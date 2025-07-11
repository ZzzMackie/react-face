import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface VolumetricConfig {
  enableVolumetricRendering?: boolean;
  enableFog?: boolean;
  enableSmoke?: boolean;
  enableFire?: boolean;
}

export interface VolumetricInfo {
  id: string;
  type: string;
  enabled: boolean;
  config: unknown;
}

/**
 * 体积渲染管理�?
 * 负责管理 Three.js 体积效果
 */
export class VolumetricManager implements Manager {
  private engine: unknown;
  private volumetrics: Map<string, VolumetricInfo> = new Map();
  private config: VolumetricConfig;

  // 信号系统
  public readonly volumetricAdded = createSignal<VolumetricInfo | null>(null);
  public readonly volumetricRemoved = createSignal<string | null>(null);
  public readonly volumetricUpdated = createSignal<VolumetricInfo | null>(null);

  constructor(engine: unknown, config: VolumetricConfig = {}) {
    this.engine = engine;
    this.config = {
      enableVolumetricRendering: false,
      enableFog: true,
      enableSmoke: false,
      enableFire: false,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化体积渲染系�?
  }

  dispose(): void {
    this.removeAllVolumetrics();
  }

  createFog(
    id: string,
    options?: {
      color?: THREE.ColorRepresentation;
      near?: number;
      far?: number;
      density?: number;
    }
  ): void {
    const volumetricInfo: VolumetricInfo = {
      id,
      type: 'fog',
      enabled: true,
      config: {
        color: options?.color ?? 0xcccccc,
        near: options?.near ?? 1,
        far: options?.far ?? 1000,
        density: options?.density ?? 0.0025
      }
    };

    this.volumetrics.set(id, volumetricInfo);
    this.volumetricAdded.emit(volumetricInfo);
  }

  createSmoke(
    id: string,
    options?: {
      density?: number;
      color?: THREE.ColorRepresentation;
      size?: number;
    }
  ): void {
    const volumetricInfo: VolumetricInfo = {
      id,
      type: 'smoke',
      enabled: true,
      config: {
        density: options?.density ?? 0.1,
        color: options?.color ?? 0x666666,
        size: options?.size ?? 1.0
      }
    };

    this.volumetrics.set(id, volumetricInfo);
    this.volumetricAdded.emit(volumetricInfo);
  }

  createFire(
    id: string,
    options?: {
      intensity?: number;
      color?: THREE.ColorRepresentation;
      size?: number;
    }
  ): void {
    const volumetricInfo: VolumetricInfo = {
      id,
      type: 'fire',
      enabled: true,
      config: {
        intensity: options?.intensity ?? 1.0,
        color: options?.color ?? 0xff4400,
        size: options?.size ?? 1.0
      }
    };

    this.volumetrics.set(id, volumetricInfo);
    this.volumetricAdded.emit(volumetricInfo);
  }

  getVolumetric(id: string): VolumetricInfo | undefined {
    return this.volumetrics.get(id);
  }

  hasVolumetric(id: string): boolean {
    return this.volumetrics.has(id);
  }

  removeVolumetric(id: string): void {
    const volumetricInfo = this.volumetrics.get(id);
    if (volumetricInfo) {
      this.volumetrics.delete(id);
      this.volumetricRemoved.emit(id);
    }
  }

  setVolumetricEnabled(id: string, enabled: boolean): void {
    const volumetricInfo = this.volumetrics.get(id);
    if (volumetricInfo) {
      volumetricInfo.enabled = enabled;
      this.volumetricUpdated.emit(volumetricInfo);
    }
  }

  updateVolumetric(
    id: string,
    config: unknown
  ): void {
    const volumetricInfo = this.volumetrics.get(id);
    if (volumetricInfo) {
      volumetricInfo.config = config;
      this.volumetricUpdated.emit(volumetricInfo);
    }
  }

  getAllVolumetrics(): VolumetricInfo[] {
    return Array.from(this.volumetrics.values());
  }

  getVolumetricsByType(type: string): VolumetricInfo[] {
    return Array.from(this.volumetrics.values()).filter(volumetric => volumetric.type === type);
  }

  getEnabledVolumetrics(): VolumetricInfo[] {
    return Array.from(this.volumetrics.values()).filter(volumetric => volumetric.enabled);
  }

  removeAllVolumetrics(): void {
    this.volumetrics.clear();
  }

  getConfig(): VolumetricConfig {
    return { ...this.config };
  }
} 
