<template>
  <div class="three-orbit-controls"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, inject } from 'vue';
import { CANVAS_INJECTION_KEY, CAMERA_INJECTION_KEY } from '../../constants';

export default {
  props: {
    enableRotate: {
      type: Boolean,
      default: true
    },
    enableZoom: {
      type: Boolean,
      default: true
    },
    enablePan: {
      type: Boolean,
      default: true
    },
    enableDamping: {
      type: Boolean,
      default: true
    },
    dampingFactor: {
      type: Number,
      default: 0.05
    },
    autoRotate: {
      type: Boolean,
      default: false
    },
    autoRotateSpeed: {
      type: Number,
      default: 2.0
    },
    minDistance: {
      type: Number,
      default: 0
    },
    maxDistance: {
      type: Number,
      default: Infinity
    },
    minPolarAngle: {
      type: Number,
      default: 0
    },
    maxPolarAngle: {
      type: Number,
      default: Math.PI
    },
    minAzimuthAngle: {
      type: Number,
      default: -Infinity
    },
    maxAzimuthAngle: {
      type: Number,
      default: Infinity
    },
    target: {
      type: Array,
      default: () => [0, 0, 0]
    }
  },
  emits: ['ready', 'start', 'change', 'end', 'update'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取相机上下文
    const cameraContext = inject(CAMERA_INJECTION_KEY, null);
    
    // 控制器引用
    const controls = ref(null);
    
    // 创建控制器
    const createControls = async () => {
      if (!canvasContext || !canvasContext.engine.value) return;
      if (!cameraContext || !cameraContext.camera.value) return;
      
      try {
        // 获取控制器管理器
        const controlsManager = await canvasContext.engine.value.getOrCreateManager('controls');
        
        // 获取Three.js
        const THREE = canvasContext.engine.value.constructor.THREE;
        
        // 动态导入OrbitControls
        const OrbitControls = await import('three/examples/jsm/controls/OrbitControls.js')
          .then(module => module.OrbitControls);
        
        // 创建控制器
        controls.value = new OrbitControls(
          cameraContext.camera.value,
          canvasContext.container.value
        );
        
        // 设置控制器属性
        updateControls();
        
        // 添加事件监听器
        controls.value.addEventListener('start', () => {
          emit('start', { controls: controls.value });
        });
        
        controls.value.addEventListener('change', () => {
          emit('change', { controls: controls.value });
        });
        
        controls.value.addEventListener('end', () => {
          emit('end', { controls: controls.value });
        });
        
        // 添加到引擎的动画循环
        const animate = () => {
          if (controls.value) {
            controls.value.update();
          }
        };
        
        canvasContext.engine.value.onBeforeRender(animate);
        
        // 触发就绪事件
        emit('ready', { controls: controls.value });
      } catch (error) {
        console.error('Failed to create orbit controls:', error);
      }
    };
    
    // 更新控制器
    const updateControls = () => {
      if (!controls.value) return;
      
      // 更新基本属性
      controls.value.enableRotate = props.enableRotate;
      controls.value.enableZoom = props.enableZoom;
      controls.value.enablePan = props.enablePan;
      controls.value.enableDamping = props.enableDamping;
      controls.value.dampingFactor = props.dampingFactor;
      controls.value.autoRotate = props.autoRotate;
      controls.value.autoRotateSpeed = props.autoRotateSpeed;
      controls.value.minDistance = props.minDistance;
      controls.value.maxDistance = props.maxDistance;
      controls.value.minPolarAngle = props.minPolarAngle;
      controls.value.maxPolarAngle = props.maxPolarAngle;
      controls.value.minAzimuthAngle = props.minAzimuthAngle;
      controls.value.maxAzimuthAngle = props.maxAzimuthAngle;
      
      // 更新目标点
      if (props.target && props.target.length === 3) {
        controls.value.target.set(
          props.target[0],
          props.target[1],
          props.target[2]
        );
      }
      
      // 更新控制器
      controls.value.update();
      
      // 触发更新事件
      emit('update', { controls: controls.value });
    };
    
    // 监听属性变化
    watch(() => props.enableRotate, updateControls);
    watch(() => props.enableZoom, updateControls);
    watch(() => props.enablePan, updateControls);
    watch(() => props.enableDamping, updateControls);
    watch(() => props.dampingFactor, updateControls);
    watch(() => props.autoRotate, updateControls);
    watch(() => props.autoRotateSpeed, updateControls);
    watch(() => props.minDistance, updateControls);
    watch(() => props.maxDistance, updateControls);
    watch(() => props.minPolarAngle, updateControls);
    watch(() => props.maxPolarAngle, updateControls);
    watch(() => props.minAzimuthAngle, updateControls);
    watch(() => props.maxAzimuthAngle, updateControls);
    watch(() => props.target, updateControls, { deep: true });
    
    // 组件挂载和卸载
    onMounted(() => {
      createControls();
    });
    
    onBeforeUnmount(() => {
      if (controls.value) {
        // 移除事件监听器
        controls.value.removeEventListener('start', () => {
          emit('start', { controls: controls.value });
        });
        
        controls.value.removeEventListener('change', () => {
          emit('change', { controls: controls.value });
        });
        
        controls.value.removeEventListener('end', () => {
          emit('end', { controls: controls.value });
        });
        
        // 释放资源
        controls.value.dispose();
        controls.value = null;
      }
    });
    
    return {
      controls
    };
  }
};
</script>

<style scoped>
.three-orbit-controls {
  display: none;
}
</style> 