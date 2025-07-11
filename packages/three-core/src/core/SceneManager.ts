import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface SceneConfig {
  background?: THREE.Color | THREE.Texture | THREE.CubeTexture;
  fog?: THREE.Fog | THREE.FogExp2;
  environment?: THREE.CubeTexture;
}

/**
 * 场景管理�?
 * 负责管理 Three.js 场景
 */
export class SceneManager implements Manager {
  private engine: unknown;
  private scene: THREE.Scene;
  private config: SceneConfig;

  // 信号系统
  public readonly sceneCreated = createSignal<THREE.Scene | null>(null);
  public readonly backgroundChanged = createSignal<THREE.Color | THREE.Texture | THREE.CubeTexture | null>(null);
  public readonly fogChanged = createSignal<THREE.Fog | THREE.FogExp2 | null>(null);
  public readonly environmentChanged = createSignal<THREE.CubeTexture | null>(null);

  constructor(engine: unknown, config: SceneConfig = {}) {
    this.engine = engine;
    this.config = config;
    this.scene = new THREE.Scene();
  }

  async initialize(): Promise<void> {
    this.setupScene();
    this.sceneCreated.emit(this.scene);
  }

  dispose(): void {
    this.scene.clear();
  }

  private setupScene(): void {
    if (this.config.background) {
      this.setBackground(this.config.background);
    }

    if (this.config.fog) {
      this.setFog(this.config.fog);
    }

    if (this.config.environment) {
      this.setEnvironment(this.config.environment);
    }
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  setBackground(background: THREE.Color | THREE.Texture | THREE.CubeTexture): void {
    this.scene.background = background;
    this.backgroundChanged.emit(background);
  }

  getBackground(): THREE.Color | THREE.Texture | THREE.CubeTexture | null {
    return this.scene.background;
  }

  setFog(fog: THREE.Fog | THREE.FogExp2): void {
    this.scene.fog = fog;
    this.fogChanged.emit(fog);
  }

  getFog(): THREE.Fog | THREE.FogExp2 | null {
    return this.scene.fog;
  }

  setEnvironment(environment: THREE.CubeTexture): void {
    this.scene.environment = environment;
    this.environmentChanged.emit(environment);
  }

  getEnvironment(): THREE.CubeTexture | null {
    return this.scene.environment;
  }

  add(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  clear(): void {
    this.scene.clear();
  }

  traverse(callback: (object: THREE.Object3D) => void): void {
    this.scene.traverse(callback);
  }

  getChildren(): THREE.Object3D[] {
    return this.scene.children;
  }

  getObjectByName(name: string): THREE.Object3D | undefined {
    return this.scene.getObjectByName(name);
  }

  getObjectById(id: number): THREE.Object3D | undefined {
    return this.scene.getObjectById(id);
  }
}
