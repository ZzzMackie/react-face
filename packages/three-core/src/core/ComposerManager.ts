import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface ComposerConfig {
  enablePostProcessing?: boolean;
  enableBloom?: boolean;
  enableSSAO?: boolean;
  enableFXAA?: boolean;
}

export interface ComposerInfo {
  id: string;
  type: string;
  enabled: boolean;
  config: unknown;
}

export interface PostProcessEffectInfo extends ComposerInfo {
  enabled: boolean;
}

/**
 * 合成器管理器
 * 负责管理 Three.js 后处理效果
 */
export class ComposerManager implements Manager {
  // Add test expected properties
  public readonly name = 'ComposerManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private composers: Map<string, ComposerInfo> = new Map();
  private postProcessEffects: Map<string, PostProcessEffectInfo> = new Map();
  private config: ComposerConfig;

  // 信号系统
  public readonly composerAdded = createSignal<ComposerInfo | null>(null);
  public readonly composerRemoved = createSignal<string | null>(null);
  public readonly composerUpdated = createSignal<ComposerInfo | null>(null);

  constructor(engine: unknown, config: ComposerConfig = {}) {
    this.engine = engine;
    this.config = {
      enablePostProcessing: true,
      enableBloom: true,
      enableSSAO: false,
      enableFXAA: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化合成器系统
    this.initialized = true;
  }

  dispose(): void {
    this.removeAllComposers();
    this.removeAllPostProcessEffects();
    this.initialized = false;
  }

  // 后处理效果方法
  createDepthOfFieldEffect(
    id: string,
    options?: {
      enabled?: boolean;
      intensity?: number;
      focusDistance?: number;
      focusRange?: number;
      bokehScale?: number;
    }
  ): void {
    const effectInfo: PostProcessEffectInfo = {
      id,
      type: 'depthOfField',
      enabled: options?.enabled ?? true,
      config: {
        intensity: options?.intensity ?? 1.0,
        focusDistance: options?.focusDistance ?? 10,
        focusRange: options?.focusRange ?? 5,
        bokehScale: options?.bokehScale ?? 2
      }
    };

    this.postProcessEffects.set(id, effectInfo);
    this.composerAdded.emit(effectInfo);
  }

  createMotionBlurEffect(
    id: string,
    options?: {
      enabled?: boolean;
      intensity?: number;
      samples?: number;
      shutterAngle?: number;
    }
  ): void {
    const effectInfo: PostProcessEffectInfo = {
      id,
      type: 'motionBlur',
      enabled: options?.enabled ?? true,
      config: {
        intensity: options?.intensity ?? 1.0,
        samples: options?.samples ?? 32,
        shutterAngle: options?.shutterAngle ?? 1.0
      }
    };

    this.postProcessEffects.set(id, effectInfo);
    this.composerAdded.emit(effectInfo);
  }

  createColorCorrectionEffect(
    id: string,
    options?: {
      enabled?: boolean;
      intensity?: number;
      brightness?: number;
      contrast?: number;
      saturation?: number;
      hue?: number;
      gamma?: number;
      exposure?: number;
    }
  ): void {
    const effectInfo: PostProcessEffectInfo = {
      id,
      type: 'colorCorrection',
      enabled: options?.enabled ?? true,
      config: {
        intensity: options?.intensity ?? 1.0,
        brightness: options?.brightness ?? 0,
        contrast: options?.contrast ?? 1,
        saturation: options?.saturation ?? 1,
        hue: options?.hue ?? 0,
        gamma: options?.gamma ?? 1,
        exposure: options?.exposure ?? 1
      }
    };

    this.postProcessEffects.set(id, effectInfo);
    this.composerAdded.emit(effectInfo);
  }

  getPostProcessEffect(id: string): PostProcessEffectInfo | undefined {
    return this.postProcessEffects.get(id);
  }

  setEffectEnabled(id: string, enabled: boolean): void {
    const effect = this.postProcessEffects.get(id);
    if (effect) {
      effect.enabled = enabled;
      this.composerUpdated.emit(effect);
    }
  }

  updateDepthOfFieldConfig(id: string, config: Partial<{
    focusDistance: number;
    focusRange: number;
    bokehScale: number;
    intensity: number;
  }>): void {
    const effect = this.postProcessEffects.get(id);
    if (effect && effect.type === 'depthOfField') {
      effect.config = { ...(effect.config as any), ...config };
      this.composerUpdated.emit(effect);
    }
  }

  updateMotionBlurConfig(id: string, config: Partial<{
    intensity: number;
    samples: number;
    shutterAngle: number;
  }>): void {
    const effect = this.postProcessEffects.get(id);
    if (effect && effect.type === 'motionBlur') {
      effect.config = { ...(effect.config as any), ...config };
      this.composerUpdated.emit(effect);
    }
  }

  updateColorCorrectionConfig(id: string, config: Partial<{
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    gamma: number;
    exposure: number;
    intensity: number;
  }>): void {
    const effect = this.postProcessEffects.get(id);
    if (effect && effect.type === 'colorCorrection') {
      effect.config = { ...(effect.config as any), ...config };
      this.composerUpdated.emit(effect);
    }
  }

  removePostProcessEffect(id: string): void {
    const effect = this.postProcessEffects.get(id);
    if (effect) {
      this.postProcessEffects.delete(id);
      this.composerRemoved.emit(id);
    }
  }

  removeAllPostProcessEffects(): void {
    this.postProcessEffects.clear();
  }

  // 原有的合成器方法
  createBloomPass(
    id: string,
    options?: {
      strength?: number;
      radius?: number;
      threshold?: number;
    }
  ): void {
    const composerInfo: ComposerInfo = {
      id,
      type: 'bloom',
      enabled: true,
      config: {
        strength: options?.strength ?? 1.0,
        radius: options?.radius ?? 0.5,
        threshold: options?.threshold ?? 0.5
      }
    };

    this.composers.set(id, composerInfo);
    this.composerAdded.emit(composerInfo);
  }

  createSSAOPass(
    id: string,
    options?: {
      radius?: number;
      intensity?: number;
      bias?: number;
    }
  ): void {
    const composerInfo: ComposerInfo = {
      id,
      type: 'ssao',
      enabled: true,
      config: {
        radius: options?.radius ?? 0.5,
        intensity: options?.intensity ?? 1.0,
        bias: options?.bias ?? 0.025
      }
    };

    this.composers.set(id, composerInfo);
    this.composerAdded.emit(composerInfo);
  }

  createFXAAPass(
    id: string,
    options?: {
      resolution?: THREE.Vector2;
    }
  ): void {
    const composerInfo: ComposerInfo = {
      id,
      type: 'fxaa',
      enabled: true,
      config: {
        resolution: options?.resolution ?? new THREE.Vector2(1024, 1024)
      }
    };

    this.composers.set(id, composerInfo);
    this.composerAdded.emit(composerInfo);
  }

  getComposer(id: string): ComposerInfo | undefined {
    return this.composers.get(id);
  }

  hasComposer(id: string): boolean {
    return this.composers.has(id);
  }

  removeComposer(id: string): void {
    const composerInfo = this.composers.get(id);
    if (composerInfo) {
      this.composers.delete(id);
      this.composerRemoved.emit(id);
    }
  }

  setComposerEnabled(id: string, enabled: boolean): void {
    const composerInfo = this.composers.get(id);
    if (composerInfo) {
      composerInfo.enabled = enabled;
      this.composerUpdated.emit(composerInfo);
    }
  }

  updateComposer(
    id: string,
    config: unknown
  ): void {
    const composerInfo = this.composers.get(id);
    if (composerInfo) {
      composerInfo.config = config;
      this.composerUpdated.emit(composerInfo);
    }
  }

  getAllComposers(): ComposerInfo[] {
    return Array.from(this.composers.values());
  }

  getComposersByType(type: string): ComposerInfo[] {
    return Array.from(this.composers.values()).filter(composer => composer.type === type);
  }

  getEnabledComposers(): ComposerInfo[] {
    return Array.from(this.composers.values()).filter(composer => composer.enabled);
  }

  removeAllComposers(): void {
    this.composers.clear();
  }

  getConfig(): ComposerConfig {
    return { ...this.config };
  }
}