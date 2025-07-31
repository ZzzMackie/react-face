// 物料数据类型定义
export interface MaterialMesh {
  id: string;
  name: string;
  type: 'rectangle' | 'circle' | 'polygon';
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  points?: Array<{ x: number; y: number }>; // 用于多边形
  radius?: number; // 用于圆形
  color: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface MaterialModel {
  id: string;
  name: string;
  modelPath: string;
  uuid: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
  enableDraco?: boolean;
  dracoPath?: string;
  autoPlay?: boolean;
  color?: string;
}

export interface MaterialData {
  id: string;
  name: string;
  description?: string;
  meshes: MaterialMesh[];
  model: MaterialModel;
  canvasSize: { width: number; height: number };
  createdAt: Date;
  updatedAt: Date;
}

// 示例数据
export const sampleMaterialData: MaterialData[] = [
  {
    id: 'material-001',
    name: '包装盒A',
    description: '标准包装盒设计',
    canvasSize: { width: 800, height: 600 },
    meshes: [
      {
        id: 'mesh-001',
        name: '主体',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 150 },
        rotation: 0,
        color: '#4a90e2',
        strokeColor: '#2c5aa0',
        strokeWidth: 2
      },
      {
        id: 'mesh-002',
        name: '标签',
        type: 'rectangle',
        position: { x: 350, y: 120 },
        size: { width: 80, height: 40 },
        rotation: 0,
        color: '#ff6b6b',
        strokeColor: '#d63031',
        strokeWidth: 1
      },
      {
        id: 'mesh-003',
        name: '圆形装饰',
        type: 'circle',
        position: { x: 500, y: 200 },
        size: { width: 60, height: 60 },
        radius: 30,
        rotation: 0,
        color: '#fdcb6e',
        strokeColor: '#e17055',
        strokeWidth: 2
      },
      {
        id: 'mesh-004',
        name: '圆形装饰',
        type: 'circle',
        position: { x: 500, y: 200 },
        size: { width: 60, height: 60 },
        radius: 30,
        rotation: 0,
        color: '#fdcb6e',
        strokeColor: '#e17055',
        strokeWidth: 2
      }
    ],
    model: {
      id: 'model-001',
      name: '包装盒3D模型',
      modelPath: '/exampleModel/XEP2DZRCDIT6W-3dSources.glb',
      uuid: 'uuid-001',
      scale: 1,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      enableDraco: true,
      dracoPath: '/draco/gltf/',
      autoPlay: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'material-002',
    name: '包装袋B',
    description: '塑料袋设计',
    canvasSize: { width: 600, height: 400 },
    meshes: [
      {
        id: 'mesh-004',
        name: '袋身',
        type: 'rectangle',
        position: { x: 50, y: 50 },
        size: { width: 300, height: 200 },
        rotation: 0,
        color: '#00b894',
        strokeColor: '#00a085',
        strokeWidth: 3
      },
      {
        id: 'mesh-005',
        name: '封口',
        type: 'rectangle',
        position: { x: 50, y: 270 },
        size: { width: 300, height: 20 },
        rotation: 0,
        color: '#74b9ff',
        strokeColor: '#0984e3',
        strokeWidth: 1
      }
    ],
    model: {
      id: 'model-002',
      name: '包装袋3D模型',
      modelPath: '/exampleModel/LittlestTokyo.glb',
      uuid: 'uuid-002',
      scale: 0.8,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      enableDraco: true,
      dracoPath: '/draco/gltf/',
      autoPlay: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]; 