import { Engine } from '../core/Engine';
import { DynamicManagerRegistry } from '../core/DynamicManagerRegistry';
import * as THREE from 'three';

/**
 * 动态加载示例 - 展示真正的按需加载
 * 
 * 这个示例展示了如何动态加载管理器，实现真正的代码分割
 */
export class DynamicLoadingExample {
  private engine: Engine;
  private registry: DynamicManagerRegistry;

  constructor() {
    // 只启用核心管理器
    this.engine = new Engine({
      width: 800,
      height: 600,
      antialias: true,
      autoRender: true,
      autoResize: true,
      // 只启用最核心的管理器
      enableManagers: [
        'scene',    // 场景管理
        'camera',   // 相机管理
        'renderer'  // 渲染器管理
      ]
    });

    this.registry = DynamicManagerRegistry.getInstance();
  }

  async initialize(): Promise<void> {
    console.log('🚀 初始化动态加载示例...');
    
    // 初始化引擎（只会创建指定的管理器）
    await this.engine.initialize();
    
    console.log('✅ 基础引擎初始化完成');
    console.log('📊 已启用的管理器:', this.engine.getInitializedManagers());
    
    // 创建基础场景
    await this.createBasicScene();
    
    console.log('🎯 动态加载示例准备就绪');
  }

  private async createBasicScene(): Promise<void> {
    // 获取场景管理器
    const sceneManager = await this.engine.getScene();
    const cameraManager = await this.engine.getCamera();

    // 创建简单的立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    
    // 添加到场景
    sceneManager.add(cube);
    
    // 设置相机位置
    cameraManager.setPosition(0, 0, 5);
    
    console.log('📦 创建了基础立方体场景');
  }

  // 演示动态加载控制器
  async loadControls(): Promise<void> {
    console.log('🎮 动态加载控制器...');
    
    try {
      // 动态加载控制器管理器
      const controlsManager = await this.registry.createManager('controls', this.engine);
      await this.engine.addManager('controls', controlsManager);
      
      // 启用控制器
      if ('enable' in controlsManager) {
        (controlsManager as any).enable();
      }
      
      console.log('✅ 控制器已动态加载');
      console.log('📊 当前启用的管理器:', this.engine.getInitializedManagers());
    } catch (error) {
      console.error('❌ 加载控制器失败:', error);
    }
  }

  // 演示动态加载光照
  async loadLighting(): Promise<void> {
    console.log('💡 动态加载光照系统...');
    
    try {
      // 动态加载光照管理器
      const lightsManager = await this.registry.createManager('lights', this.engine);
      await this.engine.addManager('lights', lightsManager);
      
      // 创建环境光
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      if ('add' in lightsManager) {
        (lightsManager as any).add(ambientLight);
      }
      
      // 创建方向光
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      if ('add' in lightsManager) {
        (lightsManager as any).add(directionalLight);
      }
      
      console.log('✅ 光照系统已动态加载');
    } catch (error) {
      console.error('❌ 加载光照失败:', error);
    }
  }

  // 演示动态加载材质
  async loadMaterials(): Promise<void> {
    console.log('🎨 动态加载材质系统...');
    
    try {
      // 动态加载材质管理器
      const materialsManager = await this.registry.createManager('materials', this.engine);
      await this.engine.addManager('materials', materialsManager);
      
      // 创建新材质
      const material = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
        shininess: 100 
      });
      
      if ('add' in materialsManager) {
        (materialsManager as any).add('redMaterial', material);
      }
      
      console.log('✅ 材质系统已动态加载');
    } catch (error) {
      console.error('❌ 加载材质失败:', error);
    }
  }

  // 演示动态加载性能监控
  async loadPerformanceMonitoring(): Promise<void> {
    console.log('📈 动态加载性能监控...');
    
    try {
      // 动态加载监控管理器
      const monitorManager = await this.registry.createManager('monitor', this.engine);
      await this.engine.addManager('monitor', monitorManager);
      
      // 开始监控
      if ('startMonitoring' in monitorManager) {
        (monitorManager as any).startMonitoring();
      }
      
      // 监听性能数据
      if ('performanceData' in monitorManager) {
        (monitorManager as any).performanceData.subscribe((data: any) => {
          console.log('📊 性能数据:', {
            fps: data.fps,
            memory: data.memory,
            renderTime: data.renderTime
          });
        });
      }
      
      console.log('✅ 性能监控已动态加载');
    } catch (error) {
      console.error('❌ 加载性能监控失败:', error);
    }
  }

  // 演示动态加载内存管理
  async loadMemoryManagement(): Promise<void> {
    console.log('🧠 动态加载内存管理...');
    
    try {
      // 动态加载内存管理器
      const memoryManager = await this.registry.createManager('memory', this.engine);
      await this.engine.addManager('memory', memoryManager);
      
      // 开始内存监控
      if ('startMonitoring' in memoryManager) {
        (memoryManager as any).startMonitoring();
      }
      
      // 监听内存警告
      if ('memoryWarning' in memoryManager) {
        (memoryManager as any).memoryWarning.subscribe((warning: any) => {
          console.warn('⚠️ 内存警告:', warning);
        });
      }
      
      console.log('✅ 内存管理已动态加载');
    } catch (error) {
      console.error('❌ 加载内存管理失败:', error);
    }
  }

  // 演示预加载多个管理器
  async preloadManagers(): Promise<void> {
    console.log('🚀 预加载多个管理器...');
    
    const managerTypes: ManagerType[] = ['controls', 'lights', 'materials', 'monitor'];
    
    try {
      // 预加载管理器
      await this.registry.preloadManagers(managerTypes);
      
      console.log('✅ 预加载完成');
      console.log('📊 已加载的管理器:', this.registry.getLoadedManagers());
    } catch (error) {
      console.error('❌ 预加载失败:', error);
    }
  }

  // 演示条件加载
  async loadConditionalFeatures(): Promise<void> {
    console.log('🎯 根据条件加载功能...');
    
    // 模拟设备性能检测
    const devicePerformance = this.getDevicePerformance();
    
    if (devicePerformance === 'high') {
      // 高性能设备 - 加载高级功能
      console.log('🖥️ 检测到高性能设备，加载高级功能...');
      
      try {
        const rayTracingManager = await this.registry.createManager('rayTracing', this.engine);
        await this.engine.addManager('rayTracing', rayTracingManager);
        
        const volumetricManager = await this.registry.createManager('volumetric', this.engine);
        await this.engine.addManager('volumetric', volumetricManager);
        
        console.log('✅ 高级渲染功能已加载');
      } catch (error) {
        console.error('❌ 加载高级功能失败:', error);
      }
    } else if (devicePerformance === 'medium') {
      // 中等性能设备 - 加载优化功能
      console.log('💻 检测到中等性能设备，加载优化功能...');
      
      try {
        const instanceManager = await this.registry.createManager('instance', this.engine);
        await this.engine.addManager('instance', instanceManager);
        
        const lodManager = await this.registry.createManager('lod', this.engine);
        await this.engine.addManager('lod', lodManager);
        
        console.log('✅ 优化功能已加载');
      } catch (error) {
        console.error('❌ 加载优化功能失败:', error);
      }
    } else {
      // 低性能设备 - 只使用基础功能
      console.log('📱 检测到低性能设备，使用基础功能');
    }
  }

  // 模拟设备性能检测
  private getDevicePerformance(): 'high' | 'medium' | 'low' {
    // 这里可以根据实际的设备检测逻辑来实现
    const memory = (performance as any).memory;
    if (memory && memory.jsHeapSizeLimit > 2 * 1024 * 1024 * 1024) {
      return 'high';
    } else if (memory && memory.jsHeapSizeLimit > 1 * 1024 * 1024 * 1024) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // 获取引擎实例
  getEngine(): Engine {
    return this.engine;
  }

  // 获取注册表实例
  getRegistry(): DynamicManagerRegistry {
    return this.registry;
  }

  // 清理资源
  dispose(): void {
    console.log('🧹 清理动态加载示例资源...');
    
    // 清理未使用的管理器
    const usedManagers = this.engine.getInitializedManagers();
    this.registry.cleanupUnusedManagers(usedManagers);
    
    this.engine.dispose();
  }
}

// 使用示例
export async function runDynamicLoadingExample(): Promise<void> {
  const example = new DynamicLoadingExample();
  
  try {
    // 初始化基础场景
    await example.initialize();
    
    // 等待一段时间后动态加载功能
    setTimeout(async () => {
      await example.loadControls();
    }, 2000);
    
    setTimeout(async () => {
      await example.loadLighting();
    }, 4000);
    
    setTimeout(async () => {
      await example.loadMaterials();
    }, 6000);
    
    setTimeout(async () => {
      await example.loadPerformanceMonitoring();
    }, 8000);
    
    setTimeout(async () => {
      await example.loadMemoryManagement();
    }, 10000);
    
    setTimeout(async () => {
      await example.preloadManagers();
    }, 12000);
    
    setTimeout(async () => {
      await example.loadConditionalFeatures();
    }, 14000);
    
  } catch (error) {
    console.error('❌ 动态加载示例运行失败:', error);
  }
}

// 导出示例
export default DynamicLoadingExample; 