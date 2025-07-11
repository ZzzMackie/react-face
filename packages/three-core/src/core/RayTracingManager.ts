import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface RayTracingConfig {
  enableRayTracing?: boolean;
  enableSoftShadows?: boolean;
  enableGlobalIllumination?: boolean;
  maxBounces?: number;
}

export interface RayTracingInfo {
  id: string;
  type: string;
  enabled: boolean;
  config: unknown;
}

/**
 * 光线追踪管理器
 * 负责管理 Three.js 光线追踪效果
 */
export class RayTracingManager implements Manager {
  private engine: unknown;
  private effects: Map<string, RayTracingInfo> = new Map();
  private config: RayTracingConfig;

  // 信号系统
  public readonly effectAdded = createSignal<RayTracingInfo | null>(null);
  public readonly effectRemoved = createSignal<string | null>(null);
  public readonly effectUpdated = createSignal<RayTracingInfo | null>(null);

  constructor(engine: unknown, config: RayTracingConfig = {}) {
    this.engine = engine;
    this.config = {
      enableRayTracing: false,
      enableSoftShadows: true,
      enableGlobalIllumination: false,
      maxBounces: 3,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化光线追踪系统
  }

  dispose(): void {
    this.removeAllEffects();
  }

  createRayTracingEffect(
    id: string,
    options?: {
      maxBounces?: number;
      enableSoftShadows?: boolean;
      enableGlobalIllumination?: boolean;
    }
  ): void {
    const effectInfo: RayTracingInfo = {
      id,
      type: 'rayTracing',
      enabled: true,
      config: {
        maxBounces: options?.maxBounces ?? this.config.maxBounces,
        enableSoftShadows: options?.enableSoftShadows ?? this.config.enableSoftShadows,
        enableGlobalIllumination: options?.enableGlobalIllumination ?? this.config.enableGlobalIllumination
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

  setEffectEnabled(id: string, enabled: boolean): void {
    const effectInfo = this.effects.get(id);
    if (effectInfo) {
      effectInfo.enabled = enabled;
      this.effectUpdated.emit(effectInfo);
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