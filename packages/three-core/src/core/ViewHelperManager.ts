import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface ViewHelperConfig {
  enableViewHelper?: boolean;
  enableAxes?: boolean;
  enableGrid?: boolean;
  enableCameraHelper?: boolean;
}

export interface ViewHelperInfo {
  id: string;
  type: string;
  enabled: boolean;
  config: unknown;
}

/**
 * 视图辅助管理器
 * 负责管理 Three.js 视图辅助工具
 */
export class ViewHelperManager implements Manager {
  private engine: unknown;
  private helpers: Map<string, ViewHelperInfo> = new Map();
  private config: ViewHelperConfig;

  // 信号系统
  public readonly helperAdded = createSignal<ViewHelperInfo | null>(null);
  public readonly helperRemoved = createSignal<string | null>(null);
  public readonly helperUpdated = createSignal<ViewHelperInfo | null>(null);

  constructor(engine: unknown, config: ViewHelperConfig = {}) {
    this.engine = engine;
    this.config = {
      enableViewHelper: true,
      enableAxes: true,
      enableGrid: true,
      enableCameraHelper: false,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化视图辅助系统
  }

  dispose(): void {
    this.removeAllHelpers();
  }

  createAxesHelper(
    id: string,
    options?: {
      size?: number;
      color?: THREE.ColorRepresentation;
    }
  ): void {
    const helperInfo: ViewHelperInfo = {
      id,
      type: 'axes',
      enabled: true,
      config: {
        size: options?.size ?? 1.0,
        color: options?.color ?? 0xffffff
      }
    };

    this.helpers.set(id, helperInfo);
    this.helperAdded.emit(helperInfo);
  }

  createGridHelper(
    id: string,
    options?: {
      size?: number;
      divisions?: number;
      color?: THREE.ColorRepresentation;
    }
  ): void {
    const helperInfo: ViewHelperInfo = {
      id,
      type: 'grid',
      enabled: true,
      config: {
        size: options?.size ?? 10,
        divisions: options?.divisions ?? 10,
        color: options?.color ?? 0x888888
      }
    };

    this.helpers.set(id, helperInfo);
    this.helperAdded.emit(helperInfo);
  }

  createCameraHelper(
    id: string,
    options?: {
      camera?: THREE.Camera;
      color?: THREE.ColorRepresentation;
    }
  ): void {
    const helperInfo: ViewHelperInfo = {
      id,
      type: 'camera',
      enabled: true,
      config: {
        camera: options?.camera ?? null,
        color: options?.color ?? 0xffffff
      }
    };

    this.helpers.set(id, helperInfo);
    this.helperAdded.emit(helperInfo);
  }

  getHelper(id: string): ViewHelperInfo | undefined {
    return this.helpers.get(id);
  }

  hasHelper(id: string): boolean {
    return this.helpers.has(id);
  }

  removeHelper(id: string): void {
    const helperInfo = this.helpers.get(id);
    if (helperInfo) {
      this.helpers.delete(id);
      this.helperRemoved.emit(id);
    }
  }

  setHelperEnabled(id: string, enabled: boolean): void {
    const helperInfo = this.helpers.get(id);
    if (helperInfo) {
      helperInfo.enabled = enabled;
      this.helperUpdated.emit(helperInfo);
    }
  }

  updateHelper(
    id: string,
    config: unknown
  ): void {
    const helperInfo = this.helpers.get(id);
    if (helperInfo) {
      helperInfo.config = config;
      this.helperUpdated.emit(helperInfo);
    }
  }

  getAllHelpers(): ViewHelperInfo[] {
    return Array.from(this.helpers.values());
  }

  getHelpersByType(type: string): ViewHelperInfo[] {
    return Array.from(this.helpers.values()).filter(helper => helper.type === type);
  }

  getEnabledHelpers(): ViewHelperInfo[] {
    return Array.from(this.helpers.values()).filter(helper => helper.enabled);
  }

  removeAllHelpers(): void {
    this.helpers.clear();
  }

  getConfig(): ViewHelperConfig {
    return { ...this.config };
  }
} 