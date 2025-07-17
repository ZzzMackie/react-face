import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface SkeletonConfig {
  enableSkeleton?: boolean;
  enableBones?: boolean;
  enableAnimation?: boolean;
}

export interface SkeletonInfo {
  id: string;
  type: string;
  enabled: boolean;
  config: unknown;
}

/**
 * 骨骼管理�?
 * 负责管理 Three.js 骨骼动画
 */
export class SkeletonManager implements Manager {
  // Add test expected properties
  public readonly name = 'SkeletonManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private skeletons: Map<string, SkeletonInfo> = new Map();
  private config: SkeletonConfig;

  // 信号系统
  public readonly skeletonAdded = createSignal<SkeletonInfo | null>(null);
  public readonly skeletonRemoved = createSignal<string | null>(null);
  public readonly skeletonUpdated = createSignal<SkeletonInfo | null>(null);

  constructor(engine: unknown, config: SkeletonConfig = {}) {
    this.engine = engine;
    this.config = {
      enableSkeleton: true,
      enableBones: true,
      enableAnimation: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化骨骼系�?
  this.initialized = true;}

  dispose(): void {
    this.removeAllSkeletons();
  this.initialized = false;}

  createSkeleton(
    id: string,
    options?: {
      bones?: THREE.Bone[];
      boneInverses?: THREE.Matrix4[];
    }
  ): void {
    const skeletonInfo: SkeletonInfo = {
      id,
      type: 'skeleton',
      enabled: true,
      config: {
        bones: options?.bones ?? [],
        boneInverses: options?.boneInverses ?? []
      }
    };

    this.skeletons.set(id, skeletonInfo);
    this.skeletonAdded.emit(skeletonInfo);
  }

  createBone(
    id: string,
    options?: {
      position?: THREE.Vector3;
      rotation?: THREE.Euler;
      scale?: THREE.Vector3;
    }
  ): void {
    const skeletonInfo: SkeletonInfo = {
      id,
      type: 'bone',
      enabled: true,
      config: {
        position: options?.position ?? new THREE.Vector3(),
        rotation: options?.rotation ?? new THREE.Euler(),
        scale: options?.scale ?? new THREE.Vector3(1, 1, 1)
      }
    };

    this.skeletons.set(id, skeletonInfo);
    this.skeletonAdded.emit(skeletonInfo);
  }

  getSkeleton(id: string): SkeletonInfo | undefined {
    return this.skeletons.get(id);
  }

  hasSkeleton(id: string): boolean {
    return this.skeletons.has(id);
  }

  removeSkeleton(id: string): void {
    const skeletonInfo = this.skeletons.get(id);
    if (skeletonInfo) {
      this.skeletons.delete(id);
      this.skeletonRemoved.emit(id);
    }
  }

  setSkeletonEnabled(id: string, enabled: boolean): void {
    const skeletonInfo = this.skeletons.get(id);
    if (skeletonInfo) {
      skeletonInfo.enabled = enabled;
      this.skeletonUpdated.emit(skeletonInfo);
    }
  }

  updateSkeleton(
    id: string,
    config: unknown
  ): void {
    const skeletonInfo = this.skeletons.get(id);
    if (skeletonInfo) {
      skeletonInfo.config = config;
      this.skeletonUpdated.emit(skeletonInfo);
    }
  }

  getAllSkeletons(): SkeletonInfo[] {
    return Array.from(this.skeletons.values());
  }

  getSkeletonsByType(type: string): SkeletonInfo[] {
    return Array.from(this.skeletons.values()).filter(skeleton => skeleton.type === type);
  }

  getEnabledSkeletons(): SkeletonInfo[] {
    return Array.from(this.skeletons.values()).filter(skeleton => skeleton.enabled);
  }

  removeAllSkeletons(): void {
    this.skeletons.clear();
  }

  getConfig(): SkeletonConfig {
    return { ...this.config };
  }
}