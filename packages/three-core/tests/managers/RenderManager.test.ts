import { RenderManager } from '../../src/core/RenderManager';
import { Engine } from '../../src/core/Engine';
import 'jest';

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
  WebGLRenderer: jest.fn().mockImplementation(() => {
    let pixelRatio = 1;
    return {
      setSize: jest.fn(),
      setClearColor: jest.fn(),
      setClearAlpha: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
      getPixelRatio: jest.fn(() => pixelRatio),
      setPixelRatio: jest.fn((r) => { pixelRatio = r; }),
      domElement: document.createElement('canvas'),
      shadowMap: { enabled: false, type: 1 },
      outputColorSpace: 3001, // THREE.SRGBColorSpace
      toneMapping: 0, // THREE.NoToneMapping
      toneMappingExposure: 1.0,
      capabilities: {
        isWebGL2: true,
        maxTextureSize: 4096,
        maxAnisotropy: 16
      },
      info: {
        render: { calls: 0, triangles: 0, points: 0, lines: 0 },
        memory: { geometries: 0, textures: 0 }
      }
    };
  }),
  Scene: jest.fn().mockImplementation(() => {
    const children = [];
    return {
      add: jest.fn((obj) => { children.push(obj); }),
      remove: jest.fn((obj) => {
        const idx = children.indexOf(obj);
        if (idx !== -1) children.splice(idx, 1);
      }),
      clear: jest.fn(),
      traverse: jest.fn((cb) => { children.forEach(cb); }),
      getObjectByName: jest.fn((name) => children.find(obj => obj.name === name)),
      getObjectById: jest.fn((id) => children.find(obj => obj.id === id)),
      children,
      background: null,
      fog: null,
      environment: null
    };
  }),
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
  Color: jest.fn().mockImplementation(() => ({
    setHex: jest.fn(),
    setRGB: jest.fn(),
    getHex: jest.fn(() => 0x000000)
  })),
  Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x, y, z,
    set: jest.fn().mockReturnThis(),
    copy: jest.fn().mockReturnThis(),
    clone: jest.fn(),
    add: jest.fn().mockReturnThis(),
    sub: jest.fn().mockReturnThis(),
    multiply: jest.fn().mockReturnThis(),
    divide: jest.fn().mockReturnThis(),
    length: jest.fn(() => Math.sqrt(x * x + y * y + z * z)),
    normalize: jest.fn().mockReturnThis(),
    lerp: jest.fn().mockReturnThis(),
    lerpVectors: jest.fn().mockReturnThis()
  })),
  Vector2: jest.fn().mockImplementation((x = 0, y = 0) => ({
    x, y,
    set: jest.fn().mockReturnThis(),
    copy: jest.fn().mockReturnThis(),
    clone: jest.fn(),
    add: jest.fn().mockReturnThis(),
    sub: jest.fn().mockReturnThis(),
    multiply: jest.fn().mockReturnThis(),
    divide: jest.fn().mockReturnThis(),
    length: jest.fn(() => Math.sqrt(x * x + y * y)),
    normalize: jest.fn().mockReturnThis()
  })),
  Raycaster: jest.fn().mockImplementation(() => ({
    set: jest.fn().mockReturnThis(),
    setFromCamera: jest.fn().mockReturnThis(),
    intersectObject: jest.fn(() => []),
    intersectObjects: jest.fn(() => [])
  })),
  Clock: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    getElapsedTime: jest.fn(() => 0),
    getDelta: jest.fn(() => 0.016),
    getTime: jest.fn(() => Date.now() / 1000)
  })),
  AudioListener: jest.fn().mockImplementation(() => ({
    context: { sampleRate: 44100 },
    getInput: jest.fn(),
    getMasterVolume: jest.fn(),
    setMasterVolume: jest.fn()
  })),
  PCFSoftShadowMap: 2,
  SRGBColorSpace: 3001,
  ACESFilmicToneMapping: 1,
  NoToneMapping: 0
}));

describe('RenderManager', () => {
  let renderManager: RenderManager;
  let engine: Engine;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    engine = new Engine(container);
    renderManager = engine.getManager('render') as RenderManager;
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
      expect(renderManager).toBeDefined();
      expect(renderManager.name).toBe('render');
      expect(renderManager.initialized).toBe(true);
    });

    test('should have renderer instance', () => {
      expect(renderManager.renderer).toBeDefined();
      expect(renderManager.renderer.domElement).toBeDefined();
    });

    test('should have default render settings', () => {
      expect(renderManager.settings).toBeDefined();
      expect(renderManager.settings.antialias).toBeDefined();
      expect(renderManager.settings.alpha).toBeDefined();
      expect(renderManager.settings.shadowMap).toBeDefined();
    });
  });

  describe('Rendering', () => {
    test('should render scene and camera', () => {
      const renderSpy = jest.spyOn(renderManager.renderer, 'render');
      
      renderManager.render();
      
      expect(renderSpy).toHaveBeenCalled();
    });

    test('should handle render errors gracefully', () => {
      const renderSpy = jest.spyOn(renderManager.renderer, 'render').mockImplementation(() => {
        throw new Error('Render error');
      });
      
      expect(() => renderManager.render()).not.toThrow();
      
      renderSpy.mockRestore();
    });

    test('should update render info', () => {
      renderManager.render();
      
      const info = renderManager.getRenderInfo();
      expect(info).toBeDefined();
      expect(info.calls).toBeDefined();
      expect(info.triangles).toBeDefined();
    });
  });

  describe('Renderer Configuration', () => {
    test('should set renderer size', () => {
      const setSizeSpy = jest.spyOn(renderManager.renderer, 'setSize');
      
      renderManager.setSize(800, 600);
      
      expect(setSizeSpy).toHaveBeenCalledWith(800, 600);
    });

    test('should set clear color', () => {
      const setClearColorSpy = jest.spyOn(renderManager.renderer, 'setClearColor');
      
      renderManager.setClearColor(0x000000);
      
      expect(setClearColorSpy).toHaveBeenCalledWith(0x000000);
    });

    test('should enable/disable shadow map', () => {
      renderManager.setShadowMapEnabled(true);
      expect(renderManager.renderer.shadowMap.enabled).toBe(true);
      
      renderManager.setShadowMapEnabled(false);
      expect(renderManager.renderer.shadowMap.enabled).toBe(false);
    });

    test('should set pixel ratio', () => {
      renderManager.setPixelRatio(2);
      expect(renderManager.renderer.getPixelRatio()).toBe(2);
    });
  });

  describe('Render Settings', () => {
    test('should update render settings', () => {
      const newSettings = {
        antialias: true,
        alpha: true,
        shadowMap: { enabled: true, type: 1 }
      };
      
      renderManager.updateSettings(newSettings);
      expect(renderManager.settings.antialias).toBe(true);
      expect(renderManager.settings.alpha).toBe(true);
    });

    test('should validate render settings', () => {
      expect(() => renderManager.updateSettings({ pixelRatio: -1 })).toThrow();
      expect(() => renderManager.updateSettings({ pixelRatio: 0 })).toThrow();
    });

    test('should get current settings', () => {
      const settings = renderManager.getSettings();
      expect(settings).toBeDefined();
      expect(settings.antialias).toBeDefined();
      expect(settings.alpha).toBeDefined();
    });
  });

  describe('Performance Monitoring', () => {
    test('should track render performance', () => {
      renderManager.render();
      
      const performance = renderManager.getPerformanceMetrics();
      expect(performance).toBeDefined();
      expect(performance.frameTime).toBeDefined();
      expect(performance.fps).toBeDefined();
    });

    test('should detect performance issues', () => {
      // Mock poor performance
      jest.spyOn(renderManager, 'getFrameTime').mockReturnValue(50); // 20 FPS
      
      const issues = renderManager.detectPerformanceIssues();
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('frameTime');
    });

    test('should optimize rendering', () => {
      const result = renderManager.optimizeRendering();
      expect(result.success).toBeDefined();
      expect(result.optimizations).toBeDefined();
    });
  });

  describe('Render Targets', () => {
    test('should create render target', () => {
      const target = renderManager.createRenderTarget(512, 512);
      expect(target).toBeDefined();
      expect(target.width).toBe(512);
      expect(target.height).toBe(512);
    });

    test('should dispose render target', () => {
      const target = renderManager.createRenderTarget(256, 256);
      const disposeSpy = jest.spyOn(target, 'dispose');
      
      renderManager.disposeRenderTarget(target);
      expect(disposeSpy).toHaveBeenCalled();
    });

    test('should render to target', () => {
      const target = renderManager.createRenderTarget(512, 512);
      const renderSpy = jest.spyOn(renderManager.renderer, 'render');
      
      renderManager.renderToTarget(target);
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('Post Processing', () => {
    test('should add post processing effect', () => {
      const effect = { name: 'test', enabled: true };
      renderManager.addPostProcessingEffect(effect);
      
      const effects = renderManager.getPostProcessingEffects();
      expect(effects).toContain(effect);
    });

    test('should remove post processing effect', () => {
      const effect = { name: 'test', enabled: true };
      renderManager.addPostProcessingEffect(effect);
      renderManager.removePostProcessingEffect('test');
      
      const effects = renderManager.getPostProcessingEffects();
      expect(effects).not.toContain(effect);
    });

    test('should enable/disable post processing', () => {
      renderManager.setPostProcessingEnabled(true);
      expect(renderManager.isPostProcessingEnabled()).toBe(true);
      
      renderManager.setPostProcessingEnabled(false);
      expect(renderManager.isPostProcessingEnabled()).toBe(false);
    });
  });

  describe('Render Events', () => {
    test('should emit render events', () => {
      const renderSpy = jest.fn();
      renderManager.on('render', renderSpy);
      
      renderManager.render();
      expect(renderSpy).toHaveBeenCalled();
    });

    test('should emit performance events', () => {
      const performanceSpy = jest.fn();
      renderManager.on('performance:warning', performanceSpy);
      
      // Mock poor performance
      jest.spyOn(renderManager, 'getFrameTime').mockReturnValue(50);
      renderManager.render();
      
      expect(performanceSpy).toHaveBeenCalled();
    });

    test('should emit error events', () => {
      const errorSpy = jest.fn();
      renderManager.on('error', errorSpy);
      
      // Mock render error
      jest.spyOn(renderManager.renderer, 'render').mockImplementation(() => {
        throw new Error('Render error');
      });
      
      renderManager.render();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('Render Statistics', () => {
    test('should get render statistics', () => {
      renderManager.render();
      
      const stats = renderManager.getStatistics();
      expect(stats).toBeDefined();
      expect(stats.totalFrames).toBeGreaterThan(0);
      expect(stats.averageFPS).toBeDefined();
      expect(stats.memoryUsage).toBeDefined();
    });

    test('should reset statistics', () => {
      renderManager.render();
      renderManager.resetStatistics();
      
      const stats = renderManager.getStatistics();
      expect(stats.totalFrames).toBe(0);
    });

    test('should export statistics', () => {
      renderManager.render();
      
      const exportData = renderManager.exportStatistics();
      expect(exportData).toBeDefined();
      expect(exportData.timestamp).toBeDefined();
      expect(exportData.statistics).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    test('should work with scene manager', () => {
      const sceneManager = engine.getManager('scene');
      expect(sceneManager).toBeDefined();
      
      renderManager.render();
      expect(() => sceneManager.update()).not.toThrow();
    });

    test('should work with camera manager', () => {
      const cameraManager = engine.getManager('camera');
      expect(cameraManager).toBeDefined();
      
      renderManager.render();
      expect(() => cameraManager.update()).not.toThrow();
    });

    test('should handle engine lifecycle', () => {
      engine.start();
      expect(renderManager.isRendering()).toBe(true);
      
      engine.stop();
      expect(renderManager.isRendering()).toBe(false);
    });
  });
}); 