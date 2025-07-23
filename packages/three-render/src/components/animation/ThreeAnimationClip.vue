<template>
  <div class="three-animation-clip"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, inject } from 'vue';
import { ANIMATION_MIXER_INJECTION_KEY } from '../../constants';

export default {
  props: {
    name: {
      type: String,
      required: true
    },
    autoPlay: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: true
    },
    repetitions: {
      type: Number,
      default: Infinity
    },
    clampWhenFinished: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      default: 0
    },
    timeScale: {
      type: Number,
      default: 1.0
    },
    weight: {
      type: Number,
      default: 1.0
    },
    fadeIn: {
      type: Number,
      default: 0
    },
    blendMode: {
      type: String,
      default: 'normal',
      validator: (value) => ['normal', 'additive'].includes(value)
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  emits: ['ready', 'play', 'stop', 'pause', 'finished', 'loop', 'update'],
  setup(props, { emit }) {
    // 获取动画混合器上下文
    const animationMixerContext = inject(ANIMATION_MIXER_INJECTION_KEY, null);
    
    // 动画动作引用
    const action = ref(null);
    
    // 是否正在播放
    const isPlaying = ref(false);
    
    // 是否已暂停
    const isPaused = ref(false);
    
    // 初始化动画剪辑
    const initAnimationClip = () => {
      if (!animationMixerContext || !animationMixerContext.mixer.value || !animationMixerContext.actions.value[props.name]) return;
      
      // 获取动画动作
      action.value = animationMixerContext.actions.value[props.name];
      
      // 设置动画参数
      updateAnimationParams();
      
      // 如果需要自动播放
      if (props.autoPlay && props.enabled) {
        play();
      }
      
      // 触发就绪事件
      emit('ready', { action: action.value });
    };
    
    // 更新动画参数
    const updateAnimationParams = () => {
      if (!action.value) return;
      
      // 设置循环模式
      action.value.loop = props.loop ? THREE.LoopRepeat : THREE.LoopOnce;
      
      // 设置重复次数
      action.value.repetitions = props.repetitions;
      
      // 设置结束时是否保持在最后一帧
      action.value.clampWhenFinished = props.clampWhenFinished;
      
      // 设置持续时间
      if (props.duration > 0) {
        action.value.setDuration(props.duration);
      }
      
      // 设置时间缩放
      action.value.setEffectiveTimeScale(props.timeScale);
      
      // 设置权重
      action.value.setEffectiveWeight(props.weight);
      
      // 设置混合模式
      action.value.blendMode = props.blendMode === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending;
      
      // 设置启用状态
      action.value.enabled = props.enabled;
    };
    
    // 播放动画
    const play = () => {
      if (!action.value || !props.enabled) return;
      
      // 重置动画
      action.value.reset();
      
      // 如果有淡入时间
      if (props.fadeIn > 0) {
        action.value.fadeIn(props.fadeIn);
      }
      
      // 播放动画
      action.value.play();
      
      // 更新状态
      isPlaying.value = true;
      isPaused.value = false;
      
      // 触发播放事件
      emit('play', { action: action.value });
    };
    
    // 停止动画
    const stop = () => {
      if (!action.value) return;
      
      // 停止动画
      action.value.stop();
      
      // 更新状态
      isPlaying.value = false;
      isPaused.value = false;
      
      // 触发停止事件
      emit('stop', { action: action.value });
    };
    
    // 暂停动画
    const pause = () => {
      if (!action.value || !isPlaying.value) return;
      
      // 暂停动画
      action.value.paused = true;
      
      // 更新状态
      isPaused.value = true;
      
      // 触发暂停事件
      emit('pause', { action: action.value });
    };
    
    // 恢复动画
    const resume = () => {
      if (!action.value || !isPaused.value) return;
      
      // 恢复动画
      action.value.paused = false;
      
      // 更新状态
      isPaused.value = false;
      
      // 触发播放事件
      emit('play', { action: action.value });
    };
    
    // 处理动画结束事件
    const handleAnimationFinished = (event) => {
      if (!action.value || event.action !== action.value) return;
      
      // 更新状态
      isPlaying.value = false;
      isPaused.value = false;
      
      // 触发结束事件
      emit('finished', { action: action.value });
    };
    
    // 处理动画循环事件
    const handleAnimationLoop = (event) => {
      if (!action.value || event.action !== action.value) return;
      
      // 触发循环事件
      emit('loop', { action: action.value, loopCount: event.loopCount });
    };
    
    // 监听属性变化
    watch(() => props.loop, (loop) => {
      if (action.value) {
        action.value.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce;
      }
    });
    
    watch(() => props.repetitions, (repetitions) => {
      if (action.value) {
        action.value.repetitions = repetitions;
      }
    });
    
    watch(() => props.clampWhenFinished, (clamp) => {
      if (action.value) {
        action.value.clampWhenFinished = clamp;
      }
    });
    
    watch(() => props.duration, (duration) => {
      if (action.value && duration > 0) {
        action.value.setDuration(duration);
      }
    });
    
    watch(() => props.timeScale, (timeScale) => {
      if (action.value) {
        action.value.setEffectiveTimeScale(timeScale);
      }
    });
    
    watch(() => props.weight, (weight) => {
      if (action.value) {
        action.value.setEffectiveWeight(weight);
      }
    });
    
    watch(() => props.blendMode, (blendMode) => {
      if (action.value) {
        action.value.blendMode = blendMode === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending;
      }
    });
    
    watch(() => props.enabled, (enabled) => {
      if (action.value) {
        action.value.enabled = enabled;
        
        if (!enabled && isPlaying.value) {
          action.value.paused = true;
          isPaused.value = true;
        } else if (enabled && isPaused.value) {
          action.value.paused = false;
          isPaused.value = false;
        }
      }
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      // 等待动画混合器准备好
      if (animationMixerContext && animationMixerContext.mixer.value) {
        initAnimationClip();
      } else {
        // 监听动画混合器就绪事件
        const unwatch = watch(() => animationMixerContext && animationMixerContext.mixer.value, (mixer) => {
          if (mixer) {
            initAnimationClip();
            unwatch();
          }
        });
      }
      
      // 添加事件监听
      if (animationMixerContext && animationMixerContext.mixer.value) {
        animationMixerContext.mixer.value.addEventListener('finished', handleAnimationFinished);
        animationMixerContext.mixer.value.addEventListener('loop', handleAnimationLoop);
      }
    });
    
    onBeforeUnmount(() => {
      // 停止动画
      if (action.value && isPlaying.value) {
        action.value.stop();
      }
      
      // 移除事件监听
      if (animationMixerContext && animationMixerContext.mixer.value) {
        animationMixerContext.mixer.value.removeEventListener('finished', handleAnimationFinished);
        animationMixerContext.mixer.value.removeEventListener('loop', handleAnimationLoop);
      }
      
      // 清空引用
      action.value = null;
      isPlaying.value = false;
      isPaused.value = false;
    });
    
    return {
      action,
      isPlaying,
      isPaused,
      play,
      stop,
      pause,
      resume
    };
  }
};
</script>

<style scoped>
.three-animation-clip {
  display: none;
}
</style> 