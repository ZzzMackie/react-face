import { Engine } from '../src/core/Engine';
import { LightManager } from '../src/core/LightManager';
import { MaterialManager } from '../src/core/MaterialManager';
import { ObjectManager } from '../src/core/ObjectManager';
import { TextureManager } from '../src/core/TextureManager';
import { GeometryManager } from '../src/core/GeometryManager';
import { ComposerManager } from '../src/core/ComposerManager';
import { DatabaseManager } from '../src/core/DatabaseManager';
import { AnimationManager } from '../src/core/AnimationManager';
import { PerformanceManager } from '../src/core/PerformanceManager';
import { EventManager } from '../src/core/EventManager';
import { PhysicsManager } from '../src/core/PhysicsManager';
import { AudioManager } from '../src/core/AudioManager';
import * as THREE from 'three';

/**
 * 完整功能示例
 * 展示所有管理器的使用方法和功能
 */
export class CompleteExample {
  private engine: Engine;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.engine = new Engine({
      container,
      width: container.clientWidth,
      height: container.clientHeight,
      antialias: true,
      shadowMap: true,
      autoRender: true,
      autoResize: true
    });
  }

  /**
   * 初始化示例
   */
  async initialize(): Promise<void> {
    console.log('🚀 初始化3D引擎...');
    
    // 初始化引擎
    await this.engine.initialize();
    
    // 设置事件监听
    this.setupEventListeners();
    
    // 创建场景内容
    await this.createScene();
    
    // 启动渲染循环
    this.engine.startRenderLoop();
    
    console.log('✅ 引擎初始化完成');
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听引擎初始化
    this.engine.engineInitialized.subscribe((engine) => {
      if (engine) {
        console.log('🎯 引擎已初始化');
      }
    });

    // 监听管理器初始化
    this.engine.managerInitialized.subscribe((data) => {
      if (data) {
        console.log(`📦 管理器已初始化: ${data.name}`);
      }
    });

    // 监听错误
    this.engine.errorOccurred.subscribe((error) => {
      if (error) {
        console.error(`❌ 错误: ${error.type} - ${error.message}`);
      }
    });

    // 监听渲染事件
    this.engine.renderStarted.subscribe(() => {
      // 可以在这里添加渲染开始时的逻辑
    });

    this.engine.renderCompleted.subscribe(() => {
      // 可以在这里添加渲染完成时的逻辑
    });
  }

  /**
   * 创建场景内容
   */
  private async createScene(): Promise<void> {
    console.log('🎨 创建场景内容...');

    // 1. 初始化灯光管理器
    const lights = await this.engine.getManager<LightManager>('lights');
    if (lights) {
      // 创建环境光
      lights.createAmbientLight('ambient', {
        color: 0x404040,
        intensity: 0.4
      });

      // 创建方向光
      lights.createDirectionalLight('directional', {
        color: 0xffffff,
        intensity: 1.0,
        position: { x: 10, y: 10, z: 5 },
        castShadow: true,
        shadowMapSize: 2048
      });

      // 创建点光源
      lights.createPointLight('point', {
        color: 0xff8800,
        intensity: 1.0,
        distance: 100,
        position: { x: -5, y: 5, z: 5 }
      });

      console.log('💡 灯光设置完成');
    }

    // 2. 初始化材质管理器
    const materials = await this.engine.getManager<MaterialManager>('materials');
    if (materials) {
      // 创建基础材质
      materials.createStandardMaterial('standard', {
        color: 0x808080,
        roughness: 0.5,
        metalness: 0.5
      });

      // 创建发光材质
      materials.createStandardMaterial('emissive', {
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.5
      });

      // 创建透明材质
      materials.createStandardMaterial('transparent', {
        color: 0x0088ff,
        transparent: true,
        opacity: 0.6
      });

      console.log('🎨 材质创建完成');
    }

    // 3. 初始化几何体管理器
    const geometry = await this.engine.getManager<GeometryManager>('geometry');
    if (geometry) {
      // 创建基础几何体
      geometry.createBoxGeometry('box', { width: 2, height: 2, depth: 2 });
      geometry.createSphereGeometry('sphere', { radius: 1, segments: 32 });
      geometry.createCylinderGeometry('cylinder', { radius: 1, height: 2 });
      geometry.createPlaneGeometry('plane', { width: 10, height: 10 });

      console.log('📐 几何体创建完成');
    }

    // 4. 初始化对象管理器
    const objects = await this.engine.getManager<ObjectManager>('objects');
    if (objects) {
      // 获取几何体和材质
      const boxGeometry = geometry?.getGeometry('box');
      const sphereGeometry = geometry?.getGeometry('sphere');
      const cylinderGeometry = geometry?.getGeometry('cylinder');
      const planeGeometry = geometry?.getGeometry('plane');

      const standardMaterial = materials?.getMaterial('standard');
      const emissiveMaterial = materials?.getMaterial('emissive');
      const transparentMaterial = materials?.getMaterial('transparent');

      // 创建立方体
      if (boxGeometry && standardMaterial) {
        objects.createMesh('cube', boxGeometry, standardMaterial, {
          position: { x: -3, y: 1, z: 0 },
          castShadow: true,
          receiveShadow: true
        });
      }

      // 创建球体
      if (sphereGeometry && emissiveMaterial) {
        objects.createMesh('sphere', sphereGeometry, emissiveMaterial, {
          position: { x: 0, y: 1, z: 0 },
          castShadow: true,
          receiveShadow: true
        });
      }

      // 创建圆柱体
      if (cylinderGeometry && transparentMaterial) {
        objects.createMesh('cylinder', cylinderGeometry, transparentMaterial, {
          position: { x: 3, y: 1, z: 0 },
          castShadow: true,
          receiveShadow: true
        });
      }

             // 创建地面
       if (planeGeometry && standardMaterial) {
         objects.createMesh('ground', planeGeometry, standardMaterial, {
           position: { x: 0, y: 0, z: 0 },
           rotation: { x: -Math.PI / 2, y: 0, z: 0 },
           receiveShadow: true
         });
       }

      console.log('🎯 对象创建完成');
    }

    // 5. 初始化纹理管理器
    const textures = await this.engine.getManager<TextureManager>('textures');
    if (textures) {
      // 加载纹理
      try {
        await textures.loadImageTexture('wood', '/textures/wood.jpg', {
          wrapS: THREE.RepeatWrapping,
          wrapT: THREE.RepeatWrapping,
          repeat: { x: 2, y: 2 }
        });
        console.log('🖼️ 纹理加载完成');
      } catch (error) {
        console.warn('⚠️ 纹理加载失败，使用默认纹理');
      }
    }

    // 6. 初始化后处理管理器
    const composer = await this.engine.getManager<ComposerManager>('composer');
    if (composer) {
      // 启用泛光效果
      composer.setBloomEnabled(true);
      composer.setBloomConfig(1.5, 0.4, 0.85);

      // 启用FXAA抗锯齿
      composer.setFXAAEnabled(true);

      console.log('✨ 后处理效果设置完成');
    }

    // 7. 初始化数据库管理器
    const database = await this.engine.getManager<DatabaseManager>('database');
    if (database) {
      // 监听保存事件
      database.sceneSaved.subscribe((data) => {
        if (data) {
          console.log(`💾 场景已保存: ${data.name} (ID: ${data.id})`);
        }
      });

      // 监听加载事件
      database.sceneLoaded.subscribe((data) => {
        if (data) {
          console.log(`📂 场景已加载: ${data.name} (ID: ${data.id})`);
        }
      });

      console.log('💾 数据库管理器初始化完成');
    }

    console.log('🎉 场景创建完成');
  }

  /**
   * 演示对象操作
   */
  async demonstrateObjectOperations(): Promise<void> {
    const objects = await this.engine.getManager<ObjectManager>('objects');
    if (!objects) return;

    console.log('🎮 演示对象操作...');

    // 选择对象
    objects.selectObject('cube');
    console.log('✅ 选择了立方体');

    // 移动对象
    objects.setPosition('sphere', 0, 3, 0);
    console.log('✅ 移动了球体');

    // 旋转对象
    objects.setRotation('cylinder', 0, Math.PI / 4, 0);
    console.log('✅ 旋转了圆柱体');

    // 缩放对象
    objects.setScale('cube', 1.5, 1.5, 1.5);
    console.log('✅ 缩放了立方体');

    // 克隆对象
    const clonedCube = objects.cloneObject('cube', 'cube_clone');
    if (clonedCube) {
      objects.setPosition('cube_clone', -6, 1, 0);
      console.log('✅ 克隆了立方体');
    }

    // 获取统计信息
    const stats = objects.getStats();
    console.log('📊 对象统计:', stats);
  }

  /**
   * 演示材质操作
   */
  async demonstrateMaterialOperations(): Promise<void> {
    const materials = await this.engine.getManager<MaterialManager>('materials');
    if (!materials) return;

    console.log('🎨 演示材质操作...');

    // 创建新材质
    materials.createStandardMaterial('new_material', {
      color: 0xff0000,
      roughness: 0.2,
      metalness: 0.8
    });

    // 更新材质属性
    materials.setMaterialColor('new_material', 0x00ff00);
    materials.setMaterialRoughness('new_material', 0.8);
    materials.setMaterialMetalness('new_material', 0.2);

    // 获取统计信息
    const stats = materials.getStats();
    console.log('📊 材质统计:', stats);
  }

  /**
   * 演示灯光操作
   */
  async demonstrateLightOperations(): Promise<void> {
    const lights = await this.engine.getManager<LightManager>('lights');
    if (!lights) return;

    console.log('💡 演示灯光操作...');

    // 创建聚光灯
    lights.createSpotLight('spotlight', {
      color: 0xffff00,
      intensity: 1.0,
      distance: 50,
      angle: Math.PI / 6,
      penumbra: 0.1,
      position: { x: 0, y: 10, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      castShadow: true
    });

    // 更新灯光属性
    lights.setLightIntensity('point', 2.0);
    lights.setLightColor('directional', 0xffffff);

    // 获取统计信息
    const stats = lights.getStats();
    console.log('📊 灯光统计:', stats);
  }

  /**
   * 演示场景保存和加载
   */
  async demonstrateScenePersistence(): Promise<void> {
    const database = await this.engine.getManager<DatabaseManager>('database');
    if (!database) return;

    console.log('💾 演示场景持久化...');

    try {
      // 保存场景
      const sceneId = await database.saveScene('演示场景', '这是一个完整的演示场景');
      console.log(`✅ 场景已保存，ID: ${sceneId}`);

      // 获取所有场景
      const scenes = await database.getAllScenes();
      console.log(`📂 所有场景: ${scenes.length} 个`);

      // 加载场景
      if (scenes.length > 0) {
        const success = await database.loadScene(scenes[0].id);
        if (success) {
          console.log('✅ 场景加载成功');
        } else {
          console.log('❌ 场景加载失败');
        }
      }
    } catch (error) {
      console.error('❌ 场景持久化操作失败:', error);
    }
  }

  /**
   * 演示后处理效果
   */
  async demonstratePostProcessing(): Promise<void> {
    const composer = await this.engine.getManager<ComposerManager>('composer');
    if (!composer) return;

    console.log('✨ 演示后处理效果...');

    // 切换泛光效果
    composer.setBloomEnabled(true);
    setTimeout(() => {
      composer.setBloomEnabled(false);
      console.log('✅ 泛光效果切换完成');
    }, 2000);

    // 调整色调映射
    composer.setToneMapping(THREE.ReinhardToneMapping, 1.2);
    console.log('✅ 色调映射调整完成');
  }

  /**
   * 获取引擎统计信息
   */
  getEngineStats(): void {
    const stats = this.engine.getStats();
    console.log('📊 引擎统计信息:', stats);

    const managers = this.engine.getInitializedManagers();
    console.log('📦 已初始化的管理器:', managers);
  }

  /**
   * 销毁示例
   */
  dispose(): void {
    console.log('🧹 清理资源...');
    this.engine.dispose();
    console.log('✅ 资源清理完成');
  }
}

// 使用示例
export function createCompleteExample(container: HTMLElement): CompleteExample {
  return new CompleteExample(container);
} 