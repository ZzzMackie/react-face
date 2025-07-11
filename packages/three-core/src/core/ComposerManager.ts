import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
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

/**
 * 合成器管理器
 * 负责管理 Three.js 后处理效�?
 */
export class ComposerManager implements Manager {
  private engine: unknown;
  private composers: Map<string, ComposerInfo> = new Map();
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
  }

  dispose(): void {
    this.removeAllComposers();
  }

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
