import { Engine } from '../core/Engine';
import { createSignal } from '../core/Signal';
import * as THREE from 'three';

export class MonitorExample {
  private engine: Engine;
  private performanceData = createSignal<any>(null);
  private resourceData = createSignal<any>(null);
  private warningData = createSignal<string>('');

  constructor(container: HTMLElement) {
    this.engine = new Engine({
      container,
      width: 800,
      height: 600,
      antialias: true,
      shadowMap: true,
      enableManagers: [
        'scene', 'renderer', 'camera', 'controls', 'lights', 
        'materials', 'geometries', 'objects', 'loader', 'monitor'
      ]
    });

    this.init();
  }

  private async init(): Promise<void> {
    console.log('📊 初始化性能监控示例...');

    // 等待引擎初始化
    this.engine.engineInitialized.subscribe((engine) => {
      if (engine) {
        this.setupScene();
        this.setupMonitoring();
      }
    });
  }

  private async setupScene(): Promise<void> {
    console.log('🎨 设置场景...');

    // 设置相机
    const camera = await this.engine.getCamera();
    if (camera) {
      camera.setPosition(0, 5, 10);
    }

    // 设置控制器
    const controls = await this.engine.getControls();
    if (controls) {
      controls.createOrbitControls('orbit', {
        enableDamping: true,
        dampingFactor: 0.05,
        enableZoom: true,
        enablePan: true,
        enableRotate: true
      });
    }

    // 创建灯光
    const lights = await this.engine.getLights();
    if (lights) {
      lights.createAmbientLight('ambient', 0x404040, 0.4);
      lights.createDirectionalLight('directional', 0xffffff, 1, {
        x: 5, y: 5, z: 5
      }, { x: 0, y: 0, z: 0 }, true);
    }

    // 创建大量对象来测试性能
    await this.createTestObjects();
  }

  private async setupMonitoring(): Promise<void> {
    console.log('📊 设置性能监控...');

    const monitor = await this.engine.getMonitor();
    if (!monitor) {
      console.error('Monitor管理器未初始化');
      return;
    }

    // 配置监控器
    monitor.setConfig({
      enabled: true,
      updateInterval: 1000,
      logToConsole: true,
      maxHistory: 50
    });

    // 监听性能数据
    monitor.performanceUpdated.subscribe((data) => {
      if (data) {
        this.performanceData.value = data;
        this.updatePerformanceDisplay(data);
      }
    });

    // 监听资源数据
    monitor.resourceUpdated.subscribe((data) => {
      if (data) {
        this.resourceData.value = data;
        this.updateResourceDisplay(data);
      }
    });

    // 监听警告
    monitor.memoryWarning.subscribe((warning) => {
      if (warning) {
        this.warningData.value = `内存警告: ${warning}`;
        console.warn('⚠️', warning);
      }
    });

    monitor.performanceWarning.subscribe((warning) => {
      if (warning) {
        this.warningData.value = `性能警告: ${warning}`;
        console.warn('⚠️', warning);
      }
    });

    // 开始监控
    monitor.startMonitoring();
  }

  private async createTestObjects(): Promise<void> {
    console.log('📦 创建测试对象...');

    const geometry = await this.engine.getGeometry();
    const materials = await this.engine.getMaterials();
    const objects = await this.engine.getObjects();

    if (!geometry || !materials || !objects) {
      console.error('必要的管理器未初始化');
      return;
    }

    // 创建大量对象来测试性能
    for (let i = 0; i < 100; i++) {
      const boxGeometry = geometry.createBoxGeometry(`box${i}`, 0.5, 0.5, 0.5);
      const material = materials.createStandardMaterial(`material${i}`, {
        color: Math.random() * 0xffffff,
        roughness: Math.random(),
        metalness: Math.random()
      });

      objects.createMesh(`mesh${i}`, boxGeometry, material, {
        position: {
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
          z: (Math.random() - 0.5) * 20
        },
        castShadow: true,
        receiveShadow: true
      });
    }

    console.log('✅ 创建了100个测试对象');
  }

  private updatePerformanceDisplay(data: any): void {
    const container = document.getElementById('performance-display');
    if (!container) return;

    container.innerHTML = `
      <div style="background: #f0f0f0; padding: 10px; margin: 10px; border-radius: 5px;">
        <h3>📊 性能监控</h3>
        <p><strong>FPS:</strong> ${data.fps}</p>
        <p><strong>渲染调用:</strong> ${data.render.calls}</p>
        <p><strong>三角形:</strong> ${data.render.triangles.toLocaleString()}</p>
        <p><strong>几何体:</strong> ${data.memory.geometries}</p>
        <p><strong>纹理:</strong> ${data.memory.textures}</p>
        <p><strong>时间戳:</strong> ${new Date(data.timestamp).toLocaleTimeString()}</p>
      </div>
    `;
  }

  private updateResourceDisplay(data: any): void {
    const container = document.getElementById('resource-display');
    if (!container) return;

    container.innerHTML = `
      <div style="background: #e0f0e0; padding: 10px; margin: 10px; border-radius: 5px;">
        <h3>📦 资源统计</h3>
        <p><strong>对象:</strong> ${data.objects}</p>
        <p><strong>几何体:</strong> ${data.geometries}</p>
        <p><strong>材质:</strong> ${data.materials}</p>
        <p><strong>纹理:</strong> ${data.textures}</p>
        <p><strong>光源:</strong> ${data.lights}</p>
        <p><strong>相机:</strong> ${data.cameras}</p>
      </div>
    `;
  }

  // 公共方法
  public async getPerformanceStats(): Promise<any> {
    const monitor = await this.engine.getMonitor();
    if (!monitor) return null;
    return monitor.getPerformanceStats();
  }

  public async getResourceStats(): Promise<any> {
    const monitor = await this.engine.getMonitor();
    if (!monitor) return null;
    return monitor.getResourceData();
  }

  public async clearHistory(): Promise<void> {
    const monitor = await this.engine.getMonitor();
    if (monitor) {
      monitor.clearHistory();
    }
  }

  public async setMonitoringConfig(config: any): Promise<void> {
    const monitor = await this.engine.getMonitor();
    if (monitor) {
      monitor.setConfig(config);
    }
  }

  public render(): void {
    this.engine.render();
  }

  public dispose(): void {
    this.engine.dispose();
    this.performanceData.dispose();
    this.resourceData.dispose();
    this.warningData.dispose();
  }
} 