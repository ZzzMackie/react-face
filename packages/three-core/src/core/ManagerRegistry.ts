import type { Manager, ManagerType } from '@react-face/shared-types';

/**
 * 管理器注册表 - 用于动态加载管理器模块
 */
export interface ManagerModule {
  default: new (engine: any, config?: any) => Manager;
}

export interface ManagerRegistryEntry {
  type: ManagerType;
  modulePath: string;
  dependencies: ManagerType[];
  description: string;
  size: number; // 预估大小 (KB)
  category: 'core' | 'rendering' | 'animation' | 'physics' | 'audio' | 'optimization' | 'utility';
}

/**
 * 管理器注册表
 */
export class ManagerRegistry {
  private static instance: ManagerRegistry;
  private registry: Map<ManagerType, ManagerRegistryEntry> = new Map();
  private loadedModules: Map<ManagerType, ManagerModule> = new Map();

  private constructor() {
    this.initializeRegistry();
  }

  static getInstance(): ManagerRegistry {
    if (!ManagerRegistry.instance) {
      ManagerRegistry.instance = new ManagerRegistry();
    }
    return ManagerRegistry.instance;
  }

  private initializeRegistry(): void {
    // 核心管理器
    this.registerManager({
      type: 'scene',
      modulePath: './SceneManager',
      dependencies: [],
      description: '场景管理 - 管理3D场景和对象',
      size: 15,
      category: 'core'
    });

    this.registerManager({
      type: 'camera',
      modulePath: './CameraManager',
      dependencies: [],
      description: '相机管理 - 管理视角和投影',
      size: 20,
      category: 'core'
    });

    this.registerManager({
      type: 'renderer',
      modulePath: './RenderManager',
      dependencies: [],
      description: '渲染器管理 - 管理WebGL渲染',
      size: 25,
      category: 'core'
    });

    this.registerManager({
      type: 'controls',
      modulePath: './ControlsManager',
      dependencies: ['camera'],
      description: '控制器管理 - 用户交互控制',
      size: 30,
      category: 'core'
    });

    // 渲染相关管理器
    this.registerManager({
      type: 'lights',
      modulePath: './LightManager',
      dependencies: ['scene'],
      description: '光照管理 - 管理场景光照',
      size: 35,
      category: 'rendering'
    });

    this.registerManager({
      type: 'materials',
      modulePath: './MaterialManager',
      dependencies: [],
      description: '材质管理 - 管理材质和着色器',
      size: 45,
      category: 'rendering'
    });

    this.registerManager({
      type: 'textures',
      modulePath: './TextureManager',
      dependencies: [],
      description: '纹理管理 - 管理纹理资源',
      size: 40,
      category: 'rendering'
    });

    this.registerManager({
      type: 'geometries',
      modulePath: './GeometryManager',
      dependencies: [],
      description: '几何体管理 - 管理3D几何体',
      size: 50,
      category: 'rendering'
    });

    // 动画相关管理器
    this.registerManager({
      type: 'animations',
      modulePath: './AnimationManager',
      dependencies: ['scene'],
      description: '动画管理 - 管理动画和关键帧',
      size: 40,
      category: 'animation'
    });

    this.registerManager({
      type: 'morph',
      modulePath: './MorphManager',
      dependencies: ['scene', 'animations'],
      description: '变形动画管理 - 管理形状变形',
      size: 35,
      category: 'animation'
    });

    this.registerManager({
      type: 'skeleton',
      modulePath: './SkeletonManager',
      dependencies: ['scene', 'animations'],
      description: '骨骼动画管理 - 管理骨骼和蒙皮',
      size: 45,
      category: 'animation'
    });

    // 物理相关管理器
    this.registerManager({
      type: 'physics',
      modulePath: './PhysicsManager',
      dependencies: ['scene'],
      description: '物理管理 - 物理模拟和碰撞',
      size: 60,
      category: 'physics'
    });

    this.registerManager({
      type: 'fluid',
      modulePath: './FluidManager',
      dependencies: ['scene', 'physics'],
      description: '流体模拟管理 - 流体动力学',
      size: 80,
      category: 'physics'
    });

    // 音频相关管理器
    this.registerManager({
      type: 'audio',
      modulePath: './AudioManager',
      dependencies: [],
      description: '音频管理 - 3D音频和音效',
      size: 55,
      category: 'audio'
    });

    // 优化相关管理器
    this.registerManager({
      type: 'performance',
      modulePath: './PerformanceManager',
      dependencies: ['renderer'],
      description: '性能管理 - 性能监控和优化',
      size: 30,
      category: 'optimization'
    });

    this.registerManager({
      type: 'monitor',
      modulePath: './MonitorManager',
      dependencies: ['renderer'],
      description: '监控管理 - 实时性能监控',
      size: 35,
      category: 'optimization'
    });

    this.registerManager({
      type: 'memory',
      modulePath: './MemoryManager',
      dependencies: ['renderer'],
      description: '内存管理 - 内存监控和清理',
      size: 40,
      category: 'optimization'
    });

    this.registerManager({
      type: 'recovery',
      modulePath: './RecoveryManager',
      dependencies: [],
      description: '错误恢复管理 - 错误检测和恢复',
      size: 45,
      category: 'optimization'
    });

    this.registerManager({
      type: 'instance',
      modulePath: './InstanceManager',
      dependencies: ['scene'],
      description: '实例化管理 - 高性能批量渲染',
      size: 70,
      category: 'optimization'
    });

    this.registerManager({
      type: 'lod',
      modulePath: './LODManager',
      dependencies: ['camera'],
      description: 'LOD管理 - 细节层次优化',
      size: 50,
      category: 'optimization'
    });

    this.registerManager({
      type: 'optimization',
      modulePath: './OptimizationManager',
      dependencies: ['renderer'],
      description: '优化管理 - 渲染优化策略',
      size: 55,
      category: 'optimization'
    });

    // 高级渲染管理器
    this.registerManager({
      type: 'rayTracing',
      modulePath: './RayTracingManager',
      dependencies: ['renderer'],
      description: '光线追踪管理 - 实时光线追踪',
      size: 100,
      category: 'rendering'
    });

    this.registerManager({
      type: 'deferred',
      modulePath: './DeferredManager',
      dependencies: ['renderer'],
      description: '延迟渲染管理 - 延迟着色',
      size: 75,
      category: 'rendering'
    });

    this.registerManager({
      type: 'volumetric',
      modulePath: './VolumetricManager',
      dependencies: ['renderer'],
      description: '体积渲染管理 - 体积效果',
      size: 85,
      category: 'rendering'
    });

    this.registerManager({
      type: 'composer',
      modulePath: './ComposerManager',
      dependencies: ['renderer'],
      description: '后期处理管理 - 渲染后处理',
      size: 65,
      category: 'rendering'
    });

    // 工具管理器
    this.registerManager({
      type: 'environment',
      modulePath: './EnvironmentManager',
      dependencies: ['scene'],
      description: '环境管理 - 环境贴图和背景',
      size: 35,
      category: 'utility'
    });

    this.registerManager({
      type: 'events',
      modulePath: './EventManager',
      dependencies: [],
      description: '事件管理 - 事件系统',
      size: 25,
      category: 'utility'
    });

    this.registerManager({
      type: 'helpers',
      modulePath: './HelperManager',
      dependencies: ['scene'],
      description: '辅助工具管理 - 调试辅助',
      size: 30,
      category: 'utility'
    });

    this.registerManager({
      type: 'ui',
      modulePath: './UIManager',
      dependencies: [],
      description: 'UI管理 - 用户界面',
      size: 40,
      category: 'utility'
    });

    this.registerManager({
      type: 'export',
      modulePath: './ExportManager',
      dependencies: ['scene'],
      description: '导出管理 - 场景导出',
      size: 50,
      category: 'utility'
    });

    this.registerManager({
      type: 'database',
      modulePath: './DatabaseManager',
      dependencies: [],
      description: '数据库管理 - 数据持久化',
      size: 60,
      category: 'utility'
    });

    this.registerManager({
      type: 'objects',
      modulePath: './ObjectManager',
      dependencies: ['scene'],
      description: '对象管理 - 3D对象生命周期',
      size: 35,
      category: 'utility'
    });

    this.registerManager({
      type: 'loader',
      modulePath: './LoaderManager',
      dependencies: ['objects'],
      description: '加载器管理 - 模型和资源加载',
      size: 55,
      category: 'utility'
    });

    this.registerManager({
      type: 'particles',
      modulePath: './ParticleManager',
      dependencies: ['scene'],
      description: '粒子管理 - 粒子系统',
      size: 70,
      category: 'rendering'
    });

    this.registerManager({
      type: 'shaders',
      modulePath: './ShaderManager',
      dependencies: [],
      description: '着色器管理 - 自定义着色器',
      size: 45,
      category: 'rendering'
    });

    this.registerManager({
      type: 'procedural',
      modulePath: './ProceduralManager',
      dependencies: ['scene'],
      description: '程序化生成管理 - 程序化内容',
      size: 55,
      category: 'rendering'
    });

    this.registerManager({
      type: 'error',
      modulePath: './ErrorManager',
      dependencies: [],
      description: '错误管理 - 错误处理和日志',
      size: 30,
      category: 'utility'
    });

    this.registerManager({
      type: 'viewHelper',
      modulePath: './ViewHelperManager',
      dependencies: ['camera', 'controls'],
      description: '视图助手管理 - 视图辅助工具',
      size: 40,
      category: 'utility'
    });
  }

  private registerManager(entry: ManagerRegistryEntry): void {
    this.registry.set(entry.type, entry);
  }

  /**
   * 获取管理器信息
   */
  getManagerInfo(type: ManagerType): ManagerRegistryEntry | undefined {
    return this.registry.get(type);
  }

  /**
   * 获取所有管理器信息
   */
  getAllManagerInfo(): ManagerRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  /**
   * 按分类获取管理器
   */
  getManagersByCategory(category: string): ManagerRegistryEntry[] {
    return Array.from(this.registry.values()).filter(m => m.category === category);
  }

  /**
   * 动态加载管理器模块
   */
  async loadManagerModule(type: ManagerType): Promise<ManagerModule> {
    // 检查是否已加载
    if (this.loadedModules.has(type)) {
      return this.loadedModules.get(type)!;
    }

    const entry = this.registry.get(type);
    if (!entry) {
      throw new Error(`Manager type '${type}' not found in registry`);
    }

    try {
      // 动态导入模块
      const module = await import(entry.modulePath);
      this.loadedModules.set(type, module);
      return module;
    } catch (error) {
      throw new Error(`Failed to load manager module '${type}': ${error}`);
    }
  }

  /**
   * 创建管理器实例
   */
  async createManager(type: ManagerType, engine: any, config?: any): Promise<Manager> {
    const module = await this.loadManagerModule(type);
    return new module.default(engine, config);
  }

  /**
   * 获取管理器依赖
   */
  getDependencies(type: ManagerType): ManagerType[] {
    const entry = this.registry.get(type);
    return entry ? entry.dependencies : [];
  }

  /**
   * 计算包大小
   */
  calculateBundleSize(managerTypes: ManagerType[]): number {
    return managerTypes.reduce((total, type) => {
      const entry = this.registry.get(type);
      return total + (entry ? entry.size : 0);
    }, 0);
  }

  /**
   * 获取推荐配置
   */
  getRecommendedConfigs(): { name: string; managers: ManagerType[]; size: number; description: string }[] {
    return [
      {
        name: '轻量级',
        managers: ['scene', 'camera', 'renderer', 'controls'],
        size: this.calculateBundleSize(['scene', 'camera', 'renderer', 'controls']),
        description: '最小化配置，适合简单展示'
      },
      {
        name: '标准',
        managers: ['scene', 'camera', 'renderer', 'controls', 'lights', 'materials', 'textures', 'geometries'],
        size: this.calculateBundleSize(['scene', 'camera', 'renderer', 'controls', 'lights', 'materials', 'textures', 'geometries']),
        description: '标准配置，适合大多数应用'
      },
      {
        name: '完整',
        managers: ['scene', 'camera', 'renderer', 'controls', 'lights', 'materials', 'textures', 'geometries', 'animations', 'physics', 'audio', 'particles'],
        size: this.calculateBundleSize(['scene', 'camera', 'renderer', 'controls', 'lights', 'materials', 'textures', 'geometries', 'animations', 'physics', 'audio', 'particles']),
        description: '完整配置，适合复杂应用'
      },
      {
        name: '专业',
        managers: ['scene', 'camera', 'renderer', 'controls', 'lights', 'materials', 'textures', 'geometries', 'animations', 'physics', 'audio', 'particles', 'performance', 'monitor', 'memory', 'recovery', 'instance', 'lod'],
        size: this.calculateBundleSize(['scene', 'camera', 'renderer', 'controls', 'lights', 'materials', 'textures', 'geometries', 'animations', 'physics', 'audio', 'particles', 'performance', 'monitor', 'memory', 'recovery', 'instance', 'lod']),
        description: '专业配置，包含所有优化功能'
      }
    ];
  }
} 