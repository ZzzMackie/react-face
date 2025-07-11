import { Engine } from '../src/core/Engine';
import { AnimationManager } from '../src/core/AnimationManager';
import { PerformanceManager } from '../src/core/PerformanceManager';
import { EventManager } from '../src/core/EventManager';
import { PhysicsManager } from '../src/core/PhysicsManager';
import { AudioManager } from '../src/core/AudioManager';
import { ObjectManager } from '../src/core/ObjectManager';
import { GeometryManager } from '../src/core/GeometryManager';
import { MaterialManager } from '../src/core/MaterialManager';
import * as THREE from 'three';

/**
 * 高级功能示例
 * 展示动画、性能监控、事件处理、物理模拟和音频功能
 */
export class AdvancedExample {
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
    console.log('🚀 初始化高级3D引擎示例...');
    
    // 初始化引擎
    await this.engine.initialize();
    
    // 设置事件监听
    this.setupEventListeners();
    
    // 创建场景内容
    await this.createScene();
    
    // 启动渲染循环
    this.engine.startRenderLoop();
    
    console.log('✅ 高级示例初始化完成');
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

    // 监听错误
    this.engine.errorOccurred.subscribe((error) => {
      if (error) {
        console.error(`❌ 错误: ${error.type} - ${error.message}`);
      }
    });
  }

  /**
   * 创建场景内容
   */
  private async createScene(): Promise<void> {
    console.log('🎨 创建高级场景内容...');

    // 1. 创建基础对象
    await this.createBasicObjects();

    // 2. 设置动画
    await this.setupAnimations();

    // 3. 设置物理
    await this.setupPhysics();

    // 4. 设置音频
    await this.setupAudio();

    // 5. 设置性能监控
    await this.setupPerformanceMonitoring();

    // 6. 设置事件处理
    await this.setupEventHandling();

    console.log('🎨 高级场景创建完成');
  }

  /**
   * 创建基础对象
   */
  private async createBasicObjects(): Promise<void> {
    const geometry = await this.engine.getManager<GeometryManager>('geometry');
    const materials = await this.engine.getManager<MaterialManager>('materials');
    const objects = await this.engine.getManager<ObjectManager>('objects');

    if (geometry && materials && objects) {
      // 创建几何体
      geometry.createBoxGeometry('animatedBox', { width: 1, height: 1, depth: 1 });
      geometry.createSphereGeometry('physicsSphere', { radius: 0.5, segments: 16 });
      geometry.createBoxGeometry('staticBox', { width: 2, height: 2, depth: 2 });

      // 创建材质
      materials.createStandardMaterial('animatedMaterial', {
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.2
      });

      materials.createStandardMaterial('physicsMaterial', {
        color: 0xff0000,
        roughness: 0.3,
        metalness: 0.7
      });

      materials.createStandardMaterial('staticMaterial', {
        color: 0x0088ff,
        transparent: true,
        opacity: 0.8
      });

      // 创建对象
      const animatedBoxGeometry = geometry.getGeometry('animatedBox');
      const physicsSphereGeometry = geometry.getGeometry('physicsSphere');
      const staticBoxGeometry = geometry.getGeometry('staticBox');

      const animatedMaterial = materials.getMaterial('animatedMaterial');
      const physicsMaterial = materials.getMaterial('physicsMaterial');
      const staticMaterial = materials.getMaterial('staticMaterial');

      if (animatedBoxGeometry && animatedMaterial) {
        objects.createMesh('animatedBox', animatedBoxGeometry, animatedMaterial, {
          position: { x: -3, y: 2, z: 0 },
          castShadow: true,
          receiveShadow: true
        });
      }

      if (physicsSphereGeometry && physicsMaterial) {
        objects.createMesh('physicsSphere', physicsSphereGeometry, physicsMaterial, {
          position: { x: 0, y: 5, z: 0 },
          castShadow: true,
          receiveShadow: true
        });
      }

      if (staticBoxGeometry && staticMaterial) {
        objects.createMesh('staticBox', staticBoxGeometry, staticMaterial, {
          position: { x: 3, y: 1, z: 0 },
          castShadow: true,
          receiveShadow: true
        });
      }
    }
  }

  /**
   * 设置动画
   */
  private async setupAnimations(): Promise<void> {
    const animation = await this.engine.getManager<AnimationManager>('animation');
    const objects = await this.engine.getManager<ObjectManager>('objects');

    if (animation && objects) {
      const animatedBox = objects.getObject('animatedBox');
      const staticBox = objects.getObject('staticBox');

      if (animatedBox) {
        // 创建旋转动画
        animation.createRotationAnimation('boxRotation', animatedBox, [
          { time: 0, rotation: new THREE.Euler(0, 0, 0) },
          { time: 2, rotation: new THREE.Euler(0, Math.PI * 2, 0) }
        ]);

        // 创建缩放动画
        animation.createScaleAnimation('boxScale', animatedBox, [
          { time: 0, scale: new THREE.Vector3(1, 1, 1) },
          { time: 1, scale: new THREE.Vector3(1.5, 1.5, 1.5) },
          { time: 2, scale: new THREE.Vector3(1, 1, 1) }
        ]);

        // 播放动画
        animation.playAnimation('boxRotation', animatedBox);
        animation.playAnimation('boxScale', animatedBox);
        animation.setAnimationLoop('boxRotation', true);
        animation.setAnimationLoop('boxScale', true);
      }

      if (staticBox) {
        // 创建位置动画
        animation.createPositionAnimation('boxPosition', staticBox, [
          { time: 0, position: new THREE.Vector3(3, 1, 0) },
          { time: 2, position: new THREE.Vector3(3, 3, 0) },
          { time: 4, position: new THREE.Vector3(3, 1, 0) }
        ]);

        animation.playAnimation('boxPosition', staticBox);
        animation.setAnimationLoop('boxPosition', true);
      }

      // 监听动画事件
      animation.animationStarted.subscribe((name) => {
        console.log(`🎬 动画开始: ${name}`);
      });

      animation.animationCompleted.subscribe((name) => {
        console.log(`✅ 动画完成: ${name}`);
      });
    }
  }

  /**
   * 设置物理
   */
  private async setupPhysics(): Promise<void> {
    const physics = await this.engine.getManager<PhysicsManager>('physics');
    const objects = await this.engine.getManager<ObjectManager>('objects');

    if (physics && objects) {
      const physicsSphere = objects.getObject('physicsSphere');
      const staticBox = objects.getObject('staticBox');

      if (physicsSphere) {
        // 添加动态物理体
        physics.addBody(physicsSphere, {
          mass: 1,
          velocity: new THREE.Vector3(0, 0, 0),
          isStatic: false,
          collisionShape: 'sphere',
          collisionRadius: 0.5,
          restitution: 0.8,
          friction: 0.3
        });
      }

      if (staticBox) {
        // 添加静态物理体
        physics.addBody(staticBox, {
          mass: 0,
          isStatic: true,
          collisionShape: 'box',
          collisionSize: new THREE.Vector3(2, 2, 2)
        });
      }

      // 设置重力
      physics.setGravity(new THREE.Vector3(0, -9.81, 0));

      // 监听碰撞事件
      physics.collisionDetected.subscribe((collision) => {
        if (collision) {
          console.log(`💥 碰撞检测: ${collision.objectA.name} 与 ${collision.objectB.name}`);
        }
      });

      // 启用调试模式
      physics.setDebugMode(true);
    }
  }

  /**
   * 设置音频
   */
  private async setupAudio(): Promise<void> {
    const audio = await this.engine.getManager<AudioManager>('audio');
    const objects = await this.engine.getManager<ObjectManager>('objects');

    if (audio && objects) {
      const animatedBox = objects.getObject('animatedBox');

      if (animatedBox) {
        try {
          // 加载音频文件（示例URL）
          await audio.loadAudio('background', '/audio/background.mp3');
          await audio.loadAudio('effect', '/audio/effect.mp3');

          // 创建3D音频源
          audio.create3DAudio('boxAudio', animatedBox, 'effect', {
            volume: 0.5,
            loop: true,
            maxDistance: 10,
            refDistance: 1,
            rolloffFactor: 1
          });

          // 创建全局音频
          audio.createGlobalAudio('bgAudio', 'background', {
            volume: 0.3,
            loop: true
          });

          // 播放音频
          audio.playAudio('bgAudio');
          audio.playAudio('boxAudio');

          // 监听音频事件
          audio.audioStarted.subscribe((id) => {
            console.log(`🎵 音频开始播放: ${id}`);
          });

          audio.audioStopped.subscribe((id) => {
            console.log(`🔇 音频停止: ${id}`);
          });

        } catch (error) {
          console.warn('⚠️ 音频文件加载失败，跳过音频设置');
        }
      }
    }
  }

  /**
   * 设置性能监控
   */
  private async setupPerformanceMonitoring(): Promise<void> {
    const performance = await this.engine.getManager<PerformanceManager>('performance');

    if (performance) {
      // 启用性能监控
      performance.setEnabled(true);
      performance.setUpdateInterval(1000);

      // 监听性能事件
      performance.statsUpdated.subscribe((stats) => {
        if (stats) {
          console.log(`📊 性能统计: FPS=${stats.fps}, 内存=${stats.memory.geometries}几何体`);
        }
      });

      performance.performanceWarning.subscribe((warning) => {
        if (warning) {
          console.warn(`⚠️ 性能警告: ${warning.type} - ${warning.message}`);
        }
      });

      // 获取性能建议
      const suggestions = performance.getPerformanceSuggestions();
      if (suggestions.length > 0) {
        console.log('💡 性能建议:', suggestions);
      }
    }
  }

  /**
   * 设置事件处理
   */
  private async setupEventHandling(): Promise<void> {
    const events = await this.engine.getManager<EventManager>('events');

    if (events) {
      // 监听点击事件
      events.addEventListener('objectclick', (data) => {
        console.log(`🖱️ 对象被点击: ${data.target?.name}`);
        
        // 切换对象颜色
        if (data.target && data.target instanceof THREE.Mesh) {
          const material = data.target.material as THREE.Material;
          if (material && 'color' in material) {
            material.color.setHex(Math.random() * 0xffffff);
          }
        }
      });

      // 监听悬停事件
      events.addEventListener('mouseenter', (data) => {
        if (data.target) {
          console.log(`🖱️ 鼠标悬停: ${data.target.name}`);
        }
      });

      // 监听键盘事件
      events.addEventListener('keydown', (data) => {
        if (data.event instanceof KeyboardEvent) {
          console.log(`⌨️ 按键: ${data.event.key}`);
          
          // 根据按键执行不同操作
          switch (data.event.key) {
            case ' ':
              this.toggleAnimations();
              break;
            case 'p':
              this.togglePhysics();
              break;
            case 'a':
              this.toggleAudio();
              break;
          }
        }
      });

      // 监听滚轮事件
      events.addEventListener('wheel', (data) => {
        if (data.delta) {
          console.log(`🖱️ 滚轮: x=${data.delta.x}, y=${data.delta.y}`);
        }
      });
    }
  }

  /**
   * 切换动画
   */
  private async toggleAnimations(): Promise<void> {
    const animation = await this.engine.getManager<AnimationManager>('animation');
    if (animation) {
      const stats = animation.getStats();
      if (stats.playingAnimations > 0) {
        animation.clearAllAnimations();
        console.log('⏸️ 动画已暂停');
      } else {
        console.log('▶️ 动画已恢复');
      }
    }
  }

  /**
   * 切换物理
   */
  private async togglePhysics(): Promise<void> {
    const physics = await this.engine.getManager<PhysicsManager>('physics');
    if (physics) {
      const enabled = physics.getStats().totalBodies > 0;
      if (enabled) {
        physics.clearAllBodies();
        console.log('⏸️ 物理已暂停');
      } else {
        console.log('▶️ 物理已恢复');
      }
    }
  }

  /**
   * 切换音频
   */
  private async toggleAudio(): Promise<void> {
    const audio = await this.engine.getManager<AudioManager>('audio');
    if (audio) {
      const sources = audio.getAllAudioSources();
      const playing = sources.filter(s => s.isPlaying);
      
      if (playing.length > 0) {
        playing.forEach(source => {
          audio.pauseAudio(source.id);
        });
        console.log('🔇 音频已暂停');
      } else {
        sources.forEach(source => {
          audio.playAudio(source.id);
        });
        console.log('🔊 音频已恢复');
      }
    }
  }

  /**
   * 获取引擎统计信息
   */
  getEngineStats(): void {
    const stats = this.engine.getStats();
    console.log('📊 引擎统计:', stats);
  }

  /**
   * 销毁示例
   */
  dispose(): void {
    this.engine.dispose();
    console.log('🧹 高级示例已销毁');
  }
}

/**
 * 创建高级示例实例
 */
export function createAdvancedExample(container: HTMLElement): AdvancedExample {
  return new AdvancedExample(container);
} 