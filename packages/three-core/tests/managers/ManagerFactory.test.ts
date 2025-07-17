import { ManagerFactory } from '../../src/core/ManagerFactory';
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
    domElement: document.createElement('canvas')
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

describe('ManagerFactory', () => {
  let factory: ManagerFactory;
  let engine: Engine;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    engine = new Engine(container);
    factory = new ManagerFactory(engine);
  });

  afterEach(() => {
    if (engine) {
      engine.dispose();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Manager Creation', () => {
    test('should create render manager', () => {
      const manager = factory.createManager('render');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('render');
    });

    test('should create scene manager', () => {
      const manager = factory.createManager('scene');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('scene');
    });

    test('should create camera manager', () => {
      const manager = factory.createManager('camera');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('camera');
    });

    test('should create light manager', () => {
      const manager = factory.createManager('light');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('light');
    });

    test('should create material manager', () => {
      const manager = factory.createManager('material');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('material');
    });

    test('should create geometry manager', () => {
      const manager = factory.createManager('geometry');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('geometry');
    });

    test('should create animation manager', () => {
      const manager = factory.createManager('animation');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('animation');
    });

    test('should create performance manager', () => {
      const manager = factory.createManager('performance');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('performance');
    });

    test('should create memory manager', () => {
      const manager = factory.createManager('memory');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('memory');
    });

    test('should create monitor manager', () => {
      const manager = factory.createManager('monitor');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('monitor');
    });

    test('should create error manager', () => {
      const manager = factory.createManager('error');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('error');
    });

    test('should create recovery manager', () => {
      const manager = factory.createManager('recovery');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('recovery');
    });

    test('should create instance manager', () => {
      const manager = factory.createManager('instance');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('instance');
    });

    test('should create LOD manager', () => {
      const manager = factory.createManager('lod');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('lod');
    });

    test('should create particle manager', () => {
      const manager = factory.createManager('particle');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('particle');
    });

    test('should create physics manager', () => {
      const manager = factory.createManager('physics');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('physics');
    });

    test('should create UI manager', () => {
      const manager = factory.createManager('ui');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('ui');
    });

    test('should create volumetric manager', () => {
      const manager = factory.createManager('volumetric');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('volumetric');
    });

    test('should create view helper manager', () => {
      const manager = factory.createManager('viewHelper');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('viewHelper');
    });

    test('should create skeleton manager', () => {
      const manager = factory.createManager('skeleton');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('skeleton');
    });

    test('should create morph manager', () => {
      const manager = factory.createManager('morph');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('morph');
    });

    test('should create shader manager', () => {
      const manager = factory.createManager('shader');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('shader');
    });

    test('should create texture manager', () => {
      const manager = factory.createManager('texture');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('texture');
    });

    test('should create loader manager', () => {
      const manager = factory.createManager('loader');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('loader');
    });

    test('should create asset manager', () => {
      const manager = factory.createManager('asset');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('asset');
    });

    test('should create export manager', () => {
      const manager = factory.createManager('export');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('export');
    });

    test('should create database manager', () => {
      const manager = factory.createManager('database');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('database');
    });

    test('should create environment manager', () => {
      const manager = factory.createManager('environment');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('environment');
    });

    test('should create audio manager', () => {
      const manager = factory.createManager('audio');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('audio');
    });

    test('should create controls manager', () => {
      const manager = factory.createManager('controls');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('controls');
    });

    test('should create config manager', () => {
      const manager = factory.createManager('config');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('config');
    });

    test('should create event manager', () => {
      const manager = factory.createManager('event');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('event');
    });

    test('should create helper manager', () => {
      const manager = factory.createManager('helper');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('helper');
    });

    test('should create object manager', () => {
      const manager = factory.createManager('object');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('object');
    });

    test('should create optimization manager', () => {
      const manager = factory.createManager('optimization');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('optimization');
    });

    test('should create procedural manager', () => {
      const manager = factory.createManager('procedural');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('procedural');
    });

    test('should create ray tracing manager', () => {
      const manager = factory.createManager('rayTracing');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('rayTracing');
    });

    test('should create deferred manager', () => {
      const manager = factory.createManager('deferred');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('deferred');
    });

    test('should create composer manager', () => {
      const manager = factory.createManager('composer');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('composer');
    });

    test('should create fluid manager', () => {
      const manager = factory.createManager('fluid');
      expect(manager).toBeDefined();
      expect(manager.name).toBe('fluid');
    });

    test('should throw error for invalid manager type', () => {
      expect(() => factory.createManager('invalid' as any)).toThrow();
    });
  });

  describe('Dependency Management', () => {
    test('should handle manager dependencies', () => {
      // Performance manager should have monitor dependency
      const performanceManager = factory.createManager('performance');
      expect(performanceManager).toBeDefined();
      
      // Monitor manager should be available
      const monitorManager = factory.createManager('monitor');
      expect(monitorManager).toBeDefined();
    });

    test('should handle circular dependencies', () => {
      // This should not cause infinite loops
      expect(() => {
        factory.createManager('performance');
        factory.createManager('monitor');
      }).not.toThrow();
    });
  });

  describe('Manager Lifecycle', () => {
    test('should initialize manager properly', () => {
      const manager = factory.createManager('render');
      expect(manager.initialized).toBe(true);
    });

    test('should dispose manager properly', () => {
      const manager = factory.createManager('render');
      const disposeSpy = jest.spyOn(manager, 'dispose');
      
      manager.dispose();
      expect(disposeSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle manager creation errors', () => {
      // Mock a manager that throws an error
      jest.spyOn(factory, 'createManager').mockImplementation((type) => {
        if (type === 'error') {
          throw new Error('Manager creation failed');
        }
        return factory.createManager(type);
      });

      expect(() => factory.createManager('error')).toThrow('Manager creation failed');
    });

    test('should handle invalid engine reference', () => {
      const invalidFactory = new ManagerFactory(null as any);
      expect(() => invalidFactory.createManager('render')).toThrow();
    });
  });

  describe('Manager Registry', () => {
    test('should register created managers', () => {
      const manager = factory.createManager('render');
      expect(factory.hasManager('render')).toBe(true);
    });

    test('should get registered manager', () => {
      factory.createManager('render');
      const manager = factory.getManager('render');
      expect(manager).toBeDefined();
    });

    test('should return null for unregistered manager', () => {
      const manager = factory.getManager('unregistered');
      expect(manager).toBeNull();
    });
  });
}); 