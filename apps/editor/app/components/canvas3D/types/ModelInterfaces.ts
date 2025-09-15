/**
 * 3D模型相关接口
 * 遵循接口隔离原则 (ISP) - 分离不同类型的模型接口
 */
import { BaseEntity, Position3D, GeometryInfo, MaterialInfo } from './BaseInterfaces';

/**
 * 3D模型Mesh接口
 * 专门用于3D模型的Mesh面片信息
 */
export interface ModelMesh extends BaseEntity, Position3D {
  type: 'mesh';
  uuid: string;
  geometry: GeometryInfo;
  material: MaterialInfo;
  userData?: any;
}

/**
 * 3D模型Group接口
 * 专门用于3D模型的Group组信息
 */
export interface ModelGroup extends BaseEntity, Position3D {
  type: 'group';
  uuid: string;
  children: (ModelMesh | ModelGroup)[];
  userData?: any;
}

/**
 * 3D模型场景结构接口
 * 专门用于3D模型的场景结构
 */
export interface ModelStructure extends BaseEntity {
  type: 'scene';
  uuid: string;
  children: (ModelMesh | ModelGroup)[];
  userData?: any;
}

/**
 * 3D模型接口
 * 组合多个接口形成完整的模型定义
 */
export interface Model extends BaseEntity {
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
}