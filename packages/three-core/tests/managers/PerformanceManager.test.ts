import { PerformanceManager } from '../../src/core/PerformanceManager';
import { Engine } from '../../src/core/Engine';

// Mocks for three/examples loaders
jest.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  __esModule: true,
  default: class GLTFLoader {
    load = jest.fn();
    setPath = jest.fn().mockReturnThis();
    setResourcePath = jest.fn().mockReturnThis();
    setDRACOLoader = jest.fn().mockReturnThis();
    setKTX2Loader = jest.fn().mockReturnThis();
    setMeshoptDecoder = jest.fn().mockReturnThis();
    register = jest.fn();
    unregister = jest.fn();
    parse = jest.fn();
  }
}));

jest.mock('three/examples/jsm/loaders/DRACOLoader.js', () => ({
  __esModule: true,
  default: class DRACOLoader {
    load = jest.fn();
    setPath = jest.fn().mockReturnThis();
    setWorkerLimit = jest.fn().mockReturnThis();
    setDecoderConfig = jest.fn().mockReturnThis();
    setDecoderPath = jest.fn().mockReturnThis();
    setWorkerPath = jest.fn().mockReturnThis();
    dispose = jest.fn();
  }
}));

jest.mock('three/examples/jsm/loaders/FBXLoader.js', () => ({
  __esModule: true,
  default: class FBXLoader {
    load = jest.fn();
    setPath = jest.fn().mockReturnThis();
    setResourcePath = jest.fn().mockReturnThis();
    parse = jest.fn();
  }
}));

jest.mock('three/examples/jsm/loaders/OBJLoader.js', () => ({
  __esModule: true,
  default: class OBJLoader {
    load = jest.fn();
    setPath = jest.fn().mockReturnThis();
    setResourcePath = jest.fn().mockReturnThis();
    parse = jest.fn();
  }
}));

// 模拟 Three.js
jest.mock('three', () => ({
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    setClearColor: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    domElement: document.createElement('canvas'),
    info: {
      render: { calls: 0, triangles: 0, points: 0, lines: 0 },
      memory: { geometries: 0, textures: 0 }
    }
  })),
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    children: []
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
    updateMatrix: jest.fn()
  })),
  Clock: jest.fn().mockImplementation(() => ({
    getDelta: jest.fn(() => 0.016),
    getElapsedTime: jest.fn(() => 0)
  }))
}));

describe('PerformanceManager', () => {
  let performanceManager: PerformanceManager;
  let engine: Engine;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    engine = new Engine(container);
    performanceManager = engine.getManager('performance') as PerformanceManager;
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
    test('should initialize with default settings', () => {
      expect(performanceManager).toBeDefined();
      expect(performanceManager.name).toBe('performance');
      expect(performanceManager.initialized).toBe(true);
    });

    test('should have performance thresholds', () => {
      expect(performanceManager.thresholds).toBeDefined();
      expect(performanceManager.thresholds.frameTime).toBe(16.67); // 60 FPS
      expect(performanceManager.thresholds.memoryUsage).toBe(100 * 1024 * 1024); // 100MB
    });
  });

  describe('Performance Monitoring', () => {
    test('should track frame time', () => {
      const frameTime = performanceManager.getFrameTime();
      expect(frameTime).toBeGreaterThan(0);
    });

    test('should track FPS', () => {
      const fps = performanceManager.getFPS();
      expect(fps).toBeGreaterThan(0);
      expect(fps).toBeLessThanOrEqual(60);
    });

    test('should track memory usage', () => {
      const memoryUsage = performanceManager.getMemoryUsage();
      expect(memoryUsage).toBeGreaterThan(0);
    });

    test('should track render calls', () => {
      const renderCalls = performanceManager.getRenderCalls();
      expect(renderCalls).toBeGreaterThanOrEqual(0);
    });

    test('should track triangle count', () => {
      const triangles = performanceManager.getTriangleCount();
      expect(triangles).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Analysis', () => {
    test('should detect performance issues', () => {
      // Mock poor performance
      jest.spyOn(performanceManager, 'getFrameTime').mockReturnValue(50); // 20 FPS
      
      const issues = performanceManager.analyzePerformance();
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('frameTime');
    });

    test('should detect memory issues', () => {
      // Mock high memory usage
      Object.defineProperty(performance, 'memory', {
        value: { usedJSHeapSize: 200 * 1024 * 1024 }, // 200MB
        configurable: true
      });
      
      const issues = performanceManager.analyzePerformance();
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('memoryUsage');
    });

    test('should detect multiple issues', () => {
      // Mock multiple issues
      jest.spyOn(performanceManager, 'getFrameTime').mockReturnValue(50);
      Object.defineProperty(performance, 'memory', {
        value: { usedJSHeapSize: 200 * 1024 * 1024 },
        configurable: true
      });
      
      const issues = performanceManager.analyzePerformance();
      expect(issues.length).toBeGreaterThan(1);
    });
  });

  describe('Performance Optimization', () => {
    test('should suggest optimizations', () => {
      const suggestions = performanceManager.getOptimizationSuggestions();
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    test('should apply automatic optimizations', () => {
      const result = performanceManager.applyOptimizations();
      expect(result.success).toBeDefined();
      expect(result.applied).toBeDefined();
    });

    test('should optimize render calls', () => {
      const originalCalls = performanceManager.getRenderCalls();
      performanceManager.optimizeRenderCalls();
      const optimizedCalls = performanceManager.getRenderCalls();
      
      expect(optimizedCalls).toBeLessThanOrEqual(originalCalls);
    });

    test('should optimize memory usage', () => {
      const originalMemory = performanceManager.getMemoryUsage();
      performanceManager.optimizeMemoryUsage();
      const optimizedMemory = performanceManager.getMemoryUsage();
      
      expect(optimizedMemory).toBeLessThanOrEqual(originalMemory);
    });
  });

  describe('Performance History', () => {
    test('should track performance history', () => {
      performanceManager.updateHistory();
      const history = performanceManager.getHistory();
      
      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
    });

    test('should limit history size', () => {
      // Add many history entries
      for (let i = 0; i < 1000; i++) {
        performanceManager.updateHistory();
      }
      
      const history = performanceManager.getHistory();
      expect(history.length).toBeLessThanOrEqual(100); // Default limit
    });

    test('should calculate performance trends', () => {
      // Simulate performance data
      for (let i = 0; i < 10; i++) {
        performanceManager.updateHistory();
      }
      
      const trends = performanceManager.getTrends();
      expect(trends).toBeDefined();
      expect(trends.fps).toBeDefined();
      expect(trends.memory).toBeDefined();
    });
  });

  describe('Performance Alerts', () => {
    test('should emit performance warnings', () => {
      const warningSpy = jest.fn();
      performanceManager.on('warning', warningSpy);
      
      // Mock poor performance
      jest.spyOn(performanceManager, 'getFrameTime').mockReturnValue(50);
      performanceManager.checkPerformance();
      
      expect(warningSpy).toHaveBeenCalled();
    });

    test('should emit critical performance alerts', () => {
      const criticalSpy = jest.fn();
      performanceManager.on('critical', criticalSpy);
      
      // Mock very poor performance
      jest.spyOn(performanceManager, 'getFrameTime').mockReturnValue(100);
      performanceManager.checkPerformance();
      
      expect(criticalSpy).toHaveBeenCalled();
    });

    test('should emit recovery notifications', () => {
      const recoverySpy = jest.fn();
      performanceManager.on('recovery', recoverySpy);
      
      // Mock performance recovery
      jest.spyOn(performanceManager, 'getFrameTime')
        .mockReturnValueOnce(50) // Poor performance
        .mockReturnValueOnce(16); // Good performance
      
      performanceManager.checkPerformance();
      performanceManager.checkPerformance();
      
      expect(recoverySpy).toHaveBeenCalled();
    });
  });

  describe('Performance Metrics', () => {
    test('should get comprehensive metrics', () => {
      const metrics = performanceManager.getMetrics();
      
      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('frameTime');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('renderCalls');
      expect(metrics).toHaveProperty('triangleCount');
    });

    test('should get performance score', () => {
      const score = performanceManager.getPerformanceScore();
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should get bottleneck analysis', () => {
      const bottlenecks = performanceManager.getBottlenecks();
      expect(bottlenecks).toBeDefined();
      expect(Array.isArray(bottlenecks)).toBe(true);
    });
  });

  describe('Performance Configuration', () => {
    test('should update thresholds', () => {
      const newThresholds = {
        frameTime: 20,
        memoryUsage: 50 * 1024 * 1024
      };
      
      performanceManager.updateThresholds(newThresholds);
      expect(performanceManager.thresholds.frameTime).toBe(20);
      expect(performanceManager.thresholds.memoryUsage).toBe(50 * 1024 * 1024);
    });

    test('should enable/disable monitoring', () => {
      performanceManager.setMonitoringEnabled(false);
      expect(performanceManager.isMonitoringEnabled()).toBe(false);
      
      performanceManager.setMonitoringEnabled(true);
      expect(performanceManager.isMonitoringEnabled()).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    test('should work with engine lifecycle', () => {
      engine.start();
      expect(performanceManager.isMonitoringEnabled()).toBe(true);
      
      engine.stop();
      expect(performanceManager.isMonitoringEnabled()).toBe(false);
    });

    test('should handle engine errors gracefully', () => {
      // Simulate engine error
      const errorSpy = jest.fn();
      performanceManager.on('error', errorSpy);
      
      // Mock renderer error
      jest.spyOn(engine.renderer, 'render').mockImplementation(() => {
        throw new Error('Render error');
      });
      
      engine.start();
      engine.render();
      
      expect(errorSpy).toHaveBeenCalled();
    });
  });
}); 