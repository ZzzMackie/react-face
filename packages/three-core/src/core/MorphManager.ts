import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface MorphConfig {
  enableMorphing?: boolean;
  enableBlendShapes?: boolean;
  enableAnimation?: boolean;
}

export interface MorphInfo {
  id: string;
  type: string;
  enabled: boolean;
  config: unknown;
}

/**
 * 变形管理器
 * 负责管理 Three.js 变形动画
 */
export class MorphManager implements Manager {
  private engine: unknown;
  private morphs: Map<string, MorphInfo> = new Map();
  private config: MorphConfig;

  // 信号系统
  public readonly morphAdded = createSignal<MorphInfo | null>(null);
  public readonly morphRemoved = createSignal<string | null>(null);
  public readonly morphUpdated = createSignal<MorphInfo | null>(null);

  constructor(engine: unknown, config: MorphConfig = {}) {
    this.engine = engine;
    this.config = {
      enableMorphing: true,
      enableBlendShapes: true,
      enableAnimation: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化变形系统
  }

  dispose(): void {
    this.removeAllMorphs();
  }

  createMorphTarget(
    id: string,
    options?: {
      weight?: number;
      duration?: number;
      easing?: string;
    }
  ): void {
    const morphInfo: MorphInfo = {
      id,
      type: 'morphTarget',
      enabled: true,
      config: {
        weight: options?.weight ?? 0.0,
        duration: options?.duration ?? 1.0,
        easing: options?.easing ?? 'linear'
      }
    };

    this.morphs.set(id, morphInfo);
    this.morphAdded.emit(morphInfo);
  }

  createBlendShape(
    id: string,
    options?: {
      influence?: number;
      morphTargetIndex?: number;
    }
  ): void {
    const morphInfo: MorphInfo = {
      id,
      type: 'blendShape',
      enabled: true,
      config: {
        influence: options?.influence ?? 1.0,
        morphTargetIndex: options?.morphTargetIndex ?? 0
      }
    };

    this.morphs.set(id, morphInfo);
    this.morphAdded.emit(morphInfo);
  }

  getMorph(id: string): MorphInfo | undefined {
    return this.morphs.get(id);
  }

  hasMorph(id: string): boolean {
    return this.morphs.has(id);
  }

  removeMorph(id: string): void {
    const morphInfo = this.morphs.get(id);
    if (morphInfo) {
      this.morphs.delete(id);
      this.morphRemoved.emit(id);
    }
  }

  setMorphEnabled(id: string, enabled: boolean): void {
    const morphInfo = this.morphs.get(id);
    if (morphInfo) {
      morphInfo.enabled = enabled;
      this.morphUpdated.emit(morphInfo);
    }
  }

  updateMorph(
    id: string,
    config: unknown
  ): void {
    const morphInfo = this.morphs.get(id);
    if (morphInfo) {
      morphInfo.config = config;
      this.morphUpdated.emit(morphInfo);
    }
  }

  getAllMorphs(): MorphInfo[] {
    return Array.from(this.morphs.values());
  }

  getMorphsByType(type: string): MorphInfo[] {
    return Array.from(this.morphs.values()).filter(morph => morph.type === type);
  }

  getEnabledMorphs(): MorphInfo[] {
    return Array.from(this.morphs.values()).filter(morph => morph.enabled);
  }

  removeAllMorphs(): void {
    this.morphs.clear();
  }

  getConfig(): MorphConfig {
    return { ...this.config };
  }
} 