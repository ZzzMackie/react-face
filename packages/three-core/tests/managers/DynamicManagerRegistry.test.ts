import { DynamicManagerRegistry } from '../../src/core/DynamicManagerRegistry';

// Mocks for core managers used by DynamicManagerRegistry
jest.mock('../../src/core/RenderManager', () => ({
  __esModule: true,
  default: class RenderManager {
    type = 'render';
    name = 'render';
    initialized = true;
    init = jest.fn();
    update = jest.fn();
    dispose = jest.fn();
  }
}));

jest.mock('../../src/core/SceneManager', () => ({
  __esModule: true,
  default: class SceneManager {
    type = 'scene';
    name = 'scene';
    initialized = true;
    init = jest.fn();
    update = jest.fn();
    dispose = jest.fn();
  }
}));

jest.mock('../../src/core/CameraManager', () => ({
  __esModule: true,
  default: class CameraManager {
    type = 'camera';
    name = 'camera';
    initialized = true;
    init = jest.fn();
    update = jest.fn();
    dispose = jest.fn();
  }
}));

jest.mock('../../src/core/LightManager', () => ({
  __esModule: true,
  default: class LightManager {
    type = 'light';
    name = 'light';
    initialized = true;
    init = jest.fn();
    update = jest.fn();
    dispose = jest.fn();
  }
}));

jest.mock('../../src/core/PerformanceManager', () => ({
  __esModule: true,
  default: class PerformanceManager {
    type = 'performance';
    name = 'performance';
    initialized = true;
    init = jest.fn();
    update = jest.fn();
    dispose = jest.fn();
  }
}));

jest.mock('../../src/core/MemoryManager', () => ({
  __esModule: true,
  default: class MemoryManager {
    type = 'memory';
    name = 'memory';
    initialized = true;
    init = jest.fn();
    update = jest.fn();
    dispose = jest.fn();
  }
}));

describe('DynamicManagerRegistry', () => {
  let registry: DynamicManagerRegistry;

  beforeEach(() => {
    registry = DynamicManagerRegistry.getInstance();
  });

  describe('Manager Loading', () => {
    test('should load render manager', async () => {
      const manager = await registry.createManager('renderer', {} as any);
      expect(manager).toBeDefined();
      expect(manager.name).toBe('render');
    });

    test('should load scene manager', async () => {
      const manager = await registry.createManager('scene', {} as any);
      expect(manager).toBeDefined();
      expect(manager.name).toBe('scene');
    });

    test('should load camera manager', async () => {
      const manager = await registry.createManager('camera', {} as any);
      expect(manager).toBeDefined();
      expect(manager.name).toBe('camera');
    });

    test('should handle loading errors', async () => {
      // Mock failed import
      jest.spyOn(registry, 'loadManagerModule').mockRejectedValueOnce(new Error('Load failed'));
      
      await expect(registry.createManager('invalid' as any, {} as any)).rejects.toThrow('Load failed');
    });

    test('should cache loaded managers', async () => {
      const manager1 = await registry.createManager('renderer', {} as any);
      const manager2 = await registry.createManager('renderer', {} as any);
      
      expect(manager1).toBeDefined();
      expect(manager2).toBeDefined();
    });
  });

  describe('Manager Registration', () => {
    test('should get manager info', () => {
      const info = registry.getManagerInfo('scene');
      expect(info).toBeDefined();
      expect(info?.type).toBe('scene');
    });

    test('should get all manager info', () => {
      const allInfo = registry.getAllManagerInfo();
      expect(allInfo).toBeDefined();
      expect(Array.isArray(allInfo)).toBe(true);
    });

    test('should get managers by category', () => {
      const coreManagers = registry.getManagersByCategory('core');
      expect(coreManagers).toBeDefined();
      expect(Array.isArray(coreManagers)).toBe(true);
    });
  });

  describe('Batch Loading', () => {
    test('should preload multiple managers', async () => {
      await registry.preloadManagers(['scene', 'camera', 'renderer']);
      
      const loadedManagers = registry.getLoadedManagers();
      expect(loadedManagers).toContain('scene');
      expect(loadedManagers).toContain('camera');
      expect(loadedManagers).toContain('renderer');
    });
  });

  describe('Loading States', () => {
    test('should track loading state', async () => {
      const loadingManagers = registry.getLoadingManagers();
      expect(Array.isArray(loadingManagers)).toBe(true);
    });
  });

  describe('Dependencies', () => {
    test('should get manager dependencies', () => {
      const dependencies = registry.getDependencies('controls');
      expect(dependencies).toContain('camera');
    });

    test('should calculate bundle size', () => {
      const size = registry.calculateBundleSize(['scene', 'camera', 'renderer']);
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('Configuration', () => {
    test('should get recommended configs', () => {
      const configs = registry.getRecommendedConfigs();
      expect(configs).toBeDefined();
      expect(Array.isArray(configs)).toBe(true);
    });
  });

  describe('Memory Management', () => {
    test('should cleanup unused managers', () => {
      registry.cleanupUnusedManagers(['scene', 'camera']);
      // Should not throw
      expect(() => registry.cleanupUnusedManagers(['scene'])).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should work with engine integration', async () => {
      // Simulate engine integration
      const engine = { container: document.createElement('div') };
      const manager = await registry.createManager('scene', engine);
      
      expect(manager).toBeDefined();
      expect(manager.initialized).toBe(true);
    });

    test('should handle concurrent access', async () => {
      const promises = Array(3).fill(null).map(() => registry.createManager('scene', {} as any));
      const managers = await Promise.all(promises);
      
      expect(managers).toHaveLength(3);
      managers.forEach(manager => {
        expect(manager).toBeDefined();
      });
    });
  });
}); 