<script>
import { onMounted, onBeforeUnmount, inject } from 'vue';
import { PARENT_INJECTION_KEY, RAYCASTER_INJECTION_KEY } from '../../constants';

export default {
  props: {
    enabled: {
      type: Boolean,
      default: true
    },
    cursor: {
      type: String,
      default: 'pointer'
    },
    hoverColor: {
      type: [Number, String],
      default: null
    },
    hoverScale: {
      type: Number,
      default: null
    },
    hoverEmissive: {
      type: [Number, String],
      default: null
    },
    hoverEmissiveIntensity: {
      type: Number,
      default: 1
    }
  },
  emits: ['click', 'dblclick', 'contextmenu', 'mouseover', 'mouseout', 'mousemove'],
  setup(props, { emit }) {
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 获取射线投射器上下文
    const raycasterContext = inject(RAYCASTER_INJECTION_KEY, null);
    
    // 原始材质属性
    let originalCursor = '';
    let originalColor = null;
    let originalScale = null;
    let originalEmissive = null;
    let originalEmissiveIntensity = null;
    
    // 鼠标进入事件
    const onMouseOver = (event, intersect) => {
      if (!props.enabled || !parentContext || !parentContext.object) return;
      
      const object = parentContext.object;
      
      // 保存原始样式
      if (document.body.style.cursor !== props.cursor) {
        originalCursor = document.body.style.cursor;
        document.body.style.cursor = props.cursor;
      }
      
      // 应用悬停样式
      if (props.hoverColor !== null && object.material && object.material.color) {
        originalColor = object.material.color.clone();
        object.material.color.set(props.hoverColor);
      }
      
      if (props.hoverScale !== null) {
        originalScale = object.scale.clone();
        object.scale.multiplyScalar(props.hoverScale);
      }
      
      if (props.hoverEmissive !== null && object.material && object.material.emissive) {
        originalEmissive = object.material.emissive.clone();
        originalEmissiveIntensity = object.material.emissiveIntensity;
        
        object.material.emissive.set(props.hoverEmissive);
        object.material.emissiveIntensity = props.hoverEmissiveIntensity;
      }
      
      // 触发事件
      emit('mouseover', { event, intersect, object });
    };
    
    // 鼠标离开事件
    const onMouseOut = (event) => {
      if (!props.enabled || !parentContext || !parentContext.object) return;
      
      const object = parentContext.object;
      
      // 恢复原始样式
      if (document.body.style.cursor === props.cursor) {
        document.body.style.cursor = originalCursor;
      }
      
      if (originalColor !== null && object.material && object.material.color) {
        object.material.color.copy(originalColor);
        originalColor = null;
      }
      
      if (originalScale !== null) {
        object.scale.copy(originalScale);
        originalScale = null;
      }
      
      if (originalEmissive !== null && object.material && object.material.emissive) {
        object.material.emissive.copy(originalEmissive);
        object.material.emissiveIntensity = originalEmissiveIntensity;
        originalEmissive = null;
        originalEmissiveIntensity = null;
      }
      
      // 触发事件
      emit('mouseout', { event, object });
    };
    
    // 鼠标移动事件
    const onMouseMove = (event, intersect) => {
      if (!props.enabled || !parentContext || !parentContext.object) return;
      
      // 触发事件
      emit('mousemove', { event, intersect, object: parentContext.object });
    };
    
    // 点击事件
    const onClick = (event, intersect) => {
      if (!props.enabled || !parentContext || !parentContext.object) return;
      
      // 触发事件
      emit('click', { event, intersect, object: parentContext.object });
    };
    
    // 双击事件
    const onDblClick = (event, intersect) => {
      if (!props.enabled || !parentContext || !parentContext.object) return;
      
      // 触发事件
      emit('dblclick', { event, intersect, object: parentContext.object });
    };
    
    // 右键菜单事件
    const onContextMenu = (event, intersect) => {
      if (!props.enabled || !parentContext || !parentContext.object) return;
      
      // 阻止默认右键菜单
      event.preventDefault();
      
      // 触发事件
      emit('contextmenu', { event, intersect, object: parentContext.object });
    };
    
    // 注册交互对象
    const registerInteractiveObject = () => {
      if (!raycasterContext || !parentContext || !parentContext.object || !props.enabled) return;
      
      // 创建事件处理程序
      const handlers = {
        mouseover: onMouseOver,
        mouseout: onMouseOut,
        mousemove: onMouseMove,
        click: onClick,
        dblclick: onDblClick,
        contextmenu: onContextMenu
      };
      
      // 添加到射线投射器
      raycasterContext.addInteractiveObject(parentContext.object, handlers);
    };
    
    // 取消注册交互对象
    const unregisterInteractiveObject = () => {
      if (!raycasterContext || !parentContext || !parentContext.object) return;
      
      // 从射线投射器移除
      raycasterContext.removeInteractiveObject(parentContext.object);
      
      // 恢复原始样式
      if (document.body.style.cursor === props.cursor) {
        document.body.style.cursor = originalCursor;
      }
    };
    
    // 组件挂载和卸载
    onMounted(() => {
      registerInteractiveObject();
    });
    
    onBeforeUnmount(() => {
      unregisterInteractiveObject();
    });
    
    return {
      registerInteractiveObject,
      unregisterInteractiveObject
    };
  }
};
</script>

<template>
  <div class="three-interactive"></div>
</template>

<style scoped>
.three-interactive {
  display: none;
}
</style> 