import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface LightConfig {
  ambientIntensity?: number;
  enableShadows?: boolean;
  shadowMapSize?: number;
  autoAddToScene?: boolean; // ?????????
  defaultScene?: THREE.Scene; // ????
}

export interface LightInfo {
  id: string;
  light: THREE.Light;
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
  enabled: boolean;
}

export interface LightCreationConfig {
  scene?: THREE.Scene; // ????????
  [key: string]: any; // ????
}

/**
 * ?????
 * ??????????
 */
export class LightManager implements Manager {
  private engine: unknown;
  private lights: Map<string, LightInfo> = new Map();
  private config: LightConfig;

  // ???????
  public readonly name = 'light';
  public initialized = false;

  // ????
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
      autoAddToScene: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    console.log('?? LightManager initialized');
    this.initialized = true;
  }

  dispose(): void {
    this.lights.forEach(lightInfo => {
      lightInfo.light.dispose();
    });
    this.lights.clear();
    this.initialized = false;
  }

  // ????????????
  private addToScene(light: THREE.Light, config?: LightCreationConfig): void {
    if (!this.config.autoAddToScene) return;

    let targetScene: THREE.Scene | null = null;

    // ?????????? > ???? > ????
    if (config?.scene) {
      targetScene = config.scene;
    } else if (this.config.defaultScene) {
      targetScene = this.config.defaultScene;
    } else {
      const sceneManager = (this.engine as any)?.getManager('scene');
      if (sceneManager) {
        targetScene = sceneManager.getScene();
      }
    }

    if (targetScene) {
      targetScene.add(light);
    }
  }

  // ????????????
  private removeFromScene(light: THREE.Light): void {
    if (light.parent) {
      light.parent.remove(light);
    }
  }

  // ???????????
  private createLightInfo(id: string, light: THREE.Light, type: LightInfo['type']): LightInfo {
    return {
      id,
      light,
      type,
      enabled: true
    };
  }

  // ???????????
  private setupLightShadows(light: THREE.Light): void {
    if (this.config.enableShadows && 'castShadow' in light) {
      (light as any).castShadow = true;
      if ('shadow' in light) {
        (light as any).shadow.mapSize.width = this.config.shadowMapSize!;
        (light as any).shadow.mapSize.height = this.config.shadowMapSize!;
      }
    }
  }

  createAmbientLight(id: string, config?: LightCreationConfig & { intensity?: number; color?: THREE.ColorRepresentation }): THREE.AmbientLight {
    const intensity = config?.intensity ?? 0.4;
    const color = config?.color ?? 0xffffff;
    const light = new THREE.AmbientLight(color, intensity);
    
    this.addToScene(light, config);
    const lightInfo: LightInfo = this.createLightInfo(id, light, 'ambient');

    this.lights.set(id, lightInfo);
    this.lightAdded.emit(lightInfo);

    return light;
  }

  createDirectionalLight(
    id: string,
    config?: LightCreationConfig & { 
      intensity?: number; 
      color?: THREE.ColorRepresentation;
      position?: THREE.Vector3 | { x: number; y: number; z: number };
    }
  ): THREE.DirectionalLight {
    const intensity = config?.intensity ?? 1;
    const color = config?.color ?? 0xffffff;
    const positionConfig = config?.position ?? { x: 5, y: 5, z: 5 };
    
    // ??position??????????Vector3??
    let position: THREE.Vector3;
    if (positionConfig instanceof THREE.Vector3) {
      position = positionConfig;
    } else {
      position = new THREE.Vector3(positionConfig.x, positionConfig.y, positionConfig.z);
    }
    
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.copy(position);
    this.setupLightShadows(light);
    const lightInfo: LightInfo = this.createLightInfo(id, light, 'directional');

    this.addToScene(light, config);
    this.lights.set(id, lightInfo);
    this.lightAdded.emit(lightInfo);

    return light;
  }

  createPointLight(
    id: string,
    config?: LightCreationConfig & {
      intensity?: number;
      color?: THREE.ColorRepresentation;
      position?: THREE.Vector3 | { x: number; y: number; z: number };
      distance?: number;
      decay?: number;
    }
  ): THREE.PointLight {
    const intensity = config?.intensity ?? 1;
    const color = config?.color ?? 0xffffff;
    const distance = config?.distance ?? 0;
    const decay = config?.decay ?? 2;
    const positionConfig = config?.position ?? { x: 0, y: 0, z: 0 };
    
    // ??position??????????Vector3??
    let position: THREE.Vector3;
    if (positionConfig instanceof THREE.Vector3) {
      position = positionConfig;
    } else {
      position = new THREE.Vector3(positionConfig.x, positionConfig.y, positionConfig.z);
    }
    
    const light = new THREE.PointLight(color, intensity, distance, decay);
    light.position.copy(position);
    this.setupLightShadows(light);
    const lightInfo: LightInfo = this.createLightInfo(id, light, 'point');

    this.addToScene(light, config);
    this.lights.set(id, lightInfo);
    this.lightAdded.emit(lightInfo);

    return light;
  }

  createSpotLight(
    id: string,
    config?: LightCreationConfig & {
      intensity?: number;
      color?: THREE.ColorRepresentation;
      position?: THREE.Vector3 | { x: number; y: number; z: number };
      target?: THREE.Vector3 | { x: number; y: number; z: number };
      angle?: number;
      penumbra?: number;
      distance?: number;
    }
  ): THREE.SpotLight {
    const intensity = config?.intensity ?? 1;
    const color = config?.color ?? 0xffffff;
    const angle = config?.angle ?? Math.PI / 3;
    const penumbra = config?.penumbra ?? 0;
    const distance = config?.distance ?? 0;
    const positionConfig = config?.position ?? { x: 0, y: 0, z: 0 };
    const targetConfig = config?.target ?? { x: 0, y: 0, z: 0 };
    
    // ??position??????????Vector3??
    let position: THREE.Vector3;
    if (positionConfig instanceof THREE.Vector3) {
      position = positionConfig;
    } else {
      position = new THREE.Vector3(positionConfig.x, positionConfig.y, positionConfig.z);
    }
    
    // ??target??????????Vector3??
    let target: THREE.Vector3;
    if (targetConfig instanceof THREE.Vector3) {
      target = targetConfig;
    } else {
      target = new THREE.Vector3(targetConfig.x, targetConfig.y, targetConfig.z);
    }
    
    const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra);
    light.position.copy(position);
    light.target.position.copy(target);
    this.setupLightShadows(light);
    const lightInfo: LightInfo = this.createLightInfo(id, light, 'spot');

    this.addToScene(light, config);
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
    const lightInfo: LightInfo = this.createLightInfo(id, light, 'hemisphere');

    this.addToScene(light);
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
      this.removeFromScene(lightInfo.light);
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
      this.removeFromScene(lightInfo.light);
      lightInfo.light.dispose();
    });
    this.lights.clear();
  }
}