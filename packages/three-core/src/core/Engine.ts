import * as THREE from 'three';
import { createSignal } from './Signal';
import type { Manager, ManagerType, ManagerInstance, ManagerMap } from '@react-face/shared-types';
import { ManagerFactory } from './ManagerFactory';
import { ManagerRegistry } from './ManagerRegistry';
import { DynamicManagerRegistry } from './DynamicManagerRegistry';

export interface EngineConfig {
  container?: HTMLElement;
  canvas?: HTMLCanvasElement;
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
  public THREE = THREE;
  // 渲染循环状态
  private _renderLoopActive: boolean = false;
  private _animationFrameId: number | null = null;
  private _lastTimestamp: number | null = null;

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
      enableManagers: [ 'camera', 'scene', 'renderer', 'objects', 'loader'],
      ...config
    };
  }

  public async initialize(): Promise<void> {
    await this.init();
  }

  private async init(): Promise<void> {
    // 初始化默认管理器
    await this.initializeDefaultManagers();

    // 设置渲染器到容器
    await this.setupRenderer();

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

  private async setupRenderer(): Promise<void> {
    const renderManager = this.getManager<any>('renderer');
    if (renderManager) {
      const renderer = renderManager.getRenderer();
      const canvas = renderer.domElement;
      
      // 如果用户提供了自定义canvas，不自动添加到container
      if (this.config.canvas) {
        console.log('✅ 使用用户提供的canvas');
      } else if (this.config.container) {
        // 清空容器
        this.config.container.innerHTML = '';
        
        // 添加canvas到容器
        this.config.container.appendChild(canvas);
        
        console.log('✅ 渲染器已添加到容器');
      }
      
      // 设置初始大小
      if (this.config.width && this.config.height) {
        renderManager.setSize(this.config.width, this.config.height);
      }
    }
  }

  private async initializeDefaultManagers(): Promise<void> {
    const factory = ManagerFactory.getInstance(this);
    
    // 只初始化用户启用的管理器
    for (const managerType of this.config.enableManagers!) {
      await this.createManager(managerType, factory);
    }
  }

  // 按需创建管理器
  private async createManager(type: ManagerType, factory: ManagerFactory = ManagerFactory.getInstance(this)): Promise<void> {
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

      // 准备管理器配置
      let managerConfig: any = {};
      if (type === 'renderer') {
        managerConfig = {
          antialias: this.config.antialias,
          alpha: this.config.alpha,
          shadowMap: this.config.shadowMap,
          pixelRatio: this.config.pixelRatio,
          canvas: this.config.canvas
        };
      }

      // 动态创建管理器
      const manager = await registry.createManager(type, this, managerConfig);
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
      
      // 更新配置
      this.config.width = width;
      this.config.height = height;
      
      // 通过管理器处理大小调整
      const cameraManager = this.getManager<any>('camera');
      const renderManager = this.getManager<any>('renderer');
      
      if (cameraManager) {
        cameraManager.setAspect(width / height);
      }
      
      if (renderManager) {
        renderManager.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);
  }

  private _startRenderLoop(): void {
    const animate = () => {
      requestAnimationFrame(animate);
      this.render();
    };
    animate();
  }

  public startRenderLoop(): void {
    // 避免重复启动渲染循环
    if (this._renderLoopActive) {
      console.warn('Render loop is already active');
      return;
    }
    
    this._renderLoopActive = true;
    this._lastTimestamp = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = this._lastTimestamp;
    let fps = 0;
    
    // 使用RAF进行渲染循环
    const animate = (timestamp: number) => {
      if (!this._renderLoopActive) return;
      
      // 计算帧间隔时间
      const deltaTime = (timestamp - this._lastTimestamp) / 1000;
      this._lastTimestamp = timestamp;
      
      // FPS计算
      frameCount++;
      if (timestamp - lastFpsUpdate >= 1000) {
        fps = Math.round((frameCount * 1000) / (timestamp - lastFpsUpdate));
        lastFpsUpdate = timestamp;
        frameCount = 0;
        
        // 更新性能监控
        const monitorManager = this.getManager<any>('monitor');
        if (monitorManager && typeof monitorManager.updateFPS === 'function') {
          monitorManager.updateFPS(fps);
        }
      }
      
      // 更新控制器
      const controlsManager = this.getManager<any>('controls');
      if (controlsManager && typeof controlsManager.update === 'function') {
        controlsManager.update(deltaTime);
      }
      
      // 更新动画
      const animationsManager = this.getManager<any>('animations');
      if (animationsManager && typeof animationsManager.update === 'function') {
        animationsManager.update(deltaTime);
      }
      
      // 更新物理
      const physicsManager = this.getManager<any>('physics');
      if (physicsManager && typeof physicsManager.update === 'function') {
        physicsManager.update(deltaTime);
      }
      
      // 更新粒子
      const particlesManager = this.getManager<any>('particles');
      if (particlesManager && typeof particlesManager.update === 'function') {
        particlesManager.update(deltaTime);
      }
      
      try {
        // 渲染场景
        this.render();
      } catch (error) {
        console.error('Error during render:', error);
        
        // 尝试恢复
        const errorManager = this.getManager<any>('error');
        if (errorManager && typeof errorManager.handleRenderError === 'function') {
          errorManager.handleRenderError(error);
        } else {
          // 如果没有错误管理器，尝试基本恢复
          console.warn('Attempting to recover from render error');
          // 重置渲染器
          const renderManager = this.getManager<any>('renderer');
          if (renderManager && typeof renderManager.reset === 'function') {
            renderManager.reset();
          }
        }
      }
      
      // 继续循环
      this._animationFrameId = requestAnimationFrame(animate);
    };
    
    this._animationFrameId = requestAnimationFrame(animate);
    console.log('🎬 Render loop started');
  }

  public stopRenderLoop(): void {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
    this._renderLoopActive = false;
    this._lastTimestamp = null;
    console.log('⏹️ Render loop stopped');
  }

  public render(): void {
    this.renderStarted.emit();
    
    // 性能监控开始
    const monitorManager = this.getManager<any>('monitor');
    if (monitorManager && typeof monitorManager.beginFrame === 'function') {
      monitorManager.beginFrame();
    }
    
    // 通过渲染管理器进行渲染
    const renderManager = this.getManager<any>('renderer');
    const sceneManager = this.getManager<any>('scene');
    const cameraManager = this.getManager<any>('camera');
    
    if (renderManager && sceneManager && cameraManager) {
      // 检查是否使用后处理
      const composerManager = this.getManager<any>('composer');
      if (composerManager && composerManager.isEnabled && composerManager.isEnabled()) {
        composerManager.render();
      } else {
        renderManager.render(sceneManager.getScene(), cameraManager.getCamera());
      }
    }
    
    // 性能监控结束
    if (monitorManager && typeof monitorManager.endFrame === 'function') {
      monitorManager.endFrame();
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

  // 公共方法 - 按需创建管理器
  public async createManagerOnDemand(type: ManagerType): Promise<Manager> {
    if (this.hasManager(type)) {
      return this.getManager<Manager>(type)!;
    }

    const factory = ManagerFactory.getInstance(this);
    await this.createManager(type, factory);
    return this.getManager<Manager>(type)!;
  }

  // 通用方法 - 获取或创建管理器
  public async getOrCreateManager<T extends Manager>(type: ManagerType): Promise<T> {
    if (!this.hasManager(type)) {
      await this.createManagerOnDemand(type);
    }
    return this.getManager<T>(type)!;
  }

  // 便捷方法 - 获取特定管理器
  public async getScene(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('scene');
  }

  public async getRender(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('renderer');
  }

  public async getCamera(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('camera');
  }

  public async getControls(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('controls');
  }

  public async getLights(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('lights');
  }

  public async getMaterials(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('materials');
  }

  public async getGeometry(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('geometries');
  }

  public async getTextures(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('textures');
  }

  public async getAnimations(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('animations');
  }

  public async getPhysics(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('physics');
  }

  public async getAudio(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('audio');
  }

  public async getParticles(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('particles');
  }

  public async getShaders(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('shaders');
  }

  public async getEnvironment(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('environment');
  }

  public async getEvents(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('events');
  }

  public async getHelpers(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('helpers');
  }

  public async getUI(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('ui');
  }

  public async getPerformance(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('performance');
  }

  public async getExport(): Promise<Manager> {
    return this.getOrCreateManager<Manager>('export');
  }

  public async getDatabase(): Promise<Manager | null> {
    return this.getOrCreateManager<Manager>('database');
  }

  public async getObjects(): Promise<Manager | null> {
    return this.getOrCreateManager<Manager>('objects');
  }

  public async getLoader(): Promise<Manager | null> {
    return this.getOrCreateManager<Manager>('loader');
  }

  public async getMonitor(): Promise<Manager | null> {
    return this.getOrCreateManager<Manager>('monitor');
  }

  public async getMemory(): Promise<Manager | null> {
    return this.getOrCreateManager<Manager>('memory');
  }

  public async getRecovery(): Promise<Manager | null> {
    return this.getOrCreateManager<Manager>('recovery');
  }

  public async getInstance(): Promise<Manager | null> {
    return this.getOrCreateManager<Manager>('instance');
  }

  public async getLOD(): Promise<Manager | null> {
    return this.getOrCreateManager<Manager>('lod');
  }

  // 场景和相机属性 - 为了兼容示例代码
  get scene(): THREE.Scene {
    const sceneManager = this.getManager<any>('scene');
    return sceneManager ? sceneManager.getScene() : new THREE.Scene();
  }

  get camera(): THREE.PerspectiveCamera {
    const cameraManager = this.getManager<any>('camera');
    return cameraManager ? cameraManager.getCamera() : new THREE.PerspectiveCamera();
  }

  get renderer(): THREE.WebGLRenderer {
    const renderManager = this.getManager<any>('renderer');
    return renderManager ? renderManager.getRenderer() : new THREE.WebGLRenderer();
  }

  // 场景对象管理
  public add(object: THREE.Object3D): void {
    const sceneManager = this.getManager<any>('scene');
    if (sceneManager) {
      sceneManager.add(object);
    }
  }

  public remove(object: THREE.Object3D): void {
    const sceneManager = this.getManager<any>('scene');
    if (sceneManager) {
      sceneManager.remove(object);
    }
  }

  // 调整大小 - 通过管理器处理
  public resize(width: number, height: number): void {
    const cameraManager = this.getManager<any>('camera');
    const renderManager = this.getManager<any>('renderer');
    
    if (cameraManager) {
      cameraManager.setAspect(width / height);
    }
    
    if (renderManager) {
      renderManager.setSize(width, height);
    }
  }

  // 设置大小 - 为了兼容示例代码
  public setSize(width: number, height: number): void {
    this.resize(width, height);
  }

  // 获取统计信息
  public getStats(): any {
    return {
      initializedManagers: this.initializedManagers.size,
      totalManagers: Object.keys(this.managers).length,
      rendererInfo: this.renderer ? this.renderer.info : null
    };
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