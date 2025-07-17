import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface EnvironmentConfig {
  enableFog?: boolean;
  enableSkybox?: boolean;
  enableEnvironmentMap?: boolean;
  defaultFogColor?: THREE.ColorRepresentation;
  defaultFogNear?: number;
  defaultFogFar?: number;
}

export interface EnvironmentInfo {
  id: string;
  type: 'fog' | 'skybox' | 'environmentMap';
  enabled: boolean;
  config: unknown;
}

/**
 * 环境管理�?
 * 负责管理 Three.js 环境效果
 */
export class EnvironmentManager implements Manager {
  // Add test expected properties
  public readonly name = 'EnvironmentManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private environments: Map<string, EnvironmentInfo> = new Map();
  private scene: THREE.Scene | null = null;
  private config: EnvironmentConfig;

  // 信号系统
  public readonly environmentAdded = createSignal<EnvironmentInfo | null>(null);
  public readonly environmentRemoved = createSignal<string | null>(null);
  public readonly environmentUpdated = createSignal<EnvironmentInfo | null>(null);

  constructor(engine: unknown, config: EnvironmentConfig = {}) {
    this.engine = engine;
    this.config = {
      enableFog: true,
      enableSkybox: false,
      enableEnvironmentMap: false,
      defaultFogColor: 0xcccccc,
      defaultFogNear: 1,
      defaultFogFar: 1000,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化环境系�?
  this.initialized = true;}

  dispose(): void {
    this.removeAllEnvironments();
  this.initialized = false;}

  setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  createFog(
    id: string,
    type: 'linear' | 'exponential' | 'exponential2' = 'linear',
    options?: {
      color?: THREE.ColorRepresentation;
      near?: number;
      far?: number;
      density?: number;
    }
  ): void {
    if (!this.scene) {
      throw new Error('Scene must be set before creating fog');
    }

    let fog: THREE.Fog | THREE.FogExp2;

    if (type === 'linear') {
      fog = new THREE.Fog(
        options?.color ?? this.config.defaultFogColor!,
        options?.near ?? this.config.defaultFogNear!,
        options?.far ?? this.config.defaultFogFar!
      );
    } else {
      fog = new THREE.FogExp2(
        options?.color ?? this.config.defaultFogColor!,
        options?.density ?? 0.0025
      );
    }

    this.scene.fog = fog;

    const environmentInfo: EnvironmentInfo = {
      id,
      type: 'fog',
      enabled: true,
      config: { type, options }
    };

    this.environments.set(id, environmentInfo);
    this.environmentAdded.emit(environmentInfo);
  }

  createSkybox(
    id: string,
    texture: THREE.Texture,
    options?: {
      size?: number;
      distance?: number;
    }
  ): void {
    if (!this.scene) {
      throw new Error('Scene must be set before creating skybox');
    }

    const size = options?.size ?? 1000;
    const distance = options?.distance ?? 1000;

    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide
    });

    const skybox = new THREE.Mesh(geometry, material);
    skybox.position.set(0, 0, 0);
    this.scene.add(skybox);

    const environmentInfo: EnvironmentInfo = {
      id,
      type: 'skybox',
      enabled: true,
      config: { texture, options }
    };

    this.environments.set(id, environmentInfo);
    this.environmentAdded.emit(environmentInfo);
  }

  createEnvironmentMap(
    id: string,
    texture: THREE.Texture,
    options?: {
      intensity?: number;
      mapping?: THREE.Mapping;
    }
  ): void {
    if (!this.scene) {
      throw new Error('Scene must be set before creating environment map');
    }

    const intensity = options?.intensity ?? 1.0;
    const mapping = options?.mapping ?? THREE.EquirectangularReflectionMapping;

    texture.mapping = mapping;
    this.scene.environment = texture;
    this.scene.environmentIntensity = intensity;

    const environmentInfo: EnvironmentInfo = {
      id,
      type: 'environmentMap',
      enabled: true,
      config: { texture, options }
    };

    this.environments.set(id, environmentInfo);
    this.environmentAdded.emit(environmentInfo);
  }

  getEnvironment(id: string): EnvironmentInfo | undefined {
    return this.environments.get(id);
  }

  hasEnvironment(id: string): boolean {
    return this.environments.has(id);
  }

  removeEnvironment(id: string): void {
    const environmentInfo = this.environments.get(id);
    if (environmentInfo) {
      if (environmentInfo.type === 'fog' && this.scene) {
        this.scene.fog = null;
      } else if (environmentInfo.type === 'skybox' && this.scene) {
        // Remove skybox mesh from scene
        this.scene.children = this.scene.children.filter(child => 
          !(child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial)
        );
      } else if (environmentInfo.type === 'environmentMap' && this.scene) {
        this.scene.environment = null;
      }

      this.environments.delete(id);
      this.environmentRemoved.emit(id);
    }
  }

  setEnvironmentEnabled(id: string, enabled: boolean): void {
    const environmentInfo = this.environments.get(id);
    if (environmentInfo) {
      environmentInfo.enabled = enabled;
      
      if (environmentInfo.type === 'fog' && this.scene) {
        this.scene.fog = enabled ? this.scene.fog : null;
      }
      
      this.environmentUpdated.emit(environmentInfo);
    }
  }

  updateFog(
    id: string,
    options: {
      color?: THREE.ColorRepresentation;
      near?: number;
      far?: number;
      density?: number;
    }
  ): void {
    const environmentInfo = this.environments.get(id);
    if (environmentInfo && environmentInfo.type === 'fog' && this.scene && this.scene.fog) {
      if (options.color) {
        this.scene.fog.color.setHex(options.color as number);
      }
      
      if (this.scene.fog instanceof THREE.Fog) {
        if (options.near) this.scene.fog.near = options.near;
        if (options.far) this.scene.fog.far = options.far;
      } else if (this.scene.fog instanceof THREE.FogExp2) {
        if (options.density) this.scene.fog.density = options.density;
      }
      
      environmentInfo.config = { ...environmentInfo.config, options };
      this.environmentUpdated.emit(environmentInfo);
    }
  }

  updateEnvironmentMap(
    id: string,
    options: {
      intensity?: number;
      mapping?: THREE.Mapping;
    }
  ): void {
    const environmentInfo = this.environments.get(id);
    if (environmentInfo && environmentInfo.type === 'environmentMap' && this.scene) {
      if (options.intensity) {
        this.scene.environmentIntensity = options.intensity;
      }
      
      if (options.mapping && this.scene.environment) {
        this.scene.environment.mapping = options.mapping;
      }
      
      environmentInfo.config = { ...environmentInfo.config, options };
      this.environmentUpdated.emit(environmentInfo);
    }
  }

  getAllEnvironments(): EnvironmentInfo[] {
    return Array.from(this.environments.values());
  }

  getEnvironmentsByType(type: 'fog' | 'skybox' | 'environmentMap'): EnvironmentInfo[] {
    return Array.from(this.environments.values()).filter(env => env.type === type);
  }

  getEnabledEnvironments(): EnvironmentInfo[] {
    return Array.from(this.environments.values()).filter(env => env.enabled);
  }

  removeAllEnvironments(): void {
    if (this.scene) {
      this.scene.fog = null;
      this.scene.environment = null;
      this.scene.children = this.scene.children.filter(child => 
        !(child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial)
      );
    }
    this.environments.clear();
  }
}