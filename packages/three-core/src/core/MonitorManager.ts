import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface PerformanceData {
  fps: number;
  memory: {
    geometries: number;
    textures: number;
    triangles: number;
    calls: number;
  };
  render: {
    calls: number;
    triangles: number;
    points: number;
    lines: number;
  };
  timestamp: number;
}

export interface ResourceData {
  objects: number;
  geometries: number;
  materials: number;
  textures: number;
  lights: number;
  cameras: number;
}

export interface MonitorConfig {
  enabled?: boolean;
  updateInterval?: number;
  logToConsole?: boolean;
  maxHistory?: number;
}

export class MonitorManager implements Manager {
  private engine: any;
  private config: MonitorConfig;
  private performanceHistory: PerformanceData[] = [];
  private resourceHistory: ResourceData[] = [];
  private isMonitoring: boolean = false;
  private updateInterval: number = 1000; // 1秒更新一次

  // 信号
  public readonly performanceUpdated = createSignal<PerformanceData | null>(null);
  public readonly resourceUpdated = createSignal<ResourceData | null>(null);
  public readonly memoryWarning = createSignal<string>('');
  public readonly performanceWarning = createSignal<string>('');

  constructor(engine: any, config: MonitorConfig = {}) {
    this.engine = engine;
    this.config = {
      enabled: true,
      updateInterval: 1000,
      logToConsole: false,
      maxHistory: 100,
      ...config
    };
  }

  async initialize(): Promise<void> {
    console.log('📊 MonitorManager initialized');
    
    if (this.config.enabled) {
      this.startMonitoring();
    }
  }

  dispose(): void {
    this.stopMonitoring();
    this.performanceHistory = [];
    this.resourceHistory = [];
    // Signal不需要手动dispose，会自动清理
  }

  // 开始监控
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.updateInterval = this.config.updateInterval || 1000;

    const monitor = () => {
      if (!this.isMonitoring) return;

      this.updatePerformance();
      this.updateResources();
      this.checkWarnings();

      setTimeout(monitor, this.updateInterval);
    };

    monitor();
  }

  // 停止监控
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  // 更新性能数据
  private updatePerformance(): void {
    const renderer = this.engine.getManager('renderer')?.instance?.renderer;
    if (!renderer) return;

    const info = renderer.info;
    const memory = renderer.info.memory;

    const performanceData: PerformanceData = {
      fps: this.calculateFPS(),
      memory: {
        geometries: memory.geometries,
        textures: memory.textures,
        triangles: info.render.triangles,
        calls: info.render.calls
      },
      render: {
        calls: info.render.calls,
        triangles: info.render.triangles,
        points: info.render.points,
        lines: info.render.lines
      },
      timestamp: Date.now()
    };

    this.performanceHistory.push(performanceData);
    
    // 限制历史记录数量
    if (this.performanceHistory.length > this.config.maxHistory!) {
      this.performanceHistory.shift();
    }

    this.performanceUpdated.emit(performanceData);

    if (this.config.logToConsole) {
      console.log('📊 Performance:', performanceData);
    }
  }

  // 更新资源数据
  private updateResources(): void {
    const objects = this.engine.getManager('objects')?.instance;
    const geometry = this.engine.getManager('geometries')?.instance;
    const materials = this.engine.getManager('materials')?.instance;
    const textures = this.engine.getManager('textures')?.instance;
    const lights = this.engine.getManager('lights')?.instance;
    const camera = this.engine.getManager('camera')?.instance;

    const resourceData: ResourceData = {
      objects: objects?.getAllObjects()?.length || 0,
      geometries: geometry?.getAllGeometries()?.length || 0,
      materials: materials?.getAllMaterials()?.length || 0,
      textures: textures?.getAllTextures()?.length || 0,
      lights: lights?.getAllLights()?.length || 0,
      cameras: camera ? 1 : 0
    };

    this.resourceHistory.push(resourceData);
    
    // 限制历史记录数量
    if (this.resourceHistory.length > this.config.maxHistory!) {
      this.resourceHistory.shift();
    }

    this.resourceUpdated.emit(resourceData);

    if (this.config.logToConsole) {
      console.log('📦 Resources:', resourceData);
    }
  }

  // 检查警告
  private checkWarnings(): void {
    const latestPerformance = this.performanceHistory[this.performanceHistory.length - 1];
    const latestResources = this.resourceHistory[this.resourceHistory.length - 1];

    if (!latestPerformance || !latestResources) return;

    // 检查内存使用
    if (latestPerformance.memory.geometries > 1000) {
      this.memoryWarning.emit('几何体数量过多，可能影响性能');
    }

    if (latestPerformance.memory.textures > 500) {
      this.memoryWarning.emit('纹理数量过多，可能影响性能');
    }

    // 检查渲染调用
    if (latestPerformance.render.calls > 1000) {
      this.performanceWarning.emit('渲染调用次数过多，建议优化');
    }

    // 检查FPS
    if (latestPerformance.fps < 30) {
      this.performanceWarning.emit('FPS过低，建议优化渲染性能');
    }
  }

  // 计算FPS
  private calculateFPS(): number {
    if (this.performanceHistory.length < 2) return 60;

    const now = Date.now();
    const last = this.performanceHistory[this.performanceHistory.length - 1];
    const timeDiff = now - last.timestamp;

    if (timeDiff === 0) return 60;

    return Math.round(1000 / timeDiff);
  }

  // 获取性能数据
  getPerformanceData(): PerformanceData[] {
    return [...this.performanceHistory];
  }

  // 获取资源数据
  getResourceData(): ResourceData[] {
    return [...this.resourceHistory];
  }

  // 获取最新性能数据
  getLatestPerformance(): PerformanceData | null {
    return this.performanceHistory[this.performanceHistory.length - 1] || null;
  }

  // 获取最新资源数据
  getLatestResources(): ResourceData | null {
    return this.resourceHistory[this.resourceHistory.length - 1] || null;
  }

  // 获取性能统计
  getPerformanceStats(): {
    avgFPS: number;
    minFPS: number;
    maxFPS: number;
    avgMemory: number;
    avgCalls: number;
  } {
    if (this.performanceHistory.length === 0) {
      return {
        avgFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        avgMemory: 0,
        avgCalls: 0
      };
    }

    const fpsValues = this.performanceHistory.map(p => p.fps);
    const memoryValues = this.performanceHistory.map(p => p.memory.geometries + p.memory.textures);
    const callsValues = this.performanceHistory.map(p => p.render.calls);

    return {
      avgFPS: Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length),
      minFPS: Math.min(...fpsValues),
      maxFPS: Math.max(...fpsValues),
      avgMemory: Math.round(memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length),
      avgCalls: Math.round(callsValues.reduce((a, b) => a + b, 0) / callsValues.length)
    };
  }

  // 清理历史数据
  clearHistory(): void {
    this.performanceHistory = [];
    this.resourceHistory = [];
  }

  // 设置配置
  setConfig(config: Partial<MonitorConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.updateInterval) {
      this.updateInterval = config.updateInterval;
    }
  }

  // 获取配置
  getConfig(): MonitorConfig {
    return { ...this.config };
  }
} 