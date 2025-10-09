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
  // 常量定义
  const CANVAS_WIDTH = 400;  // 画布宽度
  const CANVAS_HEIGHT = 400; // 画布高度
  const CANVAS_CENTER_X = CANVAS_WIDTH / 2;
  const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2;
  const BORDER_PADDING = 50;  // 边缘留白
  
  
  // 使用简单的方法生成轮廓 - 避免复杂的几何体处理
  // 如果有边界框，使用它来生成轮廓
  if (mesh.geometry && mesh.geometry.boundingBox) {
    return generateOutlineFromBoundingBox(
      mesh.geometry.boundingBox, 
      CANVAS_CENTER_X, 
      CANVAS_CENTER_Y,
      mesh.name || ''
    );
  }
  
  return generateBasicOutline(mesh.name || '', CANVAS_CENTER_X, CANVAS_CENTER_Y);
}

// 从几何体提取轮廓
function extractOutlineFromGeometry(mesh: ModelMesh): Array<{ x: number; y: number }> | null {
  try {
    // 获取几何体
    const geometry = mesh.geometry;
    
    // 检查几何体结构
    console.log('几何体结构:', {
      hasAttributes: !!geometry.attributes,
      attributeKeys: geometry.attributes ? Object.keys(geometry.attributes) : [],
      hasPosition: geometry.attributes && !!geometry.attributes.position,
      positionType: geometry.attributes && geometry.attributes.position ? typeof geometry.attributes.position : 'undefined',
      hasIndex: !!(geometry as any).index
    });
    
    // 安全检查
    if (!geometry.attributes || !geometry.attributes.position) {
      console.warn('几何体缺少position属性');
      return null;
    }
    
    const positions = geometry.attributes.position;
    
    // 检查positions对象结构
    console.log('positions结构:', {
      type: typeof positions,
      hasArray: !!(positions as any).array,
      arrayType: (positions as any).array ? typeof (positions as any).array : 'undefined',
      arrayLength: (positions as any).array ? (positions as any).array.length : 0,
      hasCount: 'count' in positions,
      count: 'count' in positions ? positions.count : 'unknown',
      hasGetX: typeof (positions as any).getX === 'function'
    });
    
    // 如果没有必要的属性，返回null
    if (!(positions as any).array && typeof (positions as any).getX !== 'function') {
      console.warn('positions对象缺少必要的属性');
      return null;
    }
    
    const indices = (geometry as any).index ? Array.from((geometry as any).index.array) : null;
    
    // 选择最佳投影平面
    // 计算模型的主要方向
    const boundingBox = mesh.geometry.boundingBox;
    if (!boundingBox) {
      console.warn('几何体缺少边界框');
      return null;
    }
    const sizeX = boundingBox.max[0] - boundingBox.min[0];
    const sizeY = boundingBox.max[1] - boundingBox.min[1];
    const sizeZ = boundingBox.max[2] - boundingBox.min[2];
    
    // 确定最佳投影轴（选择最小的维度作为法线方向）
    let projectionAxis = 1; // 默认Y轴
    if (sizeX < sizeY && sizeX < sizeZ) {
      projectionAxis = 0; // X轴最小，投影到YZ平面
    } else if (sizeZ < sizeX && sizeZ < sizeY) {
      projectionAxis = 2; // Z轴最小，投影到XY平面
    }
    
    // 收集所有顶点并投影到2D
    const vertices2D: Array<{x: number, y: number, index: number}> = [];
    
    // 遍历所有顶点
    for (let i = 0; i < positions.count; i++) {
      // 获取顶点坐标 - 处理不同的数据结构
      let x, y, z;
      
      if (typeof (positions as any).getX === 'function') {
        // 如果有getX, getY, getZ方法
        x = (positions as any).getX(i);
        y = (positions as any).getY(i);
        z = (positions as any).getZ(i);
      } else if ((positions as any).array) {
        // 如果是BufferAttribute格式
        const stride = 3; // 假设是xyz格式
        x = (positions as any).array[i * stride];
        y = (positions as any).array[i * stride + 1];
        z = (positions as any).array[i * stride + 2];
      } else {
        console.warn('无法识别的position数据格式');
        continue;
      }
      
      let px, py;
      
      // 根据投影轴选择投影平面
      switch (projectionAxis) {
        case 0: // 投影到YZ平面
          px = z;
          py = y;
          break;
        case 1: // 投影到XZ平面
          px = x;
          py = z;
          break;
        case 2: // 投影到XY平面
          px = x;
          py = y;
          break;
      }
      
      vertices2D.push({ x: px, y: py, index: i });
    }
    
    // 创建边缘映射表，用于记录每条边出现的次数
    const edges = new Map<string, number>();
    
    // 遍历所有三角形
    const triangleCount = indices ? indices.length / 3 : positions.count / 3;
    
    for (let i = 0; i < triangleCount; i++) {
      // 获取三角形的三个顶点索引
      const idx1 = indices ? indices[i * 3] : i * 3;
      const idx2 = indices ? indices[i * 3 + 1] : i * 3 + 1;
      const idx3 = indices ? indices[i * 3 + 2] : i * 3 + 2;
      
      // 记录三条边
      addEdge(edges, idx1 as number, idx2 as number);
      addEdge(edges, idx2 as number, idx3 as number);
      addEdge(edges, idx3 as number, idx1 as number);
    }
    
    // 找出只出现一次的边（即边界边）
    const boundaryEdges: Array<[number, number]> = [];
    
    for (const [edgeKey, count] of edges.entries()) {
      if (count === 1) {
        const [a, b] = edgeKey.split('-').map(Number);
        boundaryEdges.push([a, b]);
      }
    }
    
    // 如果没有边界边，使用凸包算法
    if (boundaryEdges.length === 0) {
      return computeConvexHull(vertices2D, positions, projectionAxis);
    }
    
    // 将边界边连接成闭合轮廓
    const paths: Array<Array<number>> = [];
    let remainingEdges = [...boundaryEdges];
    
    // 尝试构建多个闭合路径
    while (remainingEdges.length > 0) {
      const path: Array<number> = [];
      const startEdge = remainingEdges.shift();
      
      if (!startEdge) break;
      
      path.push(startEdge[0], startEdge[1]);
      let currentVertex = startEdge[1];
      let closed = false;
      
      // 尝试闭合当前路径
      while (!closed && remainingEdges.length > 0) {
        let foundNextEdge = false;
        
        for (let i = 0; i < remainingEdges.length; i++) {
          const [a, b] = remainingEdges[i];
          
          if (a === currentVertex) {
            path.push(b);
            currentVertex = b;
            remainingEdges.splice(i, 1);
            foundNextEdge = true;
            break;
          } else if (b === currentVertex) {
            path.push(a);
            currentVertex = a;
            remainingEdges.splice(i, 1);
            foundNextEdge = true;
            break;
          }
        }
        
        // 检查是否闭合
        if (currentVertex === path[0]) {
          closed = true;
        }
        
        // 如果找不到下一条边，则路径无法闭合
        if (!foundNextEdge) {
          break;
        }
      }
      
      // 只保留闭合的路径
      if (closed && path.length >= 3) {
        paths.push(path);
      }
    }
    
    // 如果没有找到闭合路径，使用凸包算法
    if (paths.length === 0) {
      return computeConvexHull(vertices2D, positions, projectionAxis);
    }
    
    // 找出最长的路径作为主轮廓
    let longestPath = paths[0];
    for (let i = 1; i < paths.length; i++) {
      if (paths[i].length > longestPath.length) {
        longestPath = paths[i];
      }
    }
    
    // 创建2D投影点
    const outline2D: Array<{ x: number; y: number }> = [];
    const scale = 150; // 缩放因子
    const centerX = 200;
    const centerY = 200;
    
    // 计算边界框用于居中
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (const vertexIndex of longestPath) {
      // 获取顶点坐标 - 处理不同的数据结构
      let x, y, z;
      
      if (typeof (positions as any).getX === 'function') {
        // 如果有getX, getY, getZ方法
        x = (positions as any).getX(vertexIndex);
        y = (positions as any).getY(vertexIndex);
        z = (positions as any).getZ(vertexIndex);
      } else if ((positions as any).array) {
        // 如果是BufferAttribute格式
        const stride = 3; // 假设是xyz格式
        x = (positions as any).array[vertexIndex * stride];
        y = (positions as any).array[vertexIndex * stride + 1];
        z = (positions as any).array[vertexIndex * stride + 2];
      } else {
        console.warn('无法识别的position数据格式');
        continue;
      }
      
      let px, py;
      
      // 根据投影轴选择投影平面
      switch (projectionAxis) {
        case 0: // 投影到YZ平面
          px = z;
          py = y;
          break;
        case 1: // 投影到XZ平面
          px = x;
          py = z;
          break;
        case 2: // 投影到XY平面
          px = x;
          py = y;
          break;
      }
      
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    }
    
    // 计算缩放和居中参数
    const width = maxX - minX;
    const height = maxY - minY;
    const maxDim = Math.max(width, height);
    const adjustedScale = maxDim > 0 ? (300 / maxDim) : scale;
    
    // 计算中心点
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    
    // 投影顶点到2D并应用缩放和居中
    for (const vertexIndex of longestPath) {
      // 获取顶点坐标 - 处理不同的数据结构
      let x, y, z;
      
      if (typeof (positions as any).getX === 'function') {
        // 如果有getX, getY, getZ方法
        x = (positions as any).getX(vertexIndex);
        y = (positions as any).getY(vertexIndex);
        z = (positions as any).getZ(vertexIndex);
      } else if ((positions as any).array) {
        // 如果是BufferAttribute格式
        const stride = 3; // 假设是xyz格式
        x = (positions as any).array[vertexIndex * stride];
        y = (positions as any).array[vertexIndex * stride + 1];
        z = (positions as any).array[vertexIndex * stride + 2];
      } else {
        console.warn('无法识别的position数据格式');
        continue;
      }
      
      let px, py;
      
      // 根据投影轴选择投影平面
      switch (projectionAxis) {
        case 0: // 投影到YZ平面
          px = z;
          py = y;
          break;
        case 1: // 投影到XZ平面
          px = x;
          py = z;
          break;
        case 2: // 投影到XY平面
          px = x;
          py = y;
          break;
      }
      
      // 应用缩放和居中
      px = (px - midX) * adjustedScale + centerX;
      py = (py - midY) * adjustedScale + centerY;
      
      outline2D.push({ x: px, y: py });
    }
    
    // 如果点太少，可能不是有效轮廓
    if (outline2D.length < 3) {
      return computeConvexHull(vertices2D, positions, projectionAxis);
    }
    
    // 简化轮廓，减少点的数量
    return simplifyOutline(outline2D, 1.0); // 1.0是容差值，可以调整
  } catch (error) {
    console.error('提取轮廓时出错:', error);
    return [];
  }
}

// 使用Graham扫描算法计算凸包
function computeConvexHull(
  vertices: Array<{x: number, y: number, index: number}>,
  positions: any,
  projectionAxis: number
): Array<{ x: number; y: number }> {
  // 如果点太少，无法形成凸包
  if (vertices.length < 3) {
    return [];
  }
  
  // 找到具有最低y坐标的点（如果有多个，选择最左边的）
  let lowestPoint = vertices[0];
  for (let i = 1; i < vertices.length; i++) {
    if (vertices[i].y < lowestPoint.y || 
       (vertices[i].y === lowestPoint.y && vertices[i].x < lowestPoint.x)) {
      lowestPoint = vertices[i];
    }
  }
  
  // 根据相对于最低点的极角对其他点进行排序
  const sortedVertices = vertices.filter(v => v !== lowestPoint);
  sortedVertices.sort((a, b) => {
    const angleA = Math.atan2(a.y - lowestPoint.y, a.x - lowestPoint.x);
    const angleB = Math.atan2(b.y - lowestPoint.y, b.x - lowestPoint.x);
    
    if (angleA < angleB) return -1;
    if (angleA > angleB) return 1;
    
    // 如果角度相同，选择距离最远的点
    const distA = Math.pow(a.x - lowestPoint.x, 2) + Math.pow(a.y - lowestPoint.y, 2);
    const distB = Math.pow(b.x - lowestPoint.x, 2) + Math.pow(b.y - lowestPoint.y, 2);
    return distB - distA;
  });
  
  // 初始化凸包
  const hull = [lowestPoint];
  
  // 添加第二个和第三个点
  if (sortedVertices.length > 0) {
    hull.push(sortedVertices[0]);
  }
  
  // 如果只有两个点，直接返回
  if (sortedVertices.length < 2) {
    return convertToOutline2D(hull, positions, projectionAxis);
  }
  
  hull.push(sortedVertices[1]);
  
  // 处理剩余的点
  for (let i = 2; i < sortedVertices.length; i++) {
    while (hull.length > 1) {
      const top = hull[hull.length - 1];
      const nextToTop = hull[hull.length - 2];
      
      // 检查是否需要移除顶部点
      if (isLeftTurn(nextToTop, top, sortedVertices[i])) {
        break;
      }
      
      hull.pop();
    }
    
    hull.push(sortedVertices[i]);
  }
  
  // 转换为2D轮廓点
  return convertToOutline2D(hull, positions, projectionAxis);
}

// 判断三个点是否形成左转
function isLeftTurn(p1: {x: number, y: number}, p2: {x: number, y: number}, p3: {x: number, y: number}): boolean {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x) > 0;
}

// 将顶点转换为2D轮廓点
function convertToOutline2D(
  hull: Array<{x: number, y: number, index: number}>,
  positions: any,
  projectionAxis: number
): Array<{ x: number; y: number }> {
  const outline2D: Array<{ x: number; y: number }> = [];
  const scale = 150;
  const centerX = 200;
  const centerY = 200;
  
  // 计算边界框用于居中
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  for (const vertex of hull) {
    minX = Math.min(minX, vertex.x);
    minY = Math.min(minY, vertex.y);
    maxX = Math.max(maxX, vertex.x);
    maxY = Math.max(maxY, vertex.y);
  }
  
  // 计算缩放和居中参数
  const width = maxX - minX;
  const height = maxY - minY;
  const maxDim = Math.max(width, height);
  const adjustedScale = maxDim > 0 ? (300 / maxDim) : scale;
  
  // 计算中心点
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  
  // 转换顶点
  for (const vertex of hull) {
    // 应用缩放和居中
    const px = (vertex.x - midX) * adjustedScale + centerX;
    const py = (vertex.y - midY) * adjustedScale + centerY;
    
    outline2D.push({ x: px, y: py });
  }
  
  return outline2D;
}

// 简化轮廓，减少点的数量（使用Ramer-Douglas-Peucker算法）
function simplifyOutline(
  points: Array<{ x: number; y: number }>,
  tolerance: number
): Array<{ x: number; y: number }> {
  // 如果点太少，无需简化
  if (points.length <= 2) {
    return points;
  }
  
  // 找到最远的点
  let maxDistance = 0;
  let index = 0;
  
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  
  // 如果首尾点相同，形成闭合轮廓
  const isClosed = (firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y);
  
  // 计算点到线段的距离
  for (let i = 1; i < points.length - 1; i++) {
    const distance = pointToLineDistance(points[i], firstPoint, lastPoint);
    
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }
  
  // 如果最大距离大于容差，则递归简化
  if (maxDistance > tolerance) {
    // 递归简化前半部分和后半部分
    const firstHalf = simplifyOutline(points.slice(0, index + 1), tolerance);
    const secondHalf = simplifyOutline(points.slice(index), tolerance);
    
    // 合并结果，去除重复点
    return firstHalf.slice(0, -1).concat(secondHalf);
  }
  
  // 否则，只保留首尾点
  return [firstPoint, lastPoint];
}

// 计算点到线段的距离
function pointToLineDistance(
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  // 如果线段长度为0，直接计算点到起点的距离
  if (lenSq === 0) {
    return Math.sqrt(A * A + B * B);
  }
  
  let param = dot / lenSq;
  
  // 找到线段上最近的点
  if (param < 0) param = 0;
  else if (param > 1) param = 1;
  
  const xx = lineStart.x + param * C;
  const yy = lineStart.y + param * D;
  
  const dx = point.x - xx;
  const dy = point.y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
}

// 添加边到边缘映射表
function addEdge(edges: Map<string, number>, a: number, b: number): void {
  // 确保边的方向一致（小索引在前）
  const [min, max] = a < b ? [a, b] : [b, a];
  const edgeKey = `${min}-${max}`;
  
  // 记录边出现的次数
  edges.set(edgeKey, (edges.get(edgeKey) || 0) + 1);
}

// 辅助函数：从boundingBox生成轮廓
function generateOutlineFromBoundingBox(
  boundingBox: { min: [number, number, number]; max: [number, number, number] },
  centerX: number,
  centerY: number,
  meshName: string
): Array<{ x: number; y: number }> {
  const { min, max } = boundingBox;
  const width = max[0] - min[0];
  const height = max[1] - min[1];
  const depth = max[2] - min[2];
  
  // 计算宽高比和形状特征
  const aspectRatio = width / height;
  const isFlat = depth < 0.1 * Math.max(width, height);
  const isLong = aspectRatio > 2 || aspectRatio < 0.5;
  
  // 根据形状特征选择不同的轮廓生成方法
  if (isLong && isFlat) {
    // 细长扁平 - 可能是袖子、裤腿等
    return generateSleeveOutline(centerX, centerY);
  } else if (aspectRatio > 0.8 && aspectRatio < 1.2) {
    // 接近正方形 - 可能是口袋等
    return generatePocketOutline(centerX, centerY);
  } else {
    // 一般矩形部件 - 生成圆角矩形
    return generateRoundedRectangleOutline(
      centerX, 
      centerY, 
      width * 80, 
      height * 80, 
      20
    );
  }
}

// 辅助函数：生成袖子轮廓
function generateSleeveOutline(centerX: number, centerY: number): Array<{ x: number; y: number }> {
  const points: Array<{x: number, y: number}> = [];
  const length = 180;
  const width = 60;
  const cuffWidth = 50;
  
  // 袖子形状 - 类似于梯形，一端略窄
  points.push({ x: centerX - length/2, y: centerY - width/2 }); // 左上
  points.push({ x: centerX + length/2, y: centerY - cuffWidth/2 }); // 右上
  points.push({ x: centerX + length/2, y: centerY + cuffWidth/2 }); // 右下
  points.push({ x: centerX - length/2, y: centerY + width/2 }); // 左下
  
  return points;
}

// 辅助函数：生成领子轮廓
function generateCollarOutline(centerX: number, centerY: number): Array<{ x: number; y: number }> {
  const points: Array<{x: number, y: number}> = [];
  const width = 100;
  const height = 40;
  const curvePoints = 10;
  
  // 领子形状 - 弧形
  for (let i = 0; i <= curvePoints; i++) {
    const t = i / curvePoints;
    const angle = Math.PI * t;
    points.push({
      x: centerX + Math.cos(angle) * width/2,
      y: centerY - Math.sin(angle) * height
    });
  }
  
  return points;
}

// 辅助函数：生成口袋轮廓
function generatePocketOutline(centerX: number, centerY: number): Array<{ x: number; y: number }> {
  return generateRoundedRectangleOutline(centerX, centerY, 80, 80, 10);
}

// 辅助函数：生成衣服主体轮廓
function generateBodyOutline(centerX: number, centerY: number): Array<{ x: number; y: number }> {
  const points: Array<{x: number, y: number}> = [];
  const shoulderWidth = 160;
  const bottomWidth = 140;
  const height = 200;
  const neckWidth = 50;
  const neckDepth = 30;
  
  // 左肩
  points.push({ x: centerX - shoulderWidth/2, y: centerY - height/2 + 10 });
  
  // 左领口
  points.push({ x: centerX - neckWidth/2, y: centerY - height/2 + 5 });
  
  // 领口底部
  points.push({ x: centerX, y: centerY - height/2 + neckDepth });
  
  // 右领口
  points.push({ x: centerX + neckWidth/2, y: centerY - height/2 + 5 });
  
  // 右肩
  points.push({ x: centerX + shoulderWidth/2, y: centerY - height/2 + 10 });
  
  // 右侧
  points.push({ x: centerX + bottomWidth/2, y: centerY + height/2 });
  
  // 底部
  points.push({ x: centerX - bottomWidth/2, y: centerY + height/2 });
  
  return points;
}

// 辅助函数：生成圆角矩形
function generateRoundedRectangleOutline(
  centerX: number, 
  centerY: number, 
  width: number, 
  height: number, 
  radius: number
): Array<{ x: number; y: number }> {
  const points: Array<{x: number, y: number}> = [];
  const cornerPoints = 5; // 每个角的点数
  
  // 左上角
  for (let i = 0; i <= cornerPoints; i++) {
    const angle = Math.PI + (i / cornerPoints) * (Math.PI/2);
    points.push({
      x: centerX - width/2 + radius + Math.cos(angle) * radius,
      y: centerY - height/2 + radius + Math.sin(angle) * radius
    });
  }
  
  // 右上角
  for (let i = 0; i <= cornerPoints; i++) {
    const angle = Math.PI * 1.5 + (i / cornerPoints) * (Math.PI/2);
    points.push({
      x: centerX + width/2 - radius + Math.cos(angle) * radius,
      y: centerY - height/2 + radius + Math.sin(angle) * radius
    });
  }
  
  // 右下角
  for (let i = 0; i <= cornerPoints; i++) {
    const angle = 0 + (i / cornerPoints) * (Math.PI/2);
    points.push({
      x: centerX + width/2 - radius + Math.cos(angle) * radius,
      y: centerY + height/2 - radius + Math.sin(angle) * radius
    });
  }
  
  // 左下角
  for (let i = 0; i <= cornerPoints; i++) {
    const angle = Math.PI/2 + (i / cornerPoints) * (Math.PI/2);
    points.push({
      x: centerX - width/2 + radius + Math.cos(angle) * radius,
      y: centerY + height/2 - radius + Math.sin(angle) * radius
    });
  }
  
  return points;
}

// 辅助函数：根据名称生成基本形状
function generateBasicOutline(
  meshName: string, 
  centerX: number, 
  centerY: number
): Array<{ x: number; y: number }> {
  const name = meshName.toLowerCase();
  
  if (name.includes('sleeve') || name.includes('arm')) {
    return generateSleeveOutline(centerX, centerY);
  } else if (name.includes('collar') || name.includes('neck')) {
    return generateCollarOutline(centerX, centerY);
  } else if (name.includes('pocket')) {
    return generatePocketOutline(centerX, centerY);
  } else if (name.includes('body') || name.includes('torso') || name.includes('chest')) {
    return generateBodyOutline(centerX, centerY);
  } else {
    // 默认形状 - T恤形状
    return generateBodyOutline(centerX, centerY);
  }
}

// 辅助函数：将字符串哈希为数字
function hashStringToNumber(str: string): number {
  let hash = 0;
  if (!str || str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash);
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
      // 根据材质信息生成默认图层
        ...generateDefaultLayersFromMesh(mesh),
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