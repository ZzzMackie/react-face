import { Engine } from '../core/Engine';
import { createSignal } from '../core/Signal';
import * as THREE from 'three';

export class ObjectLoaderExample {
  private engine: Engine;
  private sceneLoaded = createSignal<boolean>(false);
  private objectSelected = createSignal<string>('');
  private loadProgress = createSignal<number>(0);

  constructor(container: HTMLElement) {
    this.engine = new Engine({
      container,
      width: 800,
      height: 600,
      antialias: true,
      shadowMap: true,
      enableManagers: [
        'scene', 'renderer', 'camera', 'controls', 'lights', 
        'materials', 'geometries', 'objects', 'loader', 'helpers'
      ]
    });

    this.init();
  }

  private async init(): Promise<void> {
    console.log('🚀 初始化 ObjectLoader 示例...');

    // 等待引擎初始化
    this.engine.engineInitialized.subscribe((engine) => {
      if (engine) {
        this.setupScene();
      }
    });

    // 监听对象选择事件
    const objects = await this.engine.getObjects();
    if (objects) {
      objects.objectSelected.subscribe((objectId) => {
        this.objectSelected.value = objectId;
        console.log('选中对象:', objectId);
      });
    }

    // 监听加载进度
    const loader = await this.engine.getLoader();
    if (loader) {
      loader.loadProgress.subscribe((data) => {
        if (data) {
          this.loadProgress.value = data.progress;
          console.log(`加载进度: ${(data.progress * 100).toFixed(1)}%`);
        }
      });

      // 监听加载完成
      loader.loadCompleted.subscribe((data) => {
        if (data) {
          console.log('模型加载完成:', data.url);
          this.parseLoadedModel(data.url, data.result);
        }
      });

      // 监听加载错误
      loader.loadError.subscribe((data) => {
        if (data) {
          console.error('加载失败:', data.url, data.error);
        }
      });
    }
  }

  private async setupScene(): Promise<void> {
    console.log('🎨 设置场景...');

    // 设置相机
    const camera = await this.engine.getCamera();
    if (camera) {
      camera.setPosition(0, 5, 10);
      // camera.lookAt(0, 0, 0); // 暂时注释掉，需要实现lookAt方法
    }

    // 设置控制器
    const controls = await this.engine.getControls();
    if (controls) {
      controls.createOrbitControls('orbit', {
        enableDamping: true,
        dampingFactor: 0.05,
        enableZoom: true,
        enablePan: true,
        enableRotate: true
      });
    }

    // 创建灯光
    const lights = await this.engine.getLights();
    if (lights) {
      lights.createAmbientLight('ambient', 0x404040, 0.4);
      lights.createDirectionalLight('directional', 0xffffff, 1, {
        x: 5, y: 5, z: 5
      }, { x: 0, y: 0, z: 0 }, true);
    }

    // 创建辅助工具
    const helpers = await this.engine.getHelpers();
    if (helpers) {
      helpers.createGridHelper('grid', 20, 20);
      helpers.createAxesHelper('axes', 5);
    }

    // 创建基础几何体
    await this.createBasicObjects();

    // 加载外部模型
    await this.loadExternalModels();

    this.sceneLoaded.value = true;
  }

  private async createBasicObjects(): Promise<void> {
    console.log('📦 创建基础对象...');

    const geometry = await this.engine.getGeometry();
    const materials = await this.engine.getMaterials();
    const objects = await this.engine.getObjects();

    if (!geometry || !materials || !objects) {
      console.error('必要的管理器未初始化');
      return;
    }

    // 创建几何体
    const boxGeometry = geometry.createBoxGeometry('box', 2, 2, 2);
    const sphereGeometry = geometry.createSphereGeometry('sphere', 1, 32, 32);
    const cylinderGeometry = geometry.createCylinderGeometry('cylinder', 0.5, 1, 2, 16);

    // 创建材质
    const boxMaterial = materials.createStandardMaterial('boxMaterial', {
      color: 0xff0000,
      roughness: 0.5,
      metalness: 0.1
    });

    const sphereMaterial = materials.createStandardMaterial('sphereMaterial', {
      color: 0x00ff00,
      roughness: 0.3,
      metalness: 0.2
    });

    const cylinderMaterial = materials.createStandardMaterial('cylinderMaterial', {
      color: 0x0000ff,
      roughness: 0.7,
      metalness: 0.0
    });

    // 创建网格对象
    const box = objects.createMesh('box', boxGeometry, boxMaterial, {
      position: { x: -3, y: 1, z: 0 },
      castShadow: true,
      receiveShadow: true
    });

    const sphere = objects.createMesh('sphere', sphereGeometry, sphereMaterial, {
      position: { x: 0, y: 1, z: 0 },
      castShadow: true,
      receiveShadow: true
    });

    const cylinder = objects.createMesh('cylinder', cylinderGeometry, cylinderMaterial, {
      position: { x: 3, y: 1, z: 0 },
      castShadow: true,
      receiveShadow: true
    });

    // 创建组
    const group = objects.createGroup('basicGroup', {
      position: { x: 0, y: 0, z: 0 }
    });

    // 将对象添加到组中
    group.add(box);
    group.add(sphere);
    group.add(cylinder);

    console.log('基础对象创建完成');
  }

  private async loadExternalModels(): Promise<void> {
    console.log('📥 加载外部模型...');

    const loader = await this.engine.getLoader();

    if (!loader) {
      console.error('Loader管理器未初始化');
      return;
    }

    try {
      // 设置Draco解码器路径
      loader.setDracoDecoderPath('/draco/');

      // 加载GLTF模型
      const gltfResult = await loader.loadGLTF('/models/example.glb', {
        onProgress: (event) => {
          console.log('GLTF加载进度:', event.loaded / event.total);
        },
        onError: (error) => {
          console.error('GLTF加载失败:', error);
        }
      });

      // 解析加载的模型
      await loader.parseLoadedModel('/models/example.glb', gltfResult);

      console.log('GLTF模型加载完成');

    } catch (error) {
      console.warn('GLTF模型加载失败，使用默认模型:', error);
      await this.createFallbackModel();
    }
  }

  private async createFallbackModel(): Promise<void> {
    console.log('🔄 创建备用模型...');

    const geometry = await this.engine.getGeometry();
    const materials = await this.engine.getMaterials();
    const objects = await this.engine.getObjects();

    if (!geometry || !materials || !objects) {
      console.error('必要的管理器未初始化');
      return;
    }

    // 创建一个复杂的几何体作为备用模型
    const complexGeometry = geometry.createBoxGeometry('fallback', 1, 1, 1);
    const complexMaterial = materials.createStandardMaterial('fallbackMaterial', {
      color: 0xffff00,
      roughness: 0.2,
      metalness: 0.8
    });

    const fallbackObject = objects.createMesh('fallbackModel', complexGeometry, complexMaterial, {
      position: { x: 0, y: 2, z: 0 },
      scale: { x: 2, y: 2, z: 2 },
      castShadow: true,
      receiveShadow: true
    });

    console.log('备用模型创建完成');
  }

  private async parseLoadedModel(url: string, result: any): Promise<void> {
    console.log('🔧 解析加载的模型...');

    const objects = await this.engine.getObjects();
    const scene = await this.engine.getScene();

    if (!objects || !scene) {
      console.error('必要的管理器未初始化');
      return;
    }

    // 将加载的场景添加到引擎场景中
    scene.add(result.scene);

    // 遍历场景中的所有对象
    result.scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) {
        // 为每个网格创建对象记录
        const objectId = `${url}_${object.name || object.uuid}`;
        objects.createObject(objectId, object);
        
        console.log('解析网格对象:', objectId);
      }
    });

    console.log('模型解析完成');
  }

  // 公共方法
  public async selectObject(objectId: string): Promise<boolean> {
    const objects = await this.engine.getObjects();
    if (!objects) return false;
    return objects.selectObject(objectId);
  }

  public async getObjectStats(): Promise<any> {
    const objects = await this.engine.getObjects();
    if (!objects) return null;
    return objects.getStats();
  }

  public async getLoaderStats(): Promise<any> {
    const loader = await this.engine.getLoader();
    if (!loader) return null;
    return loader.getStats();
  }

  public async removeObject(objectId: string): Promise<boolean> {
    const objects = await this.engine.getObjects();
    if (!objects) return false;
    return objects.removeObject(objectId);
  }

  public async updateObject(objectId: string, config: any): Promise<boolean> {
    const objects = await this.engine.getObjects();
    if (!objects) return false;
    return objects.updateObject(objectId, config);
  }

  public render(): void {
    this.engine.render();
  }

  public dispose(): void {
    this.engine.dispose();
    this.sceneLoaded.dispose();
    this.objectSelected.dispose();
    this.loadProgress.dispose();
  }
} 