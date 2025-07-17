import { MemoryManager } from '../../src/core/MemoryManager';
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
  }))
}));

describe('MemoryManager', () => {
  let memoryManager: MemoryManager;
  let engine: Engine;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    engine = new Engine(container);
    memoryManager = engine.getManager('memory') as MemoryManager;
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
      expect(memoryManager).toBeDefined();
      expect(memoryManager.name).toBe('memory');
      expect(memoryManager.initialized).toBe(true);
    });

    test('should have memory thresholds', () => {
      expect(memoryManager.thresholds).toBeDefined();
      expect(memoryManager.thresholds.warning).toBe(100 * 1024 * 1024); // 100MB
      expect(memoryManager.thresholds.critical).toBe(500 * 1024 * 1024); // 500MB
    });
  });

  describe('Memory Monitoring', () => {
    test('should get current memory usage', () => {
      const usage = memoryManager.getCurrentUsage();
      expect(usage).toBeGreaterThan(0);
    });

    test('should get memory usage breakdown', () => {
      const breakdown = memoryManager.getMemoryBreakdown();
      expect(breakdown).toHaveProperty('total');
      expect(breakdown).toHaveProperty('geometries');
      expect(breakdown).toHaveProperty('textures');
      expect(breakdown).toHaveProperty('materials');
    });

    test('should track memory growth', () => {
      const growth = memoryManager.getMemoryGrowth();
      expect(growth).toBeDefined();
      expect(growth.rate).toBeDefined();
      expect(growth.trend).toBeDefined();
    });

    test('should detect memory leaks', () => {
      const leaks = memoryManager.detectLeaks();
      expect(leaks).toBeDefined();
      expect(Array.isArray(leaks)).toBe(true);
    });
  });

  describe('Memory Optimization', () => {
    test('should optimize geometries', () => {
      const result = memoryManager.optimizeGeometries();
      expect(result.success).toBeDefined();
      expect(result.optimized).toBeDefined();
    });

    test('should optimize textures', () => {
      const result = memoryManager.optimizeTextures();
      expect(result.success).toBeDefined();
      expect(result.optimized).toBeDefined();
    });

    test('should optimize materials', () => {
      const result = memoryManager.optimizeMaterials();
      expect(result.success).toBeDefined();
      expect(result.optimized).toBeDefined();
    });

    test('should perform garbage collection', () => {
      const beforeUsage = memoryManager.getCurrentUsage();
      memoryManager.performGarbageCollection();
      const afterUsage = memoryManager.getCurrentUsage();
      
      expect(afterUsage).toBeLessThanOrEqual(beforeUsage);
    });
  });

  describe('Memory Cleanup', () => {
    test('should cleanup unused resources', () => {
      const result = memoryManager.cleanupUnusedResources();
      expect(result.success).toBeDefined();
      expect(result.cleaned).toBeDefined();
    });

    test('should dispose specific resources', () => {
      const result = memoryManager.disposeResource('geometry', 'test-geometry');
      expect(result.success).toBeDefined();
    });

    test('should clear all resources', () => {
      const result = memoryManager.clearAllResources();
      expect(result.success).toBeDefined();
      expect(result.cleared).toBeDefined();
    });
  });

  describe('Memory Alerts', () => {
    test('should emit memory warnings', () => {
      const warningSpy = jest.fn();
      memoryManager.on('warning', warningSpy);
      
      // Mock high memory usage
      Object.defineProperty(performance, 'memory', {
        value: { usedJSHeapSize: 150 * 1024 * 1024 }, // 150MB
        configurable: true
      });
      
      memoryManager.checkMemoryUsage();
      expect(warningSpy).toHaveBeenCalled();
    });

    test('should emit critical memory alerts', () => {
      const criticalSpy = jest.fn();
      memoryManager.on('critical', criticalSpy);
      
      // Mock critical memory usage
      Object.defineProperty(performance, 'memory', {
        value: { usedJSHeapSize: 600 * 1024 * 1024 }, // 600MB
        configurable: true
      });
      
      memoryManager.checkMemoryUsage();
      expect(criticalSpy).toHaveBeenCalled();
    });

    test('should emit leak detection alerts', () => {
      const leakSpy = jest.fn();
      memoryManager.on('leak', leakSpy);
      
      // Mock memory leak
      jest.spyOn(memoryManager, 'detectLeaks').mockReturnValue([
        { type: 'geometry', id: 'test', size: 1024 * 1024 }
      ]);
      
      memoryManager.checkMemoryUsage();
      expect(leakSpy).toHaveBeenCalled();
    });
  });

  describe('Memory History', () => {
    test('should track memory history', () => {
      memoryManager.updateHistory();
      const history = memoryManager.getHistory();
      
      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
    });

    test('should limit history size', () => {
      // Add many history entries
      for (let i = 0; i < 1000; i++) {
        memoryManager.updateHistory();
      }
      
      const history = memoryManager.getHistory();
      expect(history.length).toBeLessThanOrEqual(100); // Default limit
    });

    test('should calculate memory trends', () => {
      // Simulate memory data
      for (let i = 0; i < 10; i++) {
        memoryManager.updateHistory();
      }
      
      const trends = memoryManager.getTrends();
      expect(trends).toBeDefined();
      expect(trends.growth).toBeDefined();
      expect(trends.peak).toBeDefined();
    });
  });

  describe('Memory Metrics', () => {
    test('should get comprehensive metrics', () => {
      const metrics = memoryManager.getMetrics();
      
      expect(metrics).toHaveProperty('current');
      expect(metrics).toHaveProperty('peak');
      expect(metrics).toHaveProperty('average');
      expect(metrics).toHaveProperty('growth');
    });

    test('should get memory efficiency score', () => {
      const score = memoryManager.getEfficiencyScore();
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should get resource distribution', () => {
      const distribution = memoryManager.getResourceDistribution();
      expect(distribution).toBeDefined();
      expect(distribution.geometries).toBeDefined();
      expect(distribution.textures).toBeDefined();
      expect(distribution.materials).toBeDefined();
    });
  });

  describe('Memory Configuration', () => {
    test('should update thresholds', () => {
      const newThresholds = {
        warning: 50 * 1024 * 1024,
        critical: 200 * 1024 * 1024
      };
      
      memoryManager.updateThresholds(newThresholds);
      expect(memoryManager.thresholds.warning).toBe(50 * 1024 * 1024);
      expect(memoryManager.thresholds.critical).toBe(200 * 1024 * 1024);
    });

    test('should enable/disable monitoring', () => {
      memoryManager.setMonitoringEnabled(false);
      expect(memoryManager.isMonitoringEnabled()).toBe(false);
      
      memoryManager.setMonitoringEnabled(true);
      expect(memoryManager.isMonitoringEnabled()).toBe(true);
    });

    test('should set cleanup intervals', () => {
      memoryManager.setCleanupInterval(5000); // 5 seconds
      expect(memoryManager.getCleanupInterval()).toBe(5000);
    });
  });

  describe('Memory Analysis', () => {
    test('should analyze memory patterns', () => {
      const patterns = memoryManager.analyzePatterns();
      expect(patterns).toBeDefined();
      expect(patterns.usage).toBeDefined();
      expect(patterns.growth).toBeDefined();
      expect(patterns.leaks).toBeDefined();
    });

    test('should generate memory report', () => {
      const report = memoryManager.generateReport();
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.details).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    test('should predict memory usage', () => {
      const prediction = memoryManager.predictUsage(60); // 60 seconds
      expect(prediction).toBeDefined();
      expect(prediction.estimated).toBeDefined();
      expect(prediction.confidence).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    test('should work with engine lifecycle', () => {
      engine.start();
      expect(memoryManager.isMonitoringEnabled()).toBe(true);
      
      engine.stop();
      expect(memoryManager.isMonitoringEnabled()).toBe(false);
    });

    test('should handle engine disposal', () => {
      const disposeSpy = jest.spyOn(memoryManager, 'dispose');
      
      engine.dispose();
      expect(disposeSpy).toHaveBeenCalled();
    });

    test('should integrate with other managers', () => {
      const performanceManager = engine.getManager('performance');
      expect(performanceManager).toBeDefined();
      
      // Memory manager should work with performance manager
      const memoryUsage = memoryManager.getCurrentUsage();
      expect(memoryUsage).toBeGreaterThan(0);
    });
  });
}); 