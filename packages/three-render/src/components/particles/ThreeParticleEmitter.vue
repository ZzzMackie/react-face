<template>
  <div class="three-particle-emitter"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, inject } from 'vue';
import { CANVAS_INJECTION_KEY, PARENT_INJECTION_KEY, PARTICLE_SYSTEM_INJECTION_KEY } from '../../constants';

export default {
  props: {
    // 发射器类型
    type: {
      type: String,
      default: 'point',
      validator: (value) => ['point', 'box', 'sphere', 'circle', 'cone'].includes(value)
    },
    // 发射器位置
    position: {
      type: Array,
      default: () => [0, 0, 0]
    },
    // 发射器方向
    direction: {
      type: Array,
      default: () => [0, 1, 0]
    },
    // 发射器尺寸（用于box、sphere、circle、cone）
    size: {
      type: Array,
      default: () => [1, 1, 1]
    },
    // 发射速率（粒子/秒）
    rate: {
      type: Number,
      default: 10
    },
    // 发射器是否启用
    enabled: {
      type: Boolean,
      default: true
    },
    // 发射器是否循环
    loop: {
      type: Boolean,
      default: true
    },
    // 发射器持续时间（秒，0表示无限）
    duration: {
      type: Number,
      default: 0
    },
    // 发射器延迟（秒）
    delay: {
      type: Number,
      default: 0
    },
    // 发射器爆发数量（一次性发射的粒子数量）
    burstCount: {
      type: Number,
      default: 0
    },
    // 粒子生命周期
    particleLifetime: {
      type: Number,
      default: 1.0
    },
    // 粒子生命周期变化范围
    particleLifetimeVariation: {
      type: Number,
      default: 0.0
    },
    // 粒子初始速度
    particleVelocity: {
      type: Number,
      default: 1.0
    },
    // 粒子速度变化范围
    particleVelocityVariation: {
      type: Number,
      default: 0.0
    },
    // 粒子颜色
    particleColor: {
      type: Array,
      default: () => [1, 1, 1]
    },
    // 粒子颜色变化范围
    particleColorVariation: {
      type: Number,
      default: 0.0
    },
    // 粒子大小
    particleSize: {
      type: Number,
      default: 0.1
    },
    // 粒子大小变化范围
    particleSizeVariation: {
      type: Number,
      default: 0.0
    },
    // 粒子重力
    gravity: {
      type: Array,
      default: () => [0, 0, 0]
    },
    // 粒子阻力
    drag: {
      type: Number,
      default: 0.0
    }
  },
  emits: ['ready', 'start', 'stop', 'burst', 'complete'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 获取粒子系统
    const particleSystemContext = inject(PARTICLE_SYSTEM_INJECTION_KEY, null);
    
    // 发射器状态
    const isEmitting = ref(false);
    
    // 发射器计时器
    const emitterTimer = ref(0);
    
    // 发射器持续时间计时器
    const durationTimer = ref(0);
    
    // 发射器延迟计时器
    const delayTimer = ref(props.delay);
    
    // 上次发射时间
    const lastEmitTime = ref(0);
    
    // 初始化发射器
    const initEmitter = () => {
      if (!particleSystemContext) return;
      
      // 重置计时器
      emitterTimer.value = 0;
      durationTimer.value = 0;
      delayTimer.value = props.delay;
      lastEmitTime.value = 0;
      
      // 如果启用，开始发射
      if (props.enabled) {
        start();
      }
      
      // 触发就绪事件
      emit('ready');
    };
    
    // 开始发射
    const start = () => {
      if (!particleSystemContext) return;
      
      isEmitting.value = true;
      
      // 如果有爆发数量，立即发射
      if (props.burstCount > 0) {
        burst(props.burstCount);
      }
      
      // 触发开始事件
      emit('start');
    };
    
    // 停止发射
    const stop = () => {
      isEmitting.value = false;
      
      // 触发停止事件
      emit('stop');
    };
    
    // 爆发发射
    const burst = (count) => {
      if (!particleSystemContext || !particleSystemContext.emit) return;
      
      // 计算发射位置和方向
      const emitOptions = calculateEmitOptions(count);
      
      // 发射粒子
      const emittedCount = particleSystemContext.emit(emitOptions);
      
      // 触发爆发事件
      emit('burst', { count: emittedCount });
      
      return emittedCount;
    };
    
    // 更新发射器
    const update = (event) => {
      if (!particleSystemContext || !isEmitting.value) return;
      
      const deltaTime = event.deltaTime;
      
      // 更新延迟计时器
      if (delayTimer.value > 0) {
        delayTimer.value -= deltaTime;
        return;
      }
      
      // 更新持续时间计时器
      if (props.duration > 0) {
        durationTimer.value += deltaTime;
        
        // 如果超过持续时间，停止发射
        if (durationTimer.value >= props.duration) {
          if (props.loop) {
            // 如果循环，重置计时器
            durationTimer.value = 0;
            delayTimer.value = props.delay;
          } else {
            // 如果不循环，停止发射
            stop();
            
            // 触发完成事件
            emit('complete');
            return;
          }
        }
      }
      
      // 更新发射计时器
      emitterTimer.value += deltaTime;
      
      // 计算应该发射的粒子数量
      const emitInterval = 1.0 / props.rate;
      const particlesToEmit = Math.floor((emitterTimer.value - lastEmitTime.value) / emitInterval);
      
      // 如果需要发射粒子
      if (particlesToEmit > 0) {
        // 发射粒子
        burst(particlesToEmit);
        
        // 更新上次发射时间
        lastEmitTime.value = emitterTimer.value;
      }
    };
    
    // 计算发射选项
    const calculateEmitOptions = (count) => {
      // 基本选项
      const options = {
        count,
        position: [...props.position],
        velocity: [...props.direction],
        color: [...props.particleColor],
        size: props.particleSize,
        lifetime: props.particleLifetime
      };
      
      // 根据发射器类型计算位置
      switch (props.type) {
        case 'box':
          options.position = generateBoxPosition();
          break;
        case 'sphere':
          options.position = generateSpherePosition();
          break;
        case 'circle':
          options.position = generateCirclePosition();
          break;
        case 'cone':
          options.position = generateConePosition();
          options.velocity = generateConeDirection();
          break;
        default: // point
          // 使用默认位置
          break;
      }
      
      // 应用变化
      if (props.particleVelocityVariation > 0) {
        options.velocity = applyVelocityVariation(options.velocity);
      }
      
      if (props.particleLifetimeVariation > 0) {
        options.lifetime = applyLifetimeVariation(options.lifetime);
      }
      
      if (props.particleSizeVariation > 0) {
        options.size = applySizeVariation(options.size);
      }
      
      if (props.particleColorVariation > 0) {
        options.color = applyColorVariation(options.color);
      }
      
      return options;
    };
    
    // 生成盒子位置
    const generateBoxPosition = () => {
      const x = props.position[0] + (Math.random() - 0.5) * props.size[0];
      const y = props.position[1] + (Math.random() - 0.5) * props.size[1];
      const z = props.position[2] + (Math.random() - 0.5) * props.size[2];
      return [x, y, z];
    };
    
    // 生成球体位置
    const generateSpherePosition = () => {
      const radius = props.size[0] * Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      const x = props.position[0] + radius * Math.sin(phi) * Math.cos(theta);
      const y = props.position[1] + radius * Math.sin(phi) * Math.sin(theta);
      const z = props.position[2] + radius * Math.cos(phi);
      
      return [x, y, z];
    };
    
    // 生成圆形位置
    const generateCirclePosition = () => {
      const radius = props.size[0] * Math.sqrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      
      const x = props.position[0] + radius * Math.cos(theta);
      const y = props.position[1];
      const z = props.position[2] + radius * Math.sin(theta);
      
      return [x, y, z];
    };
    
    // 生成圆锥位置
    const generateConePosition = () => {
      // 在圆形基底上生成位置
      const radius = props.size[0] * Math.sqrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      
      const x = props.position[0] + radius * Math.cos(theta);
      const y = props.position[1];
      const z = props.position[2] + radius * Math.sin(theta);
      
      return [x, y, z];
    };
    
    // 生成圆锥方向
    const generateConeDirection = () => {
      // 圆锥角度
      const angle = props.size[1] * Math.PI / 180;
      
      // 随机角度
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * angle;
      
      // 基本方向
      const baseDirection = props.direction;
      
      // 计算旋转后的方向
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);
      
      // 应用基本方向
      const direction = [
        x * props.particleVelocity,
        y * props.particleVelocity,
        z * props.particleVelocity
      ];
      
      return direction;
    };
    
    // 应用速度变化
    const applyVelocityVariation = (velocity) => {
      const variation = props.particleVelocityVariation;
      
      return velocity.map(v => {
        const randomVariation = (Math.random() - 0.5) * 2 * variation;
        return v * (1 + randomVariation);
      });
    };
    
    // 应用生命周期变化
    const applyLifetimeVariation = (lifetime) => {
      const variation = props.particleLifetimeVariation;
      const randomVariation = (Math.random() - 0.5) * 2 * variation;
      
      return lifetime * (1 + randomVariation);
    };
    
    // 应用大小变化
    const applySizeVariation = (size) => {
      const variation = props.particleSizeVariation;
      const randomVariation = (Math.random() - 0.5) * 2 * variation;
      
      return size * (1 + randomVariation);
    };
    
    // 应用颜色变化
    const applyColorVariation = (color) => {
      const variation = props.particleColorVariation;
      
      return color.map(c => {
        const randomVariation = (Math.random() - 0.5) * 2 * variation;
        return Math.max(0, Math.min(1, c + randomVariation));
      });
    };
    
    // 监听属性变化
    watch(() => props.enabled, (enabled) => {
      if (enabled && !isEmitting.value) {
        start();
      } else if (!enabled && isEmitting.value) {
        stop();
      }
    });
    
    watch(() => props.rate, (rate) => {
      // 重置上次发射时间，以适应新的发射速率
      lastEmitTime.value = emitterTimer.value;
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      // 初始化发射器
      initEmitter();
      
      // 添加到渲染循环
      if (canvasContext && canvasContext.engine.value) {
        canvasContext.engine.value.addEventListener('beforeRender', update);
      }
    });
    
    onBeforeUnmount(() => {
      // 停止发射
      stop();
      
      // 移除更新函数
      if (canvasContext && canvasContext.engine.value) {
        canvasContext.engine.value.removeEventListener('beforeRender', update);
      }
    });
    
    return {
      isEmitting,
      start,
      stop,
      burst
    };
  }
};
</script>

<style scoped>
.three-particle-emitter {
  display: none;
}
</style> 