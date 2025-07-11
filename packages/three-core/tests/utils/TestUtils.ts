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
   * 创建测试引擎
   */
  static async createTestEngine(config: {
    width?: number;
    height?: number;
    antialias?: boolean;
    shadowMap?: boolean;
    autoRender?: boolean;
    autoResize?: boolean;
  } = {}): Promise<{ engine: Engine; container: HTMLElement }> {
    const container = document.createElement('div');
    container.style.width = `${config.width || 800}px`;
    container.style.height = `${config.height || 600}px`;
    document.body.appendChild(container);

    const engine = new Engine({
      container,
      width: config.width || 800,
      height: config.height || 600,
      antialias: config.antialias !== false,
      shadowMap: config.shadowMap !== false,
      autoRender: config.autoRender || false,
      autoResize: config.autoResize || false
    });

    await engine.initialize();

    return { engine, container };
  }

  /**
   * 清理测试引擎
   */
  static cleanupTestEngine(engine: Engine, container: HTMLElement): void {
    if (engine) {
      engine.dispose();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }

  /**
   * 创建测试场景
   */
  static async createTestScene(engine: Engine): Promise<{
    lights: LightManager;
    materials: MaterialManager;
    objects: ObjectManager;
    geometry: GeometryManager;
  }> {
    const lights = await engine.getManager<LightManager>('lights');
    const materials = await engine.getManager<MaterialManager>('materials');
    const objects = await engine.getManager<ObjectManager>('objects');
    const geometry = await engine.getManager<GeometryManager>('geometry');

    // 创建基础灯光
    lights.createLight('ambient', {
      type: 'ambient',
      color: 0x404040,
      intensity: 0.4
    });

    lights.createLight('directional', {
      type: 'directional',
      color: 0xffffff,
      intensity: 1.0,
      position: { x: 10, y: 10, z: 5 },
      castShadow: true
    });

    // 创建基础材质
    materials.createStandardMaterial('test', {
      color: 0x808080,
      roughness: 0.5,
      metalness: 0.5
    });

    // 创建基础几何体
    geometry.createBoxGeometry('testBox', { width: 1, height: 1, depth: 1 });
    geometry.createSphereGeometry('testSphere', { radius: 0.5, segments: 16 });

    return { lights, materials, objects, geometry };
  }

  /**
   * 创建测试对象
   */
  static async createTestObjects(
    objects: ObjectManager,
    geometry: GeometryManager,
    materials: MaterialManager,
    count: number = 10
  ): Promise<void> {
    const boxGeometry = geometry.getGeometry('testBox');
    const sphereGeometry = geometry.getGeometry('testSphere');
    const material = materials.getMaterial('test');

    if (boxGeometry && sphereGeometry && material) {
      for (let i = 0; i < count; i++) {
        const isBox = i % 2 === 0;
        const geometry = isBox ? boxGeometry : sphereGeometry;
        const name = isBox ? `testBox${i}` : `testSphere${i}`;

        objects.createMesh(name, geometry, material, {
          position: {
            x: (i % 5) * 2 - 4,
            y: 0,
            z: Math.floor(i / 5) * 2
          },
          castShadow: true,
          receiveShadow: true
        });
      }
    }
  }

  /**
   * 创建测试粒子系统
   */
  static async createTestParticleSystems(
    particles: ParticleManager,
    count: number = 5
  ): Promise<void> {
    for (let i = 0; i < count; i++) {
      particles.createParticleSystem(`testParticles${i}`, {
        count: 100,
        size: 0.1,
        color: new THREE.Color(0xff0000),
        velocity: new THREE.Vector3(0, 1, 0),
        lifetime: 2.0,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

      particles.createEmitter(`testParticles${i}`, {
        position: new THREE.Vector3(i * 2, 0, 0),
        direction: new THREE.Vector3(0, 1, 0),
        rate: 10,
        continuous: true
      });

      particles.emitParticles(`testParticles${i}`, 50);
    }
  }

  /**
   * 创建测试着色器效果
   */
  static async createTestShaderEffects(
    shaders: ShaderManager,
    count: number = 5
  ): Promise<void> {
    for (let i = 0; i < count; i++) {
      shaders.createBuiltinEffect(`wave${i}`, 'wave', {
        amplitude: 0.2,
        frequency: 2.0,
        speed: 1.0,
        color: new THREE.Color(0x0088ff)
      });

      shaders.createBuiltinEffect(`glow${i}`, 'glow', {
        color: new THREE.Color(0x00ff00),
        intensity: 1.0,
        pulseSpeed: 2.0
      });
    }
  }

  /**
   * 创建测试环境
   */
  static async createTestEnvironment(environment: EnvironmentManager): Promise<void> {
    environment.setEnvironment({
      skybox: {
        type: 'gradient',
        gradient: {
          topColor: new THREE.Color(0x87ceeb),
          bottomColor: new THREE.Color(0x4169e1)
        }
      },
      fog: {
        type: 'exponential',
        color: new THREE.Color(0x87ceeb),
        density: 0.01
      },
      ambient: {
        color: new THREE.Color(0x404040),
        intensity: 0.4
      }
    });
  }

  /**
   * 测量性能
   */
  static measurePerformance<T>(
    name: string,
    fn: () => T,
    iterations: number = 1
  ): { result: T; averageTime: number; totalTime: number } {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      const result = fn();
      const endTime = performance.now();
      times.push(endTime - startTime);

      if (i === 0) {
        // 只返回第一次的结果
        const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
        const totalTime = times.reduce((a, b) => a + b, 0);

        console.log(`${name}: ${averageTime.toFixed(2)}ms average, ${totalTime.toFixed(2)}ms total`);

        return { result, averageTime, totalTime };
      }
    }

    throw new Error('Should not reach here');
  }

  /**
   * 等待指定时间
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 等待渲染完成
   */
  static async waitForRender(engine: Engine, frames: number = 1): Promise<void> {
    for (let i = 0; i < frames; i++) {
      engine.render();
      await this.wait(16); // 等待一帧
    }
  }

  /**
   * 创建随机颜色
   */
  static randomColor(): number {
    return Math.floor(Math.random() * 0xffffff);
  }

  /**
   * 创建随机位置
   */
  static randomPosition(range: number = 10): { x: number; y: number; z: number } {
    return {
      x: (Math.random() - 0.5) * range,
      y: (Math.random() - 0.5) * range,
      z: (Math.random() - 0.5) * range
    };
  }

  /**
   * 创建随机旋转
   */
  static randomRotation(): { x: number; y: number; z: number } {
    return {
      x: Math.random() * Math.PI * 2,
      y: Math.random() * Math.PI * 2,
      z: Math.random() * Math.PI * 2
    };
  }

  /**
   * 验证对象属性
   */
  static expectObjectProperties<T extends object>(
    obj: T,
    expectedProperties: Partial<T>
  ): void {
    Object.entries(expectedProperties).forEach(([key, value]) => {
      expect(obj[key as keyof T]).toEqual(value);
    });
  }

  /**
   * 验证数组长度
   */
  static expectArrayLength<T>(array: T[], expectedLength: number): void {
    expect(array).toHaveLength(expectedLength);
  }

  /**
   * 验证对象存在
   */
  static expectObjectExists<T>(obj: T | undefined | null, name: string): asserts obj is T {
    expect(obj).toBeDefined();
    expect(obj).not.toBeNull();
  }

  /**
   * 验证信号触发
   */
  static expectSignalTriggered<T>(
    signal: { subscribe: (callback: (value: T) => void) => () => void },
    expectedValue?: T
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Signal not triggered within timeout'));
      }, 1000);

      const unsubscribe = signal.subscribe((value) => {
        clearTimeout(timeout);
        unsubscribe();

        if (expectedValue !== undefined) {
          expect(value).toEqual(expectedValue);
        }

        resolve();
      });
    });
  }

  /**
   * 创建测试数据
   */
  static createTestData(size: number = 100): Array<{
    id: string;
    name: string;
    value: number;
    position: { x: number; y: number; z: number };
  }> {
    const data = [];
    for (let i = 0; i < size; i++) {
      data.push({
        id: `test-${i}`,
        name: `Test Object ${i}`,
        value: Math.random() * 100,
        position: this.randomPosition()
      });
    }
    return data;
  }

  /**
   * 模拟用户交互
   */
  static simulateUserInteraction(
    element: HTMLElement,
    eventType: 'click' | 'mousedown' | 'mouseup' | 'mousemove' | 'keydown' | 'keyup',
    options: any = {}
  ): void {
    const event = new Event(eventType, { bubbles: true, ...options });
    element.dispatchEvent(event);
  }

  /**
   * 获取内存使用情况
   */
  static getMemoryUsage(): { used: number; total: number; limit: number } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  /**
   * 记录性能指标
   */
  static recordPerformanceMetrics(
    name: string,
    metrics: {
      duration: number;
      memoryUsage?: number;
      frameCount?: number;
      objectCount?: number;
    }
  ): void {
    console.log(`Performance Metrics - ${name}:`, {
      duration: `${metrics.duration.toFixed(2)}ms`,
      memoryUsage: metrics.memoryUsage ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A',
      frameCount: metrics.frameCount || 'N/A',
      objectCount: metrics.objectCount || 'N/A'
    });
  }
} 