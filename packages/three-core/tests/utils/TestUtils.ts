import { Engine } from '../../src/core/Engine';
import { LightManager } from '../../src/core/LightManager';
import { MaterialManager } from '../../src/core/MaterialManager';
import { ObjectManager } from '../../src/core/ObjectManager';
import { GeometryManager } from '../../src/core/GeometryManager';
import { ParticleManager } from '../../src/core/ParticleManager';
import { ShaderManager } from '../../src/core/ShaderManager';
import { EnvironmentManager } from '../../src/core/EnvironmentManager';
import * as THREE from 'three';

/**
 * 测试工具类
 * 提供常用的测试辅助功能
 */
export class TestUtils {
  /**
   * 创建测试用的Engine实例
   */
  static createTestEngine(container?: HTMLDivElement): Engine {
    const testContainer = container || document.createElement('div');
    document.body.appendChild(testContainer);
    return new Engine(testContainer);
  }

  /**
   * 清理测试用的Engine实例
   */
  static cleanupTestEngine(engine: Engine, container?: HTMLDivElement): void {
    if (engine) {
      engine.dispose();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }

  /**
   * 等待指定时间
   */
  static wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 等待下一帧
   */
  static waitForNextFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(resolve));
  }

  /**
   * 模拟性能数据
   */
  static mockPerformanceData(data: {
    frameTime?: number;
    memoryUsage?: number;
    fps?: number;
  }): void {
    if (data.frameTime) {
      jest.spyOn(performance, 'now').mockReturnValue(data.frameTime);
    }

    if (data.memoryUsage) {
      Object.defineProperty(performance, 'memory', {
        value: { usedJSHeapSize: data.memoryUsage },
        configurable: true
      });
    }

    if (data.fps) {
      const frameTime = 1000 / data.fps;
      jest.spyOn(performance, 'now').mockReturnValue(frameTime);
    }
  }

  /**
   * 恢复性能数据模拟
   */
  static restorePerformanceData(): void {
    jest.restoreAllMocks();
  }

  /**
   * 创建模拟的Three.js对象
   */
  static createMockThreeObject(type: string, properties: any = {}): any {
    const baseObject = {
      dispose: jest.fn(),
      update: jest.fn(),
      ...properties
    };

    switch (type) {
      case 'geometry':
        return {
          ...baseObject,
          attributes: {},
          boundingBox: null,
          boundingSphere: null
        };
      case 'material':
        return {
          ...baseObject,
          transparent: false,
          opacity: 1,
          visible: true
        };
      case 'mesh':
        return {
          ...baseObject,
          geometry: TestUtils.createMockThreeObject('geometry'),
          material: TestUtils.createMockThreeObject('material'),
          position: { set: jest.fn(), copy: jest.fn() },
          rotation: { set: jest.fn(), copy: jest.fn() },
          scale: { set: jest.fn(), copy: jest.fn() }
        };
      case 'light':
        return {
          ...baseObject,
          intensity: 1,
          position: { set: jest.fn(), copy: jest.fn() }
        };
      case 'camera':
        return {
          ...baseObject,
          position: { set: jest.fn(), copy: jest.fn() },
          lookAt: jest.fn(),
          updateMatrix: jest.fn(),
          updateMatrixWorld: jest.fn()
        };
      default:
        return baseObject;
    }
  }

  /**
   * 测量函数执行时间
   */
  static measureExecutionTime<T>(fn: () => T): { result: T; time: number } {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    return { result, time: endTime - startTime };
  }

  /**
   * 测量异步函数执行时间
   */
  static async measureAsyncExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    return { result, time: endTime - startTime };
  }

  /**
   * 创建性能基准测试
   */
  static createBenchmark(name: string, iterations: number = 1000) {
    return {
      name,
      iterations,
      results: [] as number[],
      
      run(fn: () => void): void {
        for (let i = 0; i < this.iterations; i++) {
          const { time } = TestUtils.measureExecutionTime(fn);
          this.results.push(time);
        }
      },

      async runAsync(fn: () => Promise<void>): Promise<void> {
        for (let i = 0; i < this.iterations; i++) {
          const { time } = await TestUtils.measureAsyncExecutionTime(fn);
          this.results.push(time);
        }
      },

      getStats() {
        const sorted = [...this.results].sort((a, b) => a - b);
        const sum = sorted.reduce((a, b) => a + b, 0);
        const mean = sum / sorted.length;
        const median = sorted[Math.floor(sorted.length / 2)];
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const stdDev = Math.sqrt(
          sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sorted.length
        );

        return {
          name: this.name,
          iterations: this.iterations,
          mean,
          median,
          min,
          max,
          stdDev,
          results: this.results
        };
      }
    };
  }

  /**
   * 模拟WebGL上下文
   */
  static mockWebGLContext(): void {
    const mockContext = {
      canvas: document.createElement('canvas'),
      drawArrays: jest.fn(),
      drawElements: jest.fn(),
      createBuffer: jest.fn(() => ({})),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      createProgram: jest.fn(() => ({})),
      createShader: jest.fn(() => ({})),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      useProgram: jest.fn(),
      getAttribLocation: jest.fn(() => 0),
      getUniformLocation: jest.fn(() => ({})),
      uniformMatrix4fv: jest.fn(),
      uniform3fv: jest.fn(),
      uniform1f: jest.fn(),
      uniform1i: jest.fn(),
      enableVertexAttribArray: jest.fn(),
      vertexAttribPointer: jest.fn(),
      clearColor: jest.fn(),
      clear: jest.fn(),
      viewport: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      blendFunc: jest.fn(),
      depthFunc: jest.fn(),
      cullFace: jest.fn(),
      frontFace: jest.fn(),
      polygonOffset: jest.fn(),
      lineWidth: jest.fn(),
      pointSize: jest.fn(),
      scissor: jest.fn(),
      colorMask: jest.fn(),
      depthMask: jest.fn(),
      stencilMask: jest.fn(),
      stencilFunc: jest.fn(),
      stencilOp: jest.fn(),
      clearDepth: jest.fn(),
      clearStencil: jest.fn(),
      createTexture: jest.fn(() => ({})),
      bindTexture: jest.fn(),
      texImage2D: jest.fn(),
      texParameteri: jest.fn(),
      generateMipmap: jest.fn(),
      createFramebuffer: jest.fn(() => ({})),
      bindFramebuffer: jest.fn(),
      framebufferTexture2D: jest.fn(),
      checkFramebufferStatus: jest.fn(() => 36053), // FRAMEBUFFER_COMPLETE
      createRenderbuffer: jest.fn(() => ({})),
      bindRenderbuffer: jest.fn(),
      renderbufferStorage: jest.fn(),
      framebufferRenderbuffer: jest.fn(),
      deleteFramebuffer: jest.fn(),
      deleteRenderbuffer: jest.fn(),
      deleteTexture: jest.fn(),
      deleteBuffer: jest.fn(),
      deleteProgram: jest.fn(),
      deleteShader: jest.fn(),
      getError: jest.fn(() => 0),
      getParameter: jest.fn((param) => {
        switch (param) {
          case 34921: return 8; // MAX_VERTEX_UNIFORM_VECTORS
          case 34922: return 8; // MAX_FRAGMENT_UNIFORM_VECTORS
          case 35660: return 16; // MAX_VERTEX_ATTRIBS
          case 34047: return 4096; // MAX_TEXTURE_SIZE
          case 34930: return 16; // MAX_VERTEX_TEXTURE_IMAGE_UNITS
          case 35661: return 8; // MAX_VERTEX_UNIFORM_VECTORS
          case 35662: return 8; // MAX_VARYING_VECTORS
          case 35720: return 8; // MAX_COMBINED_TEXTURE_IMAGE_UNITS
          case 35721: return 8; // MAX_VERTEX_UNIFORM_VECTORS
          case 35722: return 8; // MAX_FRAGMENT_UNIFORM_VECTORS
          default: return 0;
        }
      }),
      getExtension: jest.fn((name) => {
        if (name === 'WEBGL_debug_renderer_info') {
          return {
            UNMASKED_VENDOR_WEBGL: 0x9245,
            UNMASKED_RENDERER_WEBGL: 0x9246
          };
        }
        return null;
      })
    };

    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: jest.fn((contextId) => {
        if (contextId === 'webgl' || contextId === 'webgl2') {
          return mockContext;
        }
        return null;
      })
    });
  }

  /**
   * 模拟浏览器API
   */
  static mockBrowserAPIs(): void {
    // 模拟 requestAnimationFrame
    global.requestAnimationFrame = jest.fn((callback) => {
      return setTimeout(callback, 16);
    });

    // 模拟 cancelAnimationFrame
    global.cancelAnimationFrame = jest.fn((id) => {
      clearTimeout(id);
    });

    // 模拟 ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    // 模拟 IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    // 模拟 AudioContext
    global.AudioContext = jest.fn().mockImplementation(() => ({
      createOscillator: jest.fn(() => ({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        frequency: { setValueAtTime: jest.fn() }
      })),
      createGain: jest.fn(() => ({
        connect: jest.fn(),
        gain: { setValueAtTime: jest.fn() }
      })),
      createBufferSource: jest.fn(() => ({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        buffer: null
      })),
      createAnalyser: jest.fn(() => ({
        connect: jest.fn(),
        frequencyBinCount: 1024,
        getByteFrequencyData: jest.fn(),
        getByteTimeDomainData: jest.fn()
      })),
      decodeAudioData: jest.fn(() => Promise.resolve({})),
      suspend: jest.fn(),
      resume: jest.fn(),
      close: jest.fn()
    }));

    // 模拟 localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    global.localStorage = localStorageMock;

    // 模拟 sessionStorage
    const sessionStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    global.sessionStorage = sessionStorageMock;

    // 模拟 fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        text: () => Promise.resolve('test'),
      })
    );
  }

  /**
   * 创建测试场景
   */
  static createTestScene(): any {
    return {
      add: jest.fn(),
      remove: jest.fn(),
      children: [],
      background: null,
      fog: null,
      traverse: jest.fn()
    };
  }

  /**
   * 创建测试相机
   */
  static createTestCamera(): any {
    return {
      position: { set: jest.fn(), copy: jest.fn() },
      lookAt: jest.fn(),
      updateMatrix: jest.fn(),
      updateMatrixWorld: jest.fn(),
      fov: 75,
      aspect: 1,
      near: 0.1,
      far: 1000
    };
  }

  /**
   * 创建测试渲染器
   */
  static createTestRenderer(): any {
    return {
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
    };
  }
} 