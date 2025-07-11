import * as THREE from 'three';
import { createSignal } from './Signal';
import type { Manager, ManagerType, ManagerInstance, ManagerMap } from '@react-face/shared-types';

// 导入所有管理器
import { SceneManager } from './SceneManager';
import { RenderManager } from './RenderManager';
import { CameraManager } from './CameraManager';
import { ControlsManager } from './ControlsManager';
import { LightManager } from './LightManager';
import { MaterialManager } from './MaterialManager';
import { TextureManager } from './TextureManager';
import { GeometryManager } from './GeometryManager';
import { ExportManager } from './ExportManager';
import { HelperManager } from './HelperManager';
import { ComposerManager } from './ComposerManager';
import { ViewHelperManager } from './ViewHelperManager';
import { DatabaseManager } from './DatabaseManager';
import { AnimationManager } from './AnimationManager';
import { PerformanceManager } from './PerformanceManager';
import { EventManager } from './EventManager';
import { PhysicsManager } from './PhysicsManager';
import { AudioManager } from './AudioManager';
import { ParticleManager } from './ParticleManager';
import { ShaderManager } from './ShaderManager';
import { EnvironmentManager } from './EnvironmentManager';
import { RayTracingManager } from './RayTracingManager';
import { DeferredManager } from './DeferredManager';
import { FluidManager } from './FluidManager';
import { MorphManager } from './MorphManager';
import { ProceduralManager } from './ProceduralManager';
import { OptimizationManager } from './OptimizationManager';
import { ErrorManager } from './ErrorManager';
import { UIManager } from './UIManager';
import { SkeletonManager } from './SkeletonManager';
import { VolumetricManager } from './VolumetricManager';
import { ObjectManager } from './ObjectManager';
import { LoaderManager } from './LoaderManager';
import { MonitorManager } from './MonitorManager';
import { MemoryManager } from './MemoryManager';
import { RecoveryManager } from './RecoveryManager';
import { InstanceManager } from './InstanceManager';
import { LODManager } from './LODManager';
import { ManagerFactory } from './ManagerFactory';
import { ManagerRegistry } from './ManagerRegistry';
import { DynamicManagerRegistry } from './DynamicManagerRegistry';

export interface EngineConfig {
  container?: HTMLElement;
  width?: number;
  height?: number;
  antialias?: boolean;
  alpha?: boolean;
  shadowMap?: boolean;
  pixelRatio?: number;
  autoRender?: boolean;
  autoResize?: boolean;
  enableManagers?: ManagerType[];
}

export class Engine {
  // 管理器管理
  private managers: ManagerMap = {};
  private initializedManagers: Set<ManagerType> = new Set();
  private config: EngineConfig;

  // 信号系统
  public readonly engineInitialized = createSignal<Engine | null>(null);
  public readonly managerAdded = createSignal<ManagerInstance | null>(null);
  public readonly managerRemoved = createSignal<ManagerType | null>(null);
  public readonly renderStarted = createSignal<void>(undefined);
  public readonly renderCompleted = createSignal<void>(undefined);

  constructor(config: EngineConfig = {}) {
    this.config = {
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      alpha: false,
      shadowMap: true,
      pixelRatio: window.devicePixelRatio,
      autoRender: true,
      autoResize: true,
      enableManagers: ['scene', 'renderer', 'camera', 'objects', 'loader'],
      ...config
    };

    this.init();
  }

  private async init(): Promise<void> {
    // 初始化默认管理器
    await this.initializeDefaultManagers();

    // 设置自动调整大小
    if (this.config.autoResize) {
      this.setupResizeHandler();
    }

    // 开始渲染循环
    if (this.config.autoRender) {
      this.startRenderLoop();
    }

    this.engineInitialized.emit(this);
  }

  private async initializeDefaultManagers(): Promise<void> {
    const factory = ManagerFactory.getInstance(this);
    
    // 只初始化用户启用的管理器
    for (const managerType of this.config.enableManagers!) {
      await this.createManager(managerType, factory);
    }
  }

  // 按需创建管理器
  private async createManager(type: ManagerType, factory: ManagerFactory): Promise<void> {
    if (this.managers[type]) return; // 已经存在

    try {
      // 使用动态注册表
      const registry = DynamicManagerRegistry.getInstance();
      
      // 检查依赖
      const dependencies = registry.getDependencies(type);
      for (const depType of dependencies) {
        if (!this.managers[depType]) {
          await this.createManager(depType, factory);
        }
      }

      // 动态创建管理器
      const manager = await registry.createManager(type, this);
      await this.addManager(type, manager);
      
      console.log(`✅ 动态加载管理器: ${type}`);
    } catch (error) {
      console.warn(`Failed to create manager ${type}:`, error);
    }
  }

  private setupResizeHandler(): void {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // 通过管理器处理大小调整
      const cameraManager = this.getManager<CameraManager>('camera');
      const renderManager = this.getManager<RenderManager>('renderer');
      
      if (cameraManager) {
        cameraManager.setAspect(width / height);
      }
      
      if (renderManager) {
        renderManager.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);
  }

  private startRenderLoop(): void {
    const animate = () => {
      requestAnimationFrame(animate);
      this.render();
    };
    animate();
  }

  public render(): void {
    this.renderStarted.emit();
    
    // 通过渲染管理器进行渲染
    const renderManager = this.getManager<RenderManager>('renderer');
    const sceneManager = this.getManager<SceneManager>('scene');
    const cameraManager = this.getManager<CameraManager>('camera');
    
    if (renderManager && sceneManager && cameraManager) {
      renderManager.render(sceneManager.getScene(), cameraManager.getCamera());
    }
    
    this.renderCompleted.emit();
  }

  // 管理器管理
  public async addManager(type: ManagerType, manager: Manager, config?: any): Promise<void> {
    if (!this.managers[type]) {
      await manager.initialize();
      this.managers[type] = {
        type,
        instance: manager,
        config: config || {}
      };
      this.initializedManagers.add(type);
      this.managerAdded.emit(this.managers[type]);
    }
  }

  public removeManager(type: ManagerType): void {
    const managerInstance = this.managers[type];
    if (managerInstance) {
      managerInstance.instance.dispose();
      delete this.managers[type];
      this.initializedManagers.delete(type);
      this.managerRemoved.emit(type);
    }
  }

  public getManager<T extends Manager>(type: ManagerType): T | null {
    const managerInstance = this.managers[type];
    return managerInstance ? managerInstance.instance as T : null;
  }

  public hasManager(type: ManagerType): boolean {
    return type in this.managers;
  }

  public isManagerInitialized(type: ManagerType): boolean {
    return this.initializedManagers.has(type);
  }

  public getInitializedManagers(): ManagerType[] {
    return Array.from(this.initializedManagers);
  }

  public getAllManagers(): ManagerMap {
    return { ...this.managers };
  }

  // 便捷方法 - 获取特定管理器
  public async getScene(): Promise<SceneManager> {
    if (!this.hasManager('scene')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('scene', factory);
    }
    return this.getManager<SceneManager>('scene')!;
  }

  public async getRender(): Promise<RenderManager> {
    if (!this.hasManager('renderer')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('renderer', factory);
    }
    return this.getManager<RenderManager>('renderer')!;
  }

  public async getCamera(): Promise<CameraManager> {
    if (!this.hasManager('camera')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('camera', factory);
    }
    return this.getManager<CameraManager>('camera')!;
  }

  public async getControls(): Promise<ControlsManager> {
    if (!this.hasManager('controls')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('controls', factory);
    }
    return this.getManager<ControlsManager>('controls')!;
  }

  public async getLights(): Promise<LightManager> {
    if (!this.hasManager('lights')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('lights', factory);
    }
    return this.getManager<LightManager>('lights')!;
  }

  public async getMaterials(): Promise<MaterialManager> {
    if (!this.hasManager('materials')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('materials', factory);
    }
    return this.getManager<MaterialManager>('materials')!;
  }

  public async getGeometry(): Promise<GeometryManager> {
    if (!this.hasManager('geometries')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('geometries', factory);
    }
    return this.getManager<GeometryManager>('geometries')!;
  }

  public async getTextures(): Promise<TextureManager> {
    if (!this.hasManager('textures')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('textures', factory);
    }
    return this.getManager<TextureManager>('textures')!;
  }

  public async getAnimations(): Promise<AnimationManager> {
    if (!this.hasManager('animations')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('animations', factory);
    }
    return this.getManager<AnimationManager>('animations')!;
  }

  public async getPhysics(): Promise<PhysicsManager> {
    if (!this.hasManager('physics')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('physics', factory);
    }
    return this.getManager<PhysicsManager>('physics')!;
  }

  public async getAudio(): Promise<AudioManager> {
    if (!this.hasManager('audio')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('audio', factory);
    }
    return this.getManager<AudioManager>('audio')!;
  }

  public async getParticles(): Promise<ParticleManager> {
    if (!this.hasManager('particles')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('particles', factory);
    }
    return this.getManager<ParticleManager>('particles')!;
  }

  public async getShaders(): Promise<ShaderManager> {
    if (!this.hasManager('shaders')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('shaders', factory);
    }
    return this.getManager<ShaderManager>('shaders')!;
  }

  public async getEnvironment(): Promise<EnvironmentManager> {
    if (!this.hasManager('environment')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('environment', factory);
    }
    return this.getManager<EnvironmentManager>('environment')!;
  }

  public async getEvents(): Promise<EventManager> {
    if (!this.hasManager('events')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('events', factory);
    }
    return this.getManager<EventManager>('events')!;
  }

  public async getHelpers(): Promise<HelperManager> {
    if (!this.hasManager('helpers')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('helpers', factory);
    }
    return this.getManager<HelperManager>('helpers')!;
  }

  public async getUI(): Promise<UIManager> {
    if (!this.hasManager('ui')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('ui', factory);
    }
    return this.getManager<UIManager>('ui')!;
  }

  public async getPerformance(): Promise<PerformanceManager> {
    if (!this.hasManager('performance')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('performance', factory);
    }
    return this.getManager<PerformanceManager>('performance')!;
  }

  public async getExport(): Promise<ExportManager> {
    if (!this.hasManager('export')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('export', factory);
    }
    return this.getManager<ExportManager>('export')!;
  }

  public async getDatabase(): Promise<DatabaseManager | null> {
    if (!this.hasManager('database')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('database', factory);
    }
    return this.getManager<DatabaseManager>('database');
  }

  public async getObjects(): Promise<ObjectManager | null> {
    if (!this.hasManager('objects')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('objects', factory);
    }
    return this.getManager<ObjectManager>('objects');
  }

  public async getLoader(): Promise<LoaderManager | null> {
    if (!this.hasManager('loader')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('loader', factory);
    }
    return this.getManager<LoaderManager>('loader');
  }

  public async getMonitor(): Promise<MonitorManager | null> {
    if (!this.hasManager('monitor')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('monitor', factory);
    }
    return this.getManager<MonitorManager>('monitor');
  }

  public async getMemory(): Promise<MemoryManager | null> {
    if (!this.hasManager('memory')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('memory', factory);
    }
    return this.getManager<MemoryManager>('memory');
  }

  public async getRecovery(): Promise<RecoveryManager | null> {
    if (!this.hasManager('recovery')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('recovery', factory);
    }
    return this.getManager<RecoveryManager>('recovery');
  }

  public async getInstance(): Promise<InstanceManager | null> {
    if (!this.hasManager('instance')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('instance', factory);
    }
    return this.getManager<InstanceManager>('instance');
  }

  public async getLOD(): Promise<LODManager | null> {
    if (!this.hasManager('lod')) {
      const factory = ManagerFactory.getInstance(this);
      await this.createManager('lod', factory);
    }
    return this.getManager<LODManager>('lod');
  }

  // 场景对象管理
  public add(object: THREE.Object3D): void {
    const sceneManager = this.getManager<SceneManager>('scene');
    if (sceneManager) {
      sceneManager.add(object);
    }
  }

  public remove(object: THREE.Object3D): void {
    const sceneManager = this.getManager<SceneManager>('scene');
    if (sceneManager) {
      sceneManager.remove(object);
    }
  }

  // 调整大小 - 通过管理器处理
  public resize(width: number, height: number): void {
    const cameraManager = this.getManager<CameraManager>('camera');
    const renderManager = this.getManager<RenderManager>('renderer');
    
    if (cameraManager) {
      cameraManager.setAspect(width / height);
    }
    
    if (renderManager) {
      renderManager.setSize(width, height);
    }
  }

  // 销毁
  public dispose(): void {
    // 销毁所有管理器
    Object.values(this.managers).forEach(managerInstance => {
      managerInstance.instance.dispose();
    });
    
    this.managers = {};
    this.initializedManagers.clear();
  }
} 