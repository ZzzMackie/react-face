import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface OptimizationConfig {
  enableLOD?: boolean;
  enableFrustumCulling?: boolean;
  enableOcclusionCulling?: boolean;
  enableLevelOfDetail?: boolean;
}

export interface OptimizationInfo {
  id: string;
  type: string;
  enabled: boolean;
  config: unknown;
}

/**
 * 优化管理�?
 * 负责管理 Three.js 性能优化
 */
export class OptimizationManager implements Manager {
  private engine: unknown;
  private optimizations: Map<string, OptimizationInfo> = new Map();
  private config: OptimizationConfig;

  // 信号系统
  public readonly optimizationAdded = createSignal<OptimizationInfo | null>(null);
  public readonly optimizationRemoved = createSignal<string | null>(null);
  public readonly optimizationUpdated = createSignal<OptimizationInfo | null>(null);

  constructor(engine: unknown, config: OptimizationConfig = {}) {
    this.engine = engine;
    this.config = {
      enableLOD: true,
      enableFrustumCulling: true,
      enableOcclusionCulling: false,
      enableLevelOfDetail: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化优化系�?
  }

  dispose(): void {
    this.removeAllOptimizations();
  }

  createLODSystem(
    id: string,
    options?: {
      distances?: number[];
      levels?: number;
    }
  ): void {
    const optimizationInfo: OptimizationInfo = {
      id,
      type: 'lod',
      enabled: true,
      config: {
        distances: options?.distances ?? [0, 50, 100, 200],
        levels: options?.levels ?? 3
      }
    };

    this.optimizations.set(id, optimizationInfo);
    this.optimizationAdded.emit(optimizationInfo);
  }

  createFrustumCulling(
    id: string,
    options?: {
      enableAutoUpdate?: boolean;
      margin?: number;
    }
  ): void {
    const optimizationInfo: OptimizationInfo = {
      id,
      type: 'frustumCulling',
      enabled: true,
      config: {
        enableAutoUpdate: options?.enableAutoUpdate ?? true,
        margin: options?.margin ?? 0.1
      }
    };

    this.optimizations.set(id, optimizationInfo);
    this.optimizationAdded.emit(optimizationInfo);
  }

  createOcclusionCulling(
    id: string,
    options?: {
      enableDepthPrePass?: boolean;
      enableHZBuffer?: boolean;
    }
  ): void {
    const optimizationInfo: OptimizationInfo = {
      id,
      type: 'occlusionCulling',
      enabled: true,
      config: {
        enableDepthPrePass: options?.enableDepthPrePass ?? true,
        enableHZBuffer: options?.enableHZBuffer ?? false
      }
    };

    this.optimizations.set(id, optimizationInfo);
    this.optimizationAdded.emit(optimizationInfo);
  }

  getOptimization(id: string): OptimizationInfo | undefined {
    return this.optimizations.get(id);
  }

  hasOptimization(id: string): boolean {
    return this.optimizations.has(id);
  }

  removeOptimization(id: string): void {
    const optimizationInfo = this.optimizations.get(id);
    if (optimizationInfo) {
      this.optimizations.delete(id);
      this.optimizationRemoved.emit(id);
    }
  }

  setOptimizationEnabled(id: string, enabled: boolean): void {
    const optimizationInfo = this.optimizations.get(id);
    if (optimizationInfo) {
      optimizationInfo.enabled = enabled;
      this.optimizationUpdated.emit(optimizationInfo);
    }
  }

  updateOptimization(
    id: string,
    config: unknown
  ): void {
    const optimizationInfo = this.optimizations.get(id);
    if (optimizationInfo) {
      optimizationInfo.config = config;
      this.optimizationUpdated.emit(optimizationInfo);
    }
  }

  getAllOptimizations(): OptimizationInfo[] {
    return Array.from(this.optimizations.values());
  }

  getOptimizationsByType(type: string): OptimizationInfo[] {
    return Array.from(this.optimizations.values()).filter(optimization => optimization.type === type);
  }

  getEnabledOptimizations(): OptimizationInfo[] {
    return Array.from(this.optimizations.values()).filter(optimization => optimization.enabled);
  }

  removeAllOptimizations(): void {
    this.optimizations.clear();
  }

  getConfig(): OptimizationConfig {
    return { ...this.config };
  }
} 
