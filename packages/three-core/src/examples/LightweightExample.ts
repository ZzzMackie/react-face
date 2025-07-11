import { Engine } from '../core/Engine';
import * as THREE from 'three';

/**
 * 轻量级示例 - 展示按需初始化的优势
 * 
 * 这个示例只启用最基本的管理器，展示轻量级使用场景
 */
export class LightweightExample {
  private engine: Engine;

  constructor() {
    // 只启用最基本的管理器，实现轻量级初始化
    this.engine = new Engine({
      width: 800,
      height: 600,
      antialias: true,
      autoRender: true,
      autoResize: true,
      // 只启用核心管理器，其他管理器按需创建
      enableManagers: [
        'scene',    // 场景管理
        'camera',   // 相机管理
        'renderer', // 渲染器管理
        'controls'  // 控制器管理
      ]
    });
  }

  async initialize(): Promise<void> {
    console.log('🚀 初始化轻量级引擎...');
    
    // 初始化引擎（只会创建指定的管理器）
    await this.engine.initialize();
    
    console.log('✅ 轻量级引擎初始化完成');
    console.log('📊 已启用的管理器:', this.engine.getInitializedManagers());
    
    // 创建简单的立方体
    await this.createSimpleScene();
    
    console.log('🎯 轻量级示例准备就绪');
  }

  private async createSimpleScene(): Promise<void> {
    // 获取场景管理器
    const sceneManager = await this.engine.getScene();
    const cameraManager = await this.engine.getCamera();
    const controlsManager = await this.engine.getControls();

    // 创建简单的立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    
    // 添加到场景
    sceneManager.add(cube);
    
    // 设置相机位置
    cameraManager.setPosition(0, 0, 5);
    
    // 启用控制器
    controlsManager.enable();
    
    console.log('📦 创建了简单的立方体场景');
  }

  // 演示按需添加管理器
  async addLighting(): Promise<void> {
    console.log('💡 按需添加光照管理器...');
    
    // 动态添加光照管理器
    const lightsManager = await this.engine.getLights();
    
    // 创建环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    lightsManager.add(ambientLight);
    
    // 创建方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    lightsManager.add(directionalLight);
    
    console.log('✅ 光照管理器已按需添加');
    console.log('📊 当前启用的管理器:', this.engine.getInitializedManagers());
  }

  // 演示按需添加材质管理器
  async addMaterials(): Promise<void> {
    console.log('🎨 按需添加材质管理器...');
    
    // 动态添加材质管理器
    const materialsManager = await this.engine.getMaterials();
    
    // 创建新材质
    const material = new THREE.MeshPhongMaterial({ 
      color: 0xff0000,
      shininess: 100 
    });
    materialsManager.add('redMaterial', material);
    
    console.log('✅ 材质管理器已按需添加');
  }

  // 演示按需添加性能监控
  async addPerformanceMonitoring(): Promise<void> {
    console.log('📈 按需添加性能监控...');
    
    // 动态添加性能监控
    const monitorManager = await this.engine.getMonitor();
    
    if (monitorManager) {
      // 开始监控
      monitorManager.startMonitoring();
      
      // 监听性能数据
      monitorManager.performanceData.subscribe((data) => {
        console.log('📊 性能数据:', {
          fps: data.fps,
          memory: data.memory,
          renderTime: data.renderTime
        });
      });
      
      console.log('✅ 性能监控已按需添加');
    }
  }

  // 演示按需添加内存管理
  async addMemoryManagement(): Promise<void> {
    console.log('🧠 按需添加内存管理...');
    
    // 动态添加内存管理
    const memoryManager = await this.engine.getMemory();
    
    if (memoryManager) {
      // 开始内存监控
      memoryManager.startMonitoring();
      
      // 监听内存警告
      memoryManager.memoryWarning.subscribe((warning) => {
        console.warn('⚠️ 内存警告:', warning);
      });
      
      console.log('✅ 内存管理已按需添加');
    }
  }

  // 获取引擎实例
  getEngine(): Engine {
    return this.engine;
  }

  // 清理资源
  dispose(): void {
    console.log('🧹 清理轻量级示例资源...');
    this.engine.dispose();
  }
}

// 使用示例
export async function runLightweightExample(): Promise<void> {
  const example = new LightweightExample();
  
  try {
    // 初始化基本场景
    await example.initialize();
    
    // 等待一段时间后按需添加功能
    setTimeout(async () => {
      await example.addLighting();
    }, 2000);
    
    setTimeout(async () => {
      await example.addMaterials();
    }, 4000);
    
    setTimeout(async () => {
      await example.addPerformanceMonitoring();
    }, 6000);
    
    setTimeout(async () => {
      await example.addMemoryManagement();
    }, 8000);
    
  } catch (error) {
    console.error('❌ 轻量级示例运行失败:', error);
  }
}

// 导出示例
export default LightweightExample; 