<template>
  <div class="three-grid-helper"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, provide, inject } from 'vue';
import { CANVAS_INJECTION_KEY, PARENT_INJECTION_KEY } from '../../constants';

export default {
  props: {
    size: {
      type: Number,
      default: 10
    },
    divisions: {
      type: Number,
      default: 10
    },
    colorCenterLine: {
      type: [Number, String],
      default: 0x444444
    },
    colorGrid: {
      type: [Number, String],
      default: 0x888888
    },
    visible: {
      type: Boolean,
      default: true
    },
    position: {
      type: Array,
      default: () => [0, 0, 0]
    },
    rotation: {
      type: Array,
      default: () => [0, 0, 0]
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
        
        // 创建网格辅助对象
        helper.value = new THREE.GridHelper(
          props.size,
          props.divisions,
          new THREE.Color(props.colorCenterLine),
          new THREE.Color(props.colorGrid)
        );
        
        // 设置可见性
        helper.value.visible = props.visible;
        
        // 设置位置
        if (Array.isArray(props.position) && props.position.length >= 3) {
          helper.value.position.set(props.position[0], props.position[1], props.position[2]);
        }
        
        // 设置旋转
        if (Array.isArray(props.rotation) && props.rotation.length >= 3) {
          helper.value.rotation.set(props.rotation[0], props.rotation[1], props.rotation[2]);
        }
        
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
        console.error('Failed to create grid helper:', error);
      }
    };
    
    // 更新辅助对象
    const updateHelper = () => {
      if (!helper.value) return;
      
      // 更新可见性
      helper.value.visible = props.visible;
      
      // 更新位置
      if (Array.isArray(props.position) && props.position.length >= 3) {
        helper.value.position.set(props.position[0], props.position[1], props.position[2]);
      }
      
      // 更新旋转
      if (Array.isArray(props.rotation) && props.rotation.length >= 3) {
        helper.value.rotation.set(props.rotation[0], props.rotation[1], props.rotation[2]);
      }
      
      // 触发更新事件
      emit('update', { helper: helper.value });
    };
    
    // 监听属性变化
    watch(() => props.visible, updateHelper);
    watch(() => props.position, updateHelper, { deep: true });
    watch(() => props.rotation, updateHelper, { deep: true });
    
    // 这些属性变化需要重新创建辅助对象
    const recreateProps = ['size', 'divisions', 'colorCenterLine', 'colorGrid'];
    recreateProps.forEach(prop => {
      watch(() => props[prop], async () => {
        if (helper.value && parentContext && parentContext.object) {
          parentContext.object.remove(helper.value);
          helper.value.dispose();
          helper.value = null;
        }
        
        await createHelper();
      });
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
.three-grid-helper {
  display: none;
}
</style> 