import { ModelMesh, Knife, MaterialLayer, Model } from '../components/canvas3D/constant/MaterialData';
import { getCachedKnifeData, cacheKnifeData } from '../../utils/knifeCache';

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
    id: `knife-${mesh.id}`,
    name: `${mesh.name}刀版`,
    description: `${mesh.name}的默认刀版设计`,
    meshId: mesh.id,
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
        id: `layer-bg-${mesh.id}`,
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
      id: `layer-img-${mesh.id}`,
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
      id: `layer-color-${mesh.id}`,
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

// 为模型生成所有刀版数据
export function generateKnivesForModel(model: Model): Knife[] {
  if (!model.structure) {
    console.warn('模型没有结构信息，无法生成刀版数据');
    return [];
  }
  
  const meshes = extractMeshesFromStructure(model.structure);
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
  model: Model
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
    const knives = generateKnivesForModel(model);
    
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
  model: Model
): Promise<Knife[]> {
  try {
    // 重新生成刀版数据
    const knives = generateKnivesForModel(model);
    
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
    id: mesh.id,
    name: mesh.name,
    type: mesh.type
  }));
} 