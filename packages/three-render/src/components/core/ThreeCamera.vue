<template>
  <three-object
    v-if="camera"
    :object="camera"
    v-bind="objectProps"
    @mounted="onMounted"
    @unmounted="onUnmounted"
  >
    <slot></slot>
  </three-object>
</template>

<script setup lang="ts">
import { ref, computed, provide, inject, onMounted as vueOnMounted, onBeforeUnmount, watch, toRefs } from 'vue';
import * as THREE from 'three';
import ThreeObject from './ThreeObject.vue';
import { CAMERA_CONTEXT_KEY, RENDER_CONTEXT_KEY } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * 相机类型
   */
  type?: 'perspective' | 'orthographic';
  
  /**
   * 相机视野(PerspectiveCamera only)
   */
  fov?: number;
  
  /**
   * 长宽比(PerspectiveCamera only)
   */
  aspect?: number;
  
  /**
   * 近裁剪面
   */
  near?: number;
  
  /**
   * 远裁剪面
   */
  far?: number;
  
  /**
   * 正交相机尺寸(OrthographicCamera only)
   */
  size?: number;
  
  /**
   * 相机位置
   */
  position?: [number, number, number] | { x: number, y: number, z: number };
  
  /**
   * 相机朝向(目标点)
   */
  lookAt?: [number, number, number] | { x: number, y: number, z: number };
  
  /**
   * 是否设为主相机
   */
  makeDefault?: boolean;
  
  /**
   * 相机名称
   */
  name?: string;
  
  /**
   * 是否手动更新
   */
  manual?: boolean;
  
  /**
   * 相机视图偏移
   */
  viewOffset?: {
    fullWidth: number;
    fullHeight: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  /**
   * 相机层级
   */
  layers?: number[];
  
  /**
   * 相机旋转
   */
  rotation?: [number, number, number] | { x: number, y: number, z: number };
  
  /**
   * 缩放
   */
  scale?: [number, number, number] | { x: number, y: number, z: number } | number;
  
  /**
   * 是否可见
   */
  visible?: boolean;
  
  /**
   * 渲染顺序
   */
  renderOrder?: number;
  
  /**
   * 用户数据
   */
  userData?: Record<string, any>;
  
  /**
   * 矩阵自动更新
   */
  matrixAutoUpdate?: boolean;
}>(), {
  type: 'perspective',
  fov: 75,
  aspect: 1,
  near: 0.1,
  far: 1000,
  size: 5,
  position: () => [0, 0, 5],
  lookAt: () => [0, 0, 0],
  makeDefault: false,
  name: '',
  manual: false,
  viewOffset: undefined,
  layers: () => [],
  rotation: () => [0, 0, 0],
  scale: 1,
  visible: true,
  renderOrder: 0,
  userData: () => ({}),
  matrixAutoUpdate: true
});

const emit = defineEmits<{
  /**
   * 相机创建
   */
  (e: 'created', camera: THREE.Camera): void;
  
  /**
   * 相机更新
   */
  (e: 'updated', camera: THREE.Camera): void;
  
  /**
   * 相机销毁
   */
  (e: 'disposed'): void;
}>();

// 获取渲染上下文
const renderContext = inject(RENDER_CONTEXT_KEY, null);

// 相机对象
const camera = ref<THREE.Camera | null>(null);

// 转发给 ThreeObject 的属性
const objectProps = computed(() => {
  const { position, rotation, scale, visible, renderOrder, userData, matrixAutoUpdate, name } = toRefs(props);
  
  return {
    position: position.value,
    rotation: rotation.value,
    scale: scale.value,
    visible: visible.value,
    renderOrder: renderOrder.value,
    userData: userData.value,
    matrixAutoUpdate: matrixAutoUpdate.value,
    name: name.value || `${props.type}Camera`
  };
});

// 创建相机
const createCamera = () => {
  // 销毁旧相机
  if (camera.value) {
    camera.value = null;
  }
  
  // 创建新相机
  if (props.type === 'orthographic') {
    // 计算正交相机的尺寸
    const aspect = props.aspect;
    const size = props.size;
    const halfSize = size / 2;
    const halfWidth = halfSize * aspect;
    const halfHeight = halfSize;
    
    // 创建正交相机
    camera.value = new THREE.OrthographicCamera(
      -halfWidth,
      halfWidth,
      halfHeight,
      -halfHeight,
      props.near,
      props.far
    );
  } else {
    // 创建透视相机
    camera.value = new THREE.PerspectiveCamera(
      props.fov,
      props.aspect,
      props.near,
      props.far
    );
  }
  
  // 设置相机名称
  camera.value.name = props.name || `${props.type}Camera`;
  
  // 设置视图偏移
  if (props.viewOffset && camera.value instanceof THREE.PerspectiveCamera) {
    camera.value.setViewOffset(
      props.viewOffset.fullWidth,
      props.viewOffset.fullHeight,
      props.viewOffset.x,
      props.viewOffset.y,
      props.viewOffset.width,
      props.viewOffset.height
    );
  }
  
  // 设置层级
  if (props.layers.length > 0) {
    camera.value.layers.disableAll();
    props.layers.forEach(layer => {
      camera.value?.layers.enable(layer);
    });
  }
  
  // 发出创建事件
  emit('created', camera.value);
  
  return camera.value;
};

// 更新相机参数
const updateCamera = () => {
  if (!camera.value) return;
  
  // 更新透视相机参数
  if (props.type === 'perspective' && camera.value instanceof THREE.PerspectiveCamera) {
    camera.value.fov = props.fov;
    camera.value.aspect = props.aspect;
    camera.value.near = props.near;
    camera.value.far = props.far;
    camera.value.updateProjectionMatrix();
  }
  
  // 更新正交相机参数
  if (props.type === 'orthographic' && camera.value instanceof THREE.OrthographicCamera) {
    const aspect = props.aspect;
    const size = props.size;
    const halfSize = size / 2;
    const halfWidth = halfSize * aspect;
    const halfHeight = halfSize;
    
    camera.value.left = -halfWidth;
    camera.value.right = halfWidth;
    camera.value.top = halfHeight;
    camera.value.bottom = -halfHeight;
    camera.value.near = props.near;
    camera.value.far = props.far;
    camera.value.updateProjectionMatrix();
  }
  
  // 设置层级
  if (props.layers.length > 0) {
    camera.value.layers.disableAll();
    props.layers.forEach(layer => {
      camera.value?.layers.enable(layer);
    });
  }
  
  // 更新视图偏移
  if (props.viewOffset && camera.value instanceof THREE.PerspectiveCamera) {
    camera.value.setViewOffset(
      props.viewOffset.fullWidth,
      props.viewOffset.fullHeight,
      props.viewOffset.x,
      props.viewOffset.y,
      props.viewOffset.width,
      props.viewOffset.height
    );
  }
  
  // 更新相机朝向
  if (props.lookAt) {
    // 获取目标点
    let target: THREE.Vector3;
    if (Array.isArray(props.lookAt)) {
      target = new THREE.Vector3(props.lookAt[0], props.lookAt[1], props.lookAt[2]);
    } else {
      target = new THREE.Vector3(props.lookAt.x, props.lookAt.y, props.lookAt.z);
    }
    
    // 更新相机朝向
    camera.value.lookAt(target);
  }
  
  // 发出更新事件
  emit('updated', camera.value);
};

// 释放资源
const dispose = () => {
  if (camera.value) {
    camera.value = null;
    emit('disposed');
  }
};

// 网格挂载事件
const onMounted = (object: THREE.Object3D) => {
  // 这个函数由 ThreeObject 组件调用
  // 如果需要设为主相机，则更新渲染上下文
  if (props.makeDefault && renderContext?.camera) {
    renderContext.camera.value = camera.value;
  }
  
  // 更新相机朝向
  if (camera.value && props.lookAt) {
    // 获取目标点
    let target: THREE.Vector3;
    if (Array.isArray(props.lookAt)) {
      target = new THREE.Vector3(props.lookAt[0], props.lookAt[1], props.lookAt[2]);
    } else {
      target = new THREE.Vector3(props.lookAt.x, props.lookAt.y, props.lookAt.z);
    }
    
    // 更新相机朝向
    camera.value.lookAt(target);
  }
};

// 网格卸载事件
const onUnmounted = () => {
  // 如果是主相机，则清除渲染上下文中的相机
  if (props.makeDefault && renderContext?.camera?.value === camera.value) {
    renderContext.camera.value = null;
  }
};

// 监听属性变化
watch(
  () => [
    props.type,
    props.fov,
    props.aspect,
    props.near,
    props.far,
    props.size,
    props.viewOffset,
    props.layers
  ],
  updateCamera,
  { deep: true }
);

// 监听 lookAt 属性变化
watch(
  () => props.lookAt,
  () => {
    if (camera.value && props.lookAt) {
      // 获取目标点
      let target: THREE.Vector3;
      if (Array.isArray(props.lookAt)) {
        target = new THREE.Vector3(props.lookAt[0], props.lookAt[1], props.lookAt[2]);
      } else {
        target = new THREE.Vector3(props.lookAt.x, props.lookAt.y, props.lookAt.z);
      }
      
      // 更新相机朝向
      camera.value.lookAt(target);
    }
  },
  { deep: true }
);

// 监听 makeDefault 属性变化
watch(
  () => props.makeDefault,
  (value) => {
    if (value && renderContext?.camera && camera.value) {
      renderContext.camera.value = camera.value;
    }
  }
);

// 创建相机上下文
const cameraContext = {
  camera
};

// 提供相机上下文给子组件
provide(CAMERA_CONTEXT_KEY, cameraContext);

// 生命周期钩子
vueOnMounted(() => {
  createCamera();
  
  // 如果设为主相机，则更新渲染上下文
  if (props.makeDefault && renderContext?.camera && camera.value) {
    renderContext.camera.value = camera.value;
  }
});

onBeforeUnmount(() => {
  // 如果是主相机，则清除渲染上下文中的相机
  if (props.makeDefault && renderContext?.camera?.value === camera.value) {
    renderContext.camera.value = null;
  }
  
  // 释放资源
  dispose();
});

// 暴露给父组件的属性和方法
defineExpose({
  camera,
  createCamera,
  updateCamera,
  dispose
});
</script> 