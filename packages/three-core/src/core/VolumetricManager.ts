import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
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

export interface VolumetricLightConfig {
  color?: THREE.ColorRepresentation;
  intensity?: number;
  density?: number;
  samples?: number;
  noiseScale?: number;
  noiseIntensity?: number;
  animationSpeed?: number;
  windDirection?: THREE.Vector3;
  windSpeed?: number;
}

export interface VolumetricLightInfo extends VolumetricInfo {
  mesh?: THREE.Mesh;
  config: VolumetricLightConfig;
}

/**
 * 体积渲染管理器
 * 负责管理 Three.js 体积效果
 */
export class VolumetricManager implements Manager {
  // Add test expected properties
  public readonly name = 'VolumetricManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private volumetrics: Map<string, VolumetricInfo> = new Map();
  private volumetricLights: Map<string, VolumetricLightInfo> = new Map();
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
    // 初始化体积渲染系统
    this.initialized = true;
  }

  dispose(): void {
    this.removeAllVolumetrics();
    this.removeAllVolumetricLights();
    this.initialized = false;
  }

  // 体积光相关方法
  createVolumetricLight(
    id: string,
    options: VolumetricLightConfig = {}
  ): void {
    const volumetricLightInfo: VolumetricLightInfo = {
      id,
      type: 'volumetricLight',
      enabled: true,
      config: {
        color: options.color ?? 0x00ffff,
        intensity: options.intensity ?? 1.0,
        density: options.density ?? 0.1,
        samples: options.samples ?? 64,
        noiseScale: options.noiseScale ?? 1.0,
        noiseIntensity: options.noiseIntensity ?? 0.5,
        animationSpeed: options.animationSpeed ?? 1.0,
        windDirection: options.windDirection ?? new THREE.Vector3(1, 0, 0),
        windSpeed: options.windSpeed ?? 0.1
      }
    };

    // 创建体积光网格（简化实现）
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: volumetricLightInfo.config.color,
      transparent: true,
      opacity: volumetricLightInfo.config.intensity
    });
    volumetricLightInfo.mesh = new THREE.Mesh(geometry, material);

    this.volumetricLights.set(id, volumetricLightInfo);
    this.volumetricAdded.emit(volumetricLightInfo);
  }

  getVolumetricLight(id: string): VolumetricLightInfo | undefined {
    return this.volumetricLights.get(id);
  }

  setVolumetricLightVisible(id: string, visible: boolean): void {
    const volumetricLight = this.volumetricLights.get(id);
    if (volumetricLight && volumetricLight.mesh) {
      volumetricLight.mesh.visible = visible;
      this.volumetricUpdated.emit(volumetricLight);
    }
  }

  updateVolumetricLight(id: string, config: Partial<VolumetricLightConfig>): void {
    const volumetricLight = this.volumetricLights.get(id);
    if (volumetricLight) {
      volumetricLight.config = { ...volumetricLight.config, ...config };
      if (volumetricLight.mesh && config.color) {
        (volumetricLight.mesh.material as THREE.MeshBasicMaterial).color.set(config.color);
      }
      if (volumetricLight.mesh && config.intensity !== undefined) {
        (volumetricLight.mesh.material as THREE.MeshBasicMaterial).opacity = config.intensity;
      }
      this.volumetricUpdated.emit(volumetricLight);
    }
  }

  updateAllVolumetricLightAnimations(): void {
    // 更新所有体积光动画
    for (const [id, volumetricLight] of this.volumetricLights) {
      if (volumetricLight.enabled && volumetricLight.mesh) {
        // 简单的动画效果
        const time = Date.now() * 0.001;
        const config = volumetricLight.config as VolumetricLightConfig;
        
        if (config.animationSpeed && config.windDirection && config.windSpeed) {
          volumetricLight.mesh.position.x += config.windDirection.x * config.windSpeed * config.animationSpeed;
          volumetricLight.mesh.position.y += config.windDirection.y * config.windSpeed * config.animationSpeed;
          volumetricLight.mesh.position.z += config.windDirection.z * config.windSpeed * config.animationSpeed;
        }
      }
    }
  }

  removeVolumetricLight(id: string): void {
    const volumetricLight = this.volumetricLights.get(id);
    if (volumetricLight) {
      if (volumetricLight.mesh) {
        volumetricLight.mesh.geometry.dispose();
        (volumetricLight.mesh.material as THREE.Material).dispose();
      }
      this.volumetricLights.delete(id);
      this.volumetricRemoved.emit(id);
    }
  }

  removeAllVolumetricLights(): void {
    for (const [id] of this.volumetricLights) {
      this.removeVolumetricLight(id);
    }
  }

  // 原有的体积效果方法
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