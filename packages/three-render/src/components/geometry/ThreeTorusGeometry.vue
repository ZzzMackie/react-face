<template>
  <div class="three-torus-geometry"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, inject } from 'vue';
import { CANVAS_INJECTION_KEY, PARENT_INJECTION_KEY } from '../../constants';

export default {
  props: {
    radius: {
      type: Number,
      default: 1
    },
    tube: {
      type: Number,
      default: 0.4
    },
    radialSegments: {
      type: Number,
      default: 16
    },
    tubularSegments: {
      type: Number,
      default: 100
    },
    arc: {
      type: Number,
      default: Math.PI * 2
    }
  },
  emits: ['ready', 'update'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 几何体引用
    const geometry = ref(null);
    
    // 创建几何体
    const createGeometry = async () => {
      if (!canvasContext || !canvasContext.engine.value) return;
      
      try {
        // 获取资源管理器
        const resourceManager = await canvasContext.engine.value.getOrCreateManager('resource');
        
        // 创建圆环几何体
        const THREE = canvasContext.engine.value.constructor.THREE;
        geometry.value = new THREE.TorusGeometry(
          props.radius,
          props.tube,
          props.radialSegments,
          props.tubularSegments,
          props.arc
        );
        
        // 如果有父对象且是网格，设置其几何体
        if (parentContext && parentContext.object && parentContext.object.type === 'Mesh') {
          parentContext.object.geometry = geometry.value;
        }
        
        // 触发就绪事件
        emit('ready', { geometry: geometry.value });
      } catch (error) {
        console.error('Failed to create torus geometry:', error);
      }
    };
    
    // 更新几何体
    const updateGeometry = async () => {
      await createGeometry();
      emit('update', { geometry: geometry.value });
    };
    
    // 监听属性变化
    watch(() => props.radius, updateGeometry);
    watch(() => props.tube, updateGeometry);
    watch(() => props.radialSegments, updateGeometry);
    watch(() => props.tubularSegments, updateGeometry);
    watch(() => props.arc, updateGeometry);
    
    // 组件挂载和卸载
    onMounted(() => {
      createGeometry();
    });
    
    onBeforeUnmount(() => {
      if (geometry.value) {
        // 如果有父对象且是网格，移除其几何体
        if (parentContext && parentContext.object && parentContext.object.type === 'Mesh') {
          parentContext.object.geometry = null;
        }
        
        // 释放资源
        geometry.value.dispose();
        geometry.value = null;
      }
    });
    
    return {
      geometry
    };
  }
};
</script>

<style scoped>
.three-torus-geometry {
  display: none;
}
</style> 