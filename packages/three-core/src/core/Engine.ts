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
    // 创建默认管理器
    const defaultManagers: { [key in ManagerType]?: Manager } = {
      scene: new SceneManager(this),
      renderer: new RenderManager(this),
      camera: new CameraManager(this),
      controls: new ControlsManager(this),
      lights: new LightManager(this),
      materials: new MaterialManager(this),
      geometries: new GeometryManager(this),
      textures: new TextureManager(this),
      animations: new AnimationManager(this),
      physics: new PhysicsManager(this),
      audio: new AudioManager(this),
      particles: new ParticleManager(this),
      shaders: new ShaderManager(this),
      environment: new EnvironmentManager(this),
      events: new EventManager(this),
      helpers: new HelperManager(this),
      ui: new UIManager(this),
      performance: new PerformanceManager(this),
      export: new ExportManager(this),
      database: new DatabaseManager(this),
      rayTracing: new RayTracingManager(this),
      deferred: new DeferredManager(this),
      fluid: new FluidManager(this),
      morph: new MorphManager(this),
      procedural: new ProceduralManager(this),
      optimization: new OptimizationManager(this),
      error: new ErrorManager(this),
      composer: new ComposerManager(this),
      viewHelper: new ViewHelperManager(this),
      volumetric: new VolumetricManager(this),
      skeleton: new SkeletonManager(this),
      objects: new ObjectManager(this),
      loader: new LoaderManager(this),
      monitor: new MonitorManager(this)
    };

    // 初始化启用的管理器
    for (const managerType of this.config.enableManagers!) {
      const manager = defaultManagers[managerType];
      if (manager) {
        await this.addManager(managerType, manager);
      }
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
      await this.addManager('scene', new SceneManager(this));
    }
    return this.getManager<SceneManager>('scene')!;
  }

  public async getRender(): Promise<RenderManager> {
    if (!this.hasManager('renderer')) {
      await this.addManager('renderer', new RenderManager(this));
    }
    return this.getManager<RenderManager>('renderer')!;
  }

  public async getCamera(): Promise<CameraManager> {
    if (!this.hasManager('camera')) {
      await this.addManager('camera', new CameraManager(this));
    }
    return this.getManager<CameraManager>('camera')!;
  }

  public async getControls(): Promise<ControlsManager> {
    if (!this.hasManager('controls')) {
      await this.addManager('controls', new ControlsManager(this));
    }
    return this.getManager<ControlsManager>('controls')!;
  }

  public async getLights(): Promise<LightManager> {
    if (!this.hasManager('lights')) {
      await this.addManager('lights', new LightManager(this));
    }
    return this.getManager<LightManager>('lights')!;
  }

  public async getMaterials(): Promise<MaterialManager> {
    if (!this.hasManager('materials')) {
      await this.addManager('materials', new MaterialManager(this));
    }
    return this.getManager<MaterialManager>('materials')!;
  }

  public async getGeometry(): Promise<GeometryManager> {
    if (!this.hasManager('geometries')) {
      await this.addManager('geometries', new GeometryManager(this));
    }
    return this.getManager<GeometryManager>('geometries')!;
  }

  public async getTextures(): Promise<TextureManager> {
    if (!this.hasManager('textures')) {
      await this.addManager('textures', new TextureManager(this));
    }
    return this.getManager<TextureManager>('textures')!;
  }

  public async getAnimations(): Promise<AnimationManager> {
    if (!this.hasManager('animations')) {
      await this.addManager('animations', new AnimationManager(this));
    }
    return this.getManager<AnimationManager>('animations')!;
  }

  public async getPhysics(): Promise<PhysicsManager> {
    if (!this.hasManager('physics')) {
      await this.addManager('physics', new PhysicsManager(this));
    }
    return this.getManager<PhysicsManager>('physics')!;
  }

  public async getAudio(): Promise<AudioManager> {
    if (!this.hasManager('audio')) {
      await this.addManager('audio', new AudioManager(this));
    }
    return this.getManager<AudioManager>('audio')!;
  }

  public async getParticles(): Promise<ParticleManager> {
    if (!this.hasManager('particles')) {
      await this.addManager('particles', new ParticleManager(this));
    }
    return this.getManager<ParticleManager>('particles')!;
  }

  public async getShaders(): Promise<ShaderManager> {
    if (!this.hasManager('shaders')) {
      await this.addManager('shaders', new ShaderManager(this));
    }
    return this.getManager<ShaderManager>('shaders')!;
  }

  public async getEnvironment(): Promise<EnvironmentManager> {
    if (!this.hasManager('environment')) {
      await this.addManager('environment', new EnvironmentManager(this));
    }
    return this.getManager<EnvironmentManager>('environment')!;
  }

  public async getEvents(): Promise<EventManager> {
    if (!this.hasManager('events')) {
      await this.addManager('events', new EventManager(this));
    }
    return this.getManager<EventManager>('events')!;
  }

  public async getHelpers(): Promise<HelperManager> {
    if (!this.hasManager('helpers')) {
      await this.addManager('helpers', new HelperManager(this));
    }
    return this.getManager<HelperManager>('helpers')!;
  }

  public async getUI(): Promise<UIManager> {
    if (!this.hasManager('ui')) {
      await this.addManager('ui', new UIManager(this));
    }
    return this.getManager<UIManager>('ui')!;
  }

  public async getPerformance(): Promise<PerformanceManager> {
    if (!this.hasManager('performance')) {
      await this.addManager('performance', new PerformanceManager(this));
    }
    return this.getManager<PerformanceManager>('performance')!;
  }

  public async getExport(): Promise<ExportManager> {
    if (!this.hasManager('export')) {
      await this.addManager('export', new ExportManager(this));
    }
    return this.getManager<ExportManager>('export')!;
  }

  public async getDatabase(): Promise<DatabaseManager | null> {
    return this.getManager<DatabaseManager>('database');
  }

  public async getObjects(): Promise<ObjectManager | null> {
    return this.getManager<ObjectManager>('objects');
  }

  public async getLoader(): Promise<LoaderManager | null> {
    return this.getManager<LoaderManager>('loader');
  }

  public async getMonitor(): Promise<MonitorManager | null> {
    return this.getManager<MonitorManager>('monitor');
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