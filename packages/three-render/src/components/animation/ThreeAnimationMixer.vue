<template>
  <div class="three-animation-mixer"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, provide, inject } from 'vue';
import { CANVAS_INJECTION_KEY, PARENT_INJECTION_KEY, ANIMATION_MIXER_INJECTION_KEY } from '../../constants';

export default {
  props: {
    enabled: {
      type: Boolean,
      default: true
    },
    timeScale: {
      type: Number,
      default: 1.0
    },
    debug: {
      type: Boolean,
      default: false
    }
  },
  emits: ['ready', 'update', 'finished'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 动画混合器引用
    const mixer = ref(null);
    
    // 动画剪辑列表
    const clips = ref([]);
    
    // 动画动作列表
    const actions = ref({});
    
    // 当前播放的动作
    const currentAction = ref(null);
    
    // 创建动画混合器
    const createMixer = () => {
      if (!canvasContext || !canvasContext.engine.value || !parentContext || !parentContext.object) return;
      
      try {
        // 获取Three.js
        const THREE = canvasContext.engine.value.constructor.THREE;
        
        // 创建动画混合器
        mixer.value = new THREE.AnimationMixer(parentContext.object);
        
        // 设置时间缩放
        mixer.value.timeScale = props.timeScale;
        
        // 查找模型中的动画剪辑
        if (parentContext.object.animations && parentContext.object.animations.length > 0) {
          clips.value = parentContext.object.animations;
          
          if (props.debug) {
            console.log(`[AnimationMixer] Found ${clips.value.length} animation clips:`, 
              clips.value.map(clip => clip.name));
          }
          
          // 为每个剪辑创建动作
          clips.value.forEach(clip => {
            const action = mixer.value.clipAction(clip);
            actions.value[clip.name] = action;
          });
        }
        
        // 添加到渲染循环
        if (canvasContext.engine.value) {
          canvasContext.engine.value.addEventListener('beforeRender', update);
        }
        
        // 添加结束事件监听
        mixer.value.addEventListener('finished', handleAnimationFinished);
        
        // 提供动画混合器上下文
        provide(ANIMATION_MIXER_INJECTION_KEY, {
          mixer,
          clips,
          actions,
          currentAction,
          play,
          stop,
          pause,
          crossFade
        });
        
        // 触发就绪事件
        emit('ready', { mixer: mixer.value, clips: clips.value, actions: actions.value });
      } catch (error) {
        console.error('Failed to create animation mixer:', error);
      }
    };
    
    // 更新动画混合器
    const update = (event) => {
      if (!mixer.value || !props.enabled) return;
      
      // 更新动画混合器
      mixer.value.update(event.deltaTime);
      
      // 触发更新事件
      emit('update', { 
        mixer: mixer.value, 
        deltaTime: event.deltaTime, 
        currentAction: currentAction.value 
      });
    };
    
    // 处理动画结束事件
    const handleAnimationFinished = (event) => {
      if (props.debug) {
        console.log('[AnimationMixer] Animation finished:', event);
      }
      
      // 触发结束事件
      emit('finished', { 
        action: event.action, 
        direction: event.direction 
      });
    };
    
    // 播放动画
    const play = (clipName, options = {}) => {
      if (!mixer.value || !actions.value[clipName]) return;
      
      const action = actions.value[clipName];
      const defaultOptions = {
        repetitions: Infinity,
        duration: 0,
        clampWhenFinished: false,
        fadeIn: 0,
        weight: 1.0,
        timeScale: 1.0,
        reset: true
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      // 如果需要重置
      if (mergedOptions.reset) {
        action.reset();
      }
      
      // 设置重复次数
      action.repetitions = mergedOptions.repetitions;
      
      // 设置持续时间
      if (mergedOptions.duration > 0) {
        action.setDuration(mergedOptions.duration);
      }
      
      // 设置结束时是否保持在最后一帧
      action.clampWhenFinished = mergedOptions.clampWhenFinished;
      
      // 设置权重
      action.setEffectiveWeight(mergedOptions.weight);
      
      // 设置时间缩放
      action.setEffectiveTimeScale(mergedOptions.timeScale);
      
      // 如果有淡入时间
      if (mergedOptions.fadeIn > 0) {
        if (currentAction.value) {
          // 淡出当前动画，淡入新动画
          currentAction.value.crossFadeTo(action, mergedOptions.fadeIn, true);
        } else {
          // 淡入新动画
          action.fadeIn(mergedOptions.fadeIn);
        }
      } else {
        // 停止当前动画
        if (currentAction.value && currentAction.value !== action) {
          currentAction.value.stop();
        }
      }
      
      // 播放动画
      action.play();
      
      // 更新当前动画
      currentAction.value = action;
      
      if (props.debug) {
        console.log(`[AnimationMixer] Playing animation: ${clipName}`, mergedOptions);
      }
      
      return action;
    };
    
    // 停止动画
    const stop = (clipName) => {
      if (!mixer.value) return;
      
      if (clipName) {
        // 停止指定动画
        const action = actions.value[clipName];
        if (action) {
          action.stop();
          
          if (currentAction.value === action) {
            currentAction.value = null;
          }
          
          if (props.debug) {
            console.log(`[AnimationMixer] Stopped animation: ${clipName}`);
          }
        }
      } else {
        // 停止所有动画
        mixer.value.stopAllAction();
        currentAction.value = null;
        
        if (props.debug) {
          console.log('[AnimationMixer] Stopped all animations');
        }
      }
    };
    
    // 暂停动画
    const pause = (clipName) => {
      if (!mixer.value) return;
      
      if (clipName) {
        // 暂停指定动画
        const action = actions.value[clipName];
        if (action) {
          action.paused = true;
          
          if (props.debug) {
            console.log(`[AnimationMixer] Paused animation: ${clipName}`);
          }
        }
      } else if (currentAction.value) {
        // 暂停当前动画
        currentAction.value.paused = true;
        
        if (props.debug) {
          console.log('[AnimationMixer] Paused current animation');
        }
      }
    };
    
    // 交叉淡入淡出动画
    const crossFade = (fromClipName, toClipName, duration = 0.5, warp = false) => {
      if (!mixer.value || !actions.value[fromClipName] || !actions.value[toClipName]) return;
      
      const fromAction = actions.value[fromClipName];
      const toAction = actions.value[toClipName];
      
      // 确保目标动画已启用
      toAction.enabled = true;
      toAction.setEffectiveWeight(1.0);
      toAction.play();
      
      // 执行交叉淡入淡出
      fromAction.crossFadeTo(toAction, duration, warp);
      
      // 更新当前动画
      currentAction.value = toAction;
      
      if (props.debug) {
        console.log(`[AnimationMixer] Cross fade from ${fromClipName} to ${toClipName}, duration: ${duration}`);
      }
      
      return toAction;
    };
    
    // 监听属性变化
    watch(() => props.timeScale, (newTimeScale) => {
      if (mixer.value) {
        mixer.value.timeScale = newTimeScale;
      }
    });
    
    watch(() => props.enabled, (enabled) => {
      if (!enabled && mixer.value) {
        // 如果禁用，暂停所有动画
        Object.values(actions.value).forEach(action => {
          action.paused = true;
        });
      } else if (enabled && mixer.value && currentAction.value) {
        // 如果启用，恢复当前动画
        currentAction.value.paused = false;
      }
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      // 创建动画混合器
      createMixer();
    });
    
    onBeforeUnmount(() => {
      // 移除更新函数
      if (canvasContext && canvasContext.engine.value) {
        canvasContext.engine.value.removeEventListener('beforeRender', update);
      }
      
      // 移除结束事件监听
      if (mixer.value) {
        mixer.value.removeEventListener('finished', handleAnimationFinished);
        mixer.value.stopAllAction();
      }
      
      // 清空引用
      mixer.value = null;
      clips.value = [];
      actions.value = {};
      currentAction.value = null;
    });
    
    return {
      mixer,
      clips,
      actions,
      currentAction,
      play,
      stop,
      pause,
      crossFade
    };
  }
};
</script>

<style scoped>
.three-animation-mixer {
  display: none;
}
</style> 