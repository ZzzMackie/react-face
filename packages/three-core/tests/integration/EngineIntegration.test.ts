import { Engine } from '../../src/core/Engine';
import { LightManager } from '../../src/core/LightManager';
import { MaterialManager } from '../../src/core/MaterialManager';
import { ObjectManager } from '../../src/core/ObjectManager';
import { GeometryManager } from '../../src/core/GeometryManager';
import { ParticleManager } from '../../src/core/ParticleManager';
import { ShaderManager } from '../../src/core/ShaderManager';
import { EnvironmentManager } from '../../src/core/EnvironmentManager';
import * as THREE from 'three';

describe('Engine Integration', () => {
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

  describe('基础场景创建', () => {
    test('应该创建完整的3D场景', async () => {
      // 获取管理器
      const lights = await engine.getManager<LightManager>('lights');
      const materials = await engine.getManager<MaterialManager>('materials');
      const objects = await engine.getManager<ObjectManager>('objects');
      const geometry = await engine.getManager<GeometryManager>('geometry');

      expect(lights).toBeDefined();
      expect(materials).toBeDefined();
      expect(objects).toBeDefined();
      expect(geometry).toBeDefined();

      // 创建灯光
      lights.createLight('ambient', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      lights.createLight('directional', {
        type: 'directional',
        color: 0xffffff,
        intensity: 1.0,
        position: { x: 10, y: 10, z: 5 },
        castShadow: true
      });

      // 创建材质
      materials.createStandardMaterial('standard', {
        color: 0x808080,
        roughness: 0.5,
        metalness: 0.5
      });

      // 创建几何体
      geometry.createBoxGeometry('box', { width: 2, height: 2, depth: 2 });
      geometry.createSphereGeometry('sphere', { radius: 1, segments: 32 });

      // 创建对象
      const boxGeometry = geometry.getGeometry('box');
      const sphereGeometry = geometry.getGeometry('sphere');
      const material = materials.getMaterial('standard');

      if (boxGeometry && material) {
        objects.createMesh('cube', boxGeometry, material, {
          position: { x: -2, y: 1, z: 0 },
          castShadow: true,
          receiveShadow: true
        });
      }

      if (sphereGeometry && material) {
        objects.createMesh('sphere', sphereGeometry, material, {
          position: { x: 2, y: 1, z: 0 },
          castShadow: true,
          receiveShadow: true
        });
      }

      // 验证场景
      expect(engine.scene.children.length).toBeGreaterThan(0);
      expect(lights.getAllLights().length).toBeGreaterThan(0);
      expect(materials.getAllMaterials().length).toBeGreaterThan(0);
      expect(objects.getAllObjects().length).toBeGreaterThan(0);
    });
  });

  describe('特效系统集成', () => {
    test('应该集成粒子系统和着色器', async () => {
      const particles = await engine.getManager<ParticleManager>('particles');
      const shaders = await engine.getManager<ShaderManager>('shaders');
      const objects = await engine.getManager<ObjectManager>('objects');
      const geometry = await engine.getManager<GeometryManager>('geometry');
      const materials = await engine.getManager<MaterialManager>('materials');

      // 创建基础对象
      geometry.createBoxGeometry('shaderBox', { width: 2, height: 2, depth: 2 });
      materials.createStandardMaterial('baseMaterial', {
        color: 0x808080,
        roughness: 0.5,
        metalness: 0.5
      });

      const boxGeometry = geometry.getGeometry('shaderBox');
      const material = materials.getMaterial('baseMaterial');

      if (boxGeometry && material) {
        objects.createMesh('shaderBox', boxGeometry, material, {
          position: { x: 0, y: 1, z: 0 }
        });
      }

      // 创建粒子系统
      particles.createParticleSystem('fire', {
        count: 100,
        size: 0.1,
        color: new THREE.Color(0xff4400),
        velocity: new THREE.Vector3(0, 1, 0),
        lifetime: 2.0,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

      particles.createEmitter('fire', {
        position: new THREE.Vector3(0, 0, 0),
        direction: new THREE.Vector3(0, 1, 0),
        rate: 10,
        continuous: true
      });

      // 创建着色器效果
      shaders.createBuiltinEffect('wave', 'wave', {
        amplitude: 0.2,
        frequency: 2.0,
        speed: 1.0,
        color: new THREE.Color(0x0088ff)
      });

      // 应用着色器到对象
      const box = objects.getObject('shaderBox');
      if (box) {
        shaders.applyShaderToObject('wave', box);
      }

      // 验证特效
      expect(particles.getAllParticleSystems().length).toBeGreaterThan(0);
      expect(shaders.getAllShaderMaterials().length).toBeGreaterThan(0);
    });
  });

  describe('环境系统集成', () => {
    test('应该集成环境效果', async () => {
      const environment = await engine.getManager<EnvironmentManager>('environment');
      const lights = await engine.getManager<LightManager>('lights');

      // 设置环境
      environment.setEnvironment({
        skybox: {
          type: 'gradient',
          gradient: {
            topColor: new THREE.Color(0x87ceeb),
            bottomColor: new THREE.Color(0x4169e1)
          }
        },
        fog: {
          type: 'exponential',
          color: new THREE.Color(0x87ceeb),
          density: 0.01
        },
        ambient: {
          color: new THREE.Color(0x404040),
          intensity: 0.4
        }
      });

      // 创建灯光
      lights.createLight('directional', {
        type: 'directional',
        color: 0xffffff,
        intensity: 1.0,
        position: { x: 10, y: 10, z: 5 },
        castShadow: true
      });

      // 验证环境设置
      expect(engine.scene.background).toBeDefined();
      expect(engine.scene.fog).toBeDefined();
      expect(lights.getAllLights().length).toBeGreaterThan(0);
    });
  });

  describe('性能监控集成', () => {
    test('应该监控引擎性能', async () => {
      const performance = await engine.getManager('performance');

      // 创建一些对象来测试性能
      const objects = await engine.getManager<ObjectManager>('objects');
      const geometry = await engine.getManager<GeometryManager>('geometry');
      const materials = await engine.getManager<MaterialManager>('materials');

      materials.createStandardMaterial('test', {
        color: 0x808080,
        roughness: 0.5,
        metalness: 0.5
      });

      geometry.createBoxGeometry('testBox', { width: 1, height: 1, depth: 1 });

      const boxGeometry = geometry.getGeometry('testBox');
      const material = materials.getMaterial('test');

      if (boxGeometry && material) {
        for (let i = 0; i < 10; i++) {
          objects.createMesh(`box${i}`, boxGeometry, material, {
            position: { x: i * 2, y: 0, z: 0 }
          });
        }
      }

      // 渲染几帧
      for (let i = 0; i < 5; i++) {
        engine.render();
      }

      // 获取性能统计
      const stats = engine.getStats();
      expect(stats.initializedManagers).toBeGreaterThan(0);
      expect(stats.totalManagers).toBeGreaterThan(0);
      expect(stats.rendererInfo).toBeDefined();
      expect(stats.sceneInfo).toBeDefined();
    });
  });

  describe('事件系统集成', () => {
    test('应该处理用户交互事件', async () => {
      const events = await engine.getManager('events');

      // 创建测试对象
      const objects = await engine.getManager<ObjectManager>('objects');
      const geometry = await engine.getManager<GeometryManager>('geometry');
      const materials = await engine.getManager<MaterialManager>('materials');

      materials.createStandardMaterial('interactive', {
        color: 0xff0000,
        roughness: 0.5,
        metalness: 0.5
      });

      geometry.createBoxGeometry('interactiveBox', { width: 1, height: 1, depth: 1 });

      const boxGeometry = geometry.getGeometry('interactiveBox');
      const material = materials.getMaterial('interactive');

      if (boxGeometry && material) {
        objects.createMesh('interactiveBox', boxGeometry, material, {
          position: { x: 0, y: 0, z: 0 }
        });
      }

      // 验证事件系统
      expect(events).toBeDefined();
    });
  });

  describe('动画系统集成', () => {
    test('应该创建和播放动画', async () => {
      const animation = await engine.getManager('animation');
      const objects = await engine.getManager<ObjectManager>('objects');
      const geometry = await engine.getManager<GeometryManager>('geometry');
      const materials = await engine.getManager<MaterialManager>('materials');

      // 创建动画对象
      materials.createStandardMaterial('animated', {
        color: 0x00ff00,
        roughness: 0.5,
        metalness: 0.5
      });

      geometry.createBoxGeometry('animatedBox', { width: 1, height: 1, depth: 1 });

      const boxGeometry = geometry.getGeometry('animatedBox');
      const material = materials.getMaterial('animated');

      if (boxGeometry && material) {
        objects.createMesh('animatedBox', boxGeometry, material, {
          position: { x: 0, y: 0, z: 0 }
        });
      }

      // 创建动画
      const object = objects.getObject('animatedBox');
      if (object) {
        animation.createAnimation('rotation', {
          target: object,
          tracks: [
            {
              property: 'rotation.y',
              times: [0, 2, 4],
              values: [0, Math.PI, Math.PI * 2]
            }
          ],
          duration: 4,
          loop: true
        });

        animation.playAnimation('rotation');
      }

      // 验证动画
      expect(animation.getAllAnimations().length).toBeGreaterThan(0);
    });
  });

  describe('物理系统集成', () => {
    test('应该集成物理模拟', async () => {
      const physics = await engine.getManager('physics');
      const objects = await engine.getManager<ObjectManager>('objects');
      const geometry = await engine.getManager<GeometryManager>('geometry');
      const materials = await engine.getManager<MaterialManager>('materials');

      // 创建物理对象
      materials.createStandardMaterial('physics', {
        color: 0x0000ff,
        roughness: 0.5,
        metalness: 0.5
      });

      geometry.createBoxGeometry('physicsBox', { width: 1, height: 1, depth: 1 });

      const boxGeometry = geometry.getGeometry('physicsBox');
      const material = materials.getMaterial('physics');

      if (boxGeometry && material) {
        objects.createMesh('physicsBox', boxGeometry, material, {
          position: { x: 0, y: 5, z: 0 }
        });
      }

      // 添加物理属性
      const object = objects.getObject('physicsBox');
      if (object) {
        physics.addPhysicsBody('physicsBox', {
          type: 'dynamic',
          mass: 1.0,
          shape: 'box',
          size: { x: 1, y: 1, z: 1 }
        });
      }

      // 验证物理系统
      expect(physics.getAllPhysicsBodies().length).toBeGreaterThan(0);
    });
  });

  describe('音频系统集成', () => {
    test('应该集成音频系统', async () => {
      const audio = await engine.getManager('audio');
      const objects = await engine.getManager<ObjectManager>('objects');
      const geometry = await engine.getManager<GeometryManager>('geometry');
      const materials = await engine.getManager<MaterialManager>('materials');

      // 创建音频对象
      materials.createStandardMaterial('audio', {
        color: 0xff00ff,
        roughness: 0.5,
        metalness: 0.5
      });

      geometry.createSphereGeometry('audioSphere', { radius: 0.5, segments: 16 });

      const sphereGeometry = geometry.getGeometry('audioSphere');
      const material = materials.getMaterial('audio');

      if (sphereGeometry && material) {
        objects.createMesh('audioSphere', sphereGeometry, material, {
          position: { x: 0, y: 0, z: 0 }
        });
      }

      // 添加音频源
      const object = objects.getObject('audioSphere');
      if (object) {
        audio.createAudioSource('testAudio', {
          type: 'positional',
          url: 'test.mp3',
          loop: true,
          volume: 0.5,
          position: { x: 0, y: 0, z: 0 }
        });
      }

      // 验证音频系统
      expect(audio.getAllAudioSources().length).toBeGreaterThan(0);
    });
  });

  describe('信号系统集成', () => {
    test('应该处理跨管理器的信号', async () => {
      const lights = await engine.getManager<LightManager>('lights');
      const materials = await engine.getManager<MaterialManager>('materials');
      const objects = await engine.getManager<ObjectManager>('objects');

      const lightCreatedSpy = jest.fn();
      const materialCreatedSpy = jest.fn();
      const objectCreatedSpy = jest.fn();

      lights.lightCreated.subscribe(lightCreatedSpy);
      materials.materialCreated.subscribe(materialCreatedSpy);
      objects.objectCreated.subscribe(objectCreatedSpy);

      // 创建资源
      lights.createLight('test', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      materials.createStandardMaterial('test', {
        color: 0x808080,
        roughness: 0.5,
        metalness: 0.5
      });

      const geometry = await engine.getManager<GeometryManager>('geometry');
      const material = materials.getMaterial('test');

      if (material) {
        geometry.createBoxGeometry('testBox', { width: 1, height: 1, depth: 1 });
        const boxGeometry = geometry.getGeometry('testBox');

        if (boxGeometry) {
          objects.createMesh('testBox', boxGeometry, material, {
            position: { x: 0, y: 0, z: 0 }
          });
        }
      }

      // 验证信号
      expect(lightCreatedSpy).toHaveBeenCalled();
      expect(materialCreatedSpy).toHaveBeenCalled();
      expect(objectCreatedSpy).toHaveBeenCalled();
    });
  });

  describe('资源管理', () => {
    test('应该正确清理所有资源', async () => {
      // 创建各种资源
      const lights = await engine.getManager<LightManager>('lights');
      const materials = await engine.getManager<MaterialManager>('materials');
      const objects = await engine.getManager<ObjectManager>('objects');
      const particles = await engine.getManager<ParticleManager>('particles');
      const shaders = await engine.getManager<ShaderManager>('shaders');

      lights.createLight('test', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      materials.createStandardMaterial('test', {
        color: 0x808080,
        roughness: 0.5,
        metalness: 0.5
      });

      particles.createParticleSystem('test', {
        count: 10,
        size: 0.1,
        color: new THREE.Color(0xff0000)
      });

      shaders.createBuiltinEffect('test', 'wave', {
        amplitude: 0.2,
        frequency: 2.0,
        speed: 1.0
      });

      // 验证资源创建
      expect(lights.getAllLights().length).toBeGreaterThan(0);
      expect(materials.getAllMaterials().length).toBeGreaterThan(0);
      expect(particles.getAllParticleSystems().length).toBeGreaterThan(0);
      expect(shaders.getAllShaderMaterials().length).toBeGreaterThan(0);

      // 清理资源
      engine.dispose();

      // 验证资源清理
      expect(engine.scene.children.length).toBe(0);
    });
  });
}); 