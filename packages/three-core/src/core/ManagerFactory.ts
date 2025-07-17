import type { Manager, ManagerType } from '@react-face/shared-types';

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

  // 动态导入管理器
  private async importManager(type: ManagerType): Promise<any> {
    const managerMap: { [key in ManagerType]: () => Promise<any> } = {
      scene: () => import('./SceneManager'),
      renderer: () => import('./RenderManager'),
      camera: () => import('./CameraManager'),
      controls: () => import('./ControlsManager'),
      lights: () => import('./LightManager'),
      materials: () => import('./MaterialManager'),
      geometries: () => import('./GeometryManager'),
      textures: () => import('./TextureManager'),
      animations: () => import('./AnimationManager'),
      physics: () => import('./PhysicsManager'),
      audio: () => import('./AudioManager'),
      particles: () => import('./ParticleManager'),
      shaders: () => import('./ShaderManager'),
      environment: () => import('./EnvironmentManager'),
      events: () => import('./EventManager'),
      helpers: () => import('./HelperManager'),
      ui: () => import('./UIManager'),  
      performance: () => import('./PerformanceManager'),
      export: () => import('./ExportManager'),
      database: () => import('./DatabaseManager'),
      rayTracing: () => import('./RayTracingManager'),
      deferred: () => import('./DeferredManager'),
      fluid: () => import('./FluidManager'),
      morph: () => import('./MorphManager'),
      procedural: () => import('./ProceduralManager'),
      optimization: () => import('./OptimizationManager'),
      error: () => import('./ErrorManager'),
      composer: () => import('./ComposerManager'),
      viewHelper: () => import('./ViewHelperManager'),
      volumetric: () => import('./VolumetricManager'),
      skeleton: () => import('./SkeletonManager'),
      objects: () => import('./ObjectManager'),
      loader: () => import('./LoaderManager'),
      monitor: () => import('./MonitorManager'),
      memory: () => import('./MemoryManager'),
      recovery: () => import('./RecoveryManager'),
      instance: () => import('./InstanceManager'),
      lod: () => import('./LODManager')
    };

    const modulePath = managerMap[type];
    if (!modulePath) {
      throw new Error(`Unknown manager type: ${type}`);
    }

    try {
      const module = await modulePath();
      const ManagerClass = module[`${type.charAt(0).toUpperCase() + type.slice(1)}Manager`];
      if (!ManagerClass) {
        throw new Error(`Manager class not found in module: ${modulePath}`);
      }
      return ManagerClass;
    } catch (error) {
      throw new Error(`Failed to load manager ${type}: ${error}`);
    }
  }

  // 创建管理器
  async createManager(type: ManagerType): Promise<Manager> {
    const ManagerClass = await this.importManager(type);
    return new ManagerClass(this.engine);
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
  async isManagerAvailable(type: ManagerType): Promise<boolean> {
    try {
      await this.importManager(type);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 获取所有可用的管理器类型
  async getAvailableManagerTypes(): Promise<ManagerType[]> {
    const allTypes: ManagerType[] = [
      'scene', 'camera', 'renderer', 'controls', 'lights',
      'materials', 'geometries', 'textures', 'animations',
      'physics', 'audio', 'particles', 'shaders', 'environment',
      'events', 'helpers', 'ui', 'performance', 'export',
      'database', 'rayTracing', 'deferred', 'fluid', 'morph',
      'procedural', 'optimization', 'error', 'composer',
      'viewHelper', 'volumetric', 'skeleton', 'objects',
      'loader', 'monitor', 'memory', 'recovery', 'instance', 'lod'
    ];

    const availableTypes: ManagerType[] = [];
    for (const type of allTypes) {
      if (await this.isManagerAvailable(type)) {
        availableTypes.push(type);
      }
    }

    return availableTypes;
  }

  // 获取已创建的管理器实例
  async getManager(type: ManagerType): Promise<Manager | null> {
    try {
      return await this.createManager(type);
    } catch (error) {
      return null;
    }
  }

  // 预加载管理器
  async preloadManagers(types: ManagerType[]): Promise<void> {
    const loadPromises = types.map(type => this.importManager(type));
    await Promise.all(loadPromises);
  }

  // 批量创建管理器
  async createManagers(types: ManagerType[]): Promise<{ [key in ManagerType]?: Manager }> {
    const managers: { [key in ManagerType]?: Manager } = {};
    
    for (const type of types) {
      try {
        managers[type] = await this.createManager(type);
      } catch (error) {
        console.warn(`Failed to create manager ${type}:`, error);
      }
    }
    
    return managers;
  }
} 