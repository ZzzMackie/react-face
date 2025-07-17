import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface Object3DConfig {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  visible?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  userData?: any;
  scene?: THREE.Scene; // 允许用户指定场景
  autoAddToScene?: boolean; // 是否自动添加到场景，覆盖全局设置
}

export interface MeshConfig extends Object3DConfig {
  geometry?: THREE.BufferGeometry | string; // 可以是几何体实例或预定义类型名称
  material?: THREE.Material | string; // 可以是材质实例或预定义类型名称
  wireframe?: boolean;
  color?: number | string;
  opacity?: number;
  transparent?: boolean;
  side?: THREE.Side; // 材质面渲染模式
  metalness?: number; // 金属度
  roughness?: number; // 粗糙度
  emissive?: number | string; // 自发光颜色
  emissiveIntensity?: number; // 自发光强度
  flatShading?: boolean; // 平面着色
  map?: THREE.Texture | string; // 纹理贴图
}

export interface ObjectManagerConfig {
  autoAddToScene?: boolean; // 是否自动添加到场景
  defaultScene?: THREE.Scene; // 默认场景
  defaultMaterial?: THREE.Material; // 默认材质
  defaultGeometry?: THREE.BufferGeometry; // 默认几何体
  enableShadows?: boolean; // 是否启用阴影
}

export class ObjectManager implements Manager {
  // Add test expected properties
  public readonly name = 'ObjectManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: any;
  private config: ObjectManagerConfig;
  private objects: Map<string, THREE.Object3D> = new Map();
  private meshes: Map<string, THREE.Mesh> = new Map();
  private groups: Map<string, THREE.Group> = new Map();
  private selectedObject: THREE.Object3D | null = null;
  private defaultMaterials: Map<string, THREE.Material> = new Map();
  private defaultGeometries: Map<string, THREE.BufferGeometry> = new Map();

  // 信号
  public readonly objectCreated = createSignal<{ id: string; object: THREE.Object3D } | null>(null);
  public readonly objectRemoved = createSignal<{ id: string; object: THREE.Object3D } | null>(null);
  public readonly objectSelected = createSignal<string>('');
  public readonly objectUpdated = createSignal<{ id: string; object: THREE.Object3D } | null>(null);

  constructor(engine: any, config: ObjectManagerConfig = {}) {
    this.engine = engine;
    this.config = {
      autoAddToScene: true,
      enableShadows: true,
      ...config
    };
    
    // 初始化默认材质
    this.initDefaultMaterials();
    // 初始化默认几何体
    this.initDefaultGeometries();
  }

  private initDefaultMaterials(): void {
    // 基础材质
    this.defaultMaterials.set('basic', new THREE.MeshBasicMaterial({ color: 0xffffff }));
    // 标准材质
    this.defaultMaterials.set('standard', new THREE.MeshStandardMaterial({ color: 0xffffff }));
    // 物理材质
    this.defaultMaterials.set('physical', new THREE.MeshPhysicalMaterial({ color: 0xffffff }));
    // Lambert材质
    this.defaultMaterials.set('lambert', new THREE.MeshLambertMaterial({ color: 0xffffff }));
    // Phong材质
    this.defaultMaterials.set('phong', new THREE.MeshPhongMaterial({ color: 0xffffff }));
    // 线框材质
    this.defaultMaterials.set('wireframe', new THREE.MeshBasicMaterial({ wireframe: true, color: 0xffffff }));
    // 法线材质
    this.defaultMaterials.set('normal', new THREE.MeshNormalMaterial());
    // 深度材质
    this.defaultMaterials.set('depth', new THREE.MeshDepthMaterial());
  }

  private initDefaultGeometries(): void {
    // 盒子
    this.defaultGeometries.set('box', new THREE.BoxGeometry(1, 1, 1));
    // 球体
    this.defaultGeometries.set('sphere', new THREE.SphereGeometry(0.5, 32, 32));
    // 平面
    this.defaultGeometries.set('plane', new THREE.PlaneGeometry(1, 1));
    // 圆柱体
    this.defaultGeometries.set('cylinder', new THREE.CylinderGeometry(0.5, 0.5, 1, 32));
    // 圆锥体
    this.defaultGeometries.set('cone', new THREE.ConeGeometry(0.5, 1, 32));
    // 圆环
    this.defaultGeometries.set('torus', new THREE.TorusGeometry(0.5, 0.2, 16, 100));
    // 八面体
    this.defaultGeometries.set('octahedron', new THREE.OctahedronGeometry(0.5));
    // 十二面体
    this.defaultGeometries.set('dodecahedron', new THREE.DodecahedronGeometry(0.5));
    // 二十面体
    this.defaultGeometries.set('icosahedron', new THREE.IcosahedronGeometry(0.5));
  }

  async initialize(): Promise<void> {
    console.log('🎯 ObjectManager initialized');
    this.initialized = true;
  }

  dispose(): void {
    this.objects.clear();
    this.meshes.clear();
    this.groups.clear();
    this.selectedObject = null;
    
    // 清理默认材质和几何体
    this.defaultMaterials.forEach(material => material.dispose());
    this.defaultMaterials.clear();
    
    this.defaultGeometries.forEach(geometry => geometry.dispose());
    this.defaultGeometries.clear();
    
    // Signal不需要手动dispose，会自动清理
    this.initialized = false;
  }

  // 通用方法：添加对象到场景
  private addToScene(object: THREE.Object3D, config?: Object3DConfig): void {
    // 检查是否应该添加到场景
    const shouldAddToScene = config?.autoAddToScene !== undefined ? 
      config.autoAddToScene : this.config.autoAddToScene;
    
    if (!shouldAddToScene) return;

    let targetScene: THREE.Scene | null = null;

    // 优先级：用户指定场景 > 默认场景 > 引擎场景
    if (config?.scene) {
      targetScene = config.scene;
    } else if (this.config.defaultScene) {
      targetScene = this.config.defaultScene;
    } else {
      const sceneManager = this.engine.getManager('scene');
      if (sceneManager) {
        targetScene = sceneManager.getScene();
      }
    }

    if (targetScene) {
      targetScene.add(object);
    }
  }

  // 通用方法：从场景移除对象
  private removeFromScene(object: THREE.Object3D): void {
    if (object.parent) {
      object.parent.remove(object);
    }
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

    // 添加到场景
    this.addToScene(object, config);

    this.objects.set(id, object);
    this.objectCreated.emit({ id, object });
    return object;
  }

  // 处理几何体参数
  private resolveGeometry(geometry?: THREE.BufferGeometry | string): THREE.BufferGeometry {
    if (!geometry) {
      return this.config.defaultGeometry || this.defaultGeometries.get('box') || new THREE.BoxGeometry(1, 1, 1);
    }
    
    if (typeof geometry === 'string') {
      // 如果是字符串，尝试获取预定义几何体
      const predefinedGeometry = this.defaultGeometries.get(geometry);
      if (predefinedGeometry) {
        return predefinedGeometry.clone();
      } else {
        console.warn(`Geometry type '${geometry}' not found, using default box geometry`);
        return new THREE.BoxGeometry(1, 1, 1);
      }
    }
    
    // 如果是几何体实例，直接返回
    return geometry;
  }

  // 处理材质参数
  private resolveMaterial(config?: MeshConfig): THREE.Material {
    // 如果提供了材质实例，直接使用
    if (config?.material instanceof THREE.Material) {
      return config.material;
    }
    
    // 如果提供了材质类型字符串，尝试获取预定义材质
    if (typeof config?.material === 'string') {
      const predefinedMaterial = this.defaultMaterials.get(config.material);
      if (predefinedMaterial) {
        return predefinedMaterial.clone();
      }
    }
    
    // 如果指定了线框，使用基础材质
    if (config?.wireframe) {
      return new THREE.MeshBasicMaterial({ 
        wireframe: true, 
        color: config?.color || 0xffffff 
      });
    }
    
    // 否则创建标准材质
    const material = new THREE.MeshStandardMaterial({
      color: config?.color || 0xffffff,
      transparent: config?.transparent || false,
      opacity: config?.opacity !== undefined ? config.opacity : 1.0,
      side: config?.side || THREE.FrontSide,
      metalness: config?.metalness !== undefined ? config.metalness : 0.1,
      roughness: config?.roughness !== undefined ? config.roughness : 0.5,
      emissive: config?.emissive || 0x000000,
      emissiveIntensity: config?.emissiveIntensity || 1.0,
      flatShading: config?.flatShading || false
    });
    
    // 如果提供了贴图
    if (config?.map) {
      if (typeof config.map === 'string') {
        // 如果是字符串，尝试从纹理管理器获取
        const textureManager = this.engine.getManager('textures');
        if (textureManager && typeof textureManager.getTexture === 'function') {
          const texture = textureManager.getTexture(config.map);
          if (texture) {
            material.map = texture;
          }
        }
      } else {
        // 如果是纹理实例，直接使用
        material.map = config.map;
      }
    }
    
    return material;
  }

  createMesh(id: string, geometry?: THREE.BufferGeometry | string, material?: THREE.Material, config?: MeshConfig): THREE.Mesh {
    // 解析几何体
    const actualGeometry = this.resolveGeometry(geometry || config?.geometry);
    
    // 解析材质
    const actualMaterial = material || this.resolveMaterial(config);
    
    const mesh = new THREE.Mesh(actualGeometry, actualMaterial);
    
    // 设置阴影
    if (this.config.enableShadows) {
      mesh.castShadow = config?.castShadow !== undefined ? config.castShadow : true;
      mesh.receiveShadow = config?.receiveShadow !== undefined ? config.receiveShadow : true;
    }
    
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
      this.removeFromScene(object);
      
      // 释放资源
      if (object instanceof THREE.Mesh) {
        if (object.geometry && !this.defaultGeometries.has(object.geometry.uuid)) {
          object.geometry.dispose();
        }
        
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => {
            if (!this.defaultMaterials.has(material.uuid)) {
              // 释放材质中的纹理
              Object.keys(material).forEach(key => {
                const value = (material as any)[key];
                if (value instanceof THREE.Texture) {
                  value.dispose();
                }
              });
              material.dispose();
            }
          });
        }
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

  // 创建几何体对象 - 简化方法
  createGeometryMesh(id: string, geometryType: string, config?: MeshConfig): THREE.Mesh {
    return this.createMesh(id, geometryType, undefined, config);
  }

  // 清理
  clear(): void {
    // 移除所有对象
    this.objects.forEach((object, id) => {
      this.removeObject(id);
    });
    
    this.objects.clear();
    this.meshes.clear();
    this.groups.clear();
    this.selectedObject = null;
  }
}