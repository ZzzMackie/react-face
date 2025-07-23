<template>
  <div class="three-draggable"></div>
</template>

<script>
import { onMounted, onBeforeUnmount, inject, watch } from 'vue';
import { PARENT_INJECTION_KEY } from '../../constants';

export default {
  props: {
    enabled: {
      type: Boolean,
      default: true
    },
    dragPlaneNormal: {
      type: Array,
      default: null
    },
    constraints: {
      type: Object,
      default: () => ({
        x: { min: null, max: null },
        y: { min: null, max: null },
        z: { min: null, max: null }
      })
    },
    snapToGrid: {
      type: Boolean,
      default: false
    },
    gridSize: {
      type: Number,
      default: 1
    },
    lockAxis: {
      type: Array,
      default: () => []
    },
    dragStartColor: {
      type: [Number, String],
      default: null
    },
    dragColor: {
      type: [Number, String],
      default: null
    }
  },
  emits: ['dragstart', 'drag', 'dragend'],
  setup(props, { emit }) {
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 查找祖先组件中的拖拽控制器
    const findDragControls = () => {
      let current = parentContext;
      while (current) {
        if (current.dragControls) {
          return current.dragControls;
        }
        current = current.parent;
      }
      return null;
    };
    
    // 获取拖拽控制器
    const dragControls = findDragControls();
    
    // 原始材质颜色
    let originalColor = null;
    
    // 原始位置
    let originalPosition = null;
    
    // 当前约束
    const applyConstraints = (position) => {
      if (!props.constraints) return position;
      
      const { x, y, z } = props.constraints;
      
      if (x.min !== null && position.x < x.min) position.x = x.min;
      if (x.max !== null && position.x > x.max) position.x = x.max;
      
      if (y.min !== null && position.y < y.min) position.y = y.min;
      if (y.max !== null && position.y > y.max) position.y = y.max;
      
      if (z.min !== null && position.z < z.min) position.z = z.min;
      if (z.max !== null && position.z > z.max) position.z = z.max;
      
      return position;
    };
    
    // 锁定轴
    const applyAxisLock = (position, originalPos) => {
      if (!props.lockAxis || !props.lockAxis.length || !originalPos) return position;
      
      if (props.lockAxis.includes('x')) position.x = originalPos.x;
      if (props.lockAxis.includes('y')) position.y = originalPos.y;
      if (props.lockAxis.includes('z')) position.z = originalPos.z;
      
      return position;
    };
    
    // 处理拖拽开始
    const handleDragStart = (event) => {
      if (!props.enabled || !parentContext || !parentContext.object) return;
      
      const object = parentContext.object;
      
      // 如果是当前拖拽的对象
      if (event.object === object) {
        // 保存原始位置
        originalPosition = object.position.clone();
        
        // 应用拖拽开始颜色
        if (props.dragStartColor !== null && object.material && object.material.color) {
          originalColor = object.material.color.clone();
          object.material.color.set(props.dragStartColor);
        }
        
        // 触发拖拽开始事件
        emit('dragstart', {
          object,
          position: object.position.toArray(),
          originalEvent: event
        });
      }
    };
    
    // 处理拖拽
    const handleDrag = (event) => {
      if (!props.enabled || !parentContext || !parentContext.object) return;
      
      const object = parentContext.object;
      
      // 如果是当前拖拽的对象
      if (event.object === object) {
        // 应用约束
        const position = object.position.clone();
        applyConstraints(position);
        applyAxisLock(position, originalPosition);
        
        // 更新对象位置
        object.position.copy(position);
        
        // 应用拖拽颜色
        if (props.dragColor !== null && object.material && object.material.color) {
          object.material.color.set(props.dragColor);
        }
        
        // 触发拖拽事件
        emit('drag', {
          object,
          position: object.position.toArray(),
          originalEvent: event
        });
      }
    };
    
    // 处理拖拽结束
    const handleDragEnd = (event) => {
      if (!props.enabled || !parentContext || !parentContext.object) return;
      
      const object = parentContext.object;
      
      // 如果是当前拖拽的对象
      if (event.object === object) {
        // 应用约束
        const position = object.position.clone();
        applyConstraints(position);
        applyAxisLock(position, originalPosition);
        
        // 更新对象位置
        object.position.copy(position);
        
        // 恢复原始颜色
        if (originalColor !== null && object.material && object.material.color) {
          object.material.color.copy(originalColor);
          originalColor = null;
        }
        
        // 触发拖拽结束事件
        emit('dragend', {
          object,
          position: object.position.toArray(),
          originalPosition: originalPosition ? originalPosition.toArray() : null,
          originalEvent: event
        });
        
        // 清除原始位置
        originalPosition = null;
      }
    };
    
    // 注册可拖拽对象
    const registerDraggable = () => {
      if (!dragControls || !parentContext || !parentContext.object || !props.enabled) return;
      
      // 添加到拖拽控制器
      dragControls.addDraggableObject(parentContext.object);
      
      // 添加事件监听
      dragControls.$on('dragstart', handleDragStart);
      dragControls.$on('drag', handleDrag);
      dragControls.$on('dragend', handleDragEnd);
      
      // 设置拖拽平面
      if (props.dragPlaneNormal) {
        dragControls.setDragPlaneNormal(props.dragPlaneNormal);
      }
      
      // 设置网格对齐
      dragControls.setSnapToGrid(props.snapToGrid);
      dragControls.setGridSize(props.gridSize);
    };
    
    // 取消注册可拖拽对象
    const unregisterDraggable = () => {
      if (!dragControls || !parentContext || !parentContext.object) return;
      
      // 从拖拽控制器移除
      dragControls.removeDraggableObject(parentContext.object);
      
      // 移除事件监听
      dragControls.$off('dragstart', handleDragStart);
      dragControls.$off('drag', handleDrag);
      dragControls.$off('dragend', handleDragEnd);
      
      // 恢复原始颜色
      if (originalColor !== null && parentContext.object.material && parentContext.object.material.color) {
        parentContext.object.material.color.copy(originalColor);
        originalColor = null;
      }
    };
    
    // 监听属性变化
    watch(() => props.enabled, (enabled) => {
      if (enabled) {
        registerDraggable();
      } else {
        unregisterDraggable();
      }
    });
    
    watch(() => props.dragPlaneNormal, (normal) => {
      if (dragControls && normal) {
        dragControls.setDragPlaneNormal(normal);
      }
    }, { deep: true });
    
    watch(() => props.snapToGrid, (snap) => {
      if (dragControls) {
        dragControls.setSnapToGrid(snap);
      }
    });
    
    watch(() => props.gridSize, (size) => {
      if (dragControls) {
        dragControls.setGridSize(size);
      }
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      registerDraggable();
    });
    
    onBeforeUnmount(() => {
      unregisterDraggable();
    });
    
    return {
      registerDraggable,
      unregisterDraggable
    };
  }
};
</script>

<style scoped>
.three-draggable {
  display: none;
}
</style> 