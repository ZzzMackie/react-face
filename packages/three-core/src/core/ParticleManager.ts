import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface ParticleConfig {
  maxParticles?: number;
  enableGPU?: boolean;
  defaultLifetime?: number;
}

export interface ParticleSystem {
  id: string;
  system: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
  active: boolean;
  particleCount: number;
  maxParticles: number;
}

/**
 * 粒子系统管理�?
 * 负责管理 Three.js 粒子系统
 */
export class ParticleManager implements Manager {
  // Add test expected properties
  public readonly name = 'ParticleManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private systems: Map<string, ParticleSystem> = new Map();
  private config: ParticleConfig;

  // 信号系统
  public readonly systemCreated = createSignal<ParticleSystem | null>(null);
  public readonly systemRemoved = createSignal<string | null>(null);
  public readonly systemUpdated = createSignal<ParticleSystem | null>(null);

  constructor(engine: unknown, config: ParticleConfig = {}) {
    this.engine = engine;
    this.config = {
      maxParticles: 10000,
      enableGPU: true,
      defaultLifetime: 2.0,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化粒子系�?
  this.initialized = true;}

  dispose(): void {
    this.removeAllSystems();
  this.initialized = false;}

  createParticleSystem(
    id: string,
    particleCount: number,
    options?: {
      size?: number;
      color?: THREE.ColorRepresentation;
      sizeAttenuation?: boolean;
      transparent?: boolean;
      opacity?: number;
      blending?: THREE.Blending;
      texture?: THREE.Texture;
    }
  ): ParticleSystem {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // 初始化粒子数�?
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();

      sizes[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: options?.size ?? 1,
      color: options?.color ?? 0xffffff,
      sizeAttenuation: options?.sizeAttenuation ?? true,
      transparent: options?.transparent ?? true,
      opacity: options?.opacity ?? 1.0,
      blending: options?.blending ?? THREE.AdditiveBlending,
      map: options?.texture,
      vertexColors: true
    });

    const system = new THREE.Points(geometry, material);

    const particleSystem: ParticleSystem = {
      id,
      system,
      geometry,
      material,
      active: true,
      particleCount,
      maxParticles: particleCount
    };

    this.systems.set(id, particleSystem);
    this.systemCreated.emit(particleSystem);

    return particleSystem;
  }

  createExplosionSystem(
    id: string,
    particleCount: number,
    position: THREE.Vector3,
    options?: {
      explosionRadius?: number;
      velocity?: number;
      lifetime?: number;
      color?: THREE.ColorRepresentation;
      size?: number;
    }
  ): ParticleSystem {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);

    const explosionRadius = options?.explosionRadius ?? 5;
    const velocity = options?.velocity ?? 10;
    const lifetime = options?.lifetime ?? this.config.defaultLifetime!;

    for (let i = 0; i < particleCount; i++) {
      // 随机方向
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = Math.random() * explosionRadius;

      positions[i * 3] = position.x + r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = position.y + r * Math.cos(phi);
      positions[i * 3 + 2] = position.z + r * Math.sin(phi) * Math.sin(theta);

      // 速度向量
      const speed = Math.random() * velocity + velocity * 0.5;
      velocities[i * 3] = (positions[i * 3] - position.x) * speed / explosionRadius;
      velocities[i * 3 + 1] = (positions[i * 3 + 1] - position.y) * speed / explosionRadius;
      velocities[i * 3 + 2] = (positions[i * 3 + 2] - position.z) * speed / explosionRadius;

      // 颜色
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = Math.random() * 0.5;
      colors[i * 3 + 2] = 0.0;

      // 生命周期
      lifetimes[i] = Math.random() * lifetime + lifetime * 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    const material = new THREE.PointsMaterial({
      size: options?.size ?? 2,
      color: options?.color ?? 0xff4400,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    const system = new THREE.Points(geometry, material);

    const particleSystem: ParticleSystem = {
      id,
      system,
      geometry,
      material,
      active: true,
      particleCount,
      maxParticles: particleCount
    };

    this.systems.set(id, particleSystem);
    this.systemCreated.emit(particleSystem);

    return particleSystem;
  }

  getSystem(id: string): ParticleSystem | undefined {
    return this.systems.get(id);
  }

  hasSystem(id: string): boolean {
    return this.systems.has(id);
  }

  removeSystem(id: string): void {
    const system = this.systems.get(id);
    if (system) {
      system.geometry.dispose();
      system.material.dispose();
      this.systems.delete(id);
      this.systemRemoved.emit(id);
    }
  }

  updateSystem(id: string, deltaTime: number): void {
    const system = this.systems.get(id);
    if (system && system.active) {
      const positions = system.geometry.attributes.position.array as Float32Array;
      const velocities = system.geometry.attributes.velocity?.array as Float32Array;
      const lifetimes = system.geometry.attributes.lifetime?.array as Float32Array;

      if (velocities && lifetimes) {
        // 更新爆炸粒子
        for (let i = 0; i < system.particleCount; i++) {
          const index = i * 3;
          const lifetime = lifetimes[i];

          if (lifetime > 0) {
            // 更新位置
            positions[index] += velocities[index] * deltaTime;
            positions[index + 1] += velocities[index + 1] * deltaTime;
            positions[index + 2] += velocities[index + 2] * deltaTime;

            // 应用重力
            velocities[index + 1] -= 9.81 * deltaTime;

            // 更新生命周期
            lifetimes[i] -= deltaTime;
          }
        }

        system.geometry.attributes.position.needsUpdate = true;
        system.geometry.attributes.velocity.needsUpdate = true;
        system.geometry.attributes.lifetime.needsUpdate = true;
      }

      this.systemUpdated.emit(system);
    }
  }

  setSystemActive(id: string, active: boolean): void {
    const system = this.systems.get(id);
    if (system) {
      system.active = active;
      system.system.visible = active;
    }
  }

  setSystemPosition(id: string, position: THREE.Vector3): void {
    const system = this.systems.get(id);
    if (system) {
      system.system.position.copy(position);
    }
  }

  setSystemScale(id: string, scale: THREE.Vector3): void {
    const system = this.systems.get(id);
    if (system) {
      system.system.scale.copy(scale);
    }
  }

  getAllSystems(): ParticleSystem[] {
    return Array.from(this.systems.values());
  }

  getActiveSystems(): ParticleSystem[] {
    return Array.from(this.systems.values()).filter(system => system.active);
  }

  removeAllSystems(): void {
    this.systems.forEach(system => {
      system.geometry.dispose();
      system.material.dispose();
    });
    this.systems.clear();
  }

  update(deltaTime: number): void {
    this.systems.forEach((system, id) => {
      this.updateSystem(id, deltaTime);
    });
  }
} 