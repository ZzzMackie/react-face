import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface ControlsConfig {
  enableOrbitControls?: boolean;
  enableTransformControls?: boolean;
  enableDamping?: boolean;
  dampingFactor?: number;
}

export interface ControlInfo {
  id: string;
  control: OrbitControls | TransformControls;
  type: 'orbit' | 'transform';
  enabled: boolean;
}

/**
 * 控制器管理器
 * 负责管理 Three.js 控制�?
 */
export class ControlsManager implements Manager {
  // Add test expected properties
  public readonly name = 'ControlsManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private controls: Map<string, ControlInfo> = new Map();
  private camera: THREE.Camera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private config: ControlsConfig;

  // 信号系统
  public readonly controlAdded = createSignal<ControlInfo | null>(null);
  public readonly controlRemoved = createSignal<string | null>(null);
  public readonly controlEnabled = createSignal<string | null>(null);
  public readonly controlDisabled = createSignal<string | null>(null);

  constructor(engine: unknown, config: ControlsConfig = {}) {
    this.engine = engine;
    this.config = {
      enableOrbitControls: true,
      enableTransformControls: true,
      enableDamping: true,
      dampingFactor: 0.05,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化控制器系统
  this.initialized = true;}

  dispose(): void {
    this.removeAllControls();
  this.initialized = false;}

  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }

  setRenderer(renderer: THREE.WebGLRenderer): void {
    this.renderer = renderer;
  }

  createOrbitControls(
    id: string,
    options?: {
      enableDamping?: boolean;
      dampingFactor?: number;
      enableZoom?: boolean;
      enableRotate?: boolean;
      enablePan?: boolean;
      minDistance?: number;
      maxDistance?: number;
      minPolarAngle?: number;
      maxPolarAngle?: number;
    }
  ): OrbitControls {
    if ((!this.camera || !this.renderer) && !this.engine) {
      throw new Error('Camera and renderer must be set before creating controls');
    } 
    const camera = this.camera ?? (this.engine as any).camera;
    const renderer = this.renderer ?? (this.engine as any).renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    
    controls.enableDamping = options?.enableDamping ?? this.config.enableDamping!;
    controls.dampingFactor = options?.dampingFactor ?? this.config.dampingFactor!;
    controls.enableZoom = options?.enableZoom ?? true;
    controls.enableRotate = options?.enableRotate ?? true;
    controls.enablePan = options?.enablePan ?? true;
    
    if (options?.minDistance) controls.minDistance = options.minDistance;
    if (options?.maxDistance) controls.maxDistance = options.maxDistance;
    if (options?.minPolarAngle) controls.minPolarAngle = options.minPolarAngle;
    if (options?.maxPolarAngle) controls.maxPolarAngle = options.maxPolarAngle;

    const controlInfo: ControlInfo = {
      id,
      control: controls,
      type: 'orbit',
      enabled: true
    };

    this.controls.set(id, controlInfo);
    this.controlAdded.emit(controlInfo);

    return controls;
  }

  createTransformControls(
    id: string,
    mode: 'translate' | 'rotate' | 'scale' = 'translate',
    options?: {
      size?: number;
      showX?: boolean;
      showY?: boolean;
      showZ?: boolean;
    }
  ): TransformControls {
    if (!this.camera || !this.renderer) {
      throw new Error('Camera and renderer must be set before creating controls');
    }

    const controls = new TransformControls(this.camera, this.renderer.domElement);
    
    controls.setMode(mode);
    controls.setSize(options?.size ?? 1);
    controls.showX = options?.showX ?? true;
    controls.showY = options?.showY ?? true;
    controls.showZ = options?.showZ ?? true;

    const controlInfo: ControlInfo = {
      id,
      control: controls,
      type: 'transform',
      enabled: true
    };

    this.controls.set(id, controlInfo);
    this.controlAdded.emit(controlInfo);

    return controls;
  }

  getControl(id: string): ControlInfo | undefined {
    return this.controls.get(id);
  }

  hasControl(id: string): boolean {
    return this.controls.has(id);
  }

  removeControl(id: string): void {
    const controlInfo = this.controls.get(id);
    if (controlInfo) {
      controlInfo.control.dispose();
      this.controls.delete(id);
      this.controlRemoved.emit(id);
    }
  }

  enableControl(id: string): void {
    const controlInfo = this.controls.get(id);
    if (controlInfo) {
      controlInfo.enabled = true;
      controlInfo.control.enabled = true;
      this.controlEnabled.emit(id);
    }
  }

  disableControl(id: string): void {
    const controlInfo = this.controls.get(id);
    if (controlInfo) {
      controlInfo.enabled = false;
      controlInfo.control.enabled = false;
      this.controlDisabled.emit(id);
    }
  }

  setControlTarget(id: string, target: THREE.Vector3): void {
    const controlInfo = this.controls.get(id);
    if (controlInfo && controlInfo.type === 'orbit') {
      (controlInfo.control as OrbitControls).target.copy(target);
    }
  }

  setControlObject(id: string, object: THREE.Object3D): void {
    const controlInfo = this.controls.get(id);
    if (controlInfo && controlInfo.type === 'transform') {
      (controlInfo.control as TransformControls).attach(object);
    }
  }

  setControlMode(id: string, mode: 'translate' | 'rotate' | 'scale'): void {
    const controlInfo = this.controls.get(id);
    if (controlInfo && controlInfo.type === 'transform') {
      (controlInfo.control as TransformControls).setMode(mode);
    }
  }

  update(): void {
    this.controls.forEach(controlInfo => {
      if (controlInfo.enabled && controlInfo.type === 'orbit') {
        (controlInfo.control as OrbitControls).update();
      }
    });
  }

  getAllControls(): ControlInfo[] {
    return Array.from(this.controls.values());
  }

  getControlsByType(type: 'orbit' | 'transform'): ControlInfo[] {
    return Array.from(this.controls.values()).filter(control => control.type === type);
  }

  getEnabledControls(): ControlInfo[] {
    return Array.from(this.controls.values()).filter(control => control.enabled);
  }

  removeAllControls(): void {
    this.controls.forEach(controlInfo => {
      controlInfo.control.dispose();
    });
    this.controls.clear();
  }
}