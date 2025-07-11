import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface FluidConfig {
  enableFluidSimulation?: boolean;
  enableParticles?: boolean;
  enableViscosity?: boolean;
  maxParticles?: number;
}

export interface FluidInfo {
  id: string;
  type: string;
  enabled: boolean;
  config: unknown;
}

/**
 * 流体管理器
 * 负责管理 Three.js 流体模拟
 */
export class FluidManager implements Manager {
  private engine: unknown;
  private fluids: Map<string, FluidInfo> = new Map();
  private config: FluidConfig;

  // 信号系统
  public readonly fluidAdded = createSignal<FluidInfo | null>(null);
  public readonly fluidRemoved = createSignal<string | null>(null);
  public readonly fluidUpdated = createSignal<FluidInfo | null>(null);

  constructor(engine: unknown, config: FluidConfig = {}) {
    this.engine = engine;
    this.config = {
      enableFluidSimulation: false,
      enableParticles: true,
      enableViscosity: true,
      maxParticles: 10000,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化流体系统
  }

  dispose(): void {
    this.removeAllFluids();
  }

  createFluidSimulation(
    id: string,
    options?: {
      resolution?: number;
      viscosity?: number;
      density?: number;
      pressure?: number;
    }
  ): void {
    const fluidInfo: FluidInfo = {
      id,
      type: 'simulation',
      enabled: true,
      config: {
        resolution: options?.resolution ?? 64,
        viscosity: options?.viscosity ?? 0.1,
        density: options?.density ?? 1.0,
        pressure: options?.pressure ?? 1.0
      }
    };

    this.fluids.set(id, fluidInfo);
    this.fluidAdded.emit(fluidInfo);
  }

  createFluidParticles(
    id: string,
    options?: {
      count?: number;
      size?: number;
      color?: THREE.ColorRepresentation;
    }
  ): void {
    const fluidInfo: FluidInfo = {
      id,
      type: 'particles',
      enabled: true,
      config: {
        count: options?.count ?? 1000,
        size: options?.size ?? 0.1,
        color: options?.color ?? 0x0088ff
      }
    };

    this.fluids.set(id, fluidInfo);
    this.fluidAdded.emit(fluidInfo);
  }

  getFluid(id: string): FluidInfo | undefined {
    return this.fluids.get(id);
  }

  hasFluid(id: string): boolean {
    return this.fluids.has(id);
  }

  removeFluid(id: string): void {
    const fluidInfo = this.fluids.get(id);
    if (fluidInfo) {
      this.fluids.delete(id);
      this.fluidRemoved.emit(id);
    }
  }

  setFluidEnabled(id: string, enabled: boolean): void {
    const fluidInfo = this.fluids.get(id);
    if (fluidInfo) {
      fluidInfo.enabled = enabled;
      this.fluidUpdated.emit(fluidInfo);
    }
  }

  updateFluid(
    id: string,
    config: unknown
  ): void {
    const fluidInfo = this.fluids.get(id);
    if (fluidInfo) {
      fluidInfo.config = config;
      this.fluidUpdated.emit(fluidInfo);
    }
  }

  getAllFluids(): FluidInfo[] {
    return Array.from(this.fluids.values());
  }

  getFluidsByType(type: string): FluidInfo[] {
    return Array.from(this.fluids.values()).filter(fluid => fluid.type === type);
  }

  getEnabledFluids(): FluidInfo[] {
    return Array.from(this.fluids.values()).filter(fluid => fluid.enabled);
  }

  removeAllFluids(): void {
    this.fluids.clear();
  }

  getConfig(): FluidConfig {
    return { ...this.config };
  }
} 