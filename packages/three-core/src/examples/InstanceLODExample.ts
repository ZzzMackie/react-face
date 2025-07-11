import { Engine } from '../core/Engine';
import { InstanceManager } from '../core/InstanceManager';
import { LODManager } from '../core/LODManager';
import { ObjectManager } from '../core/ObjectManager';
import { MonitorManager } from '../core/MonitorManager';
import * as THREE from 'three';

export class InstanceLODExample {
  private engine: Engine;
  private instanceManager: InstanceManager | null = null;
  private lodManager: LODManager | null = null;
  private objectManager: ObjectManager | null = null;
  private monitorManager: MonitorManager | null = null;

  // 信号
  public readonly instanceData = createSignal<any>(null);
  public readonly lodData = createSignal<any>(null);
  public readonly performanceData = createSignal<any>(null);

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
        'materials', 'geometries', 'textures', 'objects',
        'monitor', 'instance', 'lod'
      ]
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // 监听实例化数据
    this.engine.getInstance().then(instance => {
      this.instanceManager = instance;
      if (instance) {
        instance.instanceGroupCreated.subscribe((group) => {
          if (group) {
            console.log('🎯 Instance group created:', group.id);
          }
        });

        instance.instanceAdded.subscribe((instanceInfo) => {
          if (instanceInfo) {
            console.log('🎯 Instance added:', instanceInfo.id);
          }
        });

        instance.optimizationCompleted.subscribe((stats) => {
          if (stats) {
            console.log('🎯 Optimization completed:', stats);
            this.instanceData.emit(stats);
          }
        });
      }
    });

    // 监听LOD数据
    this.engine.getLOD().then(lod => {
      this.lodManager = lod;
      if (lod) {
        lod.lodObjectCreated.subscribe((lodObject) => {
          if (lodObject) {
            console.log('🎯 LOD object created:', lodObject.id);
          }
        });

        lod.levelChanged.subscribe((change) => {
          if (change) {
            console.log('🎯 LOD level changed:', change);
          }
        });

        lod.lodUpdated.subscribe((stats) => {
          if (stats) {
            this.lodData.emit(stats);
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
  }

  async initialize(): Promise<void> {
    console.log('🚀 初始化实例化LOD示例...');

    // 初始化引擎
    await this.engine.engineInitialized.emit(this.engine);

    // 设置场景
    await this.setupScene();

    // 创建实例化渲染
    this.createInstancedRendering();

    // 创建LOD对象
    this.createLODObjects();

    // 设置LOD相机
    this.setupLODCamera();

    console.log('✅ 实例化LOD示例初始化完成');
  }

  private async setupScene(): Promise<void> {
    const scene = await this.engine.getScene();
    const camera = await this.engine.getCamera();
    const lights = await this.engine.getLights();
    const materials = await this.engine.getMaterials();
    const geometries = await this.engine.getGeometry();

    // 设置相机
    camera.setPosition(new THREE.Vector3(0, 10, 20));
    camera.setTarget(new THREE.Vector3(0, 0, 0));

    // 添加光源
    lights.createAmbientLight('ambient', 0.4, 0x404040);
    lights.createDirectionalLight('directional', 1, 0xffffff, new THREE.Vector3(5, 5, 5));
  }

  private createInstancedRendering(): void {
    if (!this.instanceManager || !this.objectManager) return;

    console.log('🎯 创建实例化渲染...');

    const geometries = this.engine.getManager('geometries');
    const materials = this.engine.getManager('materials');

    if (!geometries || !materials) return;

    // 创建基础几何体和材质
    const boxGeometry = geometries.createBoxGeometry('instanced_box', 1, 1, 1);
    const sphereGeometry = geometries.createSphereGeometry('instanced_sphere', 0.5, 16, 16);
    
    const boxMaterial = materials.createStandardMaterial('instanced_box_material', 0x8B4513, 1, 0.5, 0.5);
    const sphereMaterial = materials.createStandardMaterial('instanced_sphere_material', 0x4169E1, 1, 0.3, 0.7);

    // 创建实例组
    const boxGroup = this.instanceManager.createInstanceGroup('box_instances', boxGeometry, boxMaterial, 1000);
    const sphereGroup = this.instanceManager.createInstanceGroup('sphere_instances', sphereGeometry, sphereMaterial, 500);

    // 添加实例到场景
    scene.add(boxGroup.mesh);
    scene.add(sphereGroup.mesh);

    // 批量添加实例
    const boxInstances = [];
    const sphereInstances = [];

    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 100;

      boxInstances.push({
        id: `box_${i}`,
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
        scale: new THREE.Vector3(1, 1, 1),
        color: new THREE.Color(Math.random(), Math.random(), Math.random())
      });
    }

    for (let i = 0; i < 500; i++) {
      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 80;

      sphereInstances.push({
        id: `sphere_${i}`,
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
        scale: new THREE.Vector3(1, 1, 1),
        color: new THREE.Color(Math.random(), Math.random(), Math.random())
      });
    }

    // 批量添加实例
    this.instanceManager.addInstances('box_instances', boxInstances);
    this.instanceManager.addInstances('sphere_instances', sphereInstances);

    console.log('🎯 实例化渲染创建完成');
  }

  private createLODObjects(): void {
    if (!this.lodManager) return;

    console.log('🎯 创建LOD对象...');

    const geometries = this.engine.getManager('geometries');
    const materials = this.engine.getManager('materials');

    if (!geometries || !materials) return;

    // 创建不同细节级别的几何体
    const highDetailGeometry = geometries.createSphereGeometry('high_detail', 2, 32, 32);
    const mediumDetailGeometry = geometries.createSphereGeometry('medium_detail', 2, 16, 16);
    const lowDetailGeometry = geometries.createSphereGeometry('low_detail', 2, 8, 8);

    const highDetailMaterial = materials.createStandardMaterial('high_detail_material', 0xFF6B6B, 1, 0.5, 0.5);
    const mediumDetailMaterial = materials.createStandardMaterial('medium_detail_material', 0x4ECDC4, 1, 0.5, 0.5);
    const lowDetailMaterial = materials.createStandardMaterial('low_detail_material', 0x45B7D1, 1, 0.5, 0.5);

    // 创建LOD级别
    const lodLevels = [
      { distance: 10, geometry: highDetailGeometry, material: highDetailMaterial },
      { distance: 30, geometry: mediumDetailGeometry, material: mediumDetailMaterial },
      { distance: 100, geometry: lowDetailGeometry, material: lowDetailMaterial }
    ];

    // 创建多个LOD对象
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 200;

      const lodObject = this.lodManager.createLODObject(
        `lod_object_${i}`,
        new THREE.Vector3(x, y, z),
        lodLevels
      );

      // 添加到场景
      scene.add(lodObject.group);
    }

    console.log('🎯 LOD对象创建完成');
  }

  private setupLODCamera(): void {
    if (!this.lodManager) return;

    // 获取相机并设置给LOD管理器
    this.engine.getCamera().then(camera => {
      if (camera) {
        this.lodManager!.setCamera(camera.getCamera());
        console.log('🎯 LOD相机设置完成');
      }
    });
  }

  // 创建性能压力测试
  createPerformanceStress(): void {
    if (!this.instanceManager) return;

    console.log('📈 创建性能压力测试...');

    const geometries = this.engine.getManager('geometries');
    const materials = this.engine.getManager('materials');

    if (!geometries || !materials) return;

    // 创建更多实例组
    for (let group = 0; group < 5; group++) {
      const geometry = geometries.createBoxGeometry(`stress_box_${group}`, 0.5, 0.5, 0.5);
      const material = materials.createStandardMaterial(`stress_material_${group}`, Math.random() * 0xffffff, 1, 0.5, 0.5);

      const instanceGroup = this.instanceManager.createInstanceGroup(
        `stress_group_${group}`,
        geometry,
        material,
        2000
      );

      // 添加大量实例
      const instances = [];
      for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 200;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 200;

        instances.push({
          id: `stress_${group}_${i}`,
          position: new THREE.Vector3(x, y, z),
          rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
          scale: new THREE.Vector3(1, 1, 1),
          color: new THREE.Color(Math.random(), Math.random(), Math.random())
        });
      }

      this.instanceManager.addInstances(`stress_group_${group}`, instances);
    }

    console.log('📈 性能压力测试创建完成');
  }

  // 优化实例组
  optimizeInstanceGroups(): void {
    if (!this.instanceManager) return;

    console.log('🧹 优化实例组...');
    this.instanceManager.autoOptimize();
  }

  // 更新LOD级别
  updateLODLevels(): void {
    if (!this.lodManager) return;

    console.log('🔄 更新LOD级别...');
    this.lodManager.updateAllLODLevels();
  }

  // 获取实例化统计
  getInstanceStats(): any {
    if (!this.instanceManager) return null;

    return this.instanceManager.getStats();
  }

  // 获取LOD统计
  getLODStats(): any {
    if (!this.lodManager) return null;

    return this.lodManager.getStats();
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
      resourceData: latestResources || { objects: 0, geometries: 0, materials: 0, textures: 0, lights: 0, cameras: 0 }
    };
  }

  // 创建UI面板
  createUIPanel(): void {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 350px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
    `;

    const updatePanel = () => {
      const instanceStats = this.getInstanceStats();
      const lodStats = this.getLODStats();
      const performanceData = this.getPerformanceData();

      panel.innerHTML = `
        <h3>🎯 实例化渲染</h3>
        <div>实例组: ${instanceStats?.totalGroups || 0}</div>
        <div>总实例: ${instanceStats?.totalInstances || 0}</div>
        <div>总三角形: ${instanceStats?.totalTriangles || 0}</div>
        <div>内存使用: ${instanceStats?.memoryUsage ? (instanceStats.memoryUsage / 1024).toFixed(2) + 'KB' : 'N/A'}</div>
        <div>性能提升: ${instanceStats?.performanceGain ? instanceStats.performanceGain.toFixed(1) + '%' : 'N/A'}</div>
        
        <h3>🎯 LOD优化</h3>
        <div>LOD对象: ${lodStats?.totalObjects || 0}</div>
        <div>活跃对象: ${lodStats?.activeObjects || 0}</div>
        <div>级别变化: ${lodStats?.levelChanges || 0}</div>
        <div>性能提升: ${lodStats?.performanceGain ? lodStats.performanceGain.toFixed(1) + '%' : 'N/A'}</div>
        <div>内存使用: ${lodStats?.memoryUsage ? (lodStats.memoryUsage / 1024).toFixed(2) + 'KB' : 'N/A'}</div>
        
        <h3>📊 性能监控</h3>
        <div>FPS: ${performanceData?.fps || 'N/A'}</div>
        <div>渲染调用: ${performanceData?.renderCalls || 'N/A'}</div>
        <div>几何体: ${performanceData?.memory?.geometries || 0}</div>
        <div>纹理: ${performanceData?.memory?.textures || 0}</div>
        
        <div style="margin-top: 10px;">
          <button onclick="window.instanceLODExample.createPerformanceStress()" style="margin: 2px; padding: 5px;">创建压力</button>
          <button onclick="window.instanceLODExample.optimizeInstanceGroups()" style="margin: 2px; padding: 5px;">优化实例</button>
          <button onclick="window.instanceLODExample.updateLODLevels()" style="margin: 2px; padding: 5px;">更新LOD</button>
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
    this.instanceData.dispose();
    this.lodData.dispose();
    this.performanceData.dispose();

    // 清理引擎
    this.engine.dispose();

    console.log('🧹 实例化LOD示例已清理');
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
    instanceLODExample: InstanceLODExample;
  }
}

// 使用示例
if (typeof window !== 'undefined') {
  const example = new InstanceLODExample();
  window.instanceLODExample = example;
  
  example.initialize().then(() => {
    example.createUIPanel();
    console.log('🎉 实例化LOD示例已启动');
  });
} 