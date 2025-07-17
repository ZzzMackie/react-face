import { Engine } from '../../src/core/Engine';

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

describe('Performance Benchmarks', () => {
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

  describe('Engine Initialization Performance', () => {
    test('should initialize within acceptable time', () => {
      const startTime = performance.now();
      
      const newEngine = new Engine(container);
      
      const endTime = performance.now();
      const initTime = endTime - startTime;
      
      expect(initTime).toBeLessThan(100); // Should initialize in under 100ms
      newEngine.dispose();
    });

    test('should handle multiple initializations efficiently', () => {
      const engines: Engine[] = [];
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        engines.push(new Engine(container));
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(500); // Should handle 10 initializations in under 500ms
      
      engines.forEach(e => e.dispose());
    });
  });

  describe('Rendering Performance', () => {
    test('should maintain 60 FPS under normal load', () => {
      engine.start();
      
      const frameTimes: number[] = [];
      const startTime = performance.now();
      
      for (let i = 0; i < 60; i++) {
        const frameStart = performance.now();
        engine.render();
        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      
      expect(averageFrameTime).toBeLessThan(16.67); // 60 FPS = 16.67ms per frame
      expect(totalTime).toBeLessThan(1000); // Should complete 60 frames in under 1 second
    });

    test('should handle high-frequency rendering', () => {
      engine.start();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        engine.render();
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(5000); // Should handle 1000 renders in under 5 seconds
    });
  });

  describe('Manager Performance', () => {
    test('should initialize managers efficiently', () => {
      const managers = [
        'render', 'scene', 'camera', 'light', 'material',
        'geometry', 'animation', 'performance', 'memory'
      ];
      
      const startTime = performance.now();
      
      managers.forEach(managerName => {
        engine.getManager(managerName as any);
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(200); // Should initialize all managers in under 200ms
    });

    test('should handle manager updates efficiently', () => {
      engine.start();
      
      const managers = [
        'render', 'scene', 'camera', 'light', 'material'
      ].map(name => engine.getManager(name as any));
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        managers.forEach(manager => manager.update());
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(100); // Should update managers efficiently
    });
  });

  describe('Memory Performance', () => {
    test('should maintain stable memory usage', () => {
      engine.start();
      
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      const memorySamples: number[] = [initialMemory];
      
      for (let i = 0; i < 100; i++) {
        engine.render();
        memorySamples.push(performance.memory?.usedJSHeapSize || 0);
      }
      
      const maxMemory = Math.max(...memorySamples);
      const minMemory = Math.min(...memorySamples);
      const memoryGrowth = maxMemory - minMemory;
      
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Should not grow more than 50MB
    });

    test('should handle memory cleanup efficiently', () => {
      engine.start();
      
      const memoryManager = engine.getManager('memory');
      const startTime = performance.now();
      
      memoryManager.cleanupUnusedResources();
      
      const endTime = performance.now();
      const cleanupTime = endTime - startTime;
      
      expect(cleanupTime).toBeLessThan(50); // Should cleanup in under 50ms
    });
  });

  describe('Event System Performance', () => {
    test('should handle high-frequency events efficiently', () => {
      engine.start();
      
      const eventCount = 1000;
      let receivedEvents = 0;
      
      engine.on('test', () => receivedEvents++);
      
      const startTime = performance.now();
      
      for (let i = 0; i < eventCount; i++) {
        engine.emit('test');
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(receivedEvents).toBe(eventCount);
      expect(totalTime).toBeLessThan(100); // Should handle 1000 events in under 100ms
    });

    test('should handle multiple event listeners efficiently', () => {
      engine.start();
      
      const listenerCount = 100;
      let totalEvents = 0;
      
      for (let i = 0; i < listenerCount; i++) {
        engine.on('test', () => totalEvents++);
      }
      
      const startTime = performance.now();
      
      engine.emit('test');
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalEvents).toBe(listenerCount);
      expect(totalTime).toBeLessThan(10); // Should handle 100 listeners in under 10ms
    });
  });

  describe('Configuration Performance', () => {
    test('should update configuration efficiently', () => {
      const configs = [
        { antialias: true },
        { alpha: true },
        { shadowMap: { enabled: true } },
        { pixelRatio: 2 }
      ];
      
      const startTime = performance.now();
      
      configs.forEach(config => {
        engine.updateConfig(config);
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(50); // Should update configs efficiently
    });
  });

  describe('Stress Testing', () => {
    test('should handle continuous operation', () => {
      engine.start();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 10000; i++) {
        engine.render();
        
        if (i % 1000 === 0) {
          // Simulate some manager operations
          engine.getManager('performance').update();
          engine.getManager('memory').update();
        }
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(30000); // Should handle 10k operations in under 30 seconds
      expect(engine.isRunning).toBe(true);
    });

    test('should handle rapid configuration changes', () => {
      engine.start();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        engine.updateConfig({
          antialias: i % 2 === 0,
          alpha: i % 3 === 0,
          pixelRatio: 1 + (i % 3)
        });
        engine.render();
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(10000); // Should handle rapid changes efficiently
    });
  });

  describe('Memory Leak Detection', () => {
    test('should not leak memory during operation', () => {
      engine.start();
      
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      for (let i = 0; i < 1000; i++) {
        engine.render();
        
        // Simulate manager operations
        engine.getManager('performance').update();
        engine.getManager('memory').update();
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryGrowth = finalMemory - initialMemory;
      
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Should not grow more than 10MB
    });

    test('should cleanup properly on dispose', () => {
      engine.start();
      
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      for (let i = 0; i < 100; i++) {
        engine.render();
      }
      
      engine.dispose();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryGrowth = finalMemory - initialMemory;
      
      expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024); // Should cleanup properly
    });
  });
}); 