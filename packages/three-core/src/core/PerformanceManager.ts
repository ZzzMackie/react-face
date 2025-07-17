import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface PerformanceConfig {
  enableMonitoring?: boolean;
  updateInterval?: number;
  enableMemoryTracking?: boolean;
  enableRenderStats?: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  memory: {
    geometries: number;
    textures: number;
  };
  render: {
    calls: number;
    triangles: number;
    points: number;
    lines: number;
  };
  timestamp: number;
}

/**
 * 性能管理�?
 * 负责监控和管�?Three.js 性能
 */
export class PerformanceManager implements Manager {
  // Add test expected properties
  public readonly name = 'PerformanceManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private renderer: THREE.WebGLRenderer | null = null;
  private config: PerformanceConfig;
  private clock: THREE.Clock;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 0;

  // 信号系统
  public readonly metricsUpdated = createSignal<PerformanceMetrics | null>(null);
  public readonly performanceWarning = createSignal<{ type: string; message: string } | null>(null);

  constructor(engine: unknown, config: PerformanceConfig = {}) {
    this.engine = engine;
    this.config = {
      enableMonitoring: true,
      updateInterval: 1000,
      enableMemoryTracking: true,
      enableRenderStats: true,
      ...config
    };
    this.clock = new THREE.Clock();
  }

  async initialize(): Promise<void> {
    this.clock.start();
  this.initialized = true;}

  dispose(): void {
    // 清理性能监控
  this.initialized = false;}

  setRenderer(renderer: THREE.WebGLRenderer): void {
    this.renderer = renderer;
  }

  update(): void {
    if (!this.config.enableMonitoring) return;

    const currentTime = this.clock.getElapsedTime() * 1000;
    this.frameCount++;

    if (currentTime - this.lastTime >= this.config.updateInterval!) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.lastTime = currentTime;
      this.frameCount = 0;

      this.updateMetrics();
    }
  }

  private updateMetrics(): void {
    if (!this.renderer) return;

    const info = this.renderer.info;
    const memory = this.renderer.info.memory;
    const render = this.renderer.info.render;

    const metrics: PerformanceMetrics = {
      fps: this.fps,
      memory: {
        geometries: memory.geometries,
        textures: memory.textures
      },
      render: {
        calls: render.calls,
        triangles: render.triangles,
        points: render.points,
        lines: render.lines
      },
      timestamp: Date.now()
    };

    this.metricsUpdated.emit(metrics);
    this.checkPerformanceWarnings(metrics);
  }

  private checkPerformanceWarnings(metrics: PerformanceMetrics): void {
    // 检�?FPS 警告
    if (metrics.fps < 30) {
      this.performanceWarning.emit({
        type: 'low_fps',
        message: `Low FPS detected: ${metrics.fps}`
      });
    }

    // 检查内存警�?
    if (metrics.memory.geometries > 1000) {
      this.performanceWarning.emit({
        type: 'high_geometry_count',
        message: `High geometry count: ${metrics.memory.geometries}`
      });
    }

    if (metrics.memory.textures > 100) {
      this.performanceWarning.emit({
        type: 'high_texture_count',
        message: `High texture count: ${metrics.memory.textures}`
      });
    }

    // 检查渲染调用警�?
    if (metrics.render.calls > 1000) {
      this.performanceWarning.emit({
        type: 'high_render_calls',
        message: `High render calls: ${metrics.render.calls}`
      });
    }
  }

  getFPS(): number {
    return this.fps;
  }

  getMemoryInfo(): { geometries: number; textures: number } {
    if (!this.renderer) return { geometries: 0, textures: 0 };
    
    const memory = this.renderer.info.memory;
    return {
      geometries: memory.geometries,
      textures: memory.textures
    };
  }

  getRenderInfo(): { calls: number; triangles: number; points: number; lines: number } {
    if (!this.renderer) return { calls: 0, triangles: 0, points: 0, lines: 0 };
    
    const render = this.renderer.info.render;
    return {
      calls: render.calls,
      triangles: render.triangles,
      points: render.points,
      lines: render.lines
    };
  }

  resetStats(): void {
    if (this.renderer) {
      this.renderer.info.reset();
    }
    this.frameCount = 0;
    this.lastTime = 0;
  }

  enableMonitoring(enabled: boolean): void {
    this.config.enableMonitoring = enabled;
  }

  setUpdateInterval(interval: number): void {
    this.config.updateInterval = interval;
  }

  getPerformanceReport(): PerformanceMetrics {
    const memory = this.getMemoryInfo();
    const render = this.getRenderInfo();

    return {
      fps: this.fps,
      memory,
      render,
      timestamp: Date.now()
    };
  }

  optimizeScene(): void {
    // 场景优化建议
    const memory = this.getMemoryInfo();
    const render = this.getRenderInfo();

    if (memory.geometries > 500) {
      this.performanceWarning.emit({
        type: 'optimization_suggestion',
        message: 'Consider merging geometries to reduce draw calls'
      });
    }

    if (render.calls > 500) {
      this.performanceWarning.emit({
        type: 'optimization_suggestion',
        message: 'Consider using instancing or batching to reduce render calls'
      });
    }
  }

  getConfig(): PerformanceConfig {
    return { ...this.config };
  }
} 
