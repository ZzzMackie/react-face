<template>
  <div class="three-ambient-light"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, provide, inject } from 'vue';
import { CANVAS_INJECTION_KEY, PARENT_INJECTION_KEY } from '../../constants';

export default {
  props: {
    color: {
      type: [Number, String],
      default: 0xffffff
    },
    intensity: {
      type: Number,
      default: 1
    }
  },
  emits: ['ready', 'update'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 光源引用
    const light = ref(null);
    
    // 创建光源
    const createLight = async () => {
      if (!canvasContext || !canvasContext.engine.value) return;
      
      try {
        // 获取光照管理器
        const lightManager = await canvasContext.engine.value.getOrCreateManager('light');
        
        // 获取Three.js
        const THREE = canvasContext.engine.value.constructor.THREE;
        
        // 创建环境光
        light.value = new THREE.AmbientLight(props.color, props.intensity);
        
        // 添加到场景
        if (parentContext && parentContext.object) {
          parentContext.object.add(light.value);
        }
        
        // 提供父对象上下文
        provide(PARENT_INJECTION_KEY, {
          object: light.value
        });
        
        // 触发就绪事件
        emit('ready', { light: light.value });
      } catch (error) {
        console.error('Failed to create ambient light:', error);
      }
    };
    
    // 更新光源
    const updateLight = () => {
      if (!light.value) return;
      
      // 更新颜色
      light.value.color.set(props.color);
      
      // 更新强度
      light.value.intensity = props.intensity;
      
      // 触发更新事件
      emit('update', { light: light.value });
    };
    
    // 监听属性变化
    watch(() => props.color, updateLight);
    watch(() => props.intensity, updateLight);
    
    // 组件挂载和卸载
    onMounted(() => {
      createLight();
    });
    
    onBeforeUnmount(() => {
      if (light.value) {
        // 移除光源
        if (parentContext && parentContext.object) {
          parentContext.object.remove(light.value);
        }
        
        light.value = null;
      }
    });
    
    return {
      light
    };
  }
};
</script>

<style scoped>
.three-ambient-light {
  display: none;
}
</style> 