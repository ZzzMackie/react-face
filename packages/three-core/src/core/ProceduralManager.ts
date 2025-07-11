import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface ProceduralConfig {
  enableProceduralGeneration?: boolean;
  enableNoise?: boolean;
  enableFractals?: boolean;
}

export interface ProceduralInfo {
  id: string;
  type: string;
  enabled: boolean;
  config: unknown;
}

/**
 * 程序化生成管理器
 * 负责管理 Three.js 程序化内容生�?
 */
export class ProceduralManager implements Manager {
  private engine: unknown;
  private procedurals: Map<string, ProceduralInfo> = new Map();
  private config: ProceduralConfig;

  // 信号系统
  public readonly proceduralAdded = createSignal<ProceduralInfo | null>(null);
  public readonly proceduralRemoved = createSignal<string | null>(null);
  public readonly proceduralUpdated = createSignal<ProceduralInfo | null>(null);

  constructor(engine: unknown, config: ProceduralConfig = {}) {
    this.engine = engine;
    this.config = {
      enableProceduralGeneration: true,
      enableNoise: true,
      enableFractals: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化程序化生成系统
  }

  dispose(): void {
    this.removeAllProcedurals();
  }

  createNoiseGenerator(
    id: string,
    options?: {
      scale?: number;
      octaves?: number;
      persistence?: number;
      lacunarity?: number;
    }
  ): void {
    const proceduralInfo: ProceduralInfo = {
      id,
      type: 'noise',
      enabled: true,
      config: {
        scale: options?.scale ?? 1.0,
        octaves: options?.octaves ?? 4,
        persistence: options?.persistence ?? 0.5,
        lacunarity: options?.lacunarity ?? 2.0
      }
    };

    this.procedurals.set(id, proceduralInfo);
    this.proceduralAdded.emit(proceduralInfo);
  }

  createFractalGenerator(
    id: string,
    options?: {
      iterations?: number;
      escapeRadius?: number;
      maxIterations?: number;
    }
  ): void {
    const proceduralInfo: ProceduralInfo = {
      id,
      type: 'fractal',
      enabled: true,
      config: {
        iterations: options?.iterations ?? 100,
        escapeRadius: options?.escapeRadius ?? 2.0,
        maxIterations: options?.maxIterations ?? 1000
      }
    };

    this.procedurals.set(id, proceduralInfo);
    this.proceduralAdded.emit(proceduralInfo);
  }

  getProcedural(id: string): ProceduralInfo | undefined {
    return this.procedurals.get(id);
  }

  hasProcedural(id: string): boolean {
    return this.procedurals.has(id);
  }

  removeProcedural(id: string): void {
    const proceduralInfo = this.procedurals.get(id);
    if (proceduralInfo) {
      this.procedurals.delete(id);
      this.proceduralRemoved.emit(id);
    }
  }

  setProceduralEnabled(id: string, enabled: boolean): void {
    const proceduralInfo = this.procedurals.get(id);
    if (proceduralInfo) {
      proceduralInfo.enabled = enabled;
      this.proceduralUpdated.emit(proceduralInfo);
    }
  }

  updateProcedural(
    id: string,
    config: unknown
  ): void {
    const proceduralInfo = this.procedurals.get(id);
    if (proceduralInfo) {
      proceduralInfo.config = config;
      this.proceduralUpdated.emit(proceduralInfo);
    }
  }

  getAllProcedurals(): ProceduralInfo[] {
    return Array.from(this.procedurals.values());
  }

  getProceduralsByType(type: string): ProceduralInfo[] {
    return Array.from(this.procedurals.values()).filter(procedural => procedural.type === type);
  }

  getEnabledProcedurals(): ProceduralInfo[] {
    return Array.from(this.procedurals.values()).filter(procedural => procedural.enabled);
  }

  removeAllProcedurals(): void {
    this.procedurals.clear();
  }

  getConfig(): ProceduralConfig {
    return { ...this.config };
  }
} 
