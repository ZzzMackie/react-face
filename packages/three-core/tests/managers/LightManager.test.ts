import { Engine } from '../../src/core/Engine';
import { LightManager } from '../../src/core/LightManager';
import * as THREE from 'three';

describe('LightManager', () => {
  let engine: Engine;
  let lightManager: LightManager;
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
    lightManager = await engine.getManager('lights') as LightManager;
  });

  afterEach(() => {
    if (engine) {
      engine.dispose();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('初始化', () => {
    test('应该正确初始化灯光管理器', () => {
      expect(lightManager).toBeDefined();
      expect(lightManager).toBeInstanceOf(LightManager);
    });

    test('应该设置默认灯光', () => {
      const lights = lightManager.getAllLights();
      expect(lights.length).toBeGreaterThan(0);
    });
  });

  describe('创建灯光', () => {
    test('应该创建环境光', () => {
      const light = lightManager.createLight('ambient', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      expect(light).toBeDefined();
      expect(light.type).toBe('ambient');
      expect(light.light).toBeInstanceOf(THREE.AmbientLight);
      expect(light.light.intensity).toBe(0.4);
    });

    test('应该创建方向光', () => {
      const light = lightManager.createLight('directional', {
        type: 'directional',
        color: 0xffffff,
        intensity: 1.0,
        position: { x: 10, y: 10, z: 5 },
        castShadow: true
      });

      expect(light).toBeDefined();
      expect(light.type).toBe('directional');
      expect(light.light).toBeInstanceOf(THREE.DirectionalLight);
      expect(light.light.intensity).toBe(1.0);
      expect(light.light.position.x).toBe(10);
      expect(light.light.position.y).toBe(10);
      expect(light.light.position.z).toBe(5);
      expect(light.light.castShadow).toBe(true);
    });

    test('应该创建点光源', () => {
      const light = lightManager.createLight('point', {
        type: 'point',
        color: 0xff8800,
        intensity: 1.0,
        distance: 100,
        position: { x: -5, y: 5, z: 5 }
      });

      expect(light).toBeDefined();
      expect(light.type).toBe('point');
      expect(light.light).toBeInstanceOf(THREE.PointLight);
      expect(light.light.intensity).toBe(1.0);
      expect(light.light.distance).toBe(100);
      expect(light.light.position.x).toBe(-5);
      expect(light.light.position.y).toBe(5);
      expect(light.light.position.z).toBe(5);
    });

    test('应该创建聚光灯', () => {
      const light = lightManager.createLight('spot', {
        type: 'spot',
        color: 0x00ff00,
        intensity: 1.0,
        distance: 50,
        angle: Math.PI / 4,
        penumbra: 0.1,
        position: { x: 0, y: 10, z: 0 },
        target: { x: 0, y: 0, z: 0 }
      });

      expect(light).toBeDefined();
      expect(light.type).toBe('spot');
      expect(light.light).toBeInstanceOf(THREE.SpotLight);
      expect(light.light.intensity).toBe(1.0);
      expect(light.light.distance).toBe(50);
      expect(light.light.angle).toBe(Math.PI / 4);
      expect(light.light.penumbra).toBe(0.1);
    });

    test('应该创建半球光', () => {
      const light = lightManager.createLight('hemisphere', {
        type: 'hemisphere',
        skyColor: 0x87ceeb,
        groundColor: 0x8b4513,
        intensity: 0.5,
        position: { x: 0, y: 10, z: 0 }
      });

      expect(light).toBeDefined();
      expect(light.type).toBe('hemisphere');
      expect(light.light).toBeInstanceOf(THREE.HemisphereLight);
      expect(light.light.intensity).toBe(0.5);
    });
  });

  describe('灯光操作', () => {
    test('应该获取灯光', () => {
      lightManager.createLight('test', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      const light = lightManager.getLight('test');
      expect(light).toBeDefined();
      expect(light?.id).toBe('test');
    });

    test('应该获取所有灯光', () => {
      lightManager.createLight('light1', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      lightManager.createLight('light2', {
        type: 'directional',
        color: 0xffffff,
        intensity: 1.0
      });

      const lights = lightManager.getAllLights();
      expect(lights.length).toBeGreaterThanOrEqual(2);
    });

    test('应该设置灯光位置', () => {
      const light = lightManager.createLight('test', {
        type: 'point',
        color: 0xff8800,
        intensity: 1.0
      });

      lightManager.setLightPosition('test', { x: 5, y: 10, z: -5 });
      
      expect(light.light.position.x).toBe(5);
      expect(light.light.position.y).toBe(10);
      expect(light.light.position.z).toBe(-5);
    });

    test('应该设置灯光颜色', () => {
      const light = lightManager.createLight('test', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      lightManager.setLightColor('test', 0xff0000);
      
      expect(light.light.color.getHex()).toBe(0xff0000);
    });

    test('应该设置灯光强度', () => {
      const light = lightManager.createLight('test', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      lightManager.setLightIntensity('test', 0.8);
      
      expect(light.light.intensity).toBe(0.8);
    });

    test('应该设置灯光可见性', () => {
      const light = lightManager.createLight('test', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      lightManager.setLightVisible('test', false);
      
      expect(light.light.visible).toBe(false);
    });

    test('应该设置阴影', () => {
      const light = lightManager.createLight('test', {
        type: 'directional',
        color: 0xffffff,
        intensity: 1.0
      });

      lightManager.setLightShadow('test', true);
      
      expect(light.light.castShadow).toBe(true);
    });
  });

  describe('信号系统', () => {
    test('应该发出灯光创建信号', () => {
      const mockCallback = jest.fn();
      lightManager.lightCreated.subscribe(mockCallback);

      lightManager.createLight('test', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test',
          type: 'ambient'
        })
      );
    });

    test('应该发出灯光更新信号', () => {
      const mockCallback = jest.fn();
      lightManager.lightUpdated.subscribe(mockCallback);

      lightManager.createLight('test', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      lightManager.setLightIntensity('test', 0.8);

      expect(mockCallback).toHaveBeenCalledWith('test');
    });

    test('应该发出灯光销毁信号', () => {
      const mockCallback = jest.fn();
      lightManager.lightDestroyed.subscribe(mockCallback);

      lightManager.createLight('test', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      lightManager.destroyLight('test');

      expect(mockCallback).toHaveBeenCalledWith('test');
    });
  });

  describe('错误处理', () => {
    test('应该处理无效的灯光类型', () => {
      expect(() => {
        lightManager.createLight('test', {
          type: 'invalid' as any,
          color: 0x404040,
          intensity: 0.4
        });
      }).toThrow();
    });

    test('应该处理不存在的灯光', () => {
      expect(() => {
        lightManager.setLightPosition('nonexistent', { x: 0, y: 0, z: 0 });
      }).toThrow();
    });
  });

  describe('资源清理', () => {
    test('应该销毁灯光', () => {
      const light = lightManager.createLight('test', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      const disposeSpy = jest.spyOn(light.light, 'dispose');
      
      lightManager.destroyLight('test');
      
      expect(disposeSpy).toHaveBeenCalled();
    });

    test('应该清理所有灯光', () => {
      lightManager.createLight('light1', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      lightManager.createLight('light2', {
        type: 'directional',
        color: 0xffffff,
        intensity: 1.0
      });

      const lights = lightManager.getAllLights();
      expect(lights.length).toBeGreaterThan(0);

      lightManager.clearAllLights();
      
      const remainingLights = lightManager.getAllLights();
      expect(remainingLights.length).toBe(0);
    });
  });

  describe('统计信息', () => {
    test('应该获取灯光统计信息', () => {
      lightManager.createLight('ambient', {
        type: 'ambient',
        color: 0x404040,
        intensity: 0.4
      });

      lightManager.createLight('directional', {
        type: 'directional',
        color: 0xffffff,
        intensity: 1.0
      });

      const stats = lightManager.getStats();
      
      expect(stats.totalLights).toBeGreaterThanOrEqual(2);
      expect(stats.ambientLights).toBeGreaterThanOrEqual(1);
      expect(stats.directionalLights).toBeGreaterThanOrEqual(1);
    });
  });
}); 