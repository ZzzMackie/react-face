import { Engine } from '../../src/core/Engine';
import { ManagerFactory } from '../../src/core/ManagerFactory';
import { DynamicManagerRegistry } from '../../src/core/DynamicManagerRegistry';

// 模拟 Three.js
jest.mock('three', () => ({
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    setClearColor: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    domElement: document.createElement('canvas'),
    capabilities: {
      isWebGL2: true,
      maxTextureSize: 4096,
      maxAnisotropy: 16
    }
  })),
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
    background: null,
    fog: null
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn(), copy: jest.fn() },
    lookAt: jest.fn(),
    updateMatrix: jest.fn(),
    updateMatrixWorld: jest.fn(),
    fov: 75,
    aspect: 1,
    near: 0.1,
    far: 1000
  })),
  AmbientLight: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    intensity: 1
  })),
  DirectionalLight: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    intensity: 1,
    castShadow: false
  })),
  Color: jest.fn().mockImplementation(() => ({
    setHex: jest.fn(),
    setRGB: jest.fn(),
    getHex: jest.fn(() => 0x000000)
  })),
  Clock: jest.fn().mockImplementation(() => ({
    getDelta: jest.fn(() => 0.016),
    getElapsedTime: jest.fn(() => 0)
  }))
}));

describe('Engine', () => {
  let engine: Engine;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    engine = new Engine(container);
  });

  afterEach(() => {
    if (engine) {
      engine.dispose();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      expect(engine).toBeDefined();
      expect(engine.isRunning).toBe(false);
      expect(engine.container).toBe(container);
    });

    test('should initialize with custom configuration', () => {
      const customEngine = new Engine(container, {
        antialias: true,
        alpha: true,
        shadowMap: { enabled: true, type: 1 },
        pixelRatio: 2
      });
      
      expect(customEngine).toBeDefined();
      customEngine.dispose();
    });

    test('should handle invalid container', () => {
      expect(() => new Engine(null as any)).toThrow();
      expect(() => new Engine(undefined as any)).toThrow();
    });

    test('should initialize managers on demand', () => {
      expect(engine.getManager('render')).toBeDefined();
      expect(engine.getManager('scene')).toBeDefined();
      expect(engine.getManager('camera')).toBeDefined();
    });
  });

  describe('Manager Management', () => {
    test('should get existing manager', () => {
      const renderManager = engine.getManager('render');
      expect(renderManager).toBeDefined();
      expect(renderManager.name).toBe('render');
    });

    test('should return null for non-existent manager', () => {
      const nonExistentManager = engine.getManager('nonExistent' as any);
      expect(nonExistentManager).toBeNull();
    });

    test('should initialize manager with dependencies', () => {
      const performanceManager = engine.getManager('performance');
      expect(performanceManager).toBeDefined();
      
      // Performance manager should have monitor dependency
      const monitorManager = engine.getManager('monitor');
      expect(monitorManager).toBeDefined();
    });

    test('should handle manager initialization errors', () => {
      // Mock a manager that throws an error
      const originalGetManager = engine.getManager.bind(engine);
      jest.spyOn(engine, 'getManager').mockImplementation((name) => {
        if (name === 'error') {
          throw new Error('Manager initialization failed');
        }
        return originalGetManager(name);
      });

      expect(() => engine.getManager('error')).toThrow('Manager initialization failed');
    });
  });

  describe('Lifecycle Management', () => {
    test('should start and stop engine', () => {
      engine.start();
      expect(engine.isRunning).toBe(true);
      
      engine.stop();
      expect(engine.isRunning).toBe(false);
    });

    test('should handle multiple start/stop calls', () => {
      engine.start();
      engine.start(); // Should not cause issues
      expect(engine.isRunning).toBe(true);
      
      engine.stop();
      engine.stop(); // Should not cause issues
      expect(engine.isRunning).toBe(false);
    });

    test('should dispose engine properly', () => {
      engine.start();
      engine.dispose();
      
      expect(engine.isRunning).toBe(false);
      expect(engine.container).toBeNull();
    });

    test('should handle dispose on already disposed engine', () => {
      engine.dispose();
      expect(() => engine.dispose()).not.toThrow();
    });
  });

  describe('Rendering', () => {
    test('should render frame when running', () => {
      const renderSpy = jest.spyOn(engine.renderer, 'render');
      
      engine.start();
      engine.render();
      
      expect(renderSpy).toHaveBeenCalled();
    });

    test('should not render when stopped', () => {
      const renderSpy = jest.spyOn(engine.renderer, 'render');
      
      engine.render();
      
      expect(renderSpy).not.toHaveBeenCalled();
    });

    test('should handle render errors gracefully', () => {
      const renderSpy = jest.spyOn(engine.renderer, 'render').mockImplementation(() => {
        throw new Error('Render error');
      });
      
      engine.start();
      expect(() => engine.render()).not.toThrow();
      
      renderSpy.mockRestore();
    });
  });

  describe('Event System', () => {
    test('should emit lifecycle events', () => {
      const startSpy = jest.fn();
      const stopSpy = jest.fn();
      const disposeSpy = jest.fn();
      
      engine.on('start', startSpy);
      engine.on('stop', stopSpy);
      engine.on('dispose', disposeSpy);
      
      engine.start();
      expect(startSpy).toHaveBeenCalled();
      
      engine.stop();
      expect(stopSpy).toHaveBeenCalled();
      
      engine.dispose();
      expect(disposeSpy).toHaveBeenCalled();
    });

    test('should emit manager events', () => {
      const managerSpy = jest.fn();
      engine.on('manager:initialized', managerSpy);
      
      engine.getManager('render');
      expect(managerSpy).toHaveBeenCalledWith('render');
    });

    test('should remove event listeners', () => {
      const spy = jest.fn();
      engine.on('start', spy);
      engine.off('start', spy);
      
      engine.start();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    test('should track performance metrics', () => {
      engine.start();
      
      // Simulate some rendering
      for (let i = 0; i < 10; i++) {
        engine.render();
      }
      
      const performanceManager = engine.getManager('performance');
      expect(performanceManager).toBeDefined();
    });

    test('should handle performance warnings', () => {
      const warningSpy = jest.fn();
      engine.on('performance:warning', warningSpy);
      
      // Mock low performance
      jest.spyOn(engine.clock, 'getDelta').mockReturnValue(0.1); // 100ms frame time
      
      engine.start();
      engine.render();
      
      // Should trigger performance warning
      expect(warningSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle manager errors gracefully', () => {
      const errorSpy = jest.fn();
      engine.on('error', errorSpy);
      
      // Mock manager error
      const originalGetManager = engine.getManager.bind(engine);
      jest.spyOn(engine, 'getManager').mockImplementation((name) => {
        if (name === 'error') {
          throw new Error('Manager error');
        }
        return originalGetManager(name);
      });
      
      expect(() => engine.getManager('error')).toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });

    test('should recover from errors', () => {
      engine.start();
      
      // Simulate error during render
      const renderSpy = jest.spyOn(engine.renderer, 'render').mockImplementationOnce(() => {
        throw new Error('Render error');
      });
      
      expect(() => engine.render()).not.toThrow();
      
      // Should continue working after error
      renderSpy.mockRestore();
      expect(() => engine.render()).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    test('should clean up resources on dispose', () => {
      const disposeSpy = jest.spyOn(engine.renderer, 'dispose');
      
      engine.dispose();
      expect(disposeSpy).toHaveBeenCalled();
    });

    test('should handle memory leaks detection', () => {
      const memoryManager = engine.getManager('memory');
      expect(memoryManager).toBeDefined();
      
      // Simulate memory usage
      const leakSpy = jest.fn();
      engine.on('memory:leak', leakSpy);
      
      // Mock high memory usage
      Object.defineProperty(performance, 'memory', {
        value: { usedJSHeapSize: 1000000000 }, // 1GB
        configurable: true
      });
      
      engine.start();
      engine.render();
      
      // Should trigger memory warning
      expect(leakSpy).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    test('should update configuration', () => {
      const newConfig = {
        antialias: true,
        alpha: true,
        shadowMap: { enabled: true, type: 1 }
      };
      
      engine.updateConfig(newConfig);
      expect(engine.config.antialias).toBe(true);
    });

    test('should validate configuration', () => {
      expect(() => engine.updateConfig({ pixelRatio: -1 })).toThrow();
      expect(() => engine.updateConfig({ pixelRatio: 0 })).toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should work with multiple managers', () => {
      const managers = ['render', 'scene', 'camera', 'light', 'material'];
      
      managers.forEach(managerName => {
        const manager = engine.getManager(managerName as any);
        expect(manager).toBeDefined();
        expect(manager.name).toBe(managerName);
      });
    });

    test('should handle complex scene setup', () => {
      engine.start();
      
      const sceneManager = engine.getManager('scene');
      const cameraManager = engine.getManager('camera');
      const lightManager = engine.getManager('light');
      
      expect(sceneManager).toBeDefined();
      expect(cameraManager).toBeDefined();
      expect(lightManager).toBeDefined();
      
      engine.render();
      expect(engine.isRunning).toBe(true);
    });

    test('should handle dynamic manager loading', async () => {
      const registry = new DynamicManagerRegistry();
      
      // Test dynamic loading
      const manager = await registry.loadManager('render');
      expect(manager).toBeDefined();
    });
  });
}); 