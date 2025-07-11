import type { Manager, ManagerType } from '@react-face/shared-types';
import { SceneManager } from './SceneManager';
import { CameraManager } from './CameraManager';
import { RenderManager } from './RenderManager';
import { ControlsManager } from './ControlsManager';
import { LightManager } from './LightManager';
import { MaterialManager } from './MaterialManager';
import { GeometryManager } from './GeometryManager';
import { TextureManager } from './TextureManager';
import { AnimationManager } from './AnimationManager';
import { PhysicsManager } from './PhysicsManager';
import { AudioManager } from './AudioManager';
import { ParticleManager } from './ParticleManager';
import { ShaderManager } from './ShaderManager';
import { EnvironmentManager } from './EnvironmentManager';
import { EventManager } from './EventManager';
import { HelperManager } from './HelperManager';
import { UIManager } from './UIManager';
import { PerformanceManager } from './PerformanceManager';
import { ExportManager } from './ExportManager';
import { DatabaseManager } from './DatabaseManager';
import { RayTracingManager } from './RayTracingManager';
import { DeferredManager } from './DeferredManager';
import { FluidManager } from './FluidManager';
import { MorphManager } from './MorphManager';
import { ProceduralManager } from './ProceduralManager';
import { OptimizationManager } from './OptimizationManager';
import { ErrorManager } from './ErrorManager';
import { ComposerManager } from './ComposerManager';
import { ViewHelperManager } from './ViewHelperManager';
import { VolumetricManager } from './VolumetricManager';
import { SkeletonManager } from './SkeletonManager';
import { ObjectManager } from './ObjectManager';
import { LoaderManager } from './LoaderManager';
import { MonitorManager } from './MonitorManager';
import { MemoryManager } from './MemoryManager';
import { RecoveryManager } from './RecoveryManager';
import { InstanceManager } from './InstanceManager';
import { LODManager } from './LODManager';

export class ManagerFactory {
  private static instance: ManagerFactory;
  private engine: any;

  private constructor(engine: any) {
    this.engine = engine;
  }

  static getInstance(engine: any): ManagerFactory {
    if (!ManagerFactory.instance) {
      ManagerFactory.instance = new ManagerFactory(engine);
    }
    return ManagerFactory.instance;
  }

  // 创建管理器
  createManager(type: ManagerType): Manager {
    switch (type) {
      case 'scene':
        return new SceneManager(this.engine);
      case 'renderer':
        return new RenderManager(this.engine);
      case 'camera':
        return new CameraManager(this.engine);
      case 'controls':
        return new ControlsManager(this.engine);
      case 'lights':
        return new LightManager(this.engine);
      case 'materials':
        return new MaterialManager(this.engine);
      case 'geometries':
        return new GeometryManager(this.engine);
      case 'textures':
        return new TextureManager(this.engine);
      case 'animations':
        return new AnimationManager(this.engine);
      case 'physics':
        return new PhysicsManager(this.engine);
      case 'audio':
        return new AudioManager(this.engine);
      case 'particles':
        return new ParticleManager(this.engine);
      case 'shaders':
        return new ShaderManager(this.engine);
      case 'environment':
        return new EnvironmentManager(this.engine);
      case 'events':
        return new EventManager(this.engine);
      case 'helpers':
        return new HelperManager(this.engine);
      case 'ui':
        return new UIManager(this.engine);
      case 'performance':
        return new PerformanceManager(this.engine);
      case 'export':
        return new ExportManager(this.engine);
      case 'database':
        return new DatabaseManager(this.engine);
      case 'rayTracing':
        return new RayTracingManager(this.engine);
      case 'deferred':
        return new DeferredManager(this.engine);
      case 'fluid':
        return new FluidManager(this.engine);
      case 'morph':
        return new MorphManager(this.engine);
      case 'procedural':
        return new ProceduralManager(this.engine);
      case 'optimization':
        return new OptimizationManager(this.engine);
      case 'error':
        return new ErrorManager(this.engine);
      case 'composer':
        return new ComposerManager(this.engine);
      case 'viewHelper':
        return new ViewHelperManager(this.engine);
      case 'volumetric':
        return new VolumetricManager(this.engine);
      case 'skeleton':
        return new SkeletonManager(this.engine);
      case 'objects':
        return new ObjectManager(this.engine);
      case 'loader':
        return new LoaderManager(this.engine);
      case 'monitor':
        return new MonitorManager(this.engine);
      case 'memory':
        return new MemoryManager(this.engine);
      case 'recovery':
        return new RecoveryManager(this.engine);
      case 'instance':
        return new InstanceManager(this.engine);
      case 'lod':
        return new LODManager(this.engine);
      default:
        throw new Error(`Unknown manager type: ${type}`);
    }
  }

  // 获取管理器依赖
  getDependencies(type: ManagerType): ManagerType[] {
    const dependencies: { [key in ManagerType]?: ManagerType[] } = {
      scene: [],
      renderer: [],
      camera: [],
      controls: ['camera'],
      lights: ['scene'],
      materials: [],
      geometries: [],
      textures: [],
      animations: ['scene'],
      physics: ['scene'],
      audio: [],
      particles: ['scene'],
      shaders: [],
      environment: ['scene'],
      events: [],
      helpers: ['scene'],
      ui: [],
      performance: ['renderer'],
      export: ['scene'],
      database: [],
      rayTracing: ['renderer'],
      deferred: ['renderer'],
      fluid: ['scene', 'physics'],
      morph: ['scene'],
      procedural: ['scene'],
      optimization: ['renderer'],
      error: [],
      composer: ['renderer'],
      viewHelper: ['camera', 'controls'],
      volumetric: ['renderer'],
      skeleton: ['scene'],
      objects: ['scene'],
      loader: ['objects'],
      monitor: ['renderer'],
      memory: ['renderer'],
      recovery: [],
      instance: ['scene'],
      lod: ['camera']
    };

    return dependencies[type] || [];
  }

  // 检查管理器是否可用
  isManagerAvailable(type: ManagerType): boolean {
    try {
      this.createManager(type);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 获取所有可用的管理器类型
  getAvailableManagerTypes(): ManagerType[] {
    const allTypes: ManagerType[] = [
      'scene', 'camera', 'renderer', 'controls', 'lights',
      'materials', 'geometries', 'textures', 'animations',
      'physics', 'audio', 'particles', 'shaders',
      'environment', 'events', 'helpers', 'ui',
      'performance', 'export', 'database', 'rayTracing',
      'deferred', 'fluid', 'morph', 'procedural',
      'optimization', 'error', 'composer', 'viewHelper',
      'volumetric', 'skeleton', 'objects', 'loader',
      'monitor', 'memory', 'recovery', 'instance', 'lod'
    ];

    return allTypes.filter(type => this.isManagerAvailable(type));
  }
} 