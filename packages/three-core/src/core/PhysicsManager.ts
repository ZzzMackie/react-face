import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface PhysicsConfig {
  gravity?: THREE.Vector3;
  timeStep?: number;
  maxSubSteps?: number;
}

export interface PhysicsBody {
  id: string;
  mesh: THREE.Mesh;
  mass: number;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  forces: THREE.Vector3;
}

/**
 * 物理管理器
 * 负责管理简单的物理模拟
 */
export class PhysicsManager implements Manager {
  private engine: unknown;
  private bodies: Map<string, PhysicsBody> = new Map();
  private config: PhysicsConfig;
  private clock: THREE.Clock;

  // 信号系统
  public readonly bodyAdded = createSignal<PhysicsBody | null>(null);
  public readonly bodyRemoved = createSignal<string | null>(null);
  public readonly collisionDetected = createSignal<{ body1: string; body2: string } | null>(null);
  public readonly physicsStep = createSignal<number>(0);

  constructor(engine: unknown, config: PhysicsConfig = {}) {
    this.engine = engine;
    this.config = {
      gravity: new THREE.Vector3(0, -9.81, 0),
      timeStep: 1 / 60,
      maxSubSteps: 5,
      ...config
    };
    this.clock = new THREE.Clock();
  }

  init(): void {
    this.clock.start();
  }

  destroy(): void {
    this.bodies.clear();
  }

  addBody(
    id: string,
    mesh: THREE.Mesh,
    mass: number = 1,
    initialVelocity: THREE.Vector3 = new THREE.Vector3()
  ): void {
    const body: PhysicsBody = {
      id,
      mesh,
      mass,
      velocity: initialVelocity.clone(),
      acceleration: new THREE.Vector3(),
      forces: new THREE.Vector3()
    };

    this.bodies.set(id, body);
    this.bodyAdded.emit(body);
  }

  removeBody(id: string): void {
    if (this.bodies.has(id)) {
      this.bodies.delete(id);
      this.bodyRemoved.emit(id);
    }
  }

  getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id);
  }

  hasBody(id: string): boolean {
    return this.bodies.has(id);
  }

  applyForce(id: string, force: THREE.Vector3): void {
    const body = this.bodies.get(id);
    if (body) {
      body.forces.add(force);
    }
  }

  setVelocity(id: string, velocity: THREE.Vector3): void {
    const body = this.bodies.get(id);
    if (body) {
      body.velocity.copy(velocity);
    }
  }

  setPosition(id: string, position: THREE.Vector3): void {
    const body = this.bodies.get(id);
    if (body) {
      body.mesh.position.copy(position);
    }
  }

  update(): void {
    const deltaTime = this.clock.getDelta();
    const timeStep = this.config.timeStep!;
    const maxSubSteps = this.config.maxSubSteps!;

    const numSubSteps = Math.min(Math.floor(deltaTime / timeStep), maxSubSteps);
    const actualTimeStep = deltaTime / numSubSteps;

    for (let i = 0; i < numSubSteps; i++) {
      this.updateStep(actualTimeStep);
    }

    this.physicsStep.emit(deltaTime);
  }

  private updateStep(deltaTime: number): void {
    this.bodies.forEach(body => {
      const gravityForce = this.config.gravity!.clone().multiplyScalar(body.mass);
      body.forces.add(gravityForce);

      body.acceleration.copy(body.forces).divideScalar(body.mass);
      body.velocity.add(body.acceleration.clone().multiplyScalar(deltaTime));
      body.mesh.position.add(body.velocity.clone().multiplyScalar(deltaTime));

      body.forces.set(0, 0, 0);
    });

    this.detectCollisions();
  }

  private detectCollisions(): void {
    const bodies = Array.from(this.bodies.values());
    
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const body1 = bodies[i];
        const body2 = bodies[j];

        if (this.checkCollision(body1, body2)) {
          this.collisionDetected.emit({
            body1: body1.id,
            body2: body2.id
          });
        }
      }
    }
  }

  private checkCollision(body1: PhysicsBody, body2: PhysicsBody): boolean {
    const box1 = new THREE.Box3().setFromObject(body1.mesh);
    const box2 = new THREE.Box3().setFromObject(body2.mesh);
    
    return box1.intersectsBox(box2);
  }

  setGravity(gravity: THREE.Vector3): void {
    this.config.gravity = gravity.clone();
  }

  getGravity(): THREE.Vector3 {
    return this.config.gravity!.clone();
  }

  getAllBodies(): PhysicsBody[] {
    return Array.from(this.bodies.values());
  }

  clearBodies(): void {
    this.bodies.clear();
  }
} 