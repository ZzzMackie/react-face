import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface DeferredConfig {
  enableDeferredRendering?: boolean;
  enableGBuffer?: boolean;
  enableLightingPass?: boolean;
  enablePostProcessing?: boolean;
}

export interface DeferredInfo {
  id: string;
  type: string;
  enabled: boolean;
  config: unknown;
}

/**
 * 延迟渲染管理器
 * 负责管理 Three.js 延迟渲染
 */
export class DeferredManager implements Manager {
  private engine: unknown;
  private passes: Map<string, DeferredInfo> = new Map();
  private config: DeferredConfig;

  // 信号系统
  public readonly passAdded = createSignal<DeferredInfo | null>(null);
  public readonly passRemoved = createSignal<string | null>(null);
  public readonly passUpdated = createSignal<DeferredInfo | null>(null);

  constructor(engine: unknown, config: DeferredConfig = {}) {
    this.engine = engine;
    this.config = {
      enableDeferredRendering: false,
      enableGBuffer: true,
      enableLightingPass: true,
      enablePostProcessing: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化延迟渲染系统
  }

  dispose(): void {
    this.removeAllPasses();
  }

  createGBufferPass(
    id: string,
    options?: {
      width?: number;
      height?: number;
      format?: THREE.PixelFormat;
      type?: THREE.TextureDataType;
    }
  ): void {
    const passInfo: DeferredInfo = {
      id,
      type: 'gBuffer',
      enabled: true,
      config: {
        width: options?.width ?? 1024,
        height: options?.height ?? 1024,
        format: options?.format ?? THREE.RGBAFormat,
        type: options?.type ?? THREE.UnsignedByteType
      }
    };

    this.passes.set(id, passInfo);
    this.passAdded.emit(passInfo);
  }

  createLightingPass(
    id: string,
    options?: {
      enableShadows?: boolean;
      enableSSAO?: boolean;
      enableBloom?: boolean;
    }
  ): void {
    const passInfo: DeferredInfo = {
      id,
      type: 'lighting',
      enabled: true,
      config: {
        enableShadows: options?.enableShadows ?? true,
        enableSSAO: options?.enableSSAO ?? false,
        enableBloom: options?.enableBloom ?? false
      }
    };

    this.passes.set(id, passInfo);
    this.passAdded.emit(passInfo);
  }

  createPostProcessingPass(
    id: string,
    options?: {
      enableFXAA?: boolean;
      enableToneMapping?: boolean;
      enableColorGrading?: boolean;
    }
  ): void {
    const passInfo: DeferredInfo = {
      id,
      type: 'postProcessing',
      enabled: true,
      config: {
        enableFXAA: options?.enableFXAA ?? true,
        enableToneMapping: options?.enableToneMapping ?? true,
        enableColorGrading: options?.enableColorGrading ?? false
      }
    };

    this.passes.set(id, passInfo);
    this.passAdded.emit(passInfo);
  }

  getPass(id: string): DeferredInfo | undefined {
    return this.passes.get(id);
  }

  hasPass(id: string): boolean {
    return this.passes.has(id);
  }

  removePass(id: string): void {
    const passInfo = this.passes.get(id);
    if (passInfo) {
      this.passes.delete(id);
      this.passRemoved.emit(id);
    }
  }

  setPassEnabled(id: string, enabled: boolean): void {
    const passInfo = this.passes.get(id);
    if (passInfo) {
      passInfo.enabled = enabled;
      this.passUpdated.emit(passInfo);
    }
  }

  updatePass(
    id: string,
    config: unknown
  ): void {
    const passInfo = this.passes.get(id);
    if (passInfo) {
      passInfo.config = config;
      this.passUpdated.emit(passInfo);
    }
  }

  getAllPasses(): DeferredInfo[] {
    return Array.from(this.passes.values());
  }

  getPassesByType(type: string): DeferredInfo[] {
    return Array.from(this.passes.values()).filter(pass => pass.type === type);
  }

  getEnabledPasses(): DeferredInfo[] {
    return Array.from(this.passes.values()).filter(pass => pass.enabled);
  }

  removeAllPasses(): void {
    this.passes.clear();
  }

  getConfig(): DeferredConfig {
    return { ...this.config };
  }
} 