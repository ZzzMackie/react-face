import { Engine } from '../core/Engine';
import { createSignal } from '../core/Signal';
import type { EngineOptions } from '../types/Engine';

/**
 * 现代化架构使用示例
 * 展示如何使用新的模块化架构和按需初始化
 */
export class ModernExample {
  private engine: Engine;
  
  // 信号系统示例
  public readonly sceneLoaded = createSignal<boolean>(false);
  public readonly objectSelected = createSignal<string>('');
  public readonly cameraPosition = createSignal<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  constructor(container: HTMLElement) {
    // 配置引擎
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
      },
      controls: {
        enabled: true,
        type: 'orbit',
        enableDamping: true,
        dampingFactor: 0.05,
        enableZoom: true,
        enableRotate: true,
        enablePan: true
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
      console.log(`Manager initialized: ${managerName}`);
    });

    // 监听相机位置变化
    this.engine.camera.positionChanged.subscribe((position) => {
      this.cameraPosition.value = {
        x: position.x,
        y: position.y,
        z: position.z
      };
    });

    // 监听对象选择
    this.engine.objects.objectSelected.subscribe((objectName) => {
      this.objectSelected.value = objectName;
    });

    // 监听场景加载完成
    this.engine.loader.loadCompleted.subscribe((result) => {
      if (result) {
        this.sceneLoaded.value = true;
        console.log('Scene loaded successfully');
      }
    });
  }

  /**
   * 初始化示例
   */
  async initialize(): Promise<void> {
    try {
      // 初始化引擎（只初始化核心管理器）
      await this.engine.initialize();
      console.log('Core managers initialized');

      // 按需初始化其他管理器
      await this.initializeOptionalManagers();

      console.log('Modern example initialized successfully');
    } catch (error) {
      console.error('Failed to initialize modern example:', error);
    }
  }

  /**
   * 按需初始化可选管理器
   */
  private async initializeOptionalManagers(): Promise<void> {
    // 根据需求按需初始化管理器
    
    // 如果需要灯光功能
    if (this.needsLighting()) {
      const lights = await this.engine.getLights();
      await this.createBasicLights(lights);
    }

    // 如果需要控制器功能
    if (this.needsControls()) {
      const controls = await this.engine.getControls();
      this.setupControls(controls);
    }

    // 如果需要辅助线功能
    if (this.needsHelpers()) {
      const helpers = await this.engine.getHelpers();
      this.createBasicHelpers(helpers);
    }

    // 如果需要加载功能
    if (this.needsLoading()) {
      const loader = await this.engine.getLoader();
      await this.loadModel(loader);
    }
  }

  /**
   * 检查是否需要灯光功能
   */
  private needsLighting(): boolean {
    // 根据实际需求决定
    return true;
  }

  /**
   * 检查是否需要控制器功能
   */
  private needsControls(): boolean {
    // 根据实际需求决定
    return true;
  }

  /**
   * 检查是否需要辅助线功能
   */
  private needsHelpers(): boolean {
    // 根据实际需求决定
    return true;
  }

  /**
   * 检查是否需要加载功能
   */
  private needsLoading(): boolean {
    // 根据实际需求决定
    return false; // 示例中不加载模型
  }

  /**
   * 创建基础灯光
   */
  private async createBasicLights(lights: any): Promise<void> {
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
  }

  /**
   * 设置控制器
   */
  private setupControls(controls: any): void {
    // 启用轨道控制器
    controls.enableOrbitControls({
      enableDamping: true,
      dampingFactor: 0.05,
      enableZoom: true,
      enableRotate: true,
      enablePan: true
    });

    // 启用变换控制器
    controls.enableTransformControls({
      mode: 'translate',
      size: 1
    });
  }

  /**
   * 创建基础辅助线
   */
  private createBasicHelpers(helpers: any): void {
    // 创建网格辅助线
    helpers.createGridHelper('grid', {
      size: 20,
      divisions: 20
    });

    // 创建坐标轴辅助线
    helpers.createAxesHelper('axes', {
      size: 5
    });
  }

  /**
   * 加载模型
   */
  private async loadModel(loader: any): Promise<void> {
    try {
      // 加载 GLTF 模型
      const result = await loader.loadGLTF('/models/example.glb', {
        onProgress: (progress: any) => {
          console.log(`Loading progress: ${progress.loaded / progress.total * 100}%`);
        },
        onError: (error: Error) => {
          console.error('Failed to load model:', error);
        }
      });

      if (result.scene) {
        // 添加到场景
        this.engine.scene.add(result.scene);
        
        // 创建包围盒辅助线
        const helpers = await this.engine.getHelpers();
        helpers.createBoxHelper('modelBox', result.scene);
      }
    } catch (error) {
      console.error('Failed to load model:', error);
    }
  }

  /**
   * 创建几何体示例（按需初始化材质和对象管理器）
   */
  async createGeometryExamples(): Promise<void> {
    // 按需初始化材质管理器
    const materials = await this.engine.getMaterials();
    
    // 按需初始化对象管理器
    const objects = await this.engine.getObjects();

    // 创建立方体
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeMaterial = materials.createMeshStandardMaterial('cubeMaterial', {
      color: 0x00ff00,
      roughness: 0.5,
      metalness: 0.1
    });

    const cube = objects.createMesh('cube', cubeGeometry, cubeMaterial);
    cube.position.set(-3, 0, 0);

    // 创建球体
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = materials.createMeshStandardMaterial('sphereMaterial', {
      color: 0xff0000,
      roughness: 0.3,
      metalness: 0.7
    });

    const sphere = objects.createMesh('sphere', sphereGeometry, sphereMaterial);
    sphere.position.set(0, 0, 0);

    // 创建圆柱体
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 1, 2, 16);
    const cylinderMaterial = materials.createMeshStandardMaterial('cylinderMaterial', {
      color: 0x0000ff,
      roughness: 0.8,
      metalness: 0.2
    });

    const cylinder = objects.createMesh('cylinder', cylinderGeometry, cylinderMaterial);
    cylinder.position.set(3, 0, 0);
  }

  /**
   * 导出场景（按需初始化导出管理器）
   */
  async exportScene(): Promise<void> {
    try {
      // 按需初始化导出管理器
      const exportManager = await this.engine.getExport();
      
      // 导出为 GLB
      const glbBlob = await exportManager.exportGLB({
        binary: true,
        onlyVisible: true
      });

      // 下载文件
      exportManager.downloadFile(glbBlob, 'scene.glb');
      
      console.log('Scene exported successfully');
    } catch (error) {
      console.error('Failed to export scene:', error);
    }
  }

  /**
   * 获取已初始化的管理器列表
   */
  getInitializedManagers(): string[] {
    return this.engine.getInitializedManagers();
  }

  /**
   * 检查管理器是否已初始化
   */
  isManagerInitialized(managerName: string): boolean {
    return this.engine.isManagerInitialized(managerName);
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
    this.sceneLoaded.dispose();
    this.objectSelected.dispose();
    this.cameraPosition.dispose();
  }
} 