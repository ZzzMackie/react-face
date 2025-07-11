/**
 * 完整包 - 包含所有常用功能
 * 包大小: ~600KB
 * 包含: 标准 + 动画、物理、音频
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
export { EnvironmentManager } from './core/EnvironmentManager';
export { ParticleManager } from './core/ParticleManager';
export { ShaderManager } from './core/ShaderManager';

// 动画相关管理器
export { AnimationManager } from './core/AnimationManager';
export { MorphManager } from './core/MorphManager';
export { SkeletonManager } from './core/SkeletonManager';

// 物理相关管理器
export { PhysicsManager } from './core/PhysicsManager';
export { FluidManager } from './core/FluidManager';

// 音频管理器
export { AudioManager } from './core/AudioManager';

// 工具管理器
export { EventManager } from './core/EventManager';
export { HelperManager } from './core/HelperManager';
export { UIManager } from './core/UIManager';
export { ExportManager } from './core/ExportManager';
export { DatabaseManager } from './core/DatabaseManager';
export { ObjectManager } from './core/ObjectManager';
export { LoaderManager } from './core/LoaderManager';
export { ErrorManager } from './core/ErrorManager';
export { ViewHelperManager } from './core/ViewHelperManager';

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