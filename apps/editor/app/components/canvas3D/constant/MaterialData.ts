// ==================== 基础类型定义 ====================

// 基础图层接口
export interface BaseLayer {
  id: string;
  name: string;
  type: 'rectangle' | 'circle' | 'polygon' | 'image' | 'text';
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  opacity: number;
  visible: boolean;
  zIndex: number; // 图层层级
}

// 几何图形图层
export interface GeometryLayer extends BaseLayer {
  type: 'rectangle' | 'circle' | 'polygon';
  color: string;
  strokeColor: string;
  strokeWidth: number;
  points?: Array<{ x: number; y: number }>; // 用于多边形
  radius?: number; // 用于圆形
}

// 图片图层
export interface ImageLayer extends BaseLayer {
  type: 'image';
  imageUrl: string;
  imageData?: string; // base64数据
  fit: 'cover' | 'contain' | 'fill' | 'none';
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

// 文字图层
export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  color: string;
  backgroundColor?: string;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
  letterSpacing?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

// 统一图层类型
export type MaterialLayer = GeometryLayer | ImageLayer | TextLayer;

// ==================== 3D模型Mesh数据结构 ====================

// 3D模型的Mesh面片信息
export interface ModelMesh {
  id: string;
  name: string;
  uuid: string;
  type: 'mesh';
  geometry: {
    type: 'BufferGeometry';
    attributes: {
      position?: { count: number; itemSize: number };
      normal?: { count: number; itemSize: number };
      uv?: { count: number; itemSize: number };
    };
    boundingBox?: {
      min: [number, number, number];
      max: [number, number, number];
    };
  };
  material: {
    id: string;
    name: string;
    type: 'MeshStandardMaterial' | 'MeshBasicMaterial' | 'MeshPhongMaterial' | 'MeshLambertMaterial';
    color?: string;
    map?: string; // 纹理贴图路径
    normalMap?: string;
    roughnessMap?: string;
    metalnessMap?: string;
  };
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
  userData?: any;
}

// 3D模型的Group组信息
export interface ModelGroup {
  id: string;
  name: string;
  uuid: string;
  type: 'group';
  children: (ModelMesh | ModelGroup)[];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
  userData?: any;
}

// 3D模型场景结构
export interface ModelStructure {
  id: string;
  name: string;
  uuid: string;
  type: 'scene';
  children: (ModelMesh | ModelGroup)[];
  userData?: any;
}

// ==================== 刀版数据结构 ====================
export interface Knife {
  id: string;
  name: string;
  description?: string;
  meshId: string; // 关联的Mesh ID
  meshName: string; // 关联的Mesh名称
  layers: MaterialLayer[]; // 刀版包含的图层
  canvasSize: { width: number; height: number };
  backgroundColor?: string;
  // 刀版描边线信息 - 基于Mesh的几何信息生成
  outline: {
    points: Array<{ x: number; y: number }>; // 描边点
    strokeColor: string;
    strokeWidth: number;
    visible: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 3D模型数据结构 ====================
export interface Model {
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
  // 模型结构信息
  structure?: ModelStructure;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 物料数据结构 ====================
export interface Material {
  id: string;
  name: string;
  description?: string;
  modelId: string; // 关联的模型ID
  knives: Knife[]; // 物料包含的刀版 - 每个刀版对应一个Mesh
  tags?: string[]; // 标签
  category?: string; // 分类
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 向后兼容的接口 ====================

// 保持向后兼容的MaterialMesh接口
export interface MaterialMesh {
  id: string;
  name: string;
  type: 'rectangle' | 'circle' | 'polygon';
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  points?: Array<{ x: number; y: number }>;
  radius?: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
}

// 保持向后兼容的MaterialData接口
export interface MaterialData {
  id: string;
  name: string;
  description?: string;
  meshes: MaterialMesh[]; // 保持向后兼容
  layers: MaterialLayer[]; // 新的图层系统
  model: {
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
    structure?: ModelStructure;
  };
  canvasSize: { width: number; height: number };
  backgroundColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 示例数据 ====================

// 独立的模型列表
export const sampleModels: Model[] = [
  {
    id: 'model-001',
    name: '包装盒3D模型',
    modelPath: '/exampleModel/XEP2DZRCDIT6W-3dSources.glb',
    uuid: 'uuid-001',
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    enableDraco: true,
    dracoPath: '/draco/gltf/',
    autoPlay: true,
    structure: {
      id: 'scene-001',
      name: '包装盒场景',
      uuid: 'scene-uuid-001',
      type: 'scene',
      children: [
        {
          id: 'group-001',
          name: '包装盒组',
          uuid: 'group-uuid-001',
          type: 'group',
          children: [
            {
              id: 'mesh-front',
              name: '正面',
              uuid: 'mesh-uuid-front',
              type: 'mesh',
              geometry: {
                type: 'BufferGeometry',
                attributes: {
                  position: { count: 4, itemSize: 3 },
                  normal: { count: 4, itemSize: 3 },
                  uv: { count: 4, itemSize: 2 }
                },
                boundingBox: {
                  min: [-1, -1, 0],
                  max: [1, 1, 0]
                }
              },
              material: {
                id: 'material-front',
                name: '正面材质',
                type: 'MeshStandardMaterial',
                color: '#ffffff'
              },
              position: [0, 0, 0.5],
              rotation: [0, 0, 0],
              scale: [1, 1, 1],
              visible: true
            },
            {
              id: 'mesh-back',
              name: '背面',
              uuid: 'mesh-uuid-back',
              type: 'mesh',
              geometry: {
                type: 'BufferGeometry',
                attributes: {
                  position: { count: 4, itemSize: 3 },
                  normal: { count: 4, itemSize: 3 },
                  uv: { count: 4, itemSize: 2 }
                },
                boundingBox: {
                  min: [-1, -1, 0],
                  max: [1, 1, 0]
                }
              },
              material: {
                id: 'material-back',
                name: '背面材质',
                type: 'MeshStandardMaterial',
                color: '#f8f9fa'
              },
              position: [0, 0, -0.5],
              rotation: [0, Math.PI, 0],
              scale: [1, 1, 1],
              visible: true
            }
          ],
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          visible: true
        }
      ]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 新的物料列表 - 刀版数据初始为空，加载模型后生成
export const sampleMaterials: Material[] = [
  {
    id: 'material-001',
    name: '包装盒A',
    description: '标准包装盒设计',
    modelId: 'model-001', // 关联模型ID
    knives: [
      {
        id: 'knife-001',
        name: '正面刀版',
        description: '包装盒正面刀版',
        meshId: 'mesh-front',
        meshName: '正面',
        layers: [
          {
            id: 'layer-001',
            name: '正面背景',
            type: 'rectangle',
            position: { x: 0, y: 0 },
            size: { width: 200, height: 300 },
            rotation: 0,
            opacity: 1,
            visible: true,
            zIndex: 1,
            color: '#ffffff',
            strokeColor: '#cccccc',
            strokeWidth: 1
          },
          {
            id: 'layer-002',
            name: '正面文字',
            type: 'text',
            text: '包装盒正面',
            fontSize: 24,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontStyle: 'normal',
            color: '#333333',
            textAlign: 'center',
            verticalAlign: 'middle',
            position: { x: 100, y: 150 },
            size: { width: 200, height: 50 },
            rotation: 0,
            opacity: 1,
            visible: true,
            zIndex: 2
          }
        ],
        canvasSize: { width: 200, height: 300 },
        backgroundColor: '#ffffff',
        outline: {
          points: [
            { x: 0, y: 0 },
            { x: 200, y: 0 },
            { x: 200, y: 300 },
            { x: 0, y: 300 }
          ],
          strokeColor: '#000000',
          strokeWidth: 2,
          visible: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'knife-002',
        name: '背面刀版',
        description: '包装盒背面刀版',
        meshId: 'mesh-back',
        meshName: '背面',
        layers: [
          {
            id: 'layer-003',
            name: '背面背景',
            type: 'rectangle',
            position: { x: 0, y: 0 },
            size: { width: 200, height: 300 },
            rotation: 0,
            opacity: 1,
            visible: true,
            zIndex: 1,
            color: '#f8f9fa',
            strokeColor: '#cccccc',
            strokeWidth: 1
          }
        ],
        canvasSize: { width: 200, height: 300 },
        backgroundColor: '#f8f9fa',
        outline: {
          points: [
            { x: 0, y: 0 },
            { x: 200, y: 0 },
            { x: 200, y: 300 },
            { x: 0, y: 300 }
          ],
          strokeColor: '#000000',
          strokeWidth: 2,
          visible: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    tags: ['包装盒', '标准'],
    category: '包装',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 保持向后兼容的示例数据
export const sampleMaterialData: MaterialData[] = [
  {
    id: 'material-001',
    name: '包装盒A',
    description: '标准包装盒设计',
    meshes: [
      {
        id: 'mesh-001',
        name: '测试矩形',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        size: { width: 100, height: 100 },
        rotation: 0,
        color: '#ff0000',
        strokeColor: '#cc0000',
        strokeWidth: 2
      }
    ],
    layers: [
      {
        id: 'layer-001',
        name: '测试矩形',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        size: { width: 100, height: 100 },
        rotation: 0,
        opacity: 1,
        visible: true,
        zIndex: 1,
        color: '#ff0000',
        strokeColor: '#cc0000',
        strokeWidth: 2
      }
    ],
    model: {
      id: 'model-001',
      name: '默认模型',
      modelPath: '/exampleModel/XEP2DZRCDIT6W-3dSources.glb',
      uuid: 'uuid-001',
      scale: 1,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      enableDraco: true,
      dracoPath: '/draco/gltf/',
      autoPlay: true
    },
    canvasSize: { width: 800, height: 600 },
    backgroundColor: '#ffffff',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]; 