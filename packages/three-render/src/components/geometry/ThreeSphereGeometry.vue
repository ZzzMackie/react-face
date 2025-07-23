<template>
  <div class="three-sphere-geometry"></div>
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
    widthSegments: {
      type: Number,
      default: 32
    },
    heightSegments: {
      type: Number,
      default: 16
    },
    phiStart: {
      type: Number,
      default: 0
    },
    phiLength: {
      type: Number,
      default: Math.PI * 2
    },
    thetaStart: {
      type: Number,
      default: 0
    },
    thetaLength: {
      type: Number,
      default: Math.PI
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
        
        // 创建球体几何体
        const THREE = canvasContext.engine.value.constructor.THREE;
        geometry.value = new THREE.SphereGeometry(
          props.radius,
          props.widthSegments,
          props.heightSegments,
          props.phiStart,
          props.phiLength,
          props.thetaStart,
          props.thetaLength
        );
        
        // 如果有父对象且是网格，设置其几何体
        if (parentContext && parentContext.object && parentContext.object.type === 'Mesh') {
          parentContext.object.geometry = geometry.value;
        }
        
        // 触发就绪事件
        emit('ready', { geometry: geometry.value });
      } catch (error) {
        console.error('Failed to create sphere geometry:', error);
      }
    };
    
    // 更新几何体
    const updateGeometry = async () => {
      await createGeometry();
      emit('update', { geometry: geometry.value });
    };
    
    // 监听属性变化
    watch(() => props.radius, updateGeometry);
    watch(() => props.widthSegments, updateGeometry);
    watch(() => props.heightSegments, updateGeometry);
    watch(() => props.phiStart, updateGeometry);
    watch(() => props.phiLength, updateGeometry);
    watch(() => props.thetaStart, updateGeometry);
    watch(() => props.thetaLength, updateGeometry);
    
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
.three-sphere-geometry {
  display: none;
}
</style> 