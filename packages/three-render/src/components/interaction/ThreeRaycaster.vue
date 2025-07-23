<script>
import { ref, onMounted, onBeforeUnmount, watch, provide, inject } from 'vue';
import { CANVAS_INJECTION_KEY, SCENE_INJECTION_KEY, CAMERA_INJECTION_KEY, RAYCASTER_INJECTION_KEY } from '../../constants';

export default {
  props: {
    enabled: {
      type: Boolean,
      default: true
    },
    recursive: {
      type: Boolean,
      default: true
    },
    near: {
      type: Number,
      default: 0.1
    },
    far: {
      type: Number,
      default: 1000
    },
    debug: {
      type: Boolean,
      default: false
    }
  },
  emits: ['ready', 'update', 'hover', 'click', 'dblclick', 'contextmenu'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取场景上下文
    const sceneContext = inject(SCENE_INJECTION_KEY, null);
    
    // 获取相机上下文
    const cameraContext = inject(CAMERA_INJECTION_KEY, null);
    
    // 射线投射器引用
    const raycaster = ref(null);
    
    // 鼠标位置
    const mouse = ref({ x: 0, y: 0 });
    
    // 可交互对象列表
    const interactiveObjects = ref([]);
    
    // 当前悬停对象
    const hoveredObject = ref(null);
    
    // 调试射线
    const debugRay = ref(null);
    
    // 添加可交互对象
    const addInteractiveObject = (object, handlers = {}) => {
      if (!object) return;
      
      // 检查对象是否已存在
      const existingIndex = interactiveObjects.value.findIndex(item => item.object === object);
      
      if (existingIndex !== -1) {
        // 更新已存在对象的处理程序
        interactiveObjects.value[existingIndex].handlers = {
          ...interactiveObjects.value[existingIndex].handlers,
          ...handlers
        };
        return;
      }
      
      // 添加新对象
      interactiveObjects.value.push({
        object,
        handlers
      });
    };
    
    // 移除可交互对象
    const removeInteractiveObject = (object) => {
      if (!object) return;
      
      const index = interactiveObjects.value.findIndex(item => item.object === object);
      
      if (index !== -1) {
        interactiveObjects.value.splice(index, 1);
      }
      
      // 如果是当前悬停对象，清除它
      if (hoveredObject.value && hoveredObject.value.object === object) {
        hoveredObject.value = null;
      }
    };
    
    // 创建射线投射器
    const createRaycaster = () => {
      if (!canvasContext || !canvasContext.engine.value) return;
      
      try {
        // 获取Three.js
        const THREE = canvasContext.engine.value.constructor.THREE;
        
        // 创建射线投射器
        raycaster.value = new THREE.Raycaster();
        raycaster.value.near = props.near;
        raycaster.value.far = props.far;
        
        // 创建调试射线
        if (props.debug && sceneContext && sceneContext.scene.value) {
          const material = new THREE.LineBasicMaterial({
            color: 0xff0000
          });
          
          const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -props.far)
          ];
          
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          debugRay.value = new THREE.Line(geometry, material);
          debugRay.value.visible = false;
          
          sceneContext.scene.value.add(debugRay.value);
        }
        
        // 提供射线投射器上下文
        provide(RAYCASTER_INJECTION_KEY, {
          raycaster,
          addInteractiveObject,
          removeInteractiveObject
        });
        
        // 添加事件监听
        if (canvasContext.container.value) {
          canvasContext.container.value.addEventListener('mousemove', onMouseMove);
          canvasContext.container.value.addEventListener('click', onClick);
          canvasContext.container.value.addEventListener('dblclick', onDblClick);
          canvasContext.container.value.addEventListener('contextmenu', onContextMenu);
        }
        
        // 触发就绪事件
        emit('ready', { raycaster: raycaster.value });
      } catch (error) {
        console.error('Failed to create raycaster:', error);
      }
    };
    
    // 更新射线投射器
    const updateRaycaster = () => {
      if (!raycaster.value) return;
      
      // 更新属性
      raycaster.value.near = props.near;
      raycaster.value.far = props.far;
      
      // 更新调试射线
      if (props.debug && debugRay.value) {
        debugRay.value.visible = true;
        
        // 更新调试射线长度
        const points = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, -props.far)
        ];
        
        debugRay.value.geometry.setFromPoints(points);
      } else if (debugRay.value) {
        debugRay.value.visible = false;
      }
      
      // 触发更新事件
      emit('update', { raycaster: raycaster.value });
    };
    
    // 执行射线投射
    const castRay = () => {
      if (!props.enabled || !raycaster.value || !cameraContext || !cameraContext.camera.value || interactiveObjects.value.length === 0) return [];
      
      // 更新射线
      raycaster.value.setFromCamera(mouse.value, cameraContext.camera.value);
      
      // 更新调试射线
      if (props.debug && debugRay.value) {
        const direction = new THREE.Vector3();
        raycaster.value.ray.direction.normalize();
        direction.copy(raycaster.value.ray.direction);
        direction.multiplyScalar(props.far);
        
        debugRay.value.position.copy(raycaster.value.ray.origin);
        debugRay.value.lookAt(raycaster.value.ray.origin.clone().add(direction));
      }
      
      // 获取所有可交互对象
      const objects = interactiveObjects.value.map(item => item.object);
      
      // 执行射线投射
      return raycaster.value.intersectObjects(objects, props.recursive);
    };
    
    // 处理鼠标移动
    const onMouseMove = (event) => {
      if (!canvasContext || !canvasContext.container.value) return;
      
      // 计算鼠标位置
      const rect = canvasContext.container.value.getBoundingClientRect();
      mouse.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // 执行射线投射
      const intersects = castRay();
      
      // 处理悬停事件
      if (intersects.length > 0) {
        const firstIntersect = intersects[0];
        const object = firstIntersect.object;
        
        // 查找对象的处理程序
        const interactiveObject = interactiveObjects.value.find(item => item.object === object);
        
        if (interactiveObject) {
          // 如果是新的悬停对象
          if (!hoveredObject.value || hoveredObject.value.object !== object) {
            // 如果之前有悬停对象，触发鼠标离开事件
            if (hoveredObject.value && hoveredObject.value.handlers.mouseout) {
              hoveredObject.value.handlers.mouseout(event);
            }
            
            // 设置新的悬停对象
            hoveredObject.value = interactiveObject;
            
            // 触发鼠标进入事件
            if (interactiveObject.handlers.mouseover) {
              interactiveObject.handlers.mouseover(event, firstIntersect);
            }
          }
          
          // 触发鼠标移动事件
          if (interactiveObject.handlers.mousemove) {
            interactiveObject.handlers.mousemove(event, firstIntersect);
          }
          
          // 触发组件悬停事件
          emit('hover', {
            object,
            intersect: firstIntersect,
            event
          });
        }
      } else if (hoveredObject.value) {
        // 如果没有交集但有悬停对象，触发鼠标离开事件
        if (hoveredObject.value.handlers.mouseout) {
          hoveredObject.value.handlers.mouseout(event);
        }
        
        // 清除悬停对象
        hoveredObject.value = null;
        
        // 触发组件悬停结束事件
        emit('hover', {
          object: null,
          intersect: null,
          event
        });
      }
    };
    
    // 处理点击事件
    const onClick = (event) => {
      if (!props.enabled) return;
      
      // 执行射线投射
      const intersects = castRay();
      
      if (intersects.length > 0) {
        const firstIntersect = intersects[0];
        const object = firstIntersect.object;
        
        // 查找对象的处理程序
        const interactiveObject = interactiveObjects.value.find(item => item.object === object);
        
        if (interactiveObject && interactiveObject.handlers.click) {
          interactiveObject.handlers.click(event, firstIntersect);
        }
        
        // 触发组件点击事件
        emit('click', {
          object,
          intersect: firstIntersect,
          event
        });
      }
    };
    
    // 处理双击事件
    const onDblClick = (event) => {
      if (!props.enabled) return;
      
      // 执行射线投射
      const intersects = castRay();
      
      if (intersects.length > 0) {
        const firstIntersect = intersects[0];
        const object = firstIntersect.object;
        
        // 查找对象的处理程序
        const interactiveObject = interactiveObjects.value.find(item => item.object === object);
        
        if (interactiveObject && interactiveObject.handlers.dblclick) {
          interactiveObject.handlers.dblclick(event, firstIntersect);
        }
        
        // 触发组件双击事件
        emit('dblclick', {
          object,
          intersect: firstIntersect,
          event
        });
      }
    };
    
    // 处理右键菜单事件
    const onContextMenu = (event) => {
      if (!props.enabled) return;
      
      // 执行射线投射
      const intersects = castRay();
      
      if (intersects.length > 0) {
        const firstIntersect = intersects[0];
        const object = firstIntersect.object;
        
        // 查找对象的处理程序
        const interactiveObject = interactiveObjects.value.find(item => item.object === object);
        
        if (interactiveObject && interactiveObject.handlers.contextmenu) {
          interactiveObject.handlers.contextmenu(event, firstIntersect);
        }
        
        // 触发组件右键菜单事件
        emit('contextmenu', {
          object,
          intersect: firstIntersect,
          event
        });
      }
    };
    
    // 监听属性变化
    watch(() => props.near, updateRaycaster);
    watch(() => props.far, updateRaycaster);
    watch(() => props.debug, updateRaycaster);
    
    // 组件挂载和卸载
    onMounted(() => {
      // 创建射线投射器
      createRaycaster();
    });
    
    onBeforeUnmount(() => {
      // 移除事件监听
      if (canvasContext && canvasContext.container.value) {
        canvasContext.container.value.removeEventListener('mousemove', onMouseMove);
        canvasContext.container.value.removeEventListener('click', onClick);
        canvasContext.container.value.removeEventListener('dblclick', onDblClick);
        canvasContext.container.value.removeEventListener('contextmenu', onContextMenu);
      }
      
      // 移除调试射线
      if (debugRay.value && sceneContext && sceneContext.scene.value) {
        sceneContext.scene.value.remove(debugRay.value);
        
        if (debugRay.value.geometry) {
          debugRay.value.geometry.dispose();
        }
        
        if (debugRay.value.material) {
          debugRay.value.material.dispose();
        }
        
        debugRay.value = null;
      }
      
      // 清空引用
      raycaster.value = null;
      interactiveObjects.value = [];
      hoveredObject.value = null;
    });
    
    return {
      raycaster,
      mouse,
      interactiveObjects,
      hoveredObject,
      addInteractiveObject,
      removeInteractiveObject,
      castRay
    };
  }
};
</script>

<template>
  <div class="three-raycaster"></div>
</template>

<style scoped>
.three-raycaster {
  display: none;
}
</style> 