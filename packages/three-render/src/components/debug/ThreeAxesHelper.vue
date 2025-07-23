<template>
  <div class="three-axes-helper"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, provide, inject } from 'vue';
import { CANVAS_INJECTION_KEY, PARENT_INJECTION_KEY } from '../../constants';

export default {
  props: {
    size: {
      type: Number,
      default: 1
    },
    visible: {
      type: Boolean,
      default: true
    }
  },
  emits: ['ready', 'update'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 辅助对象引用
    const helper = ref(null);
    
    // 创建辅助对象
    const createHelper = async () => {
      if (!canvasContext || !canvasContext.engine.value) return;
      
      try {
        // 获取Three.js
        const THREE = canvasContext.engine.value.constructor.THREE;
        
        // 创建坐标轴辅助对象
        helper.value = new THREE.AxesHelper(props.size);
        
        // 设置可见性
        helper.value.visible = props.visible;
        
        // 添加到场景
        if (parentContext && parentContext.object) {
          parentContext.object.add(helper.value);
        }
        
        // 提供父对象上下文
        provide(PARENT_INJECTION_KEY, {
          object: helper.value
        });
        
        // 触发就绪事件
        emit('ready', { helper: helper.value });
      } catch (error) {
        console.error('Failed to create axes helper:', error);
      }
    };
    
    // 更新辅助对象
    const updateHelper = () => {
      if (!helper.value) return;
      
      // 更新可见性
      helper.value.visible = props.visible;
      
      // 触发更新事件
      emit('update', { helper: helper.value });
    };
    
    // 监听属性变化
    watch(() => props.visible, updateHelper);
    watch(() => props.size, async () => {
      // 大小变化需要重新创建辅助对象
      if (helper.value && parentContext && parentContext.object) {
        parentContext.object.remove(helper.value);
        helper.value.dispose();
        helper.value = null;
      }
      
      await createHelper();
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      createHelper();
    });
    
    onBeforeUnmount(() => {
      if (helper.value) {
        // 移除辅助对象
        if (parentContext && parentContext.object) {
          parentContext.object.remove(helper.value);
        }
        
        // 释放资源
        helper.value.dispose();
        helper.value = null;
      }
    });
    
    return {
      helper
    };
  }
};
</script>

<style scoped>
.three-axes-helper {
  display: none;
}
</style> 