import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface HelperConfig {
  enableAxesHelper?: boolean;
  enableGridHelper?: boolean;
  enableBoxHelper?: boolean;
  enableWireframeHelper?: boolean;
}

export interface HelperInfo {
  id: string;
  helper: THREE.Object3D;
  type: string;
  enabled: boolean;
}

/**
 * 辅助工具管理�?
 * 负责管理 Three.js 辅助工具
 */
export class HelperManager implements Manager {
  // Add test expected properties
  public readonly name = 'HelperManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private helpers: Map<string, HelperInfo> = new Map();
  private config: HelperConfig;

  // 信号系统
  public readonly helperAdded = createSignal<HelperInfo | null>(null);
  public readonly helperRemoved = createSignal<string | null>(null);
  public readonly helperEnabled = createSignal<string | null>(null);
  public readonly helperDisabled = createSignal<string | null>(null);

  constructor(engine: unknown, config: HelperConfig = {}) {
    this.engine = engine;
    this.config = {
      enableAxesHelper: true,
      enableGridHelper: true,
      enableBoxHelper: false,
      enableWireframeHelper: false,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化辅助工具系�?
  this.initialized = true;}

  dispose(): void {
    this.removeAllHelpers();
  this.initialized = false;}

  createAxesHelper(
    id: string,
    size: number = 1
  ): THREE.AxesHelper {
    const helper = new THREE.AxesHelper(size);

    const helperInfo: HelperInfo = {
      id,
      helper,
      type: 'axes',
      enabled: true
    };

    this.helpers.set(id, helperInfo);
    this.helperAdded.emit(helperInfo);

    return helper;
  }

  createGridHelper(
    id: string,
    size: number = 10,
    divisions: number = 10,
    colorCenterLine: THREE.ColorRepresentation = 0x444444,
    colorGrid: THREE.ColorRepresentation = 0x888888
  ): THREE.GridHelper {
    const helper = new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);

    const helperInfo: HelperInfo = {
      id,
      helper,
      type: 'grid',
      enabled: true
    };

    this.helpers.set(id, helperInfo);
    this.helperAdded.emit(helperInfo);

    return helper;
  }

  createBoxHelper(
    id: string,
    object: THREE.Object3D,
    color: THREE.ColorRepresentation = 0xffff00
  ): THREE.BoxHelper {
    const helper = new THREE.BoxHelper(object, color);

    const helperInfo: HelperInfo = {
      id,
      helper,
      type: 'box',
      enabled: true
    };

    this.helpers.set(id, helperInfo);
    this.helperAdded.emit(helperInfo);

    return helper;
  }

  createWireframeHelper(
    id: string,
    object: THREE.Object3D,
    color: THREE.ColorRepresentation = 0xffffff
  ): THREE.LineSegments {
    // WireframeHelper is not available in Three.js, use LineSegments instead
    const geometry = new THREE.WireframeGeometry(object instanceof THREE.Mesh ? object.geometry : new THREE.BoxGeometry());
    const material = new THREE.LineBasicMaterial({ color });
    const helper = new THREE.LineSegments(geometry, material);

    const helperInfo: HelperInfo = {
      id,
      helper,
      type: 'wireframe',
      enabled: true
    };

    this.helpers.set(id, helperInfo);
    this.helperAdded.emit(helperInfo);

    return helper;
  }

  createBoundingBoxHelper(
    id: string,
    object: THREE.Object3D,
    color: THREE.ColorRepresentation = 0x00ff00
  ): THREE.BoxHelper {
    const helper = new THREE.BoxHelper(object, color);

    const helperInfo: HelperInfo = {
      id,
      helper,
      type: 'boundingBox',
      enabled: true
    };

    this.helpers.set(id, helperInfo);
    this.helperAdded.emit(helperInfo);

    return helper;
  }

  createFrustumHelper(
    id: string,
    camera: THREE.Camera,
    color: THREE.ColorRepresentation = 0x00ffff
  ): THREE.LineSegments {
    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4();
    matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(matrix);

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ color });
    const helper = new THREE.LineSegments(geometry, material);

    const helperInfo: HelperInfo = {
      id,
      helper,
      type: 'frustum',
      enabled: true
    };

    this.helpers.set(id, helperInfo);
    this.helperAdded.emit(helperInfo);

    return helper;
  }

  getHelper(id: string): HelperInfo | undefined {
    return this.helpers.get(id);
  }

  hasHelper(id: string): boolean {
    return this.helpers.has(id);
  }

  removeHelper(id: string): void {
    const helperInfo = this.helpers.get(id);
    if (helperInfo) {
      helperInfo.helper.dispose();
      this.helpers.delete(id);
      this.helperRemoved.emit(id);
    }
  }

  enableHelper(id: string): void {
    const helperInfo = this.helpers.get(id);
    if (helperInfo) {
      helperInfo.enabled = true;
      helperInfo.helper.visible = true;
      this.helperEnabled.emit(id);
    }
  }

  disableHelper(id: string): void {
    const helperInfo = this.helpers.get(id);
    if (helperInfo) {
      helperInfo.enabled = false;
      helperInfo.helper.visible = false;
      this.helperDisabled.emit(id);
    }
  }

  updateHelper(id: string): void {
    const helperInfo = this.helpers.get(id);
    if (helperInfo && helperInfo.type === 'box') {
      (helperInfo.helper as THREE.BoxHelper).update();
    }
  }

  setHelperColor(id: string, color: THREE.ColorRepresentation): void {
    const helperInfo = this.helpers.get(id);
    if (helperInfo) {
      if (helperInfo.helper instanceof THREE.LineSegments) {
        (helperInfo.helper.material as THREE.LineBasicMaterial).color.setHex(color as number);
      } else if (helperInfo.helper instanceof THREE.BoxHelper) {
        helperInfo.helper.material.color.setHex(color as number);
      }
    }
  }

  getAllHelpers(): HelperInfo[] {
    return Array.from(this.helpers.values());
  }

  getHelpersByType(type: string): HelperInfo[] {
    return Array.from(this.helpers.values()).filter(helper => helper.type === type);
  }

  getEnabledHelpers(): HelperInfo[] {
    return Array.from(this.helpers.values()).filter(helper => helper.enabled);
  }

  removeAllHelpers(): void {
    this.helpers.forEach(helperInfo => {
      helperInfo.helper.dispose();
    });
    this.helpers.clear();
  }
}