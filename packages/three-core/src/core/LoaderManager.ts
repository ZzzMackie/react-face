import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface LoaderConfig {
  dracoDecoderPath?: string;
  ktx2TranscoderPath?: string;
  meshoptDecoderPath?: string;
  enableDraco?: boolean;
  enableKtx2?: boolean;
  enableMeshopt?: boolean;
}

export interface LoadResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  cameras: THREE.Camera[];
  asset: any;
  parser: any;
  userData: any;
}

export interface LoadOptions {
  onProgress?: (event: ProgressEvent) => void;
  onError?: (error: Error) => void;
  dracoDecoderPath?: string;
  ktx2TranscoderPath?: string;
  meshoptDecoderPath?: string;
}

export class LoaderManager implements Manager {
  // Add test expected properties
  public readonly name = 'LoaderManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: any;
  private gltfLoader: GLTFLoader;
  private fbxLoader: FBXLoader;
  private objLoader: OBJLoader;
  private dracoLoader: DRACOLoader;
  private loadedAssets: Map<string, LoadResult> = new Map();
  private loadingAssets: Map<string, Promise<LoadResult>> = new Map();

  // 信号
  public readonly loadStarted = createSignal<{ url: string; type: string } | null>(null);
  public readonly loadProgress = createSignal<{ url: string; progress: number } | null>(null);
  public readonly loadCompleted = createSignal<{ url: string; result: LoadResult } | null>(null);
  public readonly loadError = createSignal<{ url: string; error: Error } | null>(null);

  constructor(engine: any) {
    this.engine = engine;
  }

  async initialize(): Promise<void> {
    console.log('📦 LoaderManager initialized');
    
    // 初始化加载器
    this.gltfLoader = new GLTFLoader();
    this.fbxLoader = new FBXLoader();
    this.objLoader = new OBJLoader();
    this.dracoLoader = new DRACOLoader();
    
    // 设置Draco解码器路径
    this.dracoLoader.setDecoderPath('/draco/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  this.initialized = true;}

  dispose(): void {
    this.loadedAssets.clear();
    this.loadingAssets.clear();
    // Signal不需要手动dispose，会自动清理
  this.initialized = false;}

  // 加载GLTF/GLB文件
  async loadGLTF(url: string, options?: LoadOptions): Promise<LoadResult> {
    return this.loadAsset(url, 'gltf', options);
  }

  // 加载FBX文件
  async loadFBX(url: string, options?: LoadOptions): Promise<LoadResult> {
    return this.loadAsset(url, 'fbx', options);
  }

  // 加载OBJ文件
  async loadOBJ(url: string, options?: LoadOptions): Promise<LoadResult> {
    return this.loadAsset(url, 'obj', options);
  }

  // 通用加载方法
  async loadAsset(url: string, type: string, options?: LoadOptions): Promise<LoadResult> {
    // 检查是否已经加载
    if (this.loadedAssets.has(url)) {
      return this.loadedAssets.get(url)!;
    }

    // 检查是否正在加载
    if (this.loadingAssets.has(url)) {
      return this.loadingAssets.get(url)!;
    }

    this.loadStarted.emit({ url, type });

    const loadPromise = this.performLoad(url, type, options);
    this.loadingAssets.set(url, loadPromise);

    try {
      const result = await loadPromise;
      this.loadedAssets.set(url, result);
      this.loadingAssets.delete(url);
      this.loadCompleted.emit({ url, result });
      return result;
    } catch (error) {
      this.loadingAssets.delete(url);
      this.loadError.emit({ url, error: error as Error });
      throw error;
    }
  }

  private async performLoad(url: string, type: string, options?: LoadOptions): Promise<LoadResult> {
    return new Promise((resolve, reject) => {
      const onProgress = (event: ProgressEvent) => {
        const progress = event.loaded / event.total;
        this.loadProgress.emit({ url, progress });
        options?.onProgress?.(event);
      };

      const onError = (error: Error) => {
        options?.onError?.(error);
        reject(error);
      };

      switch (type) {
        case 'gltf':
        case 'glb':
          this.gltfLoader.load(
            url,
            (gltf) => {
              const result: LoadResult = {
                scene: gltf.scene,
                animations: gltf.animations,
                cameras: gltf.cameras,
                asset: gltf.asset,
                parser: gltf.parser,
                userData: gltf.userData
              };
              resolve(result);
            },
            onProgress,
            onError
          );
          break;

        case 'fbx':
          this.fbxLoader.load(
            url,
            (object) => {
              const result: LoadResult = {
                scene: object,
                animations: object.animations || [],
                cameras: [],
                asset: {},
                parser: {},
                userData: object.userData
              };
              resolve(result);
            },
            onProgress,
            onError
          );
          break;

        case 'obj':
          this.objLoader.load(
            url,
            (object) => {
              const result: LoadResult = {
                scene: object,
                animations: [],
                cameras: [],
                asset: {},
                parser: {},
                userData: object.userData
              };
              resolve(result);
            },
            onProgress,
            onError
          );
          break;

        default:
          reject(new Error(`Unsupported file type: ${type}`));
      }
    });
  }

  // 解析加载的模型到各个管理器
  async parseLoadedModel(url: string, result: LoadResult): Promise<void> {
    const scene = result.scene;
    
    // 获取各个管理器
    const objectManager = this.engine.getManager('objects');
    const materialManager = this.engine.getManager('materials');
    const geometryManager = this.engine.getManager('geometries');
    const animationManager = this.engine.getManager('animations');
    const sceneManager = this.engine.getManager('scene');

    if (!objectManager || !sceneManager) {
      console.warn('Required managers not available for model parsing');
      return;
    }

    // 递归遍历场景中的所有对象
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // 处理网格
        const meshId = `${url}_${object.name || object.uuid}`;
        
        // 添加到对象管理器
        objectManager.createObject(meshId, object);
        
        // 处理几何体
        if (geometryManager && object.geometry) {
          const geometryId = `${meshId}_geometry`;
          geometryManager.createGeometry(geometryId, object.geometry);
        }
        
        // 处理材质
        if (materialManager && object.material) {
          const materialId = `${meshId}_material`;
          if (Array.isArray(object.material)) {
            object.material.forEach((mat, index) => {
              materialManager.createMaterial(`${materialId}_${index}`, mat);
            });
          } else {
            materialManager.createMaterial(materialId, object.material);
          }
        }
      } else if (object instanceof THREE.Light) {
        // 处理光源
        const lightManager = this.engine.getManager('lights');
        if (lightManager) {
          const lightId = `${url}_${object.name || object.uuid}`;
          lightManager.createLight(lightId, object);
        }
      } else if (object instanceof THREE.Camera) {
        // 处理相机
        const cameraManager = this.engine.getManager('camera');
        if (cameraManager) {
          const cameraId = `${url}_${object.name || object.uuid}`;
          cameraManager.createCamera(cameraId, object);
        }
      }
    });

    // 处理动画
    if (animationManager && result.animations.length > 0) {
      result.animations.forEach((animation, index) => {
        const animationId = `${url}_animation_${index}`;
        animationManager.createAnimation(animationId, animation);
      });
    }

    // 将整个场景添加到场景管理器
    const sceneId = `${url}_scene`;
    objectManager.createObject(sceneId, scene);
    sceneManager.add(scene);
  }

  // 获取加载的资产
  getLoadedAsset(url: string): LoadResult | undefined {
    return this.loadedAssets.get(url);
  }

  // 获取所有加载的资产
  getAllLoadedAssets(): Map<string, LoadResult> {
    return new Map(this.loadedAssets);
  }

  // 检查是否正在加载
  isLoading(url: string): boolean {
    return this.loadingAssets.has(url);
  }

  // 检查是否已加载
  isLoaded(url: string): boolean {
    return this.loadedAssets.has(url);
  }

  // 清理加载的资产
  clearLoadedAssets(): void {
    this.loadedAssets.clear();
  }

  // 移除特定资产
  removeLoadedAsset(url: string): boolean {
    return this.loadedAssets.delete(url);
  }

  // 设置Draco解码器路径
  setDracoDecoderPath(path: string): void {
    this.dracoLoader.setDecoderPath(path);
  }

  // 获取加载统计
  getStats(): { loaded: number; loading: number; total: number } {
    return {
      loaded: this.loadedAssets.size,
      loading: this.loadingAssets.size,
      total: this.loadedAssets.size + this.loadingAssets.size
    };
  }
}