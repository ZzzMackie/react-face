import type { Manager, ManagerType } from '@react-face/shared-types';
import managerRegistryConfig from '../config/manager-registry.json';

/**
 * 动态管理器注册表 - 支持动态导入和代码分割
 */
export interface ManagerModule {
  default: new (engine: any, config?: any) => Manager;
  [key: string]: any; // 支持动态类名访问
}

export interface DynamicManagerRegistryEntry {
  type: ManagerType;
  importPath: string;
  className: string; // 添加类名字段
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
    for (const entry of managerRegistryConfig) {
      this.registerManager(entry);
    }
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
    // 创建统一的导入映射表
    const importMap: { [key: string]: any } = {
      './SceneManager': () => import('./SceneManager'),
      './CameraManager': () => import('./CameraManager'),
      './RenderManager': () => import('./RenderManager'),
      './ControlsManager': () => import('./ControlsManager'),
      './LightManager': () => import('./LightManager'),
      './MaterialManager': () => import('./MaterialManager'),
      './TextureManager': () => import('./TextureManager'),
      './GeometryManager': () => import('./GeometryManager'),
      './AnimationManager': () => import('./AnimationManager'),
      './PhysicsManager': () => import('./PhysicsManager'),
      './AudioManager': () => import('./AudioManager'),
      './ParticleManager': () => import('./ParticleManager'),
      './ShaderManager': () => import('./ShaderManager'),
      './EnvironmentManager': () => import('./EnvironmentManager'),
      './EventManager': () => import('./EventManager'),
      './HelperManager': () => import('./HelperManager'),
      './UIManager': () => import('./UIManager'),
      './PerformanceManager': () => import('./PerformanceManager'),
      './ExportManager': () => import('./ExportManager'),
      './DatabaseManager': () => import('./DatabaseManager'),
      './RayTracingManager': () => import('./RayTracingManager'),
      './DeferredManager': () => import('./DeferredManager'),
      './FluidManager': () => import('./FluidManager'),
      './MorphManager': () => import('./MorphManager'),
      './ProceduralManager': () => import('./ProceduralManager'),
      './OptimizationManager': () => import('./OptimizationManager'),
      './ErrorManager': () => import('./ErrorManager'),
      './ComposerManager': () => import('./ComposerManager'),
      './ViewHelperManager': () => import('./ViewHelperManager'),
      './VolumetricManager': () => import('./VolumetricManager'),
      './SkeletonManager': () => import('./SkeletonManager'),
      './ObjectManager': () => import('./ObjectManager'),
      './LoaderManager': () => import('./LoaderManager'),
      './MonitorManager': () => import('./MonitorManager'),
      './MemoryManager': () => import('./MemoryManager'),
      './RecoveryManager': () => import('./RecoveryManager'),
      './InstanceManager': () => import('./InstanceManager'),
      './LODManager': () => import('./LODManager'),
      './NetworkManager': () => import('./NetworkManager'),
      './GestureManager': () => import('./GestureManager'),
      // 添加测试环境和生产环境通用的导入映射
      './GlobalIlluminationManager': () => import('./GlobalIlluminationManager'),
      './ScreenSpaceReflectionManager': () => import('./ScreenSpaceReflectionManager'),
      './VolumetricFogManager': () => import('./VolumetricFogManager'),
      './AssetManager': () => import('./AssetManager'),
      './ConfigManager': () => import('./ConfigManager')
    };

    try {
      // 检查是否在测试环境中
      if (globalThis?.process?.env?.NODE_ENV === 'test') {
        // 在测试环境中使用require
        const module = require(importPath);
        return module;
      } else {
        // 在生产环境中使用动态import
        const importFunc = importMap[importPath];
        if (!importFunc) {
          throw new Error(`Module not found: ${importPath}`);
        }
        
        const startTime = performance.now();
        const module = await importFunc();
        const loadTime = performance.now() - startTime;
        
        console.log(`📦 加载模块 ${importPath} 耗时: ${loadTime.toFixed(2)}ms`);
        return module as ManagerModule;
      }
    } catch (error) {
      console.error(`❌ 加载模块失败 ${importPath}:`, error);
      
      // 尝试回退到全局导入
      try {
        const globalModule = await import(/* @vite-ignore */ importPath);
        console.warn(`⚠️ 使用全局导入回退加载 ${importPath}`);
        return globalModule as ManagerModule;
      } catch (fallbackError) {
        throw new Error(`无法加载模块 ${importPath}: ${error}. 回退失败: ${fallbackError}`);
      }
    }
  }

  /**
   * 创建管理器实例
   */
  async createManager(type: ManagerType, engine: any, config?: any): Promise<Manager> {
    const module = await this.loadManagerModule(type);
    const entry = this.registry.get(type);
    
    if (!entry) {
      throw new Error(`Manager type '${type}' not found in registry`);
    }
    
    const ManagerClass = module[entry.className];
    if (!ManagerClass) {
      throw new Error(`Manager class '${entry.className}' not found in module for type '${type}'`);
    }
    
    return new ManagerClass(engine, config);
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