<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, provide, watch } from 'vue';
import * as THREE from 'three';
import { CANVAS_CONTEXT_KEY, CAMERA_CONTEXT_KEY, DEFAULT_CAMERA } from '../../constants';
import type { ThreeVector3 } from '../../types';

const props = withDefaults(defineProps<{
  /**
   * 相机类型
   */
  type?: 'perspective' | 'orthographic';
  
  /**
   * 视场角（仅透视相机）
   */
  fov?: number;
  
  /**
   * 近裁剪面
   */
  near?: number;
  
  /**
   * 远裁剪面
   */
  far?: number;
  
  /**
   * 相机位置
   */
  position?: ThreeVector3;
  
  /**
   * 相机朝向
   */
  lookAt?: ThreeVector3;
  
  /**
   * 是否为主相机
   */
  makeDefault?: boolean;
  
  /**
   * 正交相机参数（仅正交相机）
   */
  orthographic?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  
  /**
   * 视口大小
   */
  viewport?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  
  /**
   * 相机缩放（仅正交相机）
   */
  zoom?: number;
}>(), {
  type: 'perspective',
  fov: DEFAULT_CAMERA.FOV,
  near: DEFAULT_CAMERA.NEAR,
  far: DEFAULT_CAMERA.FAR,
  position: () => [...DEFAULT_CAMERA.POSITION],
  lookAt: () => [...DEFAULT_CAMERA.LOOK_AT],
  makeDefault: true,
  orthographic: () => ({}),
  viewport: () => ({}),
  zoom: 1
});

// 获取 Canvas 上下文
const canvasContext = inject(CANVAS_CONTEXT_KEY, null);
if (!canvasContext) {
  console.error('ThreeCamera must be used within ThreeCanvas');
}

// 相机引用
const camera = ref<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>(null);

// 初始化相机
async function initCamera() {
  if (!canvasContext?.engine?.value) return;
  
  // 获取相机管理器
  const cameraManager = await canvasContext.engine.value.getCamera();
  if (!cameraManager) return;
  
  // 创建相机
  if (props.type === 'orthographic') {
    // 获取容器大小
    const containerEl = canvasContext.containerRef.value;
    const width = containerEl?.clientWidth || 1;
    const height = containerEl?.clientHeight || 1;
    const aspect = width / height;
    
    // 计算正交相机参数
    const left = props.orthographic.left !== undefined ? props.orthographic.left : -aspect;
    const right = props.orthographic.right !== undefined ? props.orthographic.right : aspect;
    const top = props.orthographic.top !== undefined ? props.orthographic.top : 1;
    const bottom = props.orthographic.bottom !== undefined ? props.orthographic.bottom : -1;
    
    // 创建正交相机
    camera.value = new THREE.OrthographicCamera(
      left,
      right,
      top,
      bottom,
      props.near,
      props.far
    );
    
    // 设置缩放
    camera.value.zoom = props.zoom;
    camera.value.updateProjectionMatrix();
  } else {
    // 创建透视相机
    camera.value = new THREE.PerspectiveCamera(
      props.fov,
      1, // 初始宽高比，会在 resize 时更新
      props.near,
      props.far
    );
  }
  
  // 设置位置
  if (props.position) {
    camera.value.position.set(props.position[0], props.position[1], props.position[2]);
  }
  
  // 设置朝向
  if (props.lookAt) {
    camera.value.lookAt(props.lookAt[0], props.lookAt[1], props.lookAt[2]);
  }
  
  // 设置为主相机
  if (props.makeDefault) {
    cameraManager.setActiveCamera(camera.value);
  }
  
  // 设置视口
  if (props.viewport && Object.keys(props.viewport).length > 0) {
    cameraManager.setViewport(camera.value, {
      x: props.viewport.x || 0,
      y: props.viewport.y || 0,
      width: props.viewport.width || 1,
      height: props.viewport.height || 1
    });
  }
}

// 监听属性变化
watch(() => props.position, (newPosition) => {
  if (camera.value && newPosition) {
    camera.value.position.set(newPosition[0], newPosition[1], newPosition[2]);
  }
}, { deep: true });

watch(() => props.lookAt, (newLookAt) => {
  if (camera.value && newLookAt) {
    camera.value.lookAt(newLookAt[0], newLookAt[1], newLookAt[2]);
  }
}, { deep: true });

watch(() => props.zoom, (newZoom) => {
  if (camera.value && props.type === 'orthographic') {
    (camera.value as THREE.OrthographicCamera).zoom = newZoom;
    (camera.value as THREE.OrthographicCamera).updateProjectionMatrix();
  }
});

// 生命周期钩子
onMounted(async () => {
  await initCamera();
});

onBeforeUnmount(() => {
  if (camera.value && canvasContext?.engine?.value) {
    // 如果是主相机，则不删除它（由引擎管理）
    if (!props.makeDefault) {
      camera.value = null;
    }
  }
});

// 提供相机上下文
provide(CAMERA_CONTEXT_KEY, {
  camera
});

// 暴露给父组件的属性和方法
defineExpose({
  camera,
  /**
   * 更新相机位置
   */
  setPosition: (x: number, y: number, z: number) => {
    if (camera.value) {
      camera.value.position.set(x, y, z);
    }
  },
  /**
   * 更新相机朝向
   */
  lookAt: (x: number, y: number, z: number) => {
    if (camera.value) {
      camera.value.lookAt(x, y, z);
    }
  }
});
</script> 