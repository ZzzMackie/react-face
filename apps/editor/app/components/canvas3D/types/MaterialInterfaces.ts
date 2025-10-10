/**
 * 刀版和物料相关接口
 * 遵循接口隔离原则 (ISP) - 分离刀版和物料的接口
 */
import { BaseEntity, DescribableEntity, TaggableEntity, CanvasInfo } from './BaseInterfaces';
import { MaterialLayer } from './LayerInterfaces';

/**
 * 刀版描边接口
 * 专门用于刀版描边线信息
 */
export interface KnifeOutline {
  points: Array<{ x: number; y: number }>;
  strokeColor: string;
  strokeWidth: number;
  visible: boolean;
}

/**
 * 刀版接口
 * 组合多个接口形成完整的刀版定义
 */
export interface Knife extends BaseEntity, DescribableEntity, CanvasInfo {
  meshId: string; // 关联的Mesh ID
  meshName: string; // 关联的Mesh名称
  layers: MaterialLayer[]; // 刀版包含的图层
  backgroundColor?: string;
  outline: KnifeOutline; // 刀版描边线信息
}

/**
 * 物料接口
 * 组合多个接口形成完整的物料定义
 */
export interface Material extends BaseEntity, DescribableEntity, TaggableEntity {
  modelId: string; // 关联的模型ID
  knives: Knife[]; // 物料包含的刀版
}

/**
 * 向后兼容的MaterialMesh接口
 * 保持向后兼容性
 */
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

/**
 * 向后兼容的MaterialData接口
 * 组合多个接口形成完整的MaterialData定义
 */
export interface MaterialData extends BaseEntity, DescribableEntity, CanvasInfo {
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
    structure?: any; // 使用any保持向后兼容
  };
}