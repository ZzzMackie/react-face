import type { Manager, ManagerType } from '@react-face/shared-types';

/**
 * 动态管理器注册表 - 支持动态导入和代码分割
 */
export interface ManagerModule {
  default: new (engine: any, config?: any) => Manager;
}

export interface DynamicManagerRegistryEntry {
  type: ManagerType;
  importPath: string;
  dependencies: ManagerType[];
  description: string;
  size: number; // 预估大小 (KB)
  category: 'core' | 'rendering' | 'animation' | 'physics' | 'audio' | 'optimization' | 'utility';
  chunkName?: string; // Vite chunk名称
}

/**
 * 动态管理器注册表
 */
export class DynamicManagerRegistry {
  private static instance: DynamicManagerRegistry;
  private registry: Map<ManagerType, DynamicManagerRegistryEntry> = new Map();
  private loadedModules: Map<ManagerType, ManagerModule> = new Map();
  private loadingPromises: Map<ManagerType, Promise<ManagerModule>> = new Map();

  private constructor() {
    this.initializeRegistry();
  }

  static getInstance(): DynamicManagerRegistry {
    if (!DynamicManagerRegistry.instance) {
      DynamicManagerRegistry.instance = new DynamicManagerRegistry();
    }
    return DynamicManagerRegistry.instance;
  }

  private initializeRegistry(): void {
    // 核心管理器
    this.registerManager({
      type: 'scene',
      importPath: './SceneManager',
      dependencies: [],
      description: '场景管理 - 管理3D场景和对象',
      size: 15,
      category: 'core',
      chunkName: 'core-scene'
    });

    this.registerManager({
      type: 'camera',
      importPath: './CameraManager',
      dependencies: [],
      description: '相机管理 - 管理视角和投影',
      size: 20,
      category: 'core',
      chunkName: 'core-camera'
    });

    this.registerManager({
      type: 'renderer',
      importPath: './RenderManager',
      dependencies: [],
      description: '渲染器管理 - 管理WebGL渲染',
      size: 25,
      category: 'core',
      chunkName: 'core-renderer'
    });

    this.registerManager({
      type: 'controls',
      importPath: './ControlsManager',
      dependencies: ['camera'],
      description: '控制器管理 - 用户交互控制',
      size: 30,
      category: 'core',
      chunkName: 'core-controls'
    });

    // 渲染相关管理器
    this.registerManager({
      type: 'lights',
      importPath: './LightManager',
      dependencies: ['scene'],
      description: '光照管理 - 管理场景光照',
      size: 35,
      category: 'rendering',
      chunkName: 'rendering-lights'
    });

    this.registerManager({
      type: 'materials',
      importPath: './MaterialManager',
      dependencies: [],
      description: '材质管理 - 管理材质和着色器',
      size: 45,
      category: 'rendering',
      chunkName: 'rendering-materials'
    });

    this.registerManager({
      type: 'textures',
      importPath: './TextureManager',
      dependencies: [],
      description: '纹理管理 - 管理纹理资源',
      size: 40,
      category: 'rendering',
      chunkName: 'rendering-textures'
    });

    this.registerManager({
      type: 'geometries',
      importPath: './GeometryManager',
      dependencies: [],
      description: '几何体管理 - 管理3D几何体',
      size: 50,
      category: 'rendering',
      chunkName: 'rendering-geometries'
    });

    // 动画相关管理器
    this.registerManager({
      type: 'animations',
      importPath: './AnimationManager',
      dependencies: ['scene'],
      description: '动画管理 - 管理动画和关键帧',
      size: 40,
      category: 'animation',
      chunkName: 'animation-main'
    });

    this.registerManager({
      type: 'morph',
      importPath: './MorphManager',
      dependencies: ['scene', 'animations'],
      description: '变形动画管理 - 管理形状变形',
      size: 35,
      category: 'animation',
      chunkName: 'animation-morph'
    });

    this.registerManager({
      type: 'skeleton',
      importPath: './SkeletonManager',
      dependencies: ['scene', 'animations'],
      description: '骨骼动画管理 - 管理骨骼和蒙皮',
      size: 45,
      category: 'animation',
      chunkName: 'animation-skeleton'
    });

    // 物理相关管理器
    this.registerManager({
      type: 'physics',
      importPath: './PhysicsManager',
      dependencies: ['scene'],
      description: '物理管理 - 物理模拟和碰撞',
      size: 60,
      category: 'physics',
      chunkName: 'physics-main'
    });

    this.registerManager({
      type: 'fluid',
      importPath: './FluidManager',
      dependencies: ['scene', 'physics'],
      description: '流体模拟管理 - 流体动力学',
      size: 80,
      category: 'physics',
      chunkName: 'physics-fluid'
    });

    // 音频相关管理器
    this.registerManager({
      type: 'audio',
      importPath: './AudioManager',
      dependencies: [],
      description: '音频管理 - 3D音频和音效',
      size: 55,
      category: 'audio',
      chunkName: 'audio-main'
    });

    // 优化相关管理器
    this.registerManager({
      type: 'performance',
      importPath: './PerformanceManager',
      dependencies: ['renderer'],
      description: '性能管理 - 性能监控和优化',
      size: 30,
      category: 'optimization',
      chunkName: 'optimization-performance'
    });

    this.registerManager({
      type: 'monitor',
      importPath: './MonitorManager',
      dependencies: ['renderer'],
      description: '监控管理 - 实时性能监控',
      size: 35,
      category: 'optimization',
      chunkName: 'optimization-monitor'
    });

    this.registerManager({
      type: 'memory',
      importPath: './MemoryManager',
      dependencies: ['renderer'],
      description: '内存管理 - 内存监控和清理',
      size: 40,
      category: 'optimization',
      chunkName: 'optimization-memory'
    });

    this.registerManager({
      type: 'recovery',
      importPath: './RecoveryManager',
      dependencies: [],
      description: '错误恢复管理 - 错误检测和恢复',
      size: 45,
      category: 'optimization',
      chunkName: 'optimization-recovery'
    });

    this.registerManager({
      type: 'instance',
      importPath: './InstanceManager',
      dependencies: ['scene'],
      description: '实例化管理 - 高性能批量渲染',
      size: 70,
      category: 'optimization',
      chunkName: 'optimization-instance'
    });

    this.registerManager({
      type: 'lod',
      importPath: './LODManager',
      dependencies: ['camera'],
      description: 'LOD管理 - 细节层次优化',
      size: 50,
      category: 'optimization',
      chunkName: 'optimization-lod'
    });

    this.registerManager({
      type: 'optimization',
      importPath: './OptimizationManager',
      dependencies: ['renderer'],
      description: '优化管理 - 渲染优化策略',
      size: 55,
      category: 'optimization',
      chunkName: 'optimization-main'
    });

    // 高级渲染管理器
    this.registerManager({
      type: 'rayTracing',
      importPath: './RayTracingManager',
      dependencies: ['renderer'],
      description: '光线追踪管理 - 实时光线追踪',
      size: 100,
      category: 'rendering',
      chunkName: 'advanced-raytracing'
    });

    this.registerManager({
      type: 'deferred',
      importPath: './DeferredManager',
      dependencies: ['renderer'],
      description: '延迟渲染管理 - 延迟着色',
      size: 75,
      category: 'rendering',
      chunkName: 'advanced-deferred'
    });

    this.registerManager({
      type: 'volumetric',
      importPath: './VolumetricManager',
      dependencies: ['renderer'],
      description: '体积渲染管理 - 体积效果',
      size: 85,
      category: 'rendering',
      chunkName: 'advanced-volumetric'
    });

    this.registerManager({
      type: 'composer',
      importPath: './ComposerManager',
      dependencies: ['renderer'],
      description: '后期处理管理 - 渲染后处理',
      size: 65,
      category: 'rendering',
      chunkName: 'advanced-composer'
    });

    // 工具管理器
    this.registerManager({
      type: 'environment',
      importPath: './EnvironmentManager',
      dependencies: ['scene'],
      description: '环境管理 - 环境贴图和背景',
      size: 35,
      category: 'utility',
      chunkName: 'rendering-environment'
    });

    this.registerManager({
      type: 'events',
      importPath: './EventManager',
      dependencies: [],
      description: '事件管理 - 事件系统',
      size: 25,
      category: 'utility',
      chunkName: 'utility-events'
    });

    this.registerManager({
      type: 'helpers',
      importPath: './HelperManager',
      dependencies: ['scene'],
      description: '辅助工具管理 - 调试辅助',
      size: 30,
      category: 'utility',
      chunkName: 'utility-helpers'
    });

    this.registerManager({
      type: 'ui',
      importPath: './UIManager',
      dependencies: [],
      description: 'UI管理 - 用户界面',
      size: 40,
      category: 'utility',
      chunkName: 'utility-ui'
    });

    this.registerManager({
      type: 'export',
      importPath: './ExportManager',
      dependencies: ['scene'],
      description: '导出管理 - 场景导出',
      size: 50,
      category: 'utility',
      chunkName: 'utility-export'
    });

    this.registerManager({
      type: 'database',
      importPath: './DatabaseManager',
      dependencies: [],
      description: '数据库管理 - 数据持久化',
      size: 60,
      category: 'utility',
      chunkName: 'utility-database'
    });

    this.registerManager({
      type: 'objects',
      importPath: './ObjectManager',
      dependencies: ['scene'],
      description: '对象管理 - 3D对象生命周期',
      size: 35,
      category: 'utility',
      chunkName: 'utility-objects'
    });

    this.registerManager({
      type: 'loader',
      importPath: './LoaderManager',
      dependencies: ['objects'],
      description: '加载器管理 - 模型和资源加载',
      size: 55,
      category: 'utility',
      chunkName: 'utility-loader'
    });

    this.registerManager({
      type: 'particles',
      importPath: './ParticleManager',
      dependencies: ['scene'],
      description: '粒子管理 - 粒子系统',
      size: 70,
      category: 'rendering',
      chunkName: 'rendering-particles'
    });

    this.registerManager({
      type: 'shaders',
      importPath: './ShaderManager',
      dependencies: [],
      description: '着色器管理 - 自定义着色器',
      size: 45,
      category: 'rendering',
      chunkName: 'rendering-shaders'
    });

    this.registerManager({
      type: 'procedural',
      importPath: './ProceduralManager',
      dependencies: ['scene'],
      description: '程序化生成管理 - 程序化内容',
      size: 55,
      category: 'rendering',
      chunkName: 'utility-procedural'
    });

    this.registerManager({
      type: 'error',
      importPath: './ErrorManager',
      dependencies: [],
      description: '错误管理 - 错误处理和日志',
      size: 30,
      category: 'utility',
      chunkName: 'utility-error'
    });

    this.registerManager({
      type: 'viewHelper',
      importPath: './ViewHelperManager',
      dependencies: ['camera', 'controls'],
      description: '视图助手管理 - 视图辅助工具',
      size: 40,
      category: 'utility',
      chunkName: 'utility-viewhelper'
    });
  }

  private registerManager(entry: DynamicManagerRegistryEntry): void {
    this.registry.set(entry.type, entry);
  }

  /**
   * 获取管理器信息
   */
  getManagerInfo(type: ManagerType): DynamicManagerRegistryEntry | undefined {
    return this.registry.get(type);
  }

  /**
   * 获取所有管理器信息
   */
  getAllManagerInfo(): DynamicManagerRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  /**
   * 按分类获取管理器
   */
  getManagersByCategory(category: string): DynamicManagerRegistryEntry[] {
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

    // 检查是否正在加载
    if (this.loadingPromises.has(type)) {
      return this.loadingPromises.get(type)!;
    }

    const entry = this.registry.get(type);
    if (!entry) {
      throw new Error(`Manager type '${type}' not found in registry`);
    }

    try {
      // 创建加载Promise
      const loadPromise = this.dynamicImport(entry.importPath);
      this.loadingPromises.set(type, loadPromise);

      // 动态导入模块
      const module = await loadPromise;
      this.loadedModules.set(type, module);
      this.loadingPromises.delete(type);

      console.log(`📦 动态加载管理器: ${type} (${entry.chunkName})`);
      return module;
    } catch (error) {
      this.loadingPromises.delete(type);
      throw new Error(`Failed to load manager module '${type}': ${error}`);
    }
  }

  /**
   * 动态导入管理器
   */
  private async dynamicImport(importPath: string): Promise<ManagerModule> {
    // 使用动态import，让Vite进行代码分割
    const module = await import(importPath);
    return module as ManagerModule;
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

  /**
   * 预加载管理器
   */
  async preloadManagers(types: ManagerType[]): Promise<void> {
    const loadPromises = types.map(type => this.loadManagerModule(type));
    await Promise.all(loadPromises);
    console.log(`🚀 预加载完成: ${types.join(', ')}`);
  }

  /**
   * 获取已加载的管理器
   */
  getLoadedManagers(): ManagerType[] {
    return Array.from(this.loadedModules.keys());
  }

  /**
   * 获取正在加载的管理器
   */
  getLoadingManagers(): ManagerType[] {
    return Array.from(this.loadingPromises.keys());
  }

  /**
   * 清理未使用的管理器
   */
  cleanupUnusedManagers(usedTypes: ManagerType[]): void {
    const loadedTypes = this.getLoadedManagers();
    const unusedTypes = loadedTypes.filter(type => !usedTypes.includes(type));
    
    unusedTypes.forEach(type => {
      this.loadedModules.delete(type);
      console.log(`🧹 清理未使用的管理器: ${type}`);
    });
  }
} 