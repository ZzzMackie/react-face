import { Engine } from '../core/Engine';
import * as THREE from 'three';

export class SimpleObjectTest {
  private engine: Engine;

  constructor(container: HTMLElement) {
    this.engine = new Engine({
      container,
      width: 800,
      height: 600,
      antialias: true,
      shadowMap: true,
      enableManagers: ['scene', 'renderer', 'camera', 'objects', 'loader']
    });

    this.runTest();
  }

  private async runTest(): Promise<void> {
    console.log('🧪 开始简单对象测试...');

    try {
      // 等待引擎初始化
      await this.waitForEngine();

      // 测试对象管理器
      await this.testObjectManager();

      // 测试加载器管理器
      await this.testLoaderManager();

      console.log('✅ 所有测试通过！');

    } catch (error) {
      console.error('❌ 测试失败:', error);
    }
  }

  private async waitForEngine(): Promise<void> {
    return new Promise((resolve) => {
      this.engine.engineInitialized.subscribe((engine) => {
        if (engine) {
          console.log('🚀 引擎初始化完成');
          resolve();
        }
      });
    });
  }

  private async testObjectManager(): Promise<void> {
    console.log('📦 测试对象管理器...');

    const objects = await this.engine.getObjects();
    if (!objects) {
      throw new Error('ObjectManager未初始化');
    }

    // 创建基础几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // 测试创建对象
    const mesh = objects.createMesh('testMesh', geometry, material, {
      position: { x: 0, y: 0, z: 0 }
    });

    if (!mesh) {
      throw new Error('创建网格失败');
    }

    // 测试获取对象
    const retrievedMesh = objects.getMesh('testMesh');
    if (!retrievedMesh) {
      throw new Error('获取网格失败');
    }

    // 测试创建组
    const group = objects.createGroup('testGroup', {
      position: { x: 1, y: 0, z: 0 }
    });

    if (!group) {
      throw new Error('创建组失败');
    }

    // 测试选择对象
    const selectResult = objects.selectObject('testMesh');
    if (!selectResult) {
      throw new Error('选择对象失败');
    }

    // 测试获取统计信息
    const stats = objects.getStats();
    if (stats.total < 2) {
      throw new Error('统计信息不正确');
    }

    console.log('✅ 对象管理器测试通过');
    console.log('📊 对象统计:', stats);
  }

  private async testLoaderManager(): Promise<void> {
    console.log('📥 测试加载器管理器...');

    const loader = await this.engine.getLoader();
    if (!loader) {
      throw new Error('LoaderManager未初始化');
    }

    // 测试设置Draco解码器路径
    loader.setDracoDecoderPath('/draco/');

    // 测试获取统计信息
    const stats = loader.getStats();
    if (stats.loaded !== 0 || stats.loading !== 0) {
      throw new Error('初始统计信息不正确');
    }

    // 测试检查加载状态
    const isLoaded = loader.isLoaded('nonexistent');
    if (isLoaded) {
      throw new Error('不存在的文件不应该显示为已加载');
    }

    const isLoading = loader.isLoading('nonexistent');
    if (isLoading) {
      throw new Error('不存在的文件不应该显示为正在加载');
    }

    console.log('✅ 加载器管理器测试通过');
    console.log('📊 加载器统计:', stats);
  }

  public render(): void {
    this.engine.render();
  }

  public dispose(): void {
    this.engine.dispose();
  }
} 