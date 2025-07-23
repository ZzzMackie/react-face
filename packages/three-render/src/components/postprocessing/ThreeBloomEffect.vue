<template>
  <div class="three-bloom-effect"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, inject } from 'vue';
import { CANVAS_INJECTION_KEY, POSTPROCESSING_INJECTION_KEY } from '../../constants';

export default {
  props: {
    strength: {
      type: Number,
      default: 1.5
    },
    radius: {
      type: Number,
      default: 0.4
    },
    threshold: {
      type: Number,
      default: 0.85
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  emits: ['ready', 'update'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取后处理上下文
    const postprocessingContext = inject(POSTPROCESSING_INJECTION_KEY, null);
    
    // 效果通道引用
    const bloomPass = ref(null);
    
    // 创建效果通道
    const createBloomPass = async () => {
      if (!canvasContext || !canvasContext.engine.value || !postprocessingContext) return;
      
      try {
        // 动态导入后处理模块
        const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
        
        // 获取Three.js
        const THREE = canvasContext.engine.value.constructor.THREE;
        
        // 获取渲染器尺寸
        const renderer = canvasContext.engine.value.renderer;
        const size = renderer.getSize(new THREE.Vector2());
        
        // 创建辉光通道
        bloomPass.value = new UnrealBloomPass(
          new THREE.Vector2(size.width, size.height),
          props.strength,
          props.radius,
          props.threshold
        );
        
        // 设置启用状态
        bloomPass.value.enabled = props.enabled;
        
        // 添加到后处理效果链
        postprocessingContext.addEffect({
          pass: bloomPass.value,
          type: 'bloom'
        });
        
        // 触发就绪事件
        emit('ready', { pass: bloomPass.value });
      } catch (error) {
        console.error('Failed to create bloom pass:', error);
      }
    };
    
    // 更新效果通道
    const updateBloomPass = () => {
      if (!bloomPass.value) return;
      
      // 更新参数
      bloomPass.value.strength = props.strength;
      bloomPass.value.radius = props.radius;
      bloomPass.value.threshold = props.threshold;
      bloomPass.value.enabled = props.enabled;
      
      // 触发更新事件
      emit('update', { pass: bloomPass.value });
    };
    
    // 监听属性变化
    watch(() => props.strength, updateBloomPass);
    watch(() => props.radius, updateBloomPass);
    watch(() => props.threshold, updateBloomPass);
    watch(() => props.enabled, updateBloomPass);
    
    // 组件挂载和卸载
    onMounted(async () => {
      // 创建效果通道
      await createBloomPass();
    });
    
    onBeforeUnmount(() => {
      if (bloomPass.value && postprocessingContext) {
        // 从后处理效果链中移除
        postprocessingContext.removeEffect({
          pass: bloomPass.value,
          type: 'bloom'
        });
        
        // 释放资源
        if (bloomPass.value.dispose) {
          bloomPass.value.dispose();
        }
        
        bloomPass.value = null;
      }
    });
    
    return {
      bloomPass
    };
  }
};
</script>

<style scoped>
.three-bloom-effect {
  display: none;
}
</style> 