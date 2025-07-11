import { Engine } from '../src/core/Engine';
import { ParticleManager } from '../src/core/ParticleManager';
import { ShaderManager } from '../src/core/ShaderManager';
import { EnvironmentManager } from '../src/core/EnvironmentManager';
import { ObjectManager } from '../src/core/ObjectManager';
import { GeometryManager } from '../src/core/GeometryManager';
import { MaterialManager } from '../src/core/MaterialManager';
import * as THREE from 'three';

/**
 * 特效示例
 * 展示粒子系统、着色器效果和环境效果
 */
export class EffectsExample {
  private engine: Engine;
  private container: HTMLElement;
  private clock: THREE.Clock;

  constructor(container: HTMLElement) {
    this.container = container;
    this.engine = new Engine({
      container,
      width: container.clientWidth,
      height: container.clientHeight,
      antialias: true,
      shadowMap: true,
      autoRender: true,
      autoResize: true
    });
    this.clock = new THREE.Clock();
  }

  /**
   * 初始化示例
   */
  async initialize(): Promise<void> {
    console.log('🚀 初始化特效示例...');
    
    // 初始化引擎
    await this.engine.initialize();
    
    // 设置事件监听
    this.setupEventListeners();
    
    // 创建场景内容
    await this.createScene();
    
    // 启动渲染循环
    this.engine.startRenderLoop();
    
    console.log('✅ 特效示例初始化完成');
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听引擎初始化
    this.engine.engineInitialized.subscribe((engine) => {
      if (engine) {
        console.log('🎯 引擎已初始化');
      }
    });

    // 监听错误
    this.engine.errorOccurred.subscribe((error) => {
      if (error) {
        console.error(`❌ 错误: ${error.type} - ${error.message}`);
      }
    });
  }

  /**
   * 创建场景内容
   */
  private async createScene(): Promise<void> {
    console.log('🎨 创建特效场景...');

    // 1. 设置环境效果
    await this.setupEnvironment();

    // 2. 创建基础对象
    await this.createBasicObjects();

    // 3. 设置粒子系统
    await this.setupParticleSystems();

    // 4. 设置着色器效果
    await this.setupShaderEffects();

    // 5. 启动动画循环
    this.startAnimationLoop();

    console.log('🎨 特效场景创建完成');
  }

  /**
   * 设置环境效果
   */
  private async setupEnvironment(): Promise<void> {
    const environment = await this.engine.getManager<EnvironmentManager>('environment');
    
    if (environment) {
      // 设置渐变天空盒
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

      console.log('🌍 环境效果设置完成');
    }
  }

  /**
   * 创建基础对象
   */
  private async createBasicObjects(): Promise<void> {
    const geometry = await this.engine.getManager<GeometryManager>('geometry');
    const materials = await this.engine.getManager<MaterialManager>('materials');
    const objects = await this.engine.getManager<ObjectManager>('objects');

    if (geometry && materials && objects) {
      // 创建几何体
      geometry.createBoxGeometry('shaderBox', { width: 2, height: 2, depth: 2 });
      geometry.createSphereGeometry('particleSphere', { radius: 1, segments: 32 });

      // 创建材质
      materials.createStandardMaterial('baseMaterial', {
        color: 0x808080,
        roughness: 0.5,
        metalness: 0.5
      });

      // 创建对象
      const boxGeometry = geometry.getGeometry('shaderBox');
      const sphereGeometry = geometry.getGeometry('particleSphere');
      const baseMaterial = materials.getMaterial('baseMaterial');

      if (boxGeometry && baseMaterial) {
        objects.createMesh('shaderBox', boxGeometry, baseMaterial, {
          position: { x: -3, y: 1, z: 0 },
          castShadow: true,
          receiveShadow: true
        });
      }

      if (sphereGeometry && baseMaterial) {
        objects.createMesh('particleSphere', sphereGeometry, baseMaterial, {
          position: { x: 3, y: 1, z: 0 },
          castShadow: true,
          receiveShadow: true
        });
      }

      console.log('🎯 基础对象创建完成');
    }
  }

  /**
   * 设置粒子系统
   */
  private async setupParticleSystems(): Promise<void> {
    const particles = await this.engine.getManager<ParticleManager>('particles');
    const objects = await this.engine.getManager<ObjectManager>('objects');

    if (particles && objects) {
      const sphere = objects.getObject('particleSphere');

      if (sphere) {
        // 创建火焰粒子系统
        const fireSystem = particles.createParticleSystem('fire', {
          count: 500,
          size: 0.1,
          sizeVariation: 0.05,
          color: new THREE.Color(0xff4400),
          colorVariation: 0.2,
          velocity: new THREE.Vector3(0, 2, 0),
          velocityVariation: new THREE.Vector3(0.5, 0.5, 0.5),
          acceleration: new THREE.Vector3(0, -1, 0),
          lifetime: 1.5,
          lifetimeVariation: 0.5,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.8,
          sizeAttenuation: true
        });

        // 创建发射器
        particles.createEmitter('fire', {
          position: new THREE.Vector3(0, 0, 0),
          direction: new THREE.Vector3(0, 1, 0),
          spread: Math.PI / 6,
          rate: 20,
          continuous: true
        });

        // 设置粒子系统位置
        particles.setParticleSystemPosition('fire', sphere.position);

        // 发射粒子
        particles.emitParticles('fire', 100);

        // 监听粒子事件
        particles.particleEmitted.subscribe((data) => {
          if (data) {
            console.log(`🔥 发射粒子: ${data.count} 个`);
          }
        });

        console.log('🔥 火焰粒子系统创建完成');
      }

      // 创建爆炸粒子系统
      const explosionSystem = particles.createParticleSystem('explosion', {
        count: 200,
        size: 0.05,
        sizeVariation: 0.02,
        color: new THREE.Color(0xffff00),
        colorVariation: 0.3,
        velocity: new THREE.Vector3(0, 0, 0),
        velocityVariation: new THREE.Vector3(3, 3, 3),
        acceleration: new THREE.Vector3(0, -2, 0),
        lifetime: 2.0,
        lifetimeVariation: 0.5,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 1.0,
        sizeAttenuation: true
      });

      // 创建爆炸发射器
      particles.createEmitter('explosion', {
        position: new THREE.Vector3(0, 0, 0),
        direction: new THREE.Vector3(0, 0, 0),
        spread: Math.PI * 2,
        rate: 0,
        burst: 200,
        continuous: false
      });

      console.log('💥 爆炸粒子系统创建完成');
    }
  }

  /**
   * 设置着色器效果
   */
  private async setupShaderEffects(): Promise<void> {
    const shaders = await this.engine.getManager<ShaderManager>('shaders');
    const objects = await this.engine.getManager<ObjectManager>('objects');

    if (shaders && objects) {
      const box = objects.getObject('shaderBox');

      if (box) {
        // 创建波浪效果
        const waveEffect = shaders.createBuiltinEffect('waveEffect', 'wave', {
          amplitude: 0.2,
          frequency: 2.0,
          speed: 1.0,
          color: new THREE.Color(0x0088ff),
          opacity: 0.8
        });

        if (waveEffect) {
          shaders.applyShaderToObject('waveEffect', box);
          console.log('🌊 波浪着色器效果应用完成');
        }

        // 创建发光效果
        const glowEffect = shaders.createBuiltinEffect('glowEffect', 'glow', {
          color: new THREE.Color(0x00ff00),
          intensity: 1.0,
          pulseSpeed: 2.0
        });

        if (glowEffect) {
          shaders.applyShaderToObject('glowEffect', box);
          console.log('✨ 发光着色器效果应用完成');
        }
      }

      // 创建噪声效果
      const noiseEffect = shaders.createBuiltinEffect('noiseEffect', 'noise', {
        noiseScale: 2.0,
        color: new THREE.Color(0xff8800),
        noiseIntensity: 0.3
      });

      if (noiseEffect) {
        // 应用到所有对象
        objects.getAllObjects().forEach(obj => {
          shaders.applyShaderToObject('noiseEffect', obj);
        });
        console.log('🎨 噪声着色器效果应用完成');
      }
    }
  }

  /**
   * 启动动画循环
   */
  private startAnimationLoop(): void {
    const animate = () => {
      const time = this.clock.getElapsedTime();
      
      // 更新着色器时间
      this.updateShaderEffects(time);
      
      // 更新粒子系统
      this.updateParticleSystems();
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  /**
   * 更新着色器效果
   */
  private async updateShaderEffects(time: number): Promise<void> {
    const shaders = await this.engine.getManager<ShaderManager>('shaders');
    
    if (shaders) {
      // 更新所有动画效果
      shaders.getAllEffects().forEach(effect => {
        shaders.updateAnimatedEffect(effect.id, time);
      });
    }
  }

  /**
   * 更新粒子系统
   */
  private async updateParticleSystems(): Promise<void> {
    const particles = await this.engine.getManager<ParticleManager>('particles');
    
    if (particles) {
      // 持续发射火焰粒子
      particles.emitParticles('fire', 5);
    }
  }

  /**
   * 触发爆炸效果
   */
  async triggerExplosion(position: THREE.Vector3): Promise<void> {
    const particles = await this.engine.getManager<ParticleManager>('particles');
    
    if (particles) {
      // 设置爆炸位置
      particles.setParticleSystemPosition('explosion', position);
      
      // 触发爆炸
      particles.emitParticles('explosion', 200);
      
      console.log('💥 爆炸效果触发');
    }
  }

  /**
   * 切换粒子系统
   */
  async toggleParticleSystem(id: string): Promise<void> {
    const particles = await this.engine.getManager<ParticleManager>('particles');
    
    if (particles) {
      const system = particles.getParticleSystem(id);
      if (system) {
        particles.setParticleSystemActive(id, !system.isActive);
        console.log(`${system.isActive ? '启用' : '禁用'}粒子系统: ${id}`);
      }
    }
  }

  /**
   * 切换着色器效果
   */
  async toggleShaderEffect(id: string): Promise<void> {
    const shaders = await this.engine.getManager<ShaderManager>('shaders');
    
    if (shaders) {
      const effect = shaders.getEffect(id);
      if (effect) {
        effect.material.visible = !effect.material.visible;
        console.log(`${effect.material.visible ? '启用' : '禁用'}着色器效果: ${id}`);
      }
    }
  }

  /**
   * 获取特效统计信息
   */
  async getEffectsStats(): Promise<void> {
    const particles = await this.engine.getManager<ParticleManager>('particles');
    const shaders = await this.engine.getManager<ShaderManager>('shaders');
    const environment = await this.engine.getManager<EnvironmentManager>('environment');
    
    if (particles) {
      const particleStats = particles.getAllStats();
      console.log('📊 粒子系统统计:', particleStats);
    }
    
    if (shaders) {
      const shaderStats = shaders.getStats();
      console.log('📊 着色器统计:', shaderStats);
    }
    
    if (environment) {
      const envStats = environment.getStats();
      console.log('📊 环境效果统计:', envStats);
    }
  }

  /**
   * 销毁示例
   */
  dispose(): void {
    this.engine.dispose();
    console.log('🧹 特效示例已销毁');
  }
}

/**
 * 创建特效示例实例
 */
export function createEffectsExample(container: HTMLElement): EffectsExample {
  return new EffectsExample(container);
} 