import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface LightConfig {
  ambientIntensity?: number;
  enableShadows?: boolean;
  shadowMapSize?: number;
}

export interface LightInfo {
  id: string;
  light: THREE.Light;
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
  enabled: boolean;
}

/**
 * 灯光管理�?
 * 负责管理 Three.js 灯光
 */
export class LightManager implements Manager {
  private engine: unknown;
  private lights: Map<string, LightInfo> = new Map();
  private config: LightConfig;

  // 信号系统
  public readonly lightAdded = createSignal<LightInfo | null>(null);
  public readonly lightRemoved = createSignal<string | null>(null);
  public readonly lightEnabled = createSignal<string | null>(null);
  public readonly lightDisabled = createSignal<string | null>(null);

  constructor(engine: unknown, config: LightConfig = {}) {
    this.engine = engine;
    this.config = {
      ambientIntensity: 0.4,
      enableShadows: true,
      shadowMapSize: 2048,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化默认环境光
    this.createAmbientLight('default-ambient', this.config.ambientIntensity!);
  }

  dispose(): void {
    this.removeAllLights();
  }

  createAmbientLight(id: string, intensity: number = 0.4, color: THREE.ColorRepresentation = 0xffffff): THREE.AmbientLight {
    const light = new THREE.AmbientLight(color, intensity);
    const lightInfo: LightInfo = {
      id,
      light,
      type: 'ambient',
      enabled: true
    };

    this.lights.set(id, lightInfo);
    this.lightAdded.emit(lightInfo);

    return light;
  }

  createDirectionalLight(
    id: string,
    intensity: number = 1,
    color: THREE.ColorRepresentation = 0xffffff,
    position: THREE.Vector3 = new THREE.Vector3(5, 5, 5)
  ): THREE.DirectionalLight {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.copy(position);

    if (this.config.enableShadows) {
      light.castShadow = true;
      light.shadow.mapSize.width = this.config.shadowMapSize!;
      light.shadow.mapSize.height = this.config.shadowMapSize!;
    }

    const lightInfo: LightInfo = {
      id,
      light,
      type: 'directional',
      enabled: true
    };

    this.lights.set(id, lightInfo);
    this.lightAdded.emit(lightInfo);

    return light;
  }

  createPointLight(
    id: string,
    intensity: number = 1,
    color: THREE.ColorRepresentation = 0xffffff,
    position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    distance: number = 0,
    decay: number = 2
  ): THREE.PointLight {
    const light = new THREE.PointLight(color, intensity, distance, decay);
    light.position.copy(position);

    if (this.config.enableShadows) {
      light.castShadow = true;
      light.shadow.mapSize.width = this.config.shadowMapSize!;
      light.shadow.mapSize.height = this.config.shadowMapSize!;
    }

    const lightInfo: LightInfo = {
      id,
      light,
      type: 'point',
      enabled: true
    };

    this.lights.set(id, lightInfo);
    this.lightAdded.emit(lightInfo);

    return light;
  }

  createSpotLight(
    id: string,
    intensity: number = 1,
    color: THREE.ColorRepresentation = 0xffffff,
    position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    target: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    angle: number = Math.PI / 3,
    penumbra: number = 0,
    distance: number = 0
  ): THREE.SpotLight {
    const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra);
    light.position.copy(position);
    light.target.position.copy(target);

    if (this.config.enableShadows) {
      light.castShadow = true;
      light.shadow.mapSize.width = this.config.shadowMapSize!;
      light.shadow.mapSize.height = this.config.shadowMapSize!;
    }

    const lightInfo: LightInfo = {
      id,
      light,
      type: 'spot',
      enabled: true
    };

    this.lights.set(id, lightInfo);
    this.lightAdded.emit(lightInfo);

    return light;
  }

  createHemisphereLight(
    id: string,
    skyColor: THREE.ColorRepresentation = 0x87ceeb,
    groundColor: THREE.ColorRepresentation = 0x080820,
    intensity: number = 1
  ): THREE.HemisphereLight {
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);

    const lightInfo: LightInfo = {
      id,
      light,
      type: 'hemisphere',
      enabled: true
    };

    this.lights.set(id, lightInfo);
    this.lightAdded.emit(lightInfo);

    return light;
  }

  getLight(id: string): LightInfo | undefined {
    return this.lights.get(id);
  }

  hasLight(id: string): boolean {
    return this.lights.has(id);
  }

  removeLight(id: string): void {
    const lightInfo = this.lights.get(id);
    if (lightInfo) {
      lightInfo.light.dispose();
      this.lights.delete(id);
      this.lightRemoved.emit(id);
    }
  }

  enableLight(id: string): void {
    const lightInfo = this.lights.get(id);
    if (lightInfo) {
      lightInfo.enabled = true;
      lightInfo.light.intensity = lightInfo.light.intensity || 1;
      this.lightEnabled.emit(id);
    }
  }

  disableLight(id: string): void {
    const lightInfo = this.lights.get(id);
    if (lightInfo) {
      lightInfo.enabled = false;
      lightInfo.light.intensity = 0;
      this.lightDisabled.emit(id);
    }
  }

  setLightIntensity(id: string, intensity: number): void {
    const lightInfo = this.lights.get(id);
    if (lightInfo) {
      lightInfo.light.intensity = intensity;
    }
  }

  setLightColor(id: string, color: THREE.ColorRepresentation): void {
    const lightInfo = this.lights.get(id);
    if (lightInfo) {
      lightInfo.light.color.set(color);
    }
  }

  setLightPosition(id: string, position: THREE.Vector3): void {
    const lightInfo = this.lights.get(id);
    if (lightInfo && lightInfo.light instanceof THREE.Light) {
      lightInfo.light.position.copy(position);
    }
  }

  getAllLights(): LightInfo[] {
    return Array.from(this.lights.values());
  }

  getLightsByType(type: LightInfo['type']): LightInfo[] {
    return Array.from(this.lights.values()).filter(light => light.type === type);
  }

  getEnabledLights(): LightInfo[] {
    return Array.from(this.lights.values()).filter(light => light.enabled);
  }

  removeAllLights(): void {
    this.lights.forEach(lightInfo => {
      lightInfo.light.dispose();
    });
    this.lights.clear();
  }
} 
