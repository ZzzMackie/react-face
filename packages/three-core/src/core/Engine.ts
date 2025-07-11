import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createSignal } from './Signal';
import type { Manager } from '@react-face/shared-types';

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
}

export class Engine {
  // 核心组件
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls | null = null;

  // 管理器管理
  private managers: Map<string, Manager> = new Map();
  private initializedManagers: Set<string> = new Set();
  private config: EngineConfig;

  // 信号系统
  public readonly engineInitialized = createSignal<Engine | null>(null);
  public readonly managerAdded = createSignal<{ name: string; manager: Manager } | null>(null);
  public readonly managerRemoved = createSignal<string | null>(null);
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
      ...config
    };

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.config.width! / this.config.height!, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.config.antialias,
      alpha: this.config.alpha
    });

    this.init();
  }

  private init(): void {
    // 设置渲染器
    this.renderer.setSize(this.config.width!, this.config.height!);
    this.renderer.setPixelRatio(this.config.pixelRatio!);
    
    if (this.config.shadowMap) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // 设置相机位置
    this.camera.position.set(0, 0, 5);

    // 设置容器
    if (this.config.container) {
      this.config.container.appendChild(this.renderer.domElement);
    }

    // 初始化控制器
    this.initControls();

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

  private initControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }

  private setupResizeHandler(): void {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      
      this.renderer.setSize(width, height);
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
    
    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
    
    this.renderCompleted.emit();
  }

  // 管理器管理
  public addManager(name: string, manager: Manager): void {
    this.managers.set(name, manager);
    this.managerAdded.emit({ name, manager });
  }

  public removeManager(name: string): void {
    const manager = this.managers.get(name);
    if (manager) {
      manager.destroy();
      this.managers.delete(name);
      this.initializedManagers.delete(name);
      this.managerRemoved.emit(name);
    }
  }

  public getManager<T extends Manager>(name: string): T | undefined {
    return this.managers.get(name) as T;
  }

  public hasManager(name: string): boolean {
    return this.managers.has(name);
  }

  public initManager(name: string): void {
    const manager = this.managers.get(name);
    if (manager && !this.initializedManagers.has(name)) {
      manager.init();
      this.initializedManagers.add(name);
    }
  }

  public getAllManagers(): Map<string, Manager> {
    return new Map(this.managers);
  }

  // 场景管理
  public add(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  public remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  // 销毁
  public destroy(): void {
    this.managers.forEach(manager => {
      manager.destroy();
    });
    
    this.managers.clear();
    this.initializedManagers.clear();
    
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
} 