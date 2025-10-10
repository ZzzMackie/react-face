/**
 * 基础实体接口
 * 遵循接口隔离原则 (ISP) - 只包含最基本的属性
 */
export interface BaseEntity {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 可描述实体接口
 * 扩展基础实体，添加描述功能
 */
export interface DescribableEntity extends BaseEntity {
  description?: string;
}

/**
 * 可标记实体接口
 * 添加标签和分类功能
 */
export interface TaggableEntity extends BaseEntity {
  tags?: string[];
  category?: string;
}

/**
 * 位置接口
 * 定义3D空间中的位置信息
 */
export interface Position3D {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

/**
 * 变换接口
 * 定义2D空间中的变换信息
 */
export interface Transform2D {
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
}

/**
 * 可见性接口
 * 定义可见性相关属性
 */
export interface Visibility {
  visible: boolean;
  opacity: number;
  zIndex: number;
}

/**
 * 样式接口
 * 定义基础样式属性
 */
export interface BaseStyle {
  color: string;
  strokeColor: string;
  strokeWidth: number;
}

/**
 * 画布接口
 * 定义画布相关属性
 */
export interface CanvasInfo {
  canvasSize: { width: number; height: number };
  backgroundColor?: string;
}

/**
 * 模型配置接口
 * 定义3D模型加载配置
 */
export interface ModelConfig {
  modelPath: string;
  uuid: string;
  enableDraco?: boolean;
  dracoPath?: string;
  autoPlay?: boolean;
  color?: string;
}

/**
 * 几何体接口
 * 定义几何体相关属性
 */
export interface GeometryInfo {
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
}

/**
 * 材质接口
 * 定义材质相关属性
 */
export interface MaterialInfo {
  id: string;
  name: string;
  type: 'MeshStandardMaterial' | 'MeshBasicMaterial' | 'MeshPhongMaterial' | 'MeshLambertMaterial';
  color?: string;
  map?: string;
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
}