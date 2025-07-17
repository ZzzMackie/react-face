import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface RayTracingConfig {
  enableRayTracing?: boolean;
  enableSoftShadows?: boolean;
  enableGlobalIllumination?: boolean;
  maxBounces?: number;
  // 新增优化选项
  adaptiveSampling?: boolean;
  minSamples?: number;
  maxSamples?: number;
  samplingThreshold?: number;
  performanceMode?: 'quality' | 'balanced' | 'performance';
  tiledRendering?: boolean;
  tileSize?: number;
}

export interface RayTracingInfo {
  id: string;
  type: string;
  enabled: boolean;
  config: unknown;
  // 新增性能数据
  performanceStats?: {
    renderTime?: number;
    sampleCount?: number;
    rayCount?: number;
    lastUpdated?: number;
  };
}

export interface ScreenSpaceEffectInfo extends RayTracingInfo {
  enabled: boolean;
}

/**
 * 光线追踪管理器
 * 负责管理 Three.js 光线追踪效果
 */
export class RayTracingManager implements Manager {
  // Add test expected properties
  public readonly name = 'RayTracingManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private effects: Map<string, RayTracingInfo> = new Map();
  private screenSpaceEffects: Map<string, ScreenSpaceEffectInfo> = new Map();
  private config: RayTracingConfig;
  // 性能监控
  private performanceData: {
    totalRenderTime: number;
    frameCount: number;
    avgRenderTime: number;
    peakRenderTime: number;
    totalRayCount: number;
    avgRayCount: number;
  };

  // 信号系统
  public readonly effectAdded = createSignal<RayTracingInfo | null>(null);
  public readonly effectRemoved = createSignal<string | null>(null);
  public readonly effectUpdated = createSignal<RayTracingInfo | null>(null);
  // 新增性能信号
  public readonly performanceUpdated = createSignal<any>(null);

  constructor(engine: unknown, config: RayTracingConfig = {}) {
    this.engine = engine;
    this.config = {
      enableRayTracing: false,
      enableSoftShadows: true,
      enableGlobalIllumination: false,
      maxBounces: 3,
      // 新增默认优化配置
      adaptiveSampling: true,
      minSamples: 1,
      maxSamples: 64,
      samplingThreshold: 0.01,
      performanceMode: 'balanced',
      tiledRendering: true,
      tileSize: 64,
      ...config
    };
    
    // 初始化性能数据
    this.performanceData = {
      totalRenderTime: 0,
      frameCount: 0,
      avgRenderTime: 0,
      peakRenderTime: 0,
      totalRayCount: 0,
      avgRayCount: 0
    };
  }

  async initialize(): Promise<void> {
    // 初始化光线追踪系统
    this.initialized = true;
    console.log('🔄 RayTracingManager initialized with config:', this.config);
  }

  dispose(): void {
    this.removeAllEffects();
    this.removeAllScreenSpaceEffects();
    this.initialized = false;
  }

  // 新增自适应采样配置方法
  setAdaptiveSampling(options: {
    enabled: boolean;
    minSamples?: number;
    maxSamples?: number;
    threshold?: number;
  }): void {
    this.config.adaptiveSampling = options.enabled;
    
    if (options.minSamples !== undefined) {
      this.config.minSamples = Math.max(1, options.minSamples);
    }
    
    if (options.maxSamples !== undefined) {
      this.config.maxSamples = Math.max(this.config.minSamples!, options.maxSamples);
    }
    
    if (options.threshold !== undefined) {
      this.config.samplingThreshold = Math.max(0.001, options.threshold);
    }
    
    console.log('🔄 Updated adaptive sampling config:', {
      enabled: this.config.adaptiveSampling,
      minSamples: this.config.minSamples,
      maxSamples: this.config.maxSamples,
      threshold: this.config.samplingThreshold
    });
  }

  // 新增性能模式设置
  setPerformanceMode(mode: 'quality' | 'balanced' | 'performance'): void {
    this.config.performanceMode = mode;
    
    // 根据性能模式自动调整其他参数
    switch (mode) {
      case 'quality':
        this.config.maxBounces = 5;
        this.config.maxSamples = 128;
        this.config.minSamples = 4;
        this.config.tiledRendering = false;
        break;
      case 'balanced':
        this.config.maxBounces = 3;
        this.config.maxSamples = 64;
        this.config.minSamples = 2;
        this.config.tiledRendering = true;
        this.config.tileSize = 64;
        break;
      case 'performance':
        this.config.maxBounces = 2;
        this.config.maxSamples = 32;
        this.config.minSamples = 1;
        this.config.tiledRendering = true;
        this.config.tileSize = 128;
        break;
    }
    
    console.log(`🔄 Performance mode set to ${mode}`, this.config);
  }

  // 新增分块渲染配置
  setTiledRendering(options: {
    enabled: boolean;
    tileSize?: number;
  }): void {
    this.config.tiledRendering = options.enabled;
    
    if (options.tileSize !== undefined) {
      // 确保 tileSize 是 2 的幂
      const powerOfTwo = Math.pow(2, Math.round(Math.log(options.tileSize) / Math.log(2)));
      this.config.tileSize = Math.max(16, Math.min(256, powerOfTwo));
    }
    
    console.log('🔄 Updated tiled rendering config:', {
      enabled: this.config.tiledRendering,
      tileSize: this.config.tileSize
    });
  }

  // 新增性能监控方法
  beginRenderFrame(): void {
    // 记录渲染开始时间
    const effect = this.getEnabledEffects()[0];
    if (effect) {
      if (!effect.performanceStats) {
        effect.performanceStats = {};
      }
      effect.performanceStats.lastUpdated = performance.now();
    }
  }

  endRenderFrame(rayCount: number): void {
    const effect = this.getEnabledEffects()[0];
    if (effect && effect.performanceStats && effect.performanceStats.lastUpdated) {
      const renderTime = performance.now() - effect.performanceStats.lastUpdated;
      
      // 更新效果的性能数据
      effect.performanceStats.renderTime = renderTime;
      effect.performanceStats.rayCount = rayCount;
      
      // 更新全局性能数据
      this.performanceData.totalRenderTime += renderTime;
      this.performanceData.frameCount++;
      this.performanceData.totalRayCount += rayCount;
      this.performanceData.avgRenderTime = this.performanceData.totalRenderTime / this.performanceData.frameCount;
      this.performanceData.avgRayCount = this.performanceData.totalRayCount / this.performanceData.frameCount;
      this.performanceData.peakRenderTime = Math.max(this.performanceData.peakRenderTime, renderTime);
      
      // 发送性能更新信号
      this.performanceUpdated.emit({
        currentRenderTime: renderTime,
        currentRayCount: rayCount,
        averageRenderTime: this.performanceData.avgRenderTime,
        averageRayCount: this.performanceData.avgRayCount,
        peakRenderTime: this.performanceData.peakRenderTime
      });
    }
  }

  // 获取性能数据
  getPerformanceStats(): any {
    return {
      ...this.performanceData,
      effects: Array.from(this.effects.values())
        .filter(effect => effect.performanceStats)
        .map(effect => ({
          id: effect.id,
          type: effect.type,
          stats: effect.performanceStats
        }))
    };
  }

  // 重置性能数据
  resetPerformanceStats(): void {
    this.performanceData = {
      totalRenderTime: 0,
      frameCount: 0,
      avgRenderTime: 0,
      peakRenderTime: 0,
      totalRayCount: 0,
      avgRayCount: 0
    };
    
    // 重置所有效果的性能数据
    this.effects.forEach(effect => {
      effect.performanceStats = {
        renderTime: 0,
        sampleCount: 0,
        rayCount: 0,
        lastUpdated: 0
      };
    });
  }

  // 屏幕空间效果方法
  createScreenSpaceReflectionEffect(
    id: string,
    options?: {
      enabled?: boolean;
      intensity?: number;
      maxSteps?: number;
      maxDistance?: number;
      thickness?: number;
      resolution?: number;
      // 新增优化选项
      adaptiveStepSize?: boolean;
      fadeDistance?: number;
      temporalFilter?: boolean;
    }
  ): void {
    const effectInfo: ScreenSpaceEffectInfo = {
      id,
      type: 'screenSpaceReflection',
      enabled: options?.enabled ?? true,
      config: {
        intensity: options?.intensity ?? 1.0,
        maxSteps: options?.maxSteps ?? 256,
        maxDistance: options?.maxDistance ?? 10,
        thickness: options?.thickness ?? 0.1,
        resolution: options?.resolution ?? 512,
        // 新增优化选项
        adaptiveStepSize: options?.adaptiveStepSize ?? true,
        fadeDistance: options?.fadeDistance ?? 0.9,
        temporalFilter: options?.temporalFilter ?? this.config.performanceMode !== 'performance'
      }
    };

    this.screenSpaceEffects.set(id, effectInfo);
    this.effectAdded.emit(effectInfo);
  }

  createScreenSpaceAmbientOcclusionEffect(
    id: string,
    options?: {
      enabled?: boolean;
      intensity?: number;
      samples?: number;
      radius?: number;
      bias?: number;
    }
  ): void {
    const effectInfo: ScreenSpaceEffectInfo = {
      id,
      type: 'screenSpaceAmbientOcclusion',
      enabled: options?.enabled ?? true,
      config: {
        intensity: options?.intensity ?? 1.0,
        samples: options?.samples ?? 16,
        radius: options?.radius ?? 0.5,
        bias: options?.bias ?? 0.025
      }
    };

    this.screenSpaceEffects.set(id, effectInfo);
    this.effectAdded.emit(effectInfo);
  }

  getScreenSpaceEffect(id: string): ScreenSpaceEffectInfo | undefined {
    return this.screenSpaceEffects.get(id);
  }

  setEffectEnabled(id: string, enabled: boolean): void {
    // Check screen space effects first
    const screenSpaceEffect = this.screenSpaceEffects.get(id);
    if (screenSpaceEffect) {
      screenSpaceEffect.enabled = enabled;
      this.effectUpdated.emit(screenSpaceEffect);
      return;
    }
    
    // Check regular effects
    const effect = this.effects.get(id);
    if (effect) {
      effect.enabled = enabled;
      this.effectUpdated.emit(effect);
    }
  }

  updateScreenSpaceReflectionConfig(id: string, config: Partial<{
    intensity: number;
    maxSteps: number;
    maxDistance: number;
    thickness: number;
    resolution: number;
  }>): void {
    const effect = this.screenSpaceEffects.get(id);
    if (effect && effect.type === 'screenSpaceReflection') {
      effect.config = { ...(effect.config as any), ...config };
      this.effectUpdated.emit(effect);
    }
  }

  updateScreenSpaceAmbientOcclusionConfig(id: string, config: Partial<{
    intensity: number;
    samples: number;
    radius: number;
    bias: number;
  }>): void {
    const effect = this.screenSpaceEffects.get(id);
    if (effect && effect.type === 'screenSpaceAmbientOcclusion') {
      effect.config = { ...(effect.config as any), ...config };
      this.effectUpdated.emit(effect);
    }
  }

  removeScreenSpaceEffect(id: string): void {
    const effect = this.screenSpaceEffects.get(id);
    if (effect) {
      this.screenSpaceEffects.delete(id);
      this.effectRemoved.emit(id);
    }
  }

  removeAllScreenSpaceEffects(): void {
    this.screenSpaceEffects.clear();
  }

  // 创建光线追踪效果，增强版本
  createRayTracingEffect(
    id: string,
    options?: {
      maxBounces?: number;
      enableSoftShadows?: boolean;
      enableGlobalIllumination?: boolean;
      adaptiveSampling?: boolean;
      minSamples?: number;
      maxSamples?: number;
      samplingThreshold?: number;
    }
  ): void {
    const effectInfo: RayTracingInfo = {
      id,
      type: 'rayTracing',
      enabled: true,
      config: {
        maxBounces: options?.maxBounces ?? this.config.maxBounces,
        enableSoftShadows: options?.enableSoftShadows ?? this.config.enableSoftShadows,
        enableGlobalIllumination: options?.enableGlobalIllumination ?? this.config.enableGlobalIllumination,
        adaptiveSampling: options?.adaptiveSampling ?? this.config.adaptiveSampling,
        minSamples: options?.minSamples ?? this.config.minSamples,
        maxSamples: options?.maxSamples ?? this.config.maxSamples,
        samplingThreshold: options?.samplingThreshold ?? this.config.samplingThreshold
      },
      performanceStats: {
        renderTime: 0,
        sampleCount: 0,
        rayCount: 0,
        lastUpdated: 0
      }
    };

    this.effects.set(id, effectInfo);
    this.effectAdded.emit(effectInfo);
  }

  createSoftShadows(
    id: string,
    options?: {
      shadowMapSize?: number;
      shadowBias?: number;
      shadowRadius?: number;
    }
  ): void {
    const effectInfo: RayTracingInfo = {
      id,
      type: 'softShadows',
      enabled: true,
      config: {
        shadowMapSize: options?.shadowMapSize ?? 2048,
        shadowBias: options?.shadowBias ?? -0.0001,
        shadowRadius: options?.shadowRadius ?? 1
      }
    };

    this.effects.set(id, effectInfo);
    this.effectAdded.emit(effectInfo);
  }

  createGlobalIllumination(
    id: string,
    options?: {
      intensity?: number;
      bounces?: number;
      samples?: number;
    }
  ): void {
    const effectInfo: RayTracingInfo = {
      id,
      type: 'globalIllumination',
      enabled: true,
      config: {
        intensity: options?.intensity ?? 1.0,
        bounces: options?.bounces ?? this.config.maxBounces,
        samples: options?.samples ?? 64
      }
    };

    this.effects.set(id, effectInfo);
    this.effectAdded.emit(effectInfo);
  }

  getEffect(id: string): RayTracingInfo | undefined {
    return this.effects.get(id);
  }

  hasEffect(id: string): boolean {
    return this.effects.has(id);
  }

  removeEffect(id: string): void {
    const effectInfo = this.effects.get(id);
    if (effectInfo) {
      this.effects.delete(id);
      this.effectRemoved.emit(id);
    }
  }



  updateEffect(
    id: string,
    config: unknown
  ): void {
    const effectInfo = this.effects.get(id);
    if (effectInfo) {
      effectInfo.config = config;
      this.effectUpdated.emit(effectInfo);
    }
  }

  getAllEffects(): RayTracingInfo[] {
    return Array.from(this.effects.values());
  }

  getEffectsByType(type: string): RayTracingInfo[] {
    return Array.from(this.effects.values()).filter(effect => effect.type === type);
  }

  getEnabledEffects(): RayTracingInfo[] {
    return Array.from(this.effects.values()).filter(effect => effect.enabled);
  }

  removeAllEffects(): void {
    this.effects.clear();
  }

  getConfig(): RayTracingConfig {
    return { ...this.config };
  }
}