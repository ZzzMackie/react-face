/**
 * 轻量级包 - 只包含核心功能
 * 包大小: ~90KB
 * 包含: 场景、相机、渲染器、控制器
 */

// 核心引擎
export { Engine } from './core/Engine';
export type { EngineConfig } from './core/Engine';

// 核心管理器
export { SceneManager } from './core/SceneManager';
export { CameraManager } from './core/CameraManager';
export { RenderManager } from './core/RenderManager';
export { ControlsManager } from './core/ControlsManager';

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