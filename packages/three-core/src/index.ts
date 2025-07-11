// 核心引擎
export { Engine } from './core/Engine';
export type { EngineConfig } from '@react-face/shared-types';

// 导出所有管理器
export { SceneManager } from './core/SceneManager';
export { RenderManager } from './core/RenderManager';
export { CameraManager } from './core/CameraManager';
export { ControlsManager } from './core/ControlsManager';
export { LightManager } from './core/LightManager';
export { MaterialManager } from './core/MaterialManager';
export { TextureManager } from './core/TextureManager';
export { GeometryManager } from './core/GeometryManager';
export { ExportManager } from './core/ExportManager';
export { HelperManager } from './core/HelperManager';
export { ComposerManager } from './core/ComposerManager';
export { ViewHelperManager } from './core/ViewHelperManager';
export { DatabaseManager } from './core/DatabaseManager';
export { AnimationManager } from './core/AnimationManager';
export { PerformanceManager } from './core/PerformanceManager';
export { EventManager } from './core/EventManager';
export { PhysicsManager } from './core/PhysicsManager';
export { AudioManager } from './core/AudioManager';
export { ParticleManager } from './core/ParticleManager';
export { ShaderManager } from './core/ShaderManager';
export { EnvironmentManager } from './core/EnvironmentManager';
export { RayTracingManager } from './core/RayTracingManager';
export { DeferredManager } from './core/DeferredManager';
export { FluidManager } from './core/FluidManager';
export { MorphManager } from './core/MorphManager';
export { ProceduralManager } from './core/ProceduralManager';
export { OptimizationManager } from './core/OptimizationManager';
export { ErrorManager } from './core/ErrorManager';
export { UIManager } from './core/UIManager';
export { SkeletonManager } from './core/SkeletonManager';
export { VolumetricManager } from './core/VolumetricManager';
export { ObjectManager } from './core/ObjectManager';
export { LoaderManager } from './core/LoaderManager';
export { MonitorManager } from './core/MonitorManager';

// 类型定义 - 从 shared-types 导入
export type { 
  Manager,
  EngineManager,
  EngineManagerConfig,
  ManagerType,
  ManagerInstance,
  ManagerMap
} from '@react-face/shared-types';

// 配置类型
export type { ConfigStorage } from '@react-face/shared-types';

// 相机相关类型
export type { 
  CameraConfig,
  CameraPosition,
  CameraData,
  CameraWithCustomProps
} from '@react-face/shared-types';

// 控制器相关类型
export type { 
  OrbitControlsConfig,
  TransformControlsMode,
  TransformControlsParams,
  TransformControlsEvent
} from '@react-face/shared-types';

// 渲染器相关类型
export type { 
  RendererConfig,
  SceneConfig,
  MaterialConfig,
  GeometryConfig,
  LightConfig,
  Object3DConfig
} from '@react-face/shared-types';

// 工具类型
export type { 
  Vector3,
  Euler,
  ManagerConfig,
  PerformanceMetrics,
  ErrorInfo,
  ResourceInfo
} from '@react-face/shared-types';

// 工具函数
export { 
  proxyOptions, 
  createReadOnlyProxy
} from './core/Proxy';

// 版本信息
export const VERSION = '1.0.0';
export const AUTHOR = 'Chovi Team';
export const LICENSE = 'MIT';