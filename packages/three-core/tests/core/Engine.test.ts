import { Engine } from '../../src/core/Engine';
import { createSignal } from '../../src/core/Signal';

describe('Engine', () => {
  let engine: Engine;
  let container: HTMLElement;

  beforeEach(() => {
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
    test('应该正确初始化引擎', async () => {
      await expect(engine.initialize()).resolves.not.toThrow();
      
      expect(engine.scene).toBeDefined();
      expect(engine.camera).toBeDefined();
      expect(engine.renderer).toBeDefined();
      expect(engine.controls).toBeDefined();
    });

    test('应该设置正确的场景', async () => {
      await engine.initialize();
      
      expect(engine.scene).toBeInstanceOf(THREE.Scene);
      expect(engine.scene.children.length).toBeGreaterThan(0);
    });

    test('应该设置正确的相机', async () => {
      await engine.initialize();
      
      expect(engine.camera).toBeInstanceOf(THREE.PerspectiveCamera);
      expect(engine.camera.aspect).toBe(800 / 600);
      expect(engine.camera.position.z).toBe(5);
    });

    test('应该设置正确的渲染器', async () => {
      await engine.initialize();
      
      expect(engine.renderer).toBeInstanceOf(THREE.WebGLRenderer);
      expect(engine.renderer.shadowMap.enabled).toBe(true);
      expect(engine.renderer.antialias).toBe(true);
    });

    test('应该设置正确的控制器', async () => {
      await engine.initialize();
      
      expect(engine.controls).toBeDefined();
      expect(engine.controls?.enabled).toBe(true);
    });
  });

  describe('管理器初始化', () => {
    test('应该按需初始化管理器', async () => {
      await engine.initialize();
      
      // 核心管理器应该自动初始化
      expect(engine.isManagerInitialized('scene')).toBe(true);
      expect(engine.isManagerInitialized('render')).toBe(true);
      expect(engine.isManagerInitialized('camera')).toBe(true);
      
      // 其他管理器应该未初始化
      expect(engine.isManagerInitialized('lights')).toBe(false);
      expect(engine.isManagerInitialized('materials')).toBe(false);
    });

    test('应该异步获取管理器', async () => {
      await engine.initialize();
      
      const lights = await engine.getManager('lights');
      expect(lights).toBeDefined();
      expect(engine.isManagerInitialized('lights')).toBe(true);
    });

    test('应该同步获取已初始化的管理器', async () => {
      await engine.initialize();
      
      await engine.getManager('lights');
      const lights = engine.getManagerSync('lights');
      expect(lights).toBeDefined();
    });

    test('应该抛出错误当获取未初始化的管理器', async () => {
      await engine.initialize();
      
      expect(() => {
        engine.getManagerSync('lights');
      }).toThrow('Manager \'lights\' is not initialized');
    });

    test('应该销毁管理器', async () => {
      await engine.initialize();
      
      await engine.getManager('lights');
      expect(engine.isManagerInitialized('lights')).toBe(true);
      
      const result = await engine.destroyManager('lights');
      expect(result).toBe(true);
      expect(engine.isManagerInitialized('lights')).toBe(false);
    });
  });

  describe('信号系统', () => {
    test('应该发出引擎初始化信号', async () => {
      const mockCallback = jest.fn();
      engine.engineInitialized.subscribe(mockCallback);
      
      await engine.initialize();
      
      expect(mockCallback).toHaveBeenCalledWith(engine);
    });

    test('应该发出管理器初始化信号', async () => {
      const mockCallback = jest.fn();
      engine.managerInitialized.subscribe(mockCallback);
      
      await engine.initialize();
      await engine.getManager('lights');
      
      expect(mockCallback).toHaveBeenCalledWith({
        name: 'lights',
        manager: expect.any(Object)
      });
    });

    test('应该发出错误信号', async () => {
      const mockCallback = jest.fn();
      engine.errorOccurred.subscribe(mockCallback);
      
      // 尝试初始化不存在的管理器
      await engine.initialize();
      await expect(engine.getManager('nonexistent')).rejects.toThrow();
      
      expect(mockCallback).toHaveBeenCalledWith({
        type: 'manager_initialization_error',
        message: expect.stringContaining('Unknown manager')
      });
    });
  });

  describe('渲染', () => {
    test('应该渲染场景', async () => {
      await engine.initialize();
      
      const renderSpy = jest.spyOn(engine.renderer, 'render');
      
      engine.render();
      
      expect(renderSpy).toHaveBeenCalledWith(engine.scene, engine.camera);
    });

    test('应该启动渲染循环', async () => {
      await engine.initialize();
      
      const mockRequestAnimationFrame = jest.spyOn(global, 'requestAnimationFrame');
      
      engine.startRenderLoop();
      
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('尺寸设置', () => {
    test('应该设置尺寸', async () => {
      await engine.initialize();
      
      engine.setSize(1024, 768);
      
      const size = engine.getSize();
      expect(size.width).toBe(1024);
      expect(size.height).toBe(768);
      
      expect(engine.camera.aspect).toBe(1024 / 768);
      expect(engine.renderer.getSize(new THREE.Vector2()).width).toBe(1024);
    });
  });

  describe('配置', () => {
    test('应该获取配置', async () => {
      await engine.initialize();
      
      const config = engine.getConfig();
      
      expect(config.width).toBe(800);
      expect(config.height).toBe(600);
      expect(config.antialias).toBe(true);
      expect(config.shadowMap).toBe(true);
      expect(config.autoRender).toBe(false);
      expect(config.autoResize).toBe(false);
    });
  });

  describe('统计信息', () => {
    test('应该获取统计信息', async () => {
      await engine.initialize();
      
      const stats = engine.getStats();
      
      expect(stats.initializedManagers).toBeGreaterThan(0);
      expect(stats.totalManagers).toBeGreaterThan(0);
      expect(stats.rendererInfo).toBeDefined();
      expect(stats.sceneInfo).toBeDefined();
    });
  });

  describe('资源清理', () => {
    test('应该正确清理资源', async () => {
      await engine.initialize();
      
      const disposeSpy = jest.spyOn(engine.renderer, 'dispose');
      
      engine.dispose();
      
      expect(disposeSpy).toHaveBeenCalled();
    });
  });
}); 