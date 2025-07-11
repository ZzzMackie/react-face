import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface Object3DConfig {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  visible?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  userData?: any;
}

export interface MeshConfig extends Object3DConfig {
  geometry?: THREE.BufferGeometry;
  material?: THREE.Material;
}

export class ObjectManager implements Manager {
  private engine: any;
  private objects: Map<string, THREE.Object3D> = new Map();
  private meshes: Map<string, THREE.Mesh> = new Map();
  private groups: Map<string, THREE.Group> = new Map();
  private selectedObject: THREE.Object3D | null = null;

  // 信号
  public readonly objectCreated = createSignal<{ id: string; object: THREE.Object3D } | null>(null);
  public readonly objectRemoved = createSignal<{ id: string; object: THREE.Object3D } | null>(null);
  public readonly objectSelected = createSignal<string>('');
  public readonly objectUpdated = createSignal<{ id: string; object: THREE.Object3D } | null>(null);

  constructor(engine: any) {
    this.engine = engine;
  }

  async initialize(): Promise<void> {
    console.log('🎯 ObjectManager initialized');
  }

  dispose(): void {
    this.objects.clear();
    this.meshes.clear();
    this.groups.clear();
    this.selectedObject = null;
    // Signal不需要手动dispose，会自动清理
  }

  // 创建对象
  createObject(id: string, object: THREE.Object3D, config?: Object3DConfig): THREE.Object3D {
    if (this.objects.has(id)) {
      console.warn(`Object with id '${id}' already exists`);
      return this.objects.get(id)!;
    }

    // 应用配置
    if (config) {
      this.applyConfig(object, config);
    }

    this.objects.set(id, object);
    this.objectCreated.emit({ id, object });
    return object;
  }

  createMesh(id: string, geometry: THREE.BufferGeometry, material: THREE.Material, config?: MeshConfig): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    this.meshes.set(id, mesh);
    return this.createObject(id, mesh, config) as THREE.Mesh;
  }

  createGroup(id: string, config?: Object3DConfig): THREE.Group {
    const group = new THREE.Group();
    this.groups.set(id, group);
    return this.createObject(id, group, config) as THREE.Group;
  }

  // 获取对象
  getObject(id: string): THREE.Object3D | undefined {
    return this.objects.get(id);
  }

  getMesh(id: string): THREE.Mesh | undefined {
    return this.meshes.get(id);
  }

  getGroup(id: string): THREE.Group | undefined {
    return this.groups.get(id);
  }

  getAllObjects(): THREE.Object3D[] {
    return Array.from(this.objects.values());
  }

  getAllMeshes(): THREE.Mesh[] {
    return Array.from(this.meshes.values());
  }

  getAllGroups(): THREE.Group[] {
    return Array.from(this.groups.values());
  }

  // 删除对象
  removeObject(id: string): boolean {
    const object = this.objects.get(id);
    if (object) {
      this.objects.delete(id);
      this.meshes.delete(id);
      this.groups.delete(id);
      
      // 从场景中移除
      const sceneManager = this.engine.getManager('scene');
      if (sceneManager) {
        sceneManager.remove(object);
      }
      
      this.objectRemoved.emit({ id, object });
      return true;
    }
    return false;
  }

  // 更新对象
  updateObject(id: string, config: Object3DConfig): boolean {
    const object = this.objects.get(id);
    if (object) {
      this.applyConfig(object, config);
      this.objectUpdated.emit({ id, object });
      return true;
    }
    return false;
  }

  // 选择对象
  selectObject(id: string): boolean {
    const object = this.objects.get(id);
    if (object) {
      this.selectedObject = object;
      this.objectSelected.emit(id);
      return true;
    }
    return false;
  }

  getSelectedObject(): THREE.Object3D | null {
    return this.selectedObject;
  }

  // 遍历对象
  traverse(callback: (object: THREE.Object3D) => void): void {
    this.objects.forEach(callback);
  }

  // 查找对象
  findObject(predicate: (object: THREE.Object3D) => boolean): THREE.Object3D | undefined {
    return this.getAllObjects().find(predicate);
  }

  findObjects(predicate: (object: THREE.Object3D) => boolean): THREE.Object3D[] {
    return this.getAllObjects().filter(predicate);
  }

  // 批量操作
  createObjects(objects: Array<{ id: string; object: THREE.Object3D; config?: Object3DConfig }>): THREE.Object3D[] {
    return objects.map(({ id, object, config }) => this.createObject(id, object, config));
  }

  removeObjects(ids: string[]): number {
    return ids.filter(id => this.removeObject(id)).length;
  }

  // 应用配置
  private applyConfig(object: THREE.Object3D, config: Object3DConfig): void {
    if (config.position) {
      object.position.set(config.position.x, config.position.y, config.position.z);
    }
    if (config.rotation) {
      object.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);
    }
    if (config.scale) {
      object.scale.set(config.scale.x, config.scale.y, config.scale.z);
    }
    if (config.visible !== undefined) {
      object.visible = config.visible;
    }
    if (config.castShadow !== undefined) {
      object.castShadow = config.castShadow;
    }
    if (config.receiveShadow !== undefined) {
      object.receiveShadow = config.receiveShadow;
    }
    if (config.userData) {
      object.userData = { ...object.userData, ...config.userData };
    }
  }

  // 统计信息
  getStats(): { total: number; meshes: number; groups: number; selected: boolean } {
    return {
      total: this.objects.size,
      meshes: this.meshes.size,
      groups: this.groups.size,
      selected: this.selectedObject !== null
    };
  }

  // 清理
  clear(): void {
    this.objects.clear();
    this.meshes.clear();
    this.groups.clear();
    this.selectedObject = null;
  }
} 