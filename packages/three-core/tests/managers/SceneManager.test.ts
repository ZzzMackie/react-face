import { SceneManager } from '../../src/core/SceneManager';
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
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
    background: null,
    fog: null,
    traverse: jest.fn()
  })),
  Color: jest.fn().mockImplementation(() => ({
    setHex: jest.fn(),
    setRGB: jest.fn(),
    getHex: jest.fn(() => 0x000000)
  })),
  Fog: jest.fn().mockImplementation(() => ({
    color: { setHex: jest.fn() },
    near: 1,
    far: 1000
  }))
}));

describe('SceneManager', () => {
  let sceneManager: SceneManager;
  let engine: Engine;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    engine = new Engine(container);
    sceneManager = engine.getManager('scene') as SceneManager;
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
      expect(sceneManager).toBeDefined();
      expect(sceneManager.name).toBe('scene');
      expect(sceneManager.initialized).toBe(true);
    });

    test('should have scene instance', () => {
      expect(sceneManager.scene).toBeDefined();
      expect(sceneManager.scene.children).toBeDefined();
    });

    test('should have default scene settings', () => {
      expect(sceneManager.settings).toBeDefined();
      expect(sceneManager.settings.background).toBeDefined();
      expect(sceneManager.settings.fog).toBeDefined();
    });
  });

  describe('Scene Management', () => {
    test('should add object to scene', () => {
      const mockObject = { name: 'test-object' };
      const addSpy = jest.spyOn(sceneManager.scene, 'add');
      
      sceneManager.addObject(mockObject);
      
      expect(addSpy).toHaveBeenCalledWith(mockObject);
    });

    test('should remove object from scene', () => {
      const mockObject = { name: 'test-object' };
      const removeSpy = jest.spyOn(sceneManager.scene, 'remove');
      
      sceneManager.removeObject(mockObject);
      
      expect(removeSpy).toHaveBeenCalledWith(mockObject);
    });

    test('should clear scene', () => {
      const clearSpy = jest.spyOn(sceneManager.scene, 'children', 'get').mockReturnValue([]);
      
      sceneManager.clearScene();
      
      expect(clearSpy).toHaveBeenCalled();
    });

    test('should get scene objects', () => {
      const objects = sceneManager.getObjects();
      expect(objects).toBeDefined();
      expect(Array.isArray(objects)).toBe(true);
    });
  });

  describe('Scene Properties', () => {
    test('should set background color', () => {
      const setBackgroundSpy = jest.spyOn(sceneManager.scene, 'background', 'set');
      
      sceneManager.setBackground(0x000000);
      
      expect(setBackgroundSpy).toHaveBeenCalled();
    });

    test('should set fog', () => {
      const fog = { color: 0xcccccc, near: 1, far: 1000 };
      
      sceneManager.setFog(fog);
      
      expect(sceneManager.scene.fog).toBeDefined();
    });

    test('should remove fog', () => {
      sceneManager.removeFog();
      
      expect(sceneManager.scene.fog).toBeNull();
    });

    test('should set scene properties', () => {
      const properties = {
        background: 0x000000,
        fog: { color: 0xcccccc, near: 1, far: 1000 }
      };
      
      sceneManager.setProperties(properties);
      
      expect(sceneManager.scene.background).toBeDefined();
      expect(sceneManager.scene.fog).toBeDefined();
    });
  });

  describe('Object Management', () => {
    test('should find object by name', () => {
      const mockObject = { name: 'test-object' };
      sceneManager.addObject(mockObject);
      
      const found = sceneManager.findObjectByName('test-object');
      expect(found).toBe(mockObject);
    });

    test('should find objects by type', () => {
      const mockMesh = { type: 'Mesh', name: 'test-mesh' };
      const mockLight = { type: 'Light', name: 'test-light' };
      
      sceneManager.addObject(mockMesh);
      sceneManager.addObject(mockLight);
      
      const meshes = sceneManager.findObjectsByType('Mesh');
      expect(meshes).toContain(mockMesh);
    });

    test('should get object count', () => {
      const count = sceneManager.getObjectCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should get scene hierarchy', () => {
      const hierarchy = sceneManager.getHierarchy();
      expect(hierarchy).toBeDefined();
      expect(hierarchy.children).toBeDefined();
    });
  });

  describe('Scene Traversal', () => {
    test('should traverse scene objects', () => {
      const traverseSpy = jest.spyOn(sceneManager.scene, 'traverse');
      
      sceneManager.traverse((object) => {
        // Traversal callback
      });
      
      expect(traverseSpy).toHaveBeenCalled();
    });

    test('should find objects with callback', () => {
      const mockObject = { name: 'test-object', visible: true };
      sceneManager.addObject(mockObject);
      
      const found = sceneManager.findObjects((obj) => obj.name === 'test-object');
      expect(found).toContain(mockObject);
    });

    test('should apply to all objects', () => {
      const mockObject = { name: 'test-object', visible: true };
      sceneManager.addObject(mockObject);
      
      sceneManager.applyToAllObjects((obj) => {
        obj.visible = false;
      });
      
      expect(mockObject.visible).toBe(false);
    });
  });

  describe('Scene Events', () => {
    test('should emit object added event', () => {
      const addSpy = jest.fn();
      sceneManager.on('object:added', addSpy);
      
      const mockObject = { name: 'test-object' };
      sceneManager.addObject(mockObject);
      
      expect(addSpy).toHaveBeenCalledWith(mockObject);
    });

    test('should emit object removed event', () => {
      const removeSpy = jest.fn();
      sceneManager.on('object:removed', removeSpy);
      
      const mockObject = { name: 'test-object' };
      sceneManager.removeObject(mockObject);
      
      expect(removeSpy).toHaveBeenCalledWith(mockObject);
    });

    test('should emit scene cleared event', () => {
      const clearSpy = jest.fn();
      sceneManager.on('scene:cleared', clearSpy);
      
      sceneManager.clearScene();
      
      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('Scene Statistics', () => {
    test('should get scene statistics', () => {
      const stats = sceneManager.getStatistics();
      expect(stats).toBeDefined();
      expect(stats.totalObjects).toBeDefined();
      expect(stats.objectTypes).toBeDefined();
    });

    test('should get object type distribution', () => {
      const distribution = sceneManager.getObjectTypeDistribution();
      expect(distribution).toBeDefined();
      expect(typeof distribution).toBe('object');
    });

    test('should get scene memory usage', () => {
      const memoryUsage = sceneManager.getMemoryUsage();
      expect(memoryUsage).toBeDefined();
      expect(memoryUsage.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Scene Optimization', () => {
    test('should optimize scene', () => {
      const result = sceneManager.optimizeScene();
      expect(result.success).toBeDefined();
      expect(result.optimizations).toBeDefined();
    });

    test('should cull invisible objects', () => {
      const result = sceneManager.cullInvisibleObjects();
      expect(result.success).toBeDefined();
      expect(result.culled).toBeDefined();
    });

    test('should merge geometries', () => {
      const result = sceneManager.mergeGeometries();
      expect(result.success).toBeDefined();
      expect(result.merged).toBeDefined();
    });
  });

  describe('Scene Serialization', () => {
    test('should serialize scene', () => {
      const serialized = sceneManager.serialize();
      expect(serialized).toBeDefined();
      expect(serialized.objects).toBeDefined();
      expect(serialized.settings).toBeDefined();
    });

    test('should deserialize scene', () => {
      const serialized = {
        objects: [],
        settings: { background: 0x000000 }
      };
      
      const result = sceneManager.deserialize(serialized);
      expect(result.success).toBeDefined();
    });

    test('should export scene', () => {
      const exported = sceneManager.exportScene();
      expect(exported).toBeDefined();
      expect(exported.format).toBeDefined();
      expect(exported.data).toBeDefined();
    });
  });

  describe('Scene Validation', () => {
    test('should validate scene', () => {
      const validation = sceneManager.validateScene();
      expect(validation).toBeDefined();
      expect(validation.valid).toBeDefined();
      expect(validation.errors).toBeDefined();
    });

    test('should check scene integrity', () => {
      const integrity = sceneManager.checkIntegrity();
      expect(integrity).toBeDefined();
      expect(integrity.valid).toBeDefined();
      expect(integrity.issues).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    test('should work with render manager', () => {
      const renderManager = engine.getManager('render');
      expect(renderManager).toBeDefined();
      
      const mockObject = { name: 'test-object' };
      sceneManager.addObject(mockObject);
      
      expect(() => renderManager.render()).not.toThrow();
    });

    test('should work with camera manager', () => {
      const cameraManager = engine.getManager('camera');
      expect(cameraManager).toBeDefined();
      
      sceneManager.update();
      expect(() => cameraManager.update()).not.toThrow();
    });

    test('should handle engine lifecycle', () => {
      engine.start();
      expect(sceneManager.isActive()).toBe(true);
      
      engine.stop();
      expect(sceneManager.isActive()).toBe(false);
    });
  });
}); 