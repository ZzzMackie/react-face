import { Engine } from '../../src/core/Engine';
import { LightManager } from '../../src/core/LightManager';
import { MaterialManager } from '../../src/core/MaterialManager';
import { ObjectManager } from '../../src/core/ObjectManager';
import { GeometryManager } from '../../src/core/GeometryManager';
import { ParticleManager } from '../../src/core/ParticleManager';
import { ShaderManager } from '../../src/core/ShaderManager';
import * as THREE from 'three';

describe('Performance Tests', () => {
  let engine: Engine;
  let container: HTMLElement;

  beforeEach(async () => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    engine = new Engine({
      container,
      width: 800,
      height: 600,
      antialias: true,
      shadowMap: true,
      autoRender: false,
      autoResize: false
    });

    await engine.initialize();
  });

  afterEach(() => {
    if (engine) {
      engine.dispose();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('大量对象渲染', () => {
    test('应该高效渲染1000个对象', async () => {
      const objects = await engine.getManager<ObjectManager>('objects');
      const geometry = await engine.getManager<GeometryManager>('geometry');
      const materials = await engine.getManager<MaterialManager>('materials');

      // 创建材质和几何体
      materials.createStandardMaterial('performance', {
        color: 0x808080,
        roughness: 0.5,
        metalness: 0.5
      });

      geometry.createBoxGeometry('performanceBox', { width: 0.5, height: 0.5, depth: 0.5 });

      const boxGeometry = geometry.getGeometry('performanceBox');
      const material = materials.getMaterial('performance');

      if (boxGeometry && material) {
        const startTime = performance.now();

        // 创建1000个对象
        for (let i = 0; i < 1000; i++) {
          objects.createMesh(`box${i}`, boxGeometry, material, {
            position: {
              x: (i % 50) * 2 - 50,
              y: Math.floor(i / 50) * 2,
              z: Math.floor(i / 2500) * 2
            }
          });
        }

        const endTime = performance.now();
        const creationTime = endTime - startTime;

        // 验证对象创建
        expect(objects.getAllObjects().length).toBe(1000);
        expect(creationTime).toBeLessThan(1000); // 应该在1秒内完成

        // 测试渲染性能
        const renderStartTime = performance.now();
        
        for (let i = 0; i < 10; i++) {
          engine.render();
        }
        
        const renderEndTime = performance.now();
        const renderTime = renderEndTime - renderStartTime;
        const averageRenderTime = renderTime / 10;

        expect(averageRenderTime).toBeLessThan(16); // 每帧应该少于16ms (60fps)
      }
    });
  });

  describe('粒子系统性能', () => {
    test('应该高效处理大量粒子', async () => {
      const particles = await engine.getManager<ParticleManager>('particles');

      const startTime = performance.now();

      // 创建多个粒子系统
      for (let i = 0; i < 10; i++) {
        particles.createParticleSystem(`particles${i}`, {
          count: 1000,
          size: 0.05,
          color: new THREE.Color(0xff0000),
          velocity: new THREE.Vector3(0, 1, 0),
          lifetime: 2.0,
          blending: THREE.AdditiveBlending,
          transparent: true
        });

        particles.createEmitter(`particles${i}`, {
          position: new THREE.Vector3(i * 2, 0, 0),
          direction: new THREE.Vector3(0, 1, 0),
          rate: 50,
          continuous: true
        });

        particles.emitParticles(`particles${i}`, 500);
      }

      const endTime = performance.now();
      const creationTime = endTime - startTime;

      // 验证粒子系统创建
      expect(particles.getAllParticleSystems().length).toBe(10);
      expect(creationTime).toBeLessThan(2000); // 应该在2秒内完成

      // 测试粒子更新性能
      const updateStartTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        // 模拟粒子更新
        particles.getAllParticleSystems().forEach(system => {
          particles.emitParticles(system.id, 10);
        });
      }
      
      const updateEndTime = performance.now();
      const updateTime = updateEndTime - updateStartTime;
      const averageUpdateTime = updateTime / 100;

      expect(averageUpdateTime).toBeLessThan(1); // 每次更新应该少于1ms
    });
  });

  describe('着色器性能', () => {
    test('应该高效处理着色器效果', async () => {
      const shaders = await engine.getManager<ShaderManager>('shaders');
      const objects = await engine.getManager<ObjectManager>('objects');
      const geometry = await engine.getManager<GeometryManager>('geometry');
      const materials = await engine.getManager<MaterialManager>('materials');

      // 创建基础对象
      materials.createStandardMaterial('shaderTest', {
        color: 0x808080,
        roughness: 0.5,
        metalness: 0.5
      });

      geometry.createBoxGeometry('shaderBox', { width: 1, height: 1, depth: 1 });

      const boxGeometry = geometry.getGeometry('shaderBox');
      const material = materials.getMaterial('shaderTest');

      if (boxGeometry && material) {
        // 创建多个对象
        for (let i = 0; i < 100; i++) {
          objects.createMesh(`shaderBox${i}`, boxGeometry, material, {
            position: { x: i * 2, y: 0, z: 0 }
          });
        }

        const startTime = performance.now();

        // 创建多个着色器效果
        for (let i = 0; i < 10; i++) {
          shaders.createBuiltinEffect(`wave${i}`, 'wave', {
            amplitude: 0.2,
            frequency: 2.0,
            speed: 1.0,
            color: new THREE.Color(0x0088ff)
          });

          shaders.createBuiltinEffect(`glow${i}`, 'glow', {
            color: new THREE.Color(0x00ff00),
            intensity: 1.0,
            pulseSpeed: 2.0
          });
        }

        const endTime = performance.now();
        const creationTime = endTime - startTime;

        // 验证着色器创建
        expect(shaders.getAllShaderMaterials().length).toBe(20);
        expect(creationTime).toBeLessThan(1000); // 应该在1秒内完成

        // 测试着色器更新性能
        const updateStartTime = performance.now();
        
        for (let i = 0; i < 100; i++) {
          shaders.getAllEffects().forEach(effect => {
            shaders.updateAnimatedEffect(effect.id, i * 0.016); // 模拟时间
          });
        }
        
        const updateEndTime = performance.now();
        const updateTime = updateEndTime - updateStartTime;
        const averageUpdateTime = updateTime / 100;

        expect(averageUpdateTime).toBeLessThan(1); // 每次更新应该少于1ms
      }
    });
  });

  describe('内存使用', () => {
    test('应该合理使用内存', async () => {
      const objects = await engine.getManager<ObjectManager>('objects');
      const geometry = await engine.getManager<GeometryManager>('geometry');
      const materials = await engine.getManager<MaterialManager>('materials');
      const particles = await engine.getManager<ParticleManager>('particles');

      // 记录初始内存使用
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // 创建大量资源
      materials.createStandardMaterial('memoryTest', {
        color: 0x808080,
        roughness: 0.5,
        metalness: 0.5
      });

      geometry.createBoxGeometry('memoryBox', { width: 1, height: 1, depth: 1 });

      const boxGeometry = geometry.getGeometry('memoryBox');
      const material = materials.getMaterial('memoryTest');

      if (boxGeometry && material) {
        // 创建500个对象
        for (let i = 0; i < 500; i++) {
          objects.createMesh(`memoryBox${i}`, boxGeometry, material, {
            position: { x: i * 2, y: 0, z: 0 }
          });
        }

        // 创建5个粒子系统
        for (let i = 0; i < 5; i++) {
          particles.createParticleSystem(`memoryParticles${i}`, {
            count: 500,
            size: 0.1,
            color: new THREE.Color(0xff0000),
            velocity: new THREE.Vector3(0, 1, 0),
            lifetime: 2.0
          });
        }

        // 记录内存使用
        const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
        const memoryIncrease = finalMemory - initialMemory;

        // 验证内存使用合理
        expect(objects.getAllObjects().length).toBe(500);
        expect(particles.getAllParticleSystems().length).toBe(5);
        
        // 内存增长应该在合理范围内 (如果支持内存监控)
        if (initialMemory > 0 && finalMemory > 0) {
          expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 少于100MB
        }
      }
    });
  });

  describe('渲染性能', () => {
    test('应该维持稳定的帧率', async () => {
      const objects = await engine.getManager<ObjectManager>('objects');
      const geometry = await engine.getManager<GeometryManager>('geometry');
      const materials = await engine.getManager<MaterialManager>('materials');

      // 创建中等复杂度的场景
      materials.createStandardMaterial('frameTest', {
        color: 0x808080,
        roughness: 0.5,
        metalness: 0.5
      });

      geometry.createBoxGeometry('frameBox', { width: 1, height: 1, depth: 1 });

      const boxGeometry = geometry.getGeometry('frameBox');
      const material = materials.getMaterial('frameTest');

      if (boxGeometry && material) {
        // 创建100个对象
        for (let i = 0; i < 100; i++) {
          objects.createMesh(`frameBox${i}`, boxGeometry, material, {
            position: { x: i * 2, y: 0, z: 0 }
          });
        }

        const frameTimes: number[] = [];

        // 渲染100帧并记录时间
        for (let i = 0; i < 100; i++) {
          const startTime = performance.now();
          engine.render();
          const endTime = performance.now();
          frameTimes.push(endTime - startTime);
        }

        // 计算统计信息
        const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        const maxFrameTime = Math.max(...frameTimes);
        const minFrameTime = Math.min(...frameTimes);

        // 验证性能
        expect(averageFrameTime).toBeLessThan(16); // 平均帧时间少于16ms
        expect(maxFrameTime).toBeLessThan(33); // 最大帧时间少于33ms
        expect(minFrameTime).toBeGreaterThan(0); // 最小帧时间大于0

        // 验证帧率稳定性
        const frameRateVariation = maxFrameTime - minFrameTime;
        expect(frameRateVariation).toBeLessThan(10); // 帧时间变化少于10ms
      }
    });
  });

  describe('管理器初始化性能', () => {
    test('应该快速初始化所有管理器', async () => {
      const managerNames = [
        'lights', 'materials', 'objects', 'geometry', 'textures',
        'loaders', 'export', 'helpers', 'composer', 'viewHelper',
        'animation', 'performance', 'events', 'physics', 'audio',
        'particles', 'shaders', 'environment'
      ];

      const startTime = performance.now();

      // 初始化所有管理器
      const managers = await Promise.all(
        managerNames.map(name => engine.getManager(name))
      );

      const endTime = performance.now();
      const initializationTime = endTime - startTime;

      // 验证所有管理器都成功初始化
      managers.forEach((manager, index) => {
        expect(manager).toBeDefined();
        expect(engine.isManagerInitialized(managerNames[index])).toBe(true);
      });

      // 验证初始化时间
      expect(initializationTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });

  describe('信号系统性能', () => {
    test('应该高效处理大量信号订阅', async () => {
      const lights = await engine.getManager<LightManager>('lights');
      const materials = await engine.getManager<MaterialManager>('materials');
      const objects = await engine.getManager<ObjectManager>('objects');

      const subscribers: Array<() => void> = [];

      const startTime = performance.now();

      // 创建大量订阅者
      for (let i = 0; i < 1000; i++) {
        const unsubscribe = lights.lightCreated.subscribe(() => {});
        subscribers.push(unsubscribe);
      }

      const endTime = performance.now();
      const subscriptionTime = endTime - startTime;

      // 验证订阅创建
      expect(subscribers.length).toBe(1000);
      expect(subscriptionTime).toBeLessThan(100); // 应该在100ms内完成

      // 测试信号触发性能
      const triggerStartTime = performance.now();

      lights.createLight('performanceTest', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      const triggerEndTime = performance.now();
      const triggerTime = triggerEndTime - triggerStartTime;

      expect(triggerTime).toBeLessThan(50); // 信号触发应该少于50ms

      // 清理订阅者
      subscribers.forEach(unsubscribe => unsubscribe());
    });
  });
}); 