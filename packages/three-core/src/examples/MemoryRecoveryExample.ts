import { Engine } from '../core/Engine';
import { MemoryManager } from '../core/MemoryManager';
import { RecoveryManager } from '../core/RecoveryManager';
import { ObjectManager } from '../core/ObjectManager';
import { LoaderManager } from '../core/LoaderManager';
import { MonitorManager } from '../core/MonitorManager';
import * as THREE from 'three';

export class MemoryRecoveryExample {
  private engine: Engine;
  private memoryManager: MemoryManager | null = null;
  private recoveryManager: RecoveryManager | null = null;
  private objectManager: ObjectManager | null = null;
  private loaderManager: LoaderManager | null = null;
  private monitorManager: MonitorManager | null = null;

  // 信号
  public readonly memoryData = createSignal<any>(null);
  public readonly recoveryData = createSignal<any>(null);
  public readonly errorOccurred = createSignal<string>('');

  constructor() {
    this.engine = new Engine({
      container: document.getElementById('app') as HTMLElement,
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      alpha: true,
      shadowMap: true,
      autoRender: true,
      autoResize: true,
      enableManagers: [
        'scene', 'camera', 'renderer', 'controls', 'lights',
        'materials', 'geometries', 'textures', 'objects', 'loader'
      ]
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // 监听内存数据更新
    this.engine.getMemory().then(memory => {
      this.memoryManager = memory;
      if (memory) {
        memory.memoryUpdated.subscribe((data) => {
          this.memoryData.emit(data);
        });

        memory.leakDetected.subscribe((leaks) => {
          if (leaks && leaks.length > 0) {
            console.warn('检测到内存泄漏:', leaks);
          }
        });

        memory.memoryWarning.subscribe((warning) => {
          this.errorOccurred.emit(warning);
        });

        memory.cleanupCompleted.subscribe((result) => {
          if (result) {
            console.log('内存清理完成:', result);
          }
        });
      }
    });

    // 监听错误恢复
    this.engine.getRecovery().then(recovery => {
      this.recoveryManager = recovery;
      if (recovery) {
        recovery.errorOccurred.subscribe((error) => {
          if (error) {
            console.error('错误发生:', error);
            this.errorOccurred.emit(`${error.manager}.${error.operation}: ${error.error.message}`);
          }
        });

        recovery.recoveryAttempted.subscribe((result) => {
          this.recoveryData.emit(result);
        });

        recovery.recoverySucceeded.subscribe((message) => {
          console.log('恢复成功:', message);
        });

        recovery.recoveryFailed.subscribe((error) => {
          if (error) {
            console.error('恢复失败:', error);
          }
        });
      }
    });

    // 监听性能监控
    this.engine.getMonitor().then(monitor => {
      this.monitorManager = monitor;
    });

    // 获取其他管理器
    this.engine.getObjects().then(objects => {
      this.objectManager = objects;
    });

    this.engine.getLoader().then(loader => {
      this.loaderManager = loader;
    });
  }

  async initialize(): Promise<void> {
    console.log('🚀 初始化内存恢复示例...');

    // 初始化引擎
    await this.engine.engineInitialized.emit(this.engine);

    // 设置场景
    await this.setupScene();

    // 开始内存监控
    this.startMemoryMonitoring();

    // 模拟错误和恢复
    this.simulateErrors();

    console.log('✅ 内存恢复示例初始化完成');
  }

  private async setupScene(): Promise<void> {
    const scene = await this.engine.getScene();
    const camera = await this.engine.getCamera();
    const lights = await this.engine.getLights();
    const materials = await this.engine.getMaterials();
    const geometries = await this.engine.getGeometry();

    // 设置相机
    camera.setPosition(new THREE.Vector3(0, 5, 10));
    camera.setTarget(new THREE.Vector3(0, 0, 0));

    // 添加光源
    lights.createAmbientLight('ambient', 0.4, 0x404040);
    lights.createDirectionalLight('directional', 1, 0xffffff, new THREE.Vector3(5, 5, 5));

    // 创建一些测试对象
    if (this.objectManager) {
      // 创建多个对象来测试内存管理
      for (let i = 0; i < 10; i++) {
        const geometry = geometries.createBoxGeometry(`box_${i}`, 1, 1, 1);
        const material = materials.createStandardMaterial(`material_${i}`, Math.random() * 0xffffff, 1, 0.5, 0.5);

        const mesh = this.objectManager.createMesh(`test_mesh_${i}`, geometry, material, {
          position: { x: (i - 5) * 2, y: 0, z: 0 }
        });

        // 标记为使用中
        if (this.memoryManager) {
          this.memoryManager.markResourceAsUsed('geometry', geometry.uuid);
          this.memoryManager.markResourceAsUsed('material', material.uuid);
          this.memoryManager.markResourceAsUsed('object', mesh.uuid);
        }
      }
    }
  }

  private startMemoryMonitoring(): void {
    if (!this.memoryManager) return;

    // 设置内存监控配置
    this.memoryManager.setConfig({
      enabled: true,
      checkInterval: 2000, // 2秒检查一次
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      maxIdleTime: 10000, // 10秒
      autoCleanup: true,
      logToConsole: true
    });

    console.log('🧠 内存监控已启动');
  }

  private simulateErrors(): void {
    // 模拟不同类型的错误
    setTimeout(() => {
      this.simulateRenderError();
    }, 5000);

    setTimeout(() => {
      this.simulateMemoryError();
    }, 10000);

    setTimeout(() => {
      this.simulateLoadError();
    }, 15000);
  }

  private simulateRenderError(): void {
    console.log('🎭 模拟渲染错误...');
    
    if (this.recoveryManager) {
      const error = new Error('模拟渲染错误');
      this.recoveryManager.handleError('renderer', 'render', error);
    }
  }

  private simulateMemoryError(): void {
    console.log('💾 模拟内存错误...');
    
    if (this.recoveryManager) {
      const error = new Error('内存使用过高');
      this.recoveryManager.handleError('memory', 'allocation', error);
    }
  }

  private simulateLoadError(): void {
    console.log('📦 模拟加载错误...');
    
    if (this.recoveryManager) {
      const error = new Error('模型加载失败');
      this.recoveryManager.handleError('loader', 'load', error);
    }
  }

  // 创建大量对象来测试内存压力
  createMemoryPressure(): void {
    if (!this.objectManager || !this.memoryManager) return;

    console.log('📈 创建内存压力...');

    const geometries = this.engine.getManager('geometries');
    const materials = this.engine.getManager('materials');

    if (!geometries || !materials) return;

    // 创建大量对象
    for (let i = 0; i < 50; i++) {
      const geometry = geometries.createSphereGeometry(`sphere_${i}`, 0.5, 16, 16);
      const material = materials.createStandardMaterial(`pressure_material_${i}`, Math.random() * 0xffffff, 1, Math.random(), Math.random());

      const mesh = this.objectManager.createMesh(`pressure_mesh_${i}`, geometry, material, {
        position: {
          x: (i % 10 - 5) * 2,
          y: Math.floor(i / 10) * 2,
          z: 0
        }
      });

      // 标记为使用中
      this.memoryManager.markResourceAsUsed('geometry', geometry.uuid);
      this.memoryManager.markResourceAsUsed('material', material.uuid);
      this.memoryManager.markResourceAsUsed('object', mesh.uuid);
    }

    console.log('📈 内存压力创建完成');
  }

  // 释放内存压力
  releaseMemoryPressure(): void {
    if (!this.objectManager || !this.memoryManager) return;

    console.log('📉 释放内存压力...');

    const objects = this.objectManager.getAllObjects();
    const geometries = this.engine.getManager('geometries');
    const materials = this.engine.getManager('materials');

    if (!geometries || !materials) return;

    // 释放压力测试对象
    objects.forEach((object: any) => {
      if (object.name && object.name.startsWith('pressure_')) {
        this.objectManager!.removeObject(object.uuid);
        
        // 标记为未使用
        this.memoryManager!.markResourceAsUnused('object', object.uuid);
        
        if (object.geometry) {
          this.memoryManager!.markResourceAsUnused('geometry', object.geometry.uuid);
        }
        
        if (object.material) {
          this.memoryManager!.markResourceAsUnused('material', object.material.uuid);
        }
      }
    });

    console.log('📉 内存压力释放完成');
  }

  // 强制清理内存
  forceCleanup(): void {
    if (!this.memoryManager) return;

    console.log('🧹 强制清理内存...');
    const result = this.memoryManager.forceCleanup();
    console.log('🧹 清理结果:', result);
  }

  // 检查系统稳定性
  checkSystemStability(): boolean {
    if (!this.recoveryManager) return false;

    const isStable = this.recoveryManager.checkSystemStability();
    console.log('🔍 系统稳定性:', isStable ? '稳定' : '不稳定');
    return isStable;
  }

  // 获取内存统计
  getMemoryStats(): any {
    if (!this.memoryManager) return null;

    const latestMemory = this.memoryManager.getLatestMemory();
    const leakData = this.memoryManager.getLeakDetectorData();
    const memoryData = this.memoryManager.getMemoryData();

    return {
      latest: latestMemory,
      leaks: leakData,
      history: memoryData,
      config: this.memoryManager.getConfig()
    };
  }

  // 获取错误统计
  getErrorStats(): any {
    if (!this.recoveryManager) return null;

    const errorStats = this.recoveryManager.getErrorStats();
    const errorHistory = this.recoveryManager.getErrorHistory();
    const recoveryHistory = this.recoveryManager.getRecoveryHistory();
    const latestError = this.recoveryManager.getLatestError();

    return {
      stats: errorStats,
      errors: errorHistory,
      recoveries: recoveryHistory,
      latest: latestError,
      isStable: this.recoveryManager.checkSystemStability()
    };
  }

  // 获取性能数据
  getPerformanceData(): any {
    if (!this.monitorManager) return null;

    const latestPerformance = this.monitorManager.getLatestPerformance();
    const latestResources = this.monitorManager.getLatestResources();

    return {
      fps: latestPerformance?.fps || 0,
      memory: latestPerformance?.memory || { geometries: 0, textures: 0, triangles: 0, calls: 0 },
      renderCalls: latestPerformance?.render.calls || 0,
      resourceData: latestResources || { objects: 0, geometries: 0, materials: 0, textures: 0, lights: 0, cameras: 0 },
      warnings: [] // 暂时返回空数组
    };
  }

  // 创建UI面板
  createUIPanel(): void {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
    `;

    const updatePanel = () => {
      const memoryStats = this.getMemoryStats();
      const errorStats = this.getErrorStats();
      const performanceData = this.getPerformanceData();

      panel.innerHTML = `
        <h3>🧠 内存管理</h3>
        <div>几何体: ${memoryStats?.latest?.geometries || 0}</div>
        <div>纹理: ${memoryStats?.latest?.textures || 0}</div>
        <div>材质: ${memoryStats?.latest?.materials || 0}</div>
        <div>对象: ${memoryStats?.latest?.objects || 0}</div>
        <div>总内存: ${memoryStats?.latest ? (memoryStats.latest.totalMemory / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'}</div>
        <div>泄漏: ${memoryStats?.leaks?.length || 0}</div>
        
        <h3>🔄 错误恢复</h3>
        <div>总错误: ${errorStats?.stats?.total || 0}</div>
        <div>最近错误: ${errorStats?.stats?.recentErrors || 0}</div>
        <div>系统稳定: ${errorStats?.isStable ? '✅' : '❌'}</div>
        
        <h3>📊 性能监控</h3>
        <div>FPS: ${performanceData?.fps || 'N/A'}</div>
        <div>渲染调用: ${performanceData?.renderCalls || 'N/A'}</div>
        <div>警告: ${performanceData?.warnings?.length || 0}</div>
        
        <div style="margin-top: 10px;">
          <button onclick="window.memoryExample.createMemoryPressure()" style="margin: 2px; padding: 5px;">创建压力</button>
          <button onclick="window.memoryExample.releaseMemoryPressure()" style="margin: 2px; padding: 5px;">释放压力</button>
          <button onclick="window.memoryExample.forceCleanup()" style="margin: 2px; padding: 5px;">强制清理</button>
        </div>
      `;
    };

    // 定期更新面板
    setInterval(updatePanel, 1000);
    updatePanel();

    document.body.appendChild(panel);
  }

  dispose(): void {
    // 清理信号
    this.memoryData.dispose();
    this.recoveryData.dispose();
    this.errorOccurred.dispose();

    // 停止内存监控
    if (this.memoryManager) {
      this.memoryManager.stopMonitoring();
    }

    // 清理引擎
    this.engine.dispose();

    console.log('🧹 内存恢复示例已清理');
  }
}

// 创建信号函数
function createSignal<T>(initialValue: T) {
  let value = initialValue;
  const listeners: ((value: T) => void)[] = [];

  return {
    emit: (newValue: T) => {
      value = newValue;
      listeners.forEach(listener => listener(newValue));
    },
    subscribe: (listener: (value: T) => void) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
    dispose: () => {
      listeners.length = 0;
    }
  };
}

// 全局访问
declare global {
  interface Window {
    memoryExample: MemoryRecoveryExample;
  }
}

// 使用示例
if (typeof window !== 'undefined') {
  const example = new MemoryRecoveryExample();
  window.memoryExample = example;
  
  example.initialize().then(() => {
    example.createUIPanel();
    console.log('🎉 内存恢复示例已启动');
  });
} 