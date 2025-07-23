<template>
  <div class="three-drag-controls"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, inject } from 'vue';
import { CANVAS_INJECTION_KEY, SCENE_INJECTION_KEY, CAMERA_INJECTION_KEY, RAYCASTER_INJECTION_KEY } from '../../constants';

export default {
  props: {
    enabled: {
      type: Boolean,
      default: true
    },
    transformGroup: {
      type: Boolean,
      default: false
    },
    dragCursor: {
      type: String,
      default: 'move'
    },
    hoverCursor: {
      type: String,
      default: 'pointer'
    },
    useRaycaster: {
      type: Boolean,
      default: true
    },
    dragPlaneNormal: {
      type: Array,
      default: () => [0, 1, 0]
    },
    snapToGrid: {
      type: Boolean,
      default: false
    },
    gridSize: {
      type: Number,
      default: 1
    },
    autoSelectOnDrag: {
      type: Boolean,
      default: false
    }
  },
  emits: ['dragstart', 'drag', 'dragend', 'hoveron', 'hoveroff'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取场景上下文
    const sceneContext = inject(SCENE_INJECTION_KEY, null);
    
    // 获取相机上下文
    const cameraContext = inject(CAMERA_INJECTION_KEY, null);
    
    // 获取射线投射器上下文
    const raycasterContext = inject(RAYCASTER_INJECTION_KEY, null);
    
    // 拖拽控制器引用
    const dragControls = ref(null);
    
    // 可拖拽对象列表
    const draggableObjects = ref([]);
    
    // 当前选中的对象
    const selectedObject = ref(null);
    
    // 当前悬停的对象
    const hoveredObject = ref(null);
    
    // 拖拽平面
    const dragPlane = ref(null);
    
    // 鼠标位置
    const mouse = ref({ x: 0, y: 0 });
    
    // 拖拽状态
    const isDragging = ref(false);
    
    // 拖拽开始位置
    const dragStartPosition = ref(null);
    
    // 原始鼠标样式
    let originalCursor = '';
    
    // 添加可拖拽对象
    const addDraggableObject = (object) => {
      if (!object) return;
      
      // 检查对象是否已存在
      if (!draggableObjects.value.includes(object)) {
        draggableObjects.value.push(object);
      }
    };
    
    // 移除可拖拽对象
    const removeDraggableObject = (object) => {
      if (!object) return;
      
      const index = draggableObjects.value.indexOf(object);
      
      if (index !== -1) {
        draggableObjects.value.splice(index, 1);
      }
      
      // 如果是当前选中对象，清除它
      if (selectedObject.value === object) {
        selectedObject.value = null;
      }
      
      // 如果是当前悬停对象，清除它
      if (hoveredObject.value === object) {
        hoveredObject.value = null;
      }
    };
    
    // 清空可拖拽对象
    const clearDraggableObjects = () => {
      draggableObjects.value = [];
      selectedObject.value = null;
      hoveredObject.value = null;
    };
    
    // 创建拖拽控制器
    const createDragControls = () => {
      if (!canvasContext || !canvasContext.engine.value || !cameraContext || !cameraContext.camera.value) return;
      
      try {
        // 获取Three.js
        const THREE = canvasContext.engine.value.constructor.THREE;
        
        // 创建拖拽平面
        const normal = new THREE.Vector3(props.dragPlaneNormal[0], props.dragPlaneNormal[1], props.dragPlaneNormal[2]);
        dragPlane.value = new THREE.Plane(normal);
        
        // 添加事件监听
        if (canvasContext.container.value) {
          canvasContext.container.value.addEventListener('mousemove', onMouseMove);
          canvasContext.container.value.addEventListener('mousedown', onMouseDown);
          canvasContext.container.value.addEventListener('mouseup', onMouseUp);
          window.addEventListener('mouseup', onMouseUp);
        }
      } catch (error) {
        console.error('Failed to create drag controls:', error);
      }
    };
    
    // 处理鼠标移动
    const onMouseMove = (event) => {
      if (!canvasContext || !canvasContext.container.value || !props.enabled) return;
      
      // 计算鼠标位置
      const rect = canvasContext.container.value.getBoundingClientRect();
      mouse.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      if (isDragging.value && selectedObject.value) {
        // 执行拖拽
        drag(event);
      } else if (props.useRaycaster && raycasterContext) {
        // 执行射线投射
        const intersects = castRay();
        
        // 处理悬停
        handleHover(intersects);
      }
    };
    
    // 处理鼠标按下
    const onMouseDown = (event) => {
      if (!props.enabled) return;
      
      // 如果使用射线投射器
      if (props.useRaycaster && raycasterContext) {
        // 执行射线投射
        const intersects = castRay();
        
        // 如果有交集
        if (intersects.length > 0) {
          // 获取第一个交集对象
          const object = intersects[0].object;
          
          // 检查是否是可拖拽对象
          if (draggableObjects.value.includes(object)) {
            // 开始拖拽
            startDrag(object, intersects[0].point);
            event.preventDefault();
          }
        }
      } else if (hoveredObject.value) {
        // 如果有悬停对象，开始拖拽
        startDrag(hoveredObject.value);
        event.preventDefault();
      }
    };
    
    // 处理鼠标释放
    const onMouseUp = (event) => {
      if (isDragging.value) {
        // 结束拖拽
        endDrag();
        event.preventDefault();
      }
    };
    
    // 执行射线投射
    const castRay = () => {
      if (!raycasterContext || !raycasterContext.raycaster.value || !cameraContext || !cameraContext.camera.value || draggableObjects.value.length === 0) return [];
      
      // 更新射线
      raycasterContext.raycaster.value.setFromCamera(mouse.value, cameraContext.camera.value);
      
      // 执行射线投射
      return raycasterContext.raycaster.value.intersectObjects(draggableObjects.value, false);
    };
    
    // 处理悬停
    const handleHover = (intersects) => {
      // 如果有交集
      if (intersects.length > 0) {
        // 获取第一个交集对象
        const object = intersects[0].object;
        
        // 如果是新的悬停对象
        if (hoveredObject.value !== object) {
          // 如果之前有悬停对象
          if (hoveredObject.value) {
            // 触发悬停结束事件
            emit('hoveroff', { object: hoveredObject.value });
          }
          
          // 设置新的悬停对象
          hoveredObject.value = object;
          
          // 更改鼠标样式
          if (document.body.style.cursor !== props.hoverCursor) {
            originalCursor = document.body.style.cursor;
            document.body.style.cursor = props.hoverCursor;
          }
          
          // 触发悬停开始事件
          emit('hoveron', { object, point: intersects[0].point });
        }
      } else if (hoveredObject.value) {
        // 如果没有交集但有悬停对象
        
        // 触发悬停结束事件
        emit('hoveroff', { object: hoveredObject.value });
        
        // 清除悬停对象
        hoveredObject.value = null;
        
        // 恢复鼠标样式
        if (document.body.style.cursor === props.hoverCursor) {
          document.body.style.cursor = originalCursor;
        }
      }
    };
    
    // 开始拖拽
    const startDrag = (object, point) => {
      if (!object || !cameraContext || !cameraContext.camera.value || !dragPlane.value) return;
      
      const THREE = canvasContext.engine.value.constructor.THREE;
      
      // 设置选中对象
      selectedObject.value = object;
      
      // 设置拖拽状态
      isDragging.value = true;
      
      // 保存拖拽开始位置
      dragStartPosition.value = object.position.clone();
      
      // 更改鼠标样式
      document.body.style.cursor = props.dragCursor;
      
      // 如果需要自动选择
      if (props.autoSelectOnDrag) {
        // 更新拖拽平面
        const normal = new THREE.Vector3(props.dragPlaneNormal[0], props.dragPlaneNormal[1], props.dragPlaneNormal[2]);
        
        // 如果提供了点，使用点的位置更新平面
        if (point) {
          dragPlane.value.setFromNormalAndCoplanarPoint(normal, point);
        } else {
          dragPlane.value.setFromNormalAndCoplanarPoint(normal, object.position);
        }
      }
      
      // 触发拖拽开始事件
      emit('dragstart', {
        object,
        startPosition: dragStartPosition.value.toArray()
      });
    };
    
    // 执行拖拽
    const drag = (event) => {
      if (!isDragging.value || !selectedObject.value || !cameraContext || !cameraContext.camera.value || !dragPlane.value) return;
      
      const THREE = canvasContext.engine.value.constructor.THREE;
      
      // 创建射线
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse.value, cameraContext.camera.value);
      
      // 计算射线与拖拽平面的交点
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlane.value, intersection);
      
      // 如果需要网格对齐
      if (props.snapToGrid) {
        intersection.x = Math.round(intersection.x / props.gridSize) * props.gridSize;
        intersection.y = Math.round(intersection.y / props.gridSize) * props.gridSize;
        intersection.z = Math.round(intersection.z / props.gridSize) * props.gridSize;
      }
      
      // 更新对象位置
      if (props.transformGroup && selectedObject.value.parent) {
        selectedObject.value.parent.position.copy(intersection);
      } else {
        selectedObject.value.position.copy(intersection);
      }
      
      // 触发拖拽事件
      emit('drag', {
        object: selectedObject.value,
        position: intersection.toArray(),
        startPosition: dragStartPosition.value.toArray()
      });
    };
    
    // 结束拖拽
    const endDrag = () => {
      if (!isDragging.value || !selectedObject.value) return;
      
      // 触发拖拽结束事件
      emit('dragend', {
        object: selectedObject.value,
        position: selectedObject.value.position.toArray(),
        startPosition: dragStartPosition.value.toArray()
      });
      
      // 重置拖拽状态
      isDragging.value = false;
      dragStartPosition.value = null;
      
      // 如果有悬停对象，恢复悬停鼠标样式
      if (hoveredObject.value) {
        document.body.style.cursor = props.hoverCursor;
      } else {
        document.body.style.cursor = originalCursor;
      }
    };
    
    // 监听属性变化
    watch(() => props.dragPlaneNormal, (newNormal) => {
      if (!dragPlane.value) return;
      
      const THREE = canvasContext.engine.value.constructor.THREE;
      const normal = new THREE.Vector3(newNormal[0], newNormal[1], newNormal[2]);
      dragPlane.value.normal.copy(normal);
    }, { deep: true });
    
    watch(() => props.enabled, (enabled) => {
      if (!enabled && isDragging.value) {
        // 如果禁用且正在拖拽，结束拖拽
        endDrag();
      }
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      // 创建拖拽控制器
      createDragControls();
    });
    
    onBeforeUnmount(() => {
      // 移除事件监听
      if (canvasContext && canvasContext.container.value) {
        canvasContext.container.value.removeEventListener('mousemove', onMouseMove);
        canvasContext.container.value.removeEventListener('mousedown', onMouseDown);
        canvasContext.container.value.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('mouseup', onMouseUp);
      }
      
      // 恢复鼠标样式
      document.body.style.cursor = originalCursor;
      
      // 清空引用
      dragControls.value = null;
      draggableObjects.value = [];
      selectedObject.value = null;
      hoveredObject.value = null;
      dragPlane.value = null;
      dragStartPosition.value = null;
    });
    
    return {
      dragControls,
      draggableObjects,
      selectedObject,
      hoveredObject,
      isDragging,
      addDraggableObject,
      removeDraggableObject,
      clearDraggableObjects
    };
  }
};
</script>

<style scoped>
.three-drag-controls {
  display: none;
}
</style> 