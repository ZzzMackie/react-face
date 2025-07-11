import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface CameraConfig {
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  position?: THREE.Vector3;
  target?: THREE.Vector3;
}

/**
 * 相机管理�?
 * 负责管理 Three.js 相机
 */
export class CameraManager implements Manager {
  private engine: unknown;
  private camera!: THREE.PerspectiveCamera;
  private config: CameraConfig;

  // 信号系统
  public readonly cameraCreated = createSignal<THREE.PerspectiveCamera | null>(null);
  public readonly cameraMoved = createSignal<THREE.Vector3>(new THREE.Vector3());
  public readonly cameraTargetChanged = createSignal<THREE.Vector3>(new THREE.Vector3());
  public readonly cameraConfigChanged = createSignal<CameraConfig | null>(null);

  constructor(engine: unknown, config: CameraConfig = {}) {
    this.engine = engine;
    this.config = {
      fov: 75,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 1000,
      position: new THREE.Vector3(0, 0, 5),
      target: new THREE.Vector3(0, 0, 0),
      ...config
    };
  }

  async initialize(): Promise<void> {
    this.createCamera();
  }

  dispose(): void {
    // 相机不需要特殊销�?
  }

  private createCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      this.config.fov,
      this.config.aspect,
      this.config.near,
      this.config.far
    );

    this.camera.position.copy(this.config.position!);
    this.camera.lookAt(this.config.target!);

    this.cameraCreated.emit(this.camera);
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  setPosition(position: THREE.Vector3): void {
    this.camera.position.copy(position);
    this.cameraMoved.emit(position);
  }

  getPosition(): THREE.Vector3 {
    return this.camera.position.clone();
  }

  setTarget(target: THREE.Vector3): void {
    this.camera.lookAt(target);
    this.cameraTargetChanged.emit(target);
  }

  getTarget(): THREE.Vector3 {
    return this.config.target!.clone();
  }

  setFOV(fov: number): void {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
    this.cameraConfigChanged.emit({ ...this.config, fov });
  }

  getFOV(): number {
    return this.camera.fov;
  }

  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.cameraConfigChanged.emit({ ...this.config, aspect });
  }

  getAspect(): number {
    return this.camera.aspect;
  }

  setNear(near: number): void {
    this.camera.near = near;
    this.camera.updateProjectionMatrix();
    this.cameraConfigChanged.emit({ ...this.config, near });
  }

  getNear(): number {
    return this.camera.near;
  }

  setFar(far: number): void {
    this.camera.far = far;
    this.camera.updateProjectionMatrix();
    this.cameraConfigChanged.emit({ ...this.config, far });
  }

  getFar(): number {
    return this.camera.far;
  }

  updateProjectionMatrix(): void {
    this.camera.updateProjectionMatrix();
  }

  animateToPosition(position: THREE.Vector3, duration: number = 1000): void {
    const startPosition = this.camera.position.clone();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(startPosition, position, easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  animateToTarget(target: THREE.Vector3, duration: number = 1000): void {
    const startTarget = this.config.target!.clone();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentTarget = new THREE.Vector3();
      currentTarget.lerpVectors(startTarget, target, easeProgress);

      this.camera.lookAt(currentTarget);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }
}
