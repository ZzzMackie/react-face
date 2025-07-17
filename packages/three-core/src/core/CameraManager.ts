import * as THREE from 'three';
import { createSignal } from './Signal';

export interface CameraConfig {
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  position?: THREE.Vector3;
  target?: THREE.Vector3;
}

export interface CameraSettings {
  fov: number;
  aspect: number;
  near: number;
  far: number;
}

/**
 * ?????
 * ?? Three.js ??
 */
export class CameraManager {
  private engine: unknown;
  private _camera!: THREE.PerspectiveCamera;
  private config: CameraConfig;
  private _settings: CameraSettings;
  private isAnimatingFlag = false;
  private orbitControls: any = null;

  // ????
  public readonly name = 'camera';
  public readonly type = 'camera';
  public initialized = false;

  // ????
  public readonly cameraCreated = createSignal<THREE.PerspectiveCamera | null>(null);
  public readonly cameraMoved = createSignal<THREE.Vector3>(new THREE.Vector3());
  public readonly cameraTargetChanged = createSignal<THREE.Vector3>(new THREE.Vector3());
  public readonly cameraConfigChanged = createSignal<CameraConfig | null>(null);

  // 事件系统
  private eventListeners: Map<string, Function[]> = new Map();

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
    
    this._settings = {
      fov: this.config.fov!,
      aspect: this.config.aspect!,
      near: this.config.near!,
      far: this.config.far!
    };
  }

  async initialize(): Promise<void> {
    this.createCamera();
    this.initialized = true;
  }

  dispose(): void {
    // ?????????
  }

  private createCamera(): void {
    this._camera = new THREE.PerspectiveCamera(
      this.config.fov,
      this.config.aspect,
      this.config.near,
      this.config.far
    );

    this._camera.position.copy(this.config.position!);
    this._camera.lookAt(this.config.target!);

    this.cameraCreated.emit(this._camera);
  }

  // ????
  getCamera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  // ????
  createPerspectiveCamera(fov: number, aspect: number, near: number, far: number): THREE.PerspectiveCamera {
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
  }

  createOrthographicCamera(left: number, right: number, top: number, bottom: number, near: number, far: number): THREE.OrthographicCamera {
    return new THREE.OrthographicCamera(left, right, top, bottom, near, far);
  }

  setActiveCamera(camera: THREE.Camera): void {
    this._camera = camera as THREE.PerspectiveCamera;
    this.emit('camera:changed', camera);
  }

  // 位置相关
  setPosition(position: { x: number; y: number; z: number }): void {
    this._camera.position.set(position.x, position.y, position.z);
    this.cameraMoved.emit(this._camera.position);
    this.emit('position:changed', position);
  }

  getPosition(): { x: number; y: number; z: number } {
    return {
      x: this._camera.position.x,
      y: this._camera.position.y,
      z: this._camera.position.z
    };
  }

  move(offset: { x: number; y: number; z: number }): void {
    this._camera.position.add(new THREE.Vector3(offset.x, offset.y, offset.z));
    this.cameraMoved.emit(this._camera.position);
    this.emit('position:changed', this.getPosition());
  }

  // 旋转相关
  setRotation(rotation: { x: number; y: number; z: number }): void {
    this._camera.rotation.set(rotation.x, rotation.y, rotation.z);
    this.emit('rotation:changed', rotation);
  }

  getRotation(): { x: number; y: number; z: number } {
    return {
      x: this._camera.rotation.x,
      y: this._camera.rotation.y,
      z: this._camera.rotation.z
    };
  }

  rotate(rotation: { x: number; y: number; z: number }): void {
    this._camera.rotation.x += rotation.x;
    this._camera.rotation.y += rotation.y;
    this._camera.rotation.z += rotation.z;
    this.emit('rotation:changed', this.getRotation());
  }

  // ????
  setTarget(target: { x: number; y: number; z: number }): void {
    this._camera.lookAt(new THREE.Vector3(target.x, target.y, target.z));
    this.cameraTargetChanged.emit(new THREE.Vector3(target.x, target.y, target.z));
  }

  getTarget(): THREE.Vector3 {
    return this.config.target!.clone();
  }

  lookAt(target: { x: number; y: number; z: number }): void {
    this._camera.lookAt(new THREE.Vector3(target.x, target.y, target.z));
  }

  lookAtObject(object: { position: { x: number; y: number; z: number } }): void {
    this._camera.lookAt(new THREE.Vector3(object.position.x, object.position.y, object.position.z));
  }

  // ????
  setFOV(fov: number): void {
    this._camera.fov = fov;
    this._settings.fov = fov;
    this._camera.updateProjectionMatrix();
    this.cameraConfigChanged.emit({ ...this.config, fov });
  }

  getFOV(): number {
    return this._camera.fov;
  }

  setAspectRatio(aspect: number): void {
    this._camera.aspect = aspect;
    this._settings.aspect = aspect;
    this._camera.updateProjectionMatrix();
    this.cameraConfigChanged.emit({ ...this.config, aspect });
  }

  // Alias for setAspectRatio
  setAspect(aspect: number): void {
    this.setAspectRatio(aspect);
  }

  getAspectRatio(): number {
    return this._camera.aspect;
  }

  setNearFar(near: number, far: number): void {
    this._camera.near = near;
    this._camera.far = far;
    this._settings.near = near;
    this._settings.far = far;
    this._camera.updateProjectionMatrix();
    this.cameraConfigChanged.emit({ ...this.config, near, far });
  }

  getNear(): number {
    return this._camera.near;
  }

  getFar(): number {
    return this._camera.far;
  }

  updateProjectionMatrix(): void {
    this._camera.updateProjectionMatrix();
  }

  updateMatrix(): void {
    this._camera.updateMatrix();
    this._camera.updateMatrixWorld();
  }

  // ????
  animateToPosition(position: { x: number; y: number; z: number }, duration: number = 1000): void {
    const startPosition = this._camera.position.clone();
    const targetPosition = new THREE.Vector3(position.x, position.y, position.z);
    const startTime = Date.now();
    this.isAnimatingFlag = true;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      this._camera.position.lerpVectors(startPosition, targetPosition, easeProgress);

      if (progress < 1 && this.isAnimatingFlag) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimatingFlag = false;
      }
    };

    animate();
  }

  animateToRotation(rotation: { x: number; y: number; z: number }, duration: number = 1000): void {
    const startRotation = this._camera.rotation.clone();
    const targetRotation = new THREE.Euler(rotation.x, rotation.y, rotation.z);
    const startTime = Date.now();
    this.isAnimatingFlag = true;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      this._camera.rotation.x = THREE.MathUtils.lerp(startRotation.x, targetRotation.x, easeProgress);
      this._camera.rotation.y = THREE.MathUtils.lerp(startRotation.y, targetRotation.y, easeProgress);
      this._camera.rotation.z = THREE.MathUtils.lerp(startRotation.z, targetRotation.z, easeProgress);

      if (progress < 1 && this.isAnimatingFlag) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimatingFlag = false;
      }
    };

    animate();
  }

  isAnimating(): boolean {
    return this.isAnimatingFlag;
  }

  stopAnimation(): void {
    this.isAnimatingFlag = false;
  }

  // ?????
  enableOrbitControls(): void {
    // ????????????????????
    this.orbitControls = { enabled: true };
  }

  disableOrbitControls(): void {
    if (this.orbitControls) {
      this.orbitControls.enabled = false;
    }
  }

  hasOrbitControls(): boolean {
    return this.orbitControls && this.orbitControls.enabled;
  }

  setOrbitTarget(target: { x: number; y: number; z: number }): void {
    // ????????
  }

  getOrbitTarget(): { x: number; y: number; z: number } {
    return { x: 0, y: 0, z: 0 };
  }

  // ????
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // ????
  getStatistics(): any {
    return {
      position: this.getPosition(),
      rotation: this.getRotation(),
      fov: this.getFOV(),
      aspect: this.getAspectRatio()
    };
  }

  getMatrix(): THREE.Matrix4 {
    return this._camera.matrix;
  }

  getWorldMatrix(): THREE.Matrix4 {
    return this._camera.matrixWorld;
  }

  // ??
  validateSettings(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (this._camera.fov <= 0) errors.push('FOV must be positive');
    if (this._camera.aspect <= 0) errors.push('Aspect ratio must be positive');
    if (this._camera.near >= this._camera.far) errors.push('Near must be less than far');
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  checkIntegrity(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    if (!this._camera) issues.push('Camera is null');
    if (!this.initialized) issues.push('Manager not initialized');
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  // ????
  update(): void {
    // ??????
  }

  // ?????
  get camera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  get settings(): CameraSettings {
    return this._settings;
  }
}
