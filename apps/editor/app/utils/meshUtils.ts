import { ModelMesh, Knife, MaterialLayer, Model, ModelGroup, ModelStructure } from '../components/canvas3D/constant/MaterialData';
import { getCachedKnifeData, cacheKnifeData } from '../../utils/knifeCache';

const _lut = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff' ];

function generateUUID() {

	const d0 = Math.random() * 0xffffffff | 0;
	const d1 = Math.random() * 0xffffffff | 0;
	const d2 = Math.random() * 0xffffffff | 0;
	const d3 = Math.random() * 0xffffffff | 0;
	const uuid = _lut[ d0 & 0xff ] + _lut[ d0 >> 8 & 0xff ] + _lut[ d0 >> 16 & 0xff ] + _lut[ d0 >> 24 & 0xff ] +
			_lut[ d1 & 0xff ] + _lut[ d1 >> 8 & 0xff ] + _lut[ d1 >> 16 & 0x0f | 0x40 ] + _lut[ d1 >> 24 & 0xff ] +
			_lut[ d2 & 0x3f | 0x80 ] + _lut[ d2 >> 8 & 0xff ] + _lut[ d2 >> 16 & 0xff ] + _lut[ d2 >> 24 & 0xff ] +
			_lut[ d3 & 0xff ] + _lut[ d3 >> 8 & 0xff ] + _lut[ d3 >> 16 & 0xff ] + _lut[ d3 >> 24 & 0xff ];

	// .toLowerCase() here flattens concatenated strings to save heap memory space.
	return uuid.toLowerCase();

}

// 从3D模型结构中提取所有Mesh
export function extractMeshesFromStructure(structure: any): ModelMesh[] {
  const meshes: ModelMesh[] = [];
  
  const traverse = (children: any[]) => {
    children.forEach(child => {
      if (child.type === 'mesh') {
        meshes.push(child as ModelMesh);
      } else if (child.type === 'group' && child.children) {
        traverse(child.children);
      }
    });
  };
  
  if (structure?.children) {
    traverse(structure.children);
  }
  
  return meshes;
}

// ==================== 支持直接从THREE.Scene/Group提取Mesh ====================

function threeColorToHex(materialColor: any): string | undefined {
  try {
    if (!materialColor) return undefined;
    if (typeof materialColor === 'string') return materialColor;
    if (materialColor.getHexString) {
      return `#${materialColor.getHexString()}`;
    }
  } catch (_) {
    // ignore
  }
  return undefined;
}

function getTextureImageSrc(texture: any): string | undefined {
  try {
    if (!texture) return undefined;
    if (typeof texture === 'string') return texture;
    // three r150+
    if (texture.source?.data?.src) return texture.source.data.src as string;
    if (texture.image?.src) return texture.image.src as string;
  } catch (_) {
    // ignore
  }
  return undefined;
}

function isMeshLike(obj: any): boolean {
  if (!obj) return false;
  return !!(obj.isMesh || obj.isSkinnedMesh || obj.isInstancedMesh || obj.type === 'Mesh' || obj.type === 'SkinnedMesh' || obj.type === 'InstancedMesh');
}

function isGroupLike(obj: any): boolean {
  if (!obj) return false;
  return !!(obj.isGroup || obj.type === 'Group' || obj.type === 'Scene' || Array.isArray(obj.children));
}

function convertThreeMeshToModelMesh(obj: any): ModelMesh {
  const id = obj.id?.toString?.() ?? obj.uuid ?? generateUUID();
  const base = {
    id,
    name: obj.name || 'Object',
    uuid: obj.uuid || id,
    position: [obj.position?.x || 0, obj.position?.y || 0, obj.position?.z || 0] as [number, number, number],
    rotation: [obj.rotation?.x || 0, obj.rotation?.y || 0, obj.rotation?.z || 0] as [number, number, number],
    scale: [obj.scale?.x || 1, obj.scale?.y || 1, obj.scale?.z || 1] as [number, number, number],
    visible: obj.visible !== false,
    userData: obj.userData || {},
  };

  const geom = obj.geometry;
  if (geom && !geom.boundingBox && geom.computeBoundingBox) geom.computeBoundingBox();
  const boundingBox = geom?.boundingBox
    ? { min: [geom.boundingBox.min.x, geom.boundingBox.min.y, geom.boundingBox.min.z] as [number, number, number],
        max: [geom.boundingBox.max.x, geom.boundingBox.max.y, geom.boundingBox.max.z] as [number, number, number] }
    : undefined;

  const material = obj.material || {};
  const materialType = material.type || 'MeshStandardMaterial';
  const mapSrc = getTextureImageSrc(material.map);
  const colorHex = threeColorToHex(material.color);

  const node: ModelMesh = {
    ...(base as any),
    type: 'mesh',
    geometry: {
      type: 'BufferGeometry',
      attributes: {
        position: geom?.attributes?.position ? { count: geom.attributes.position.count, itemSize: geom.attributes.position.itemSize } : undefined,
        normal: geom?.attributes?.normal ? { count: geom.attributes.normal.count, itemSize: geom.attributes.normal.itemSize } : undefined,
        uv: geom?.attributes?.uv ? { count: geom.attributes.uv.count, itemSize: geom.attributes.uv.itemSize } : undefined,
      },
      boundingBox,
    },
    material: {
      id: material.uuid || base.uuid,
      name: material.name || materialType,
      type: materialType,
      color: colorHex,
      map: mapSrc,
    },
  };
  return node;
}

// 将THREE.Object3D层级转换为内部ModelStructure（可选）
export function convertThreeToModelStructure(root: any): ModelStructure {
  const toNode = (obj: any): any => {
    const id = obj.id?.toString?.() ?? obj.uuid ?? generateUUID();
    const base = {
      id,
      name: obj.name || 'Object',
      uuid: obj.uuid || id,
      position: [obj.position?.x || 0, obj.position?.y || 0, obj.position?.z || 0] as [number, number, number],
      rotation: [obj.rotation?.x || 0, obj.rotation?.y || 0, obj.rotation?.z || 0] as [number, number, number],
      scale: [obj.scale?.x || 1, obj.scale?.y || 1, obj.scale?.z || 1] as [number, number, number],
      visible: obj.visible !== false,
      userData: obj.userData || {},
    };

    if (obj.isMesh) {
      return convertThreeMeshToModelMesh(obj);
    }

    const group: ModelGroup = {
      ...(base as any),
      type: 'group',
      children: (obj.children || []).map((c: any) => toNode(c)),
    };
    return group;
  };

  const id = root.id?.toString?.() ?? root.uuid ?? generateUUID();
  return {
    id,
    name: root.name || 'Scene',
    uuid: root.uuid || id,
    type: 'scene',
    children: (root.children || []).map((c: any) => toNode(c)),
    userData: root.userData || {},
  };
}

// 直接从THREE.Scene/Group提取Mesh列表
export function extractMeshesFromThreeScene(root: any): ModelMesh[] {
  const meshes: ModelMesh[] = [];
  if (!root) return meshes;
  const traverse = (obj: any) => {
    if (isMeshLike(obj)) {
      const node = convertThreeMeshToModelMesh(obj);
      meshes.push(node);
    }
  };
  root.traverse(traverse);
  return meshes;
}

// 根据Mesh的几何信息生成刀版描边线
export function generateKnifeOutlineFromMesh(mesh: ModelMesh): Array<{ x: number; y: number }> {
  // 这里是一个简化的实现，实际应该根据Mesh的几何信息来计算
  // 可以根据boundingBox或者实际的几何顶点来生成描边点
  
  if (mesh.geometry.boundingBox) {
    const { min, max } = mesh.geometry.boundingBox;
    const width = max[0] - min[0];
    const height = max[1] - min[1];
    
    // 将3D坐标转换为2D坐标（简化处理）
    return [
      { x: 100, y: 100 },
      { x: 100 + width * 100, y: 100 },
      { x: 100 + width * 100, y: 100 + height * 100 },
      { x: 100, y: 100 + height * 100 }
    ];
  }
  
  // 默认描边点
  return [
    { x: 100, y: 100 },
    { x: 300, y: 100 },
    { x: 300, y: 250 },
    { x: 100, y: 250 }
  ];
}

// 为Mesh创建默认刀版
export function createDefaultKnifeForMesh(mesh: ModelMesh): Knife {
  const outline = generateKnifeOutlineFromMesh(mesh);
  const canvasSize = calculateCanvasSizeFromMesh(mesh);
  
  return {
    id: `knife-${mesh.uuid}`,
    name: `${mesh.name}刀版`,
    description: `${mesh.name}的默认刀版设计`,
    meshId: mesh.uuid,
    meshName: mesh.name,
    canvasSize,
    backgroundColor: '#ffffff',
    outline: {
      points: outline,
      strokeColor: '#000000',
      strokeWidth: 2,
      visible: true
    },
    layers: [
      // 默认背景图层
      {
        id: `layer-bg-${mesh.uuid}`,
        name: '背景',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        size: canvasSize,
        rotation: 0,
        opacity: 1,
        visible: true,
        zIndex: 0,
        color: '#ffffff',
        strokeColor: '#e0e0e0',
        strokeWidth: 1
      },
      // 根据材质信息生成默认图层
      ...generateDefaultLayersFromMesh(mesh)
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// 根据Mesh的材质信息生成默认图层
export function generateDefaultLayersFromMesh(mesh: ModelMesh): MaterialLayer[] {
  const layers: MaterialLayer[] = [];
  
  // 根据材质类型生成不同的默认图层
  if (mesh.material.map) {
    // 如果有纹理贴图，创建图片图层
    layers.push({
      id: `layer-img-${mesh.uuid}`,
      name: '材质贴图',
      type: 'image',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 150 },
      rotation: 0,
      opacity: 1,
      visible: true,
      zIndex: 1,
      imageUrl: mesh.material.map,
      fit: 'cover',
      borderColor: '#ffffff',
      borderWidth: 1,
      borderRadius: 4
    });
  }
  
  // 根据材质颜色创建背景图层
  if (mesh.material.color && mesh.material.color !== '#ffffff') {
    layers.push({
      id: `layer-color-${mesh.uuid}`,
      name: '材质颜色',
      type: 'rectangle',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 150 },
      rotation: 0,
      opacity: 1,
      visible: true,
      zIndex: 0,
      color: mesh.material.color,
      strokeColor: '#000000',
      strokeWidth: 1
    });
  }
  
  return layers;
}

// 更新刀版的描边线
export function updateKnifeOutline(knife: Knife, mesh: ModelMesh): Knife {
  const newOutline = generateKnifeOutlineFromMesh(mesh);
  
  return {
    ...knife,
    outline: {
      ...knife.outline,
      points: newOutline
    },
    updatedAt: new Date()
  };
}

// 检查Mesh是否有关联的刀版
export function hasKnifeForMesh(meshId: string, knives: Knife[]): boolean {
  return knives.some(knife => knife.meshId === meshId);
}

// 获取Mesh关联的刀版
export function getKnifeForMesh(meshId: string, knives: Knife[]): Knife | undefined {
  return knives.find(knife => knife.meshId === meshId);
}

// 根据Mesh的几何信息计算画布尺寸
export function calculateCanvasSizeFromMesh(mesh: ModelMesh): { width: number; height: number } {
  if (mesh.geometry.boundingBox) {
    const { min, max } = mesh.geometry.boundingBox;
    const width = Math.abs(max[0] - min[0]);
    const height = Math.abs(max[1] - min[1]);
    
    // 转换为合适的画布尺寸
    const scale = 100; // 缩放因子
    return {
      width: Math.max(width * scale, 400),
      height: Math.max(height * scale, 300)
    };
  }
  
  return { width: 800, height: 600 };
}

// 从Mesh的UV坐标生成描边点
export function generateOutlineFromUV(mesh: ModelMesh): Array<{ x: number; y: number }> {
  // 这里应该根据Mesh的UV坐标来生成描边点
  // 简化实现，实际应该解析UV坐标数据
  
  if (mesh.geometry.attributes.uv) {
    const uvCount = mesh.geometry.attributes.uv.count;
    const points: Array<{ x: number; y: number }> = [];
    
    // 这里应该解析UV坐标数据
    // 简化处理，生成默认的矩形描边
    for (let i = 0; i < Math.min(uvCount, 4); i++) {
      points.push({
        x: 100 + i * 50,
        y: 100 + (i % 2) * 50
      });
    }
    
    return points;
  }
  
  return generateKnifeOutlineFromMesh(mesh);
}

// ==================== 新增：模型加载后生成刀版数据 ====================

// 为模型生成所有刀版数据（优先使用Model.structure；没有则尝试从THREE.Scene/Group生成）
export function generateKnivesForModel(model: Model, sceneOrRoot?: any): Knife[] {
  let meshes: ModelMesh[] = [];
  // 优先使用实时的 THREE.Scene/Group 数据生成（更准确）
  const preferredRoot = sceneOrRoot || (model as any).gltf?.scene || (model as any).scene || (model as any).root || (model as any).three;
  if (preferredRoot) {
    try {
      meshes = extractMeshesFromThreeScene(preferredRoot);
      // 回填 structure，便于后续缓存/复用
      try {
        // (model as any).structure = convertThreeToModelStructure(preferredRoot);
      } catch (_) {
        // ignore
      }
    } catch (error) {
      console.warn('从THREE.Scene提取Mesh失败，回退使用model.structure:', error);
    }
  }
  // 如果没有拿到任何 mesh，再回退使用 model.structure
  if ((!meshes || meshes.length === 0) && model.structure && model.structure.children && model.structure.children.length > 0) {
    meshes = extractMeshesFromStructure(model.structure);
  }

  if (!meshes || meshes.length === 0) {
    console.warn('未找到可用于生成刀版的Mesh');
  }
  const knives: Knife[] = [];
  
  meshes.forEach(mesh => {
    const knife = createDefaultKnifeForMesh(mesh);
    knives.push(knife);
  });
  
  console.log(`为模型 ${model.name} 生成了 ${knives.length} 个刀版`);
  return knives;
}

// 从缓存获取或生成刀版数据
export async function getOrGenerateKnives(
  materialId: string,
  model: Model,
  sceneOrRoot?: any
): Promise<Knife[]> {
  try {
    // 首先尝试从缓存获取
    const cachedKnives = await getCachedKnifeData(materialId, model.id, model.modelPath);
    
    if (cachedKnives && cachedKnives.length > 0) {
      console.log(`从缓存获取到 ${cachedKnives.length} 个刀版数据`);
      return cachedKnives;
    }
    
    // 缓存中没有，生成新的刀版数据
    console.log('缓存中没有刀版数据，开始生成...');
    const knives = generateKnivesForModel(model, sceneOrRoot);
    
    if (knives.length > 0) {
      // 缓存生成的刀版数据
      await cacheKnifeData(materialId, model.id, model.modelPath, knives);
      console.log(`已生成并缓存 ${knives.length} 个刀版数据`);
    }
    
    return knives;
  } catch (error) {
    console.error('获取或生成刀版数据失败:', error);
    return [];
  }
}

// 更新物料的刀版数据（当模型结构发生变化时）
export async function updateMaterialKnives(
  materialId: string,
  model: Model,
  sceneOrRoot?: any
): Promise<Knife[]> {
  try {
    // 重新生成刀版数据
    const knives = generateKnivesForModel(model, sceneOrRoot);
    
    if (knives.length > 0) {
      // 更新缓存
      await cacheKnifeData(materialId, model.id, model.modelPath, knives);
      console.log(`已更新并缓存 ${knives.length} 个刀版数据`);
    }
    
    return knives;
  } catch (error) {
    console.error('更新物料刀版数据失败:', error);
    return [];
  }
}

// 检查模型是否有有效的结构信息
export function hasValidModelStructure(model: Model): boolean {
  return !!(model.structure && model.structure.children && model.structure.children.length > 0);
}

// 获取模型的所有Mesh信息（用于调试）
export function getModelMeshInfo(model: Model): Array<{ id: string; name: string; type: string }> {
  if (!model.structure) {
    return [];
  }
  
  const meshes = extractMeshesFromStructure(model.structure);
  return meshes.map(mesh => ({
    id: mesh.uuid,
    name: mesh.name,
    type: mesh.type
  }));
} 