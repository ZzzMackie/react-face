import { Engine } from '../src/core/Engine';
import { ParticleManager } from '../src/core/ParticleManager';
import { ShaderManager } from '../src/core/ShaderManager';
import { EnvironmentManager } from '../src/core/EnvironmentManager';
import * as THREE from 'three';

/**
 * 特效使用示例
 * 展示如何使用粒子系统、着色器和环境效果
 */
export class EffectsUsageExample {
  private engine: Engine;
  private container: HTMLElement;

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
  }

  /**
   * 初始化示例
   */
  async initialize(): Promise<void> {
    console.log('🚀 初始化特效使用示例...');
    
    await this.engine.initialize();
    this.setupEventListeners();
    await this.createEffects();
    
    console.log('✅ 特效使用示例初始化完成');
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.engine.engineInitialized.subscribe((engine) => {
      if (engine) {
        console.log('🎯 引擎已初始化');
      }
    });

    this.engine.errorOccurred.subscribe((error) => {
      if (error) {
        console.error(`❌ 错误: ${error.type} - ${error.message}`);
      }
    });
  }

  /**
   * 创建特效
   */
  private async createEffects(): Promise<void> {
    // 1. 设置环境效果
    await this.setupEnvironment();
    
    // 2. 创建粒子系统
    await this.setupParticleSystems();
    
    // 3. 创建着色器效果
    await this.setupShaderEffects();
    
    // 4. 启动动画循环
    this.startAnimationLoop();
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
   * 设置粒子系统
   */
  private async setupParticleSystems(): Promise<void> {
    const particles = await this.engine.getManager<ParticleManager>('particles');
    
    if (particles) {
      // 创建火焰粒子系统
      particles.createParticleSystem('fire', {
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

      // 发射粒子
      particles.emitParticles('fire', 100);

      // 创建爆炸粒子系统
      particles.createParticleSystem('explosion', {
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

      console.log('🔥 粒子系统创建完成');
    }
  }

  /**
   * 设置着色器效果
   */
  private async setupShaderEffects(): Promise<void> {
    const shaders = await this.engine.getManager<ShaderManager>('shaders');
    
    if (shaders) {
      // 创建波浪效果
      shaders.createBuiltinEffect('wave', 'wave', {
        amplitude: 0.2,
        frequency: 2.0,
        speed: 1.0,
        color: new THREE.Color(0x0088ff),
        opacity: 0.8
      });

      // 创建发光效果
      shaders.createBuiltinEffect('glow', 'glow', {
        color: new THREE.Color(0x00ff00),
        intensity: 1.0,
        pulseSpeed: 2.0
      });

      // 创建噪声效果
      shaders.createBuiltinEffect('noise', 'noise', {
        noiseScale: 2.0,
        color: new THREE.Color(0xff8800),
        noiseIntensity: 0.3
      });

      console.log('🎨 着色器效果创建完成');
    }
  }

  /**
   * 启动动画循环
   */
  private startAnimationLoop(): void {
    const clock = new THREE.Clock();
    
    const animate = () => {
      const time = clock.getElapsedTime();
      
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
      particles.setParticleSystemPosition('explosion', position);
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
   * 应用着色器到对象
   */
  async applyShaderToObject(shaderId: string, objectId: string): Promise<void> {
    const shaders = await this.engine.getManager<ShaderManager>('shaders');
    const objects = await this.engine.getManager('objects');
    
    if (shaders && objects) {
      const object = objects.getObject(objectId);
      if (object) {
        shaders.applyShaderToObject(shaderId, object);
        console.log(`🎨 着色器 ${shaderId} 应用到对象 ${objectId}`);
      }
    }
  }

  /**
   * 更新粒子系统配置
   */
  async updateParticleConfig(id: string, config: any): Promise<void> {
    const particles = await this.engine.getManager<ParticleManager>('particles');
    
    if (particles) {
      particles.updateParticleSystemConfig(id, config);
      console.log(`🔥 更新粒子系统配置: ${id}`);
    }
  }

  /**
   * 更新着色器参数
   */
  async updateShaderUniforms(id: string, uniforms: Record<string, any>): Promise<void> {
    const shaders = await this.engine.getManager<ShaderManager>('shaders');
    
    if (shaders) {
      shaders.updateShaderUniforms(id, uniforms);
      console.log(`🎨 更新着色器参数: ${id}`);
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
    console.log('🧹 特效使用示例已销毁');
  }
}

/**
 * 创建特效使用示例实例
 */
export function createEffectsUsageExample(container: HTMLElement): EffectsUsageExample {
  return new EffectsUsageExample(container);
} 