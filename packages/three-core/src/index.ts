// 核心导出
export { Engine } from './core/Engine';
export type { EngineConfig } from './core/Engine';

// 管理器导出
export { SceneManager } from './core/SceneManager';
export { CameraManager } from './core/CameraManager';
export { RenderManager } from './core/RenderManager';
export { ControlsManager } from './core/ControlsManager';
export { LightManager } from './core/LightManager';
export { MaterialManager } from './core/MaterialManager';
export { GeometryManager } from './core/GeometryManager';
export { TextureManager } from './core/TextureManager';
export { AnimationManager } from './core/AnimationManager';
export { PhysicsManager } from './core/PhysicsManager';
export { AudioManager } from './core/AudioManager';
export { ParticleManager } from './core/ParticleManager';
export { ShaderManager } from './core/ShaderManager';
export { EnvironmentManager } from './core/EnvironmentManager';
export { EventManager } from './core/EventManager';
export { HelperManager } from './core/HelperManager';
export { UIManager } from './core/UIManager';
export { PerformanceManager } from './core/PerformanceManager';
export { ExportManager } from './core/ExportManager';
export { DatabaseManager } from './core/DatabaseManager';
export { RayTracingManager } from './core/RayTracingManager';
export { DeferredManager } from './core/DeferredManager';
export { FluidManager } from './core/FluidManager';
export { MorphManager } from './core/MorphManager';
export { ProceduralManager } from './core/ProceduralManager';
export { OptimizationManager } from './core/OptimizationManager';
export { ErrorManager } from './core/ErrorManager';
export { ComposerManager } from './core/ComposerManager';
export { ViewHelperManager } from './core/ViewHelperManager';
export { VolumetricManager } from './core/VolumetricManager';
export { SkeletonManager } from './core/SkeletonManager';
export { ObjectManager } from './core/ObjectManager';
export { LoaderManager } from './core/LoaderManager';
export { MonitorManager } from './core/MonitorManager';
export { MemoryManager } from './core/MemoryManager';
export { RecoveryManager } from './core/RecoveryManager';
export { InstanceManager } from './core/InstanceManager';
export { LODManager } from './core/LODManager';

// 工具类导出
export { ManagerFactory } from './core/ManagerFactory';
export { DynamicManagerRegistry } from './core/DynamicManagerRegistry';
export { Signal, createSignal } from './core/Signal';

// 类型导出
export type {
  Manager,
  ManagerType,
  ManagerInstance,
  ManagerMap
} from '@react-face/shared-types';

// 常量导出
export const VERSION = '1.0.0';
export const AUTHOR = 'Chovi Team';
export const LICENSE = 'MIT';

// 示例导出
export { LightweightExample, runLightweightExample } from './examples/LightweightExample';
export { DynamicLoadingExample, runDynamicLoadingExample } from './examples/DynamicLoadingExample';