import { Engine } from '../../src/core/Engine';
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
    },
    info: {
      render: { calls: 0, triangles: 0, points: 0, lines: 0 },
      memory: { geometries: 0, textures: 0 }
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

describe('Engine Integration Tests', () => {
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

  describe('Full Engine Lifecycle', () => {
    test('should complete full lifecycle without errors', () => {
      // Initialize
      expect(engine).toBeDefined();
      expect(engine.isRunning).toBe(false);

      // Start
      engine.start();
      expect(engine.isRunning).toBe(true);

      // Render
      expect(() => engine.render()).not.toThrow();

      // Stop
      engine.stop();
      expect(engine.isRunning).toBe(false);

      // Dispose
      expect(() => engine.dispose()).not.toThrow();
    });

    test('should handle multiple start/stop cycles', () => {
      for (let i = 0; i < 5; i++) {
        engine.start();
        expect(engine.isRunning).toBe(true);
        
        engine.render();
        
        engine.stop();
        expect(engine.isRunning).toBe(false);
      }
    });
  });

  describe('Manager Integration', () => {
    test('should initialize all core managers', () => {
      const coreManagers = ['render', 'scene', 'camera', 'light'];
      
      coreManagers.forEach(managerName => {
        const manager = engine.getManager(managerName as any);
        expect(manager).toBeDefined();
        expect(manager.name).toBe(managerName);
        expect(manager.initialized).toBe(true);
      });
    });

    test('should handle manager dependencies correctly', () => {
      // Performance manager should have monitor dependency
      const performanceManager = engine.getManager('performance');
      expect(performanceManager).toBeDefined();
      
      const monitorManager = engine.getManager('monitor');
      expect(monitorManager).toBeDefined();
    });

    test('should handle manager communication', () => {
      const renderManager = engine.getManager('render');
      const sceneManager = engine.getManager('scene');
      
      expect(renderManager).toBeDefined();
      expect(sceneManager).toBeDefined();
      
      // Managers should be able to communicate
      expect(() => renderManager.update()).not.toThrow();
      expect(() => sceneManager.update()).not.toThrow();
    });
  });

  describe('Performance Integration', () => {
    test('should monitor performance during rendering', () => {
      engine.start();
      
      const performanceManager = engine.getManager('performance');
      expect(performanceManager).toBeDefined();
      
      // Render multiple frames
      for (let i = 0; i < 10; i++) {
        engine.render();
      }
      
      // Performance should be tracked
      const metrics = performanceManager.getMetrics();
      expect(metrics).toBeDefined();
    });

    test('should handle performance optimization', () => {
      engine.start();
      
      const performanceManager = engine.getManager('performance');
      const optimizationManager = engine.getManager('optimization');
      
      expect(performanceManager).toBeDefined();
      expect(optimizationManager).toBeDefined();
      
      // Apply optimizations
      const result = optimizationManager.applyOptimizations();
      expect(result.success).toBeDefined();
    });
  });

  describe('Memory Integration', () => {
    test('should manage memory during operation', () => {
      engine.start();
      
      const memoryManager = engine.getManager('memory');
      expect(memoryManager).toBeDefined();
      
      // Perform some operations
      for (let i = 0; i < 5; i++) {
        engine.render();
      }
      
      // Memory should be tracked
      const usage = memoryManager.getCurrentUsage();
      expect(usage).toBeGreaterThan(0);
    });

    test('should handle memory cleanup', () => {
      engine.start();
      
      const memoryManager = engine.getManager('memory');
      expect(memoryManager).toBeDefined();
      
      // Perform cleanup
      const result = memoryManager.cleanupUnusedResources();
      expect(result.success).toBeDefined();
    });
  });

  describe('Error Recovery Integration', () => {
    test('should recover from manager errors', () => {
      engine.start();
      
      const recoveryManager = engine.getManager('recovery');
      expect(recoveryManager).toBeDefined();
      
      // Simulate error
      const errorManager = engine.getManager('error');
      expect(errorManager).toBeDefined();
      
      // Should handle errors gracefully
      expect(() => engine.render()).not.toThrow();
    });

    test('should handle renderer errors', () => {
      engine.start();
      
      // Mock renderer error
      jest.spyOn(engine.renderer, 'render').mockImplementationOnce(() => {
        throw new Error('Render error');
      });
      
      // Should recover gracefully
      expect(() => engine.render()).not.toThrow();
      
      // Should continue working
      expect(() => engine.render()).not.toThrow();
    });
  });

  describe('Dynamic Loading Integration', () => {
    test('should load managers dynamically', async () => {
      const registry = new DynamicManagerRegistry();
      
      // Test dynamic loading
      const manager = await registry.loadManager('render');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('render');
    });

    test('should handle dynamic loading errors', async () => {
      const registry = new DynamicManagerRegistry();
      
      // Mock loading error
      jest.spyOn(registry, 'loadManager').mockRejectedValueOnce(new Error('Load failed'));
      
      await expect(registry.loadManager('invalid')).rejects.toThrow('Load failed');
    });
  });

  describe('Event System Integration', () => {
    test('should emit lifecycle events', () => {
      const events: string[] = [];
      
      engine.on('start', () => events.push('start'));
      engine.on('stop', () => events.push('stop'));
      engine.on('dispose', () => events.push('dispose'));
      
      engine.start();
      engine.stop();
      engine.dispose();
      
      expect(events).toContain('start');
      expect(events).toContain('stop');
      expect(events).toContain('dispose');
    });

    test('should emit manager events', () => {
      const managerEvents: string[] = [];
      
      engine.on('manager:initialized', (name) => managerEvents.push(name));
      
      // Initialize managers
      engine.getManager('render');
      engine.getManager('scene');
      
      expect(managerEvents).toContain('render');
      expect(managerEvents).toContain('scene');
    });

    test('should emit performance events', () => {
      const performanceEvents: string[] = [];
      
      engine.on('performance:warning', () => performanceEvents.push('warning'));
      engine.on('performance:critical', () => performanceEvents.push('critical'));
      
      engine.start();
      
      // Mock poor performance
      jest.spyOn(engine.clock, 'getDelta').mockReturnValue(0.1);
      engine.render();
      
      expect(performanceEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Integration', () => {
    test('should apply configuration changes', () => {
      const newConfig = {
        antialias: true,
        alpha: true,
        shadowMap: { enabled: true, type: 1 }
      };
      
      engine.updateConfig(newConfig);
      expect(engine.config.antialias).toBe(true);
      expect(engine.config.alpha).toBe(true);
    });

    test('should handle invalid configuration', () => {
      expect(() => engine.updateConfig({ pixelRatio: -1 })).toThrow();
    });
  });

  describe('Stress Testing', () => {
    test('should handle rapid start/stop cycles', () => {
      for (let i = 0; i < 100; i++) {
        engine.start();
        engine.render();
        engine.stop();
      }
      
      expect(engine.isRunning).toBe(false);
    });

    test('should handle continuous rendering', () => {
      engine.start();
      
      for (let i = 0; i < 1000; i++) {
        engine.render();
      }
      
      expect(engine.isRunning).toBe(true);
    });

    test('should handle memory pressure', () => {
      engine.start();
      
      // Simulate memory pressure
      Object.defineProperty(performance, 'memory', {
        value: { usedJSHeapSize: 800 * 1024 * 1024 }, // 800MB
        configurable: true
      });
      
      for (let i = 0; i < 100; i++) {
        engine.render();
      }
      
      expect(engine.isRunning).toBe(true);
    });
  });

  describe('Multi-Manager Integration', () => {
    test('should coordinate multiple managers', () => {
      engine.start();
      
      const managers = [
        'render', 'scene', 'camera', 'light', 'material',
        'geometry', 'animation', 'performance', 'memory'
      ];
      
      managers.forEach(managerName => {
        const manager = engine.getManager(managerName as any);
        expect(manager).toBeDefined();
        expect(manager.initialized).toBe(true);
      });
      
      // All managers should work together
      expect(() => engine.render()).not.toThrow();
    });

    test('should handle manager conflicts', () => {
      engine.start();
      
      // Simulate conflicting manager operations
      const renderManager = engine.getManager('render');
      const sceneManager = engine.getManager('scene');
      
      expect(() => {
        renderManager.update();
        sceneManager.update();
        engine.render();
      }).not.toThrow();
    });
  });
}); 