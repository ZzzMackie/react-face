<script>
import { ref, onMounted, onBeforeUnmount, watch, provide, inject } from 'vue';
import { CANVAS_INJECTION_KEY, CAMERA_INJECTION_KEY, PARENT_INJECTION_KEY } from '../../constants';

export default {
  props: {
    type: {
      type: String,
      default: 'perspective',
      validator: (value) => ['perspective', 'orthographic'].includes(value)
    },
    position: {
      type: Array,
      default: () => [0, 0, 5]
    },
    rotation: {
      type: Array,
      default: () => [0, 0, 0]
    },
    lookAt: {
      type: Array,
      default: null
    },
    fov: {
      type: Number,
      default: 75
    },
    aspect: {
      type: Number,
      default: null
    },
    near: {
      type: Number,
      default: 0.1
    },
    far: {
      type: Number,
      default: 1000
    },
    left: {
      type: Number,
      default: -1
    },
    right: {
      type: Number,
      default: 1
    },
    top: {
      type: Number,
      default: 1
    },
    bottom: {
      type: Number,
      default: -1
    },
    zoom: {
      type: Number,
      default: 1
    },
    active: {
      type: Boolean,
      default: true
    },
    id: {
      type: String,
      default: 'default'
    }
  },
  emits: ['ready', 'update'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 相机引用
    const camera = ref(null);
    
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 创建相机
    const createCamera = async () => {
      if (!canvasContext || !canvasContext.engine.value) return;
      
      try {
        // 获取相机管理器
        const cameraManager = await canvasContext.engine.value.getOrCreateManager('camera');
        
        // 创建相机配置
        const config = {
          type: props.type,
          fov: props.fov,
          aspect: props.aspect,
          near: props.near,
          far: props.far,
          left: props.left,
          right: props.right,
          top: props.top,
          bottom: props.bottom,
          zoom: props.zoom,
          id: props.id,
          active: props.active
        };
        
        // 创建相机
        camera.value = cameraManager.createCamera(config);
        
        // 设置相机属性
        updateCamera();
        
        // 如果有父对象，添加到父对象
        if (parentContext && parentContext.object) {
          parentContext.object.add(camera.value);
        }
        
        // 提供相机上下文
        provide(CAMERA_INJECTION_KEY, {
          camera
        });
        
        // 提供父对象上下文
        provide(PARENT_INJECTION_KEY, {
          object: camera.value
        });
        
        // 触发就绪事件
        emit('ready', { camera: camera.value });
      } catch (error) {
        console.error('Failed to create camera:', error);
      }
    };
    
    // 更新相机属性
    const updateCamera = () => {
      if (!camera.value) return;
      
      // 设置位置
      if (props.position && props.position.length === 3) {
        camera.value.position.set(
          props.position[0],
          props.position[1],
          props.position[2]
        );
      }
      
      // 设置旋转
      if (props.rotation && props.rotation.length === 3) {
        camera.value.rotation.set(
          props.rotation[0],
          props.rotation[1],
          props.rotation[2]
        );
      }
      
      // 设置朝向
      if (props.lookAt && props.lookAt.length === 3) {
        camera.value.lookAt(
          props.lookAt[0],
          props.lookAt[1],
          props.lookAt[2]
        );
      }
      
      // 设置缩放
      camera.value.zoom = props.zoom;
      camera.value.updateProjectionMatrix();
      
      // 触发更新事件
      emit('update', { camera: camera.value });
    };
    
    // 监听属性变化
    watch(() => props.position, updateCamera, { deep: true });
    watch(() => props.rotation, updateCamera, { deep: true });
    watch(() => props.lookAt, updateCamera, { deep: true });
    watch(() => props.zoom, (newValue) => {
      if (camera.value) {
        camera.value.zoom = newValue;
        camera.value.updateProjectionMatrix();
        emit('update', { camera: camera.value });
      }
    });
    watch(() => props.active, (newValue) => {
      if (camera.value && canvasContext && canvasContext.engine.value) {
        const cameraManager = canvasContext.engine.value.getManager('camera');
        if (cameraManager && newValue) {
          cameraManager.setActiveCamera(camera.value);
        }
      }
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      createCamera();
    });
    
    onBeforeUnmount(() => {
      if (camera.value) {
        // 如果有父对象，从父对象中移除
        if (parentContext && parentContext.object) {
          parentContext.object.remove(camera.value);
        }
        
        camera.value = null;
      }
    });
    
    return {
      camera
    };
  }
};
</script>

<template>
  <div class="three-camera">
    <slot></slot>
  </div>
</template>

<style scoped>
.three-camera {
  display: contents;
}
</style> 