/**
 * 标准包 - 包含常用功能
 * 包大小: ~300KB
 * 包含: 核心 + 渲染相关管理器
 */

// 核心引擎
export { Engine } from './core/Engine';
export type { EngineConfig } from './core/Engine';

// 核心管理器
export { SceneManager } from './core/SceneManager';
export { CameraManager } from './core/CameraManager';
export { RenderManager } from './core/RenderManager';
export { ControlsManager } from './core/ControlsManager';

// 渲染相关管理器
export { LightManager } from './core/LightManager';
export { MaterialManager } from './core/MaterialManager';
export { GeometryManager } from './core/GeometryManager';
export { TextureManager } from './core/TextureManager';

// 工具类
export { ManagerRegistry } from './core/ManagerRegistry';
export { Signal, createSignal } from './core/Signal';

// 类型导出
export type {
  Manager,
  ManagerType,
  ManagerInstance,
  ManagerMap
} from '@react-face/shared-types';

// 常量
export const VERSION = '1.0.0';
export const AUTHOR = 'Chovi Team';
export const LICENSE = 'MIT';

// 示例
export { LightweightExample, runLightweightExample } from './examples/LightweightExample'; 