import { Engine } from '../core/Engine';
import { createSignal } from '../core/Signal';
import type { EngineOptions } from '../types/Engine';

/**
 * 简单使用示例
 * 展示按需初始化的正确用法
 */
export class SimpleExample {
  private engine: Engine;
  
  // 信号系统
  public readonly initialized = createSignal<boolean>(false);

  constructor(container: HTMLElement) {
    // 基础配置
    const options: EngineOptions = {
      canvas: container as HTMLCanvasElement,
      antialias: true,
      alpha: true,
      camera: {
        type: 'perspective',
        fov: 75,
        near: 0.1,
        far: 1000,
        position: { x: 0, y: 5, z: 10 },
        lookAt: { x: 0, y: 0, z: 0 }
      }
    };

    this.engine = new Engine(options);
    this.setupSignals();
  }

  /**
   * 设置信号监听
   */
  private setupSignals(): void {
    // 监听管理器初始化
    this.engine.managerInitialized.subscribe((managerName) => {
      console.log(`✅ Manager initialized: ${managerName}`);
    });

    // 监听初始化完成
    this.engine.on('initialized', () => {
      this.initialized.value = true;
      console.log('🎉 Engine initialized successfully!');
    });
  }

  /**
   * 基础初始化（只初始化核心管理器）
   */
  async initializeBasic(): Promise<void> {
    console.log('🚀 Starting basic initialization...');
    
    // 只初始化核心管理器：scene, render, camera
    await this.engine.initialize();
    
    console.log('📊 Initialized managers:', this.engine.getInitializedManagers());
    // 输出: ['scene', 'render', 'camera']
  }

  /**
   * 按需添加灯光功能
   */
  async addLighting(): Promise<void> {
    console.log('💡 Adding lighting functionality...');
    
    // 按需初始化灯光管理器
    const lights = await this.engine.getLights();
    
    // 创建环境光
    lights.createAmbientLight('ambient', {
      color: 0x404040,
      intensity: 0.4
    });

    // 创建方向光
    lights.createDirectionalLight('directional', {
      color: 0xffffff,
      intensity: 1,
      position: { x: 10, y: 10, z: 5 },
      castShadow: true
    });

    console.log('📊 Updated managers:', this.engine.getInitializedManagers());
    // 输出: ['scene', 'render', 'camera', 'lights']
  }

  /**
   * 按需添加控制器功能
   */
  async addControls(): Promise<void> {
    console.log('🎮 Adding controls functionality...');
    
    // 按需初始化控制器管理器
    const controls = await this.engine.getControls();
    
    // 启用轨道控制器
    controls.enableOrbitControls({
      enableDamping: true,
      dampingFactor: 0.05,
      enableZoom: true,
      enableRotate: true,
      enablePan: true
    });

    console.log('📊 Updated managers:', this.engine.getInitializedManagers());
    // 输出: ['scene', 'render', 'camera', 'lights', 'controls']
  }

  /**
   * 按需添加辅助线功能
   */
  async addHelpers(): Promise<void> {
    console.log('📐 Adding helpers functionality...');
    
    // 按需初始化辅助线管理器
    const helpers = await this.engine.getHelpers();
    
    // 创建网格辅助线
    helpers.createGridHelper('grid', {
      size: 20,
      divisions: 20
    });

    // 创建坐标轴辅助线
    helpers.createAxesHelper('axes', {
      size: 5
    });

    console.log('📊 Updated managers:', this.engine.getInitializedManagers());
    // 输出: ['scene', 'render', 'camera', 'lights', 'controls', 'helpers']
  }

  /**
   * 按需添加几何体功能
   */
  async addGeometry(): Promise<void> {
    console.log('🔷 Adding geometry functionality...');
    
    // 按需初始化几何体管理器
    const geometry = await this.engine.getGeometry();
    
    // 创建基础几何体
    geometry.createBoxGeometry('cube', {
      width: 2,
      height: 2,
      depth: 2
    });

    geometry.createSphereGeometry('sphere', {
      radius: 1,
      widthSegments: 32,
      heightSegments: 32
    });

    console.log('📊 Updated managers:', this.engine.getInitializedManagers());
    // 输出: ['scene', 'render', 'camera', 'lights', 'controls', 'helpers', 'geometry']
  }

  /**
   * 按需添加材质功能
   */
  async addMaterials(): Promise<void> {
    console.log('🎨 Adding materials functionality...');
    
    // 按需初始化材质管理器
    const materials = await this.engine.getMaterials();
    
    // 创建基础材质
    materials.createMeshStandardMaterial('standard', {
      color: 0x00ff00,
      roughness: 0.5,
      metalness: 0.1
    });

    materials.createMeshBasicMaterial('basic', {
      color: 0xff0000,
      wireframe: true
    });

    console.log('📊 Updated managers:', this.engine.getInitializedManagers());
    // 输出: ['scene', 'render', 'camera', 'lights', 'controls', 'helpers', 'geometry', 'materials']
  }

  /**
   * 按需添加对象功能
   */
  async addObjects(): Promise<void> {
    console.log('📦 Adding objects functionality...');
    
    // 按需初始化对象管理器
    const objects = await this.engine.getObjects();
    
    // 创建网格对象
    const geometry = await this.engine.getGeometry();
    const materials = await this.engine.getMaterials();
    
    const cubeGeometry = geometry.getGeometry('cube');
    const cubeMaterial = materials.getMaterial('standard');
    
    if (cubeGeometry && cubeMaterial) {
      objects.createMesh('cube', cubeGeometry, cubeMaterial);
    }

    console.log('📊 Updated managers:', this.engine.getInitializedManagers());
    // 输出: ['scene', 'render', 'camera', 'lights', 'controls', 'helpers', 'geometry', 'materials', 'objects']
  }

  /**
   * 按需添加加载功能
   */
  async addLoading(): Promise<void> {
    console.log('📥 Adding loading functionality...');
    
    // 按需初始化加载器管理器
    const loader = await this.engine.getLoader();
    
    // 设置 DRACO 解码器路径
    loader.setDracoDecoderPath('/draco/');
    
    console.log('📊 Updated managers:', this.engine.getInitializedManagers());
    // 输出: ['scene', 'render', 'camera', 'lights', 'controls', 'helpers', 'geometry', 'materials', 'objects', 'loader']
  }

  /**
   * 按需添加导出功能
   */
  async addExport(): Promise<void> {
    console.log('📤 Adding export functionality...');
    
    // 按需初始化导出管理器
    const exportManager = await this.engine.getExport();
    
    console.log('📊 Updated managers:', this.engine.getInitializedManagers());
    // 输出: ['scene', 'render', 'camera', 'lights', 'controls', 'helpers', 'geometry', 'materials', 'objects', 'loader', 'export']
  }

  /**
   * 完整初始化（按需加载所有功能）
   */
  async initializeFull(): Promise<void> {
    console.log('🚀 Starting full initialization...');
    
    // 基础初始化
    await this.initializeBasic();
    
    // 按需添加功能
    await this.addLighting();
    await this.addControls();
    await this.addHelpers();
    await this.addGeometry();
    await this.addMaterials();
    await this.addObjects();
    await this.addLoading();
    await this.addExport();
    
    console.log('🎉 Full initialization completed!');
    console.log('📊 All managers:', this.engine.getInitializedManagers());
  }

  /**
   * 检查管理器状态
   */
  checkManagerStatus(): void {
    const managers = [
      'scene', 'render', 'camera', 'lights', 'controls', 
      'helpers', 'geometry', 'materials', 'objects', 'loader', 'export'
    ];

    console.log('📋 Manager Status:');
    managers.forEach(manager => {
      const isInitialized = this.engine.isManagerInitialized(manager);
      console.log(`  ${isInitialized ? '✅' : '❌'} ${manager}`);
    });
  }

  /**
   * 调整大小
   */
  resize(width: number, height: number): void {
    this.engine.resize(width, height);
  }

  /**
   * 销毁示例
   */
  dispose(): void {
    this.engine.dispose();
    this.initialized.dispose();
  }
} 