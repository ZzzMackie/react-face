<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch, onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useThree } from '../../composables/useThree';

const props = withDefaults(defineProps<{
  /**
   * 是否启用旋转
   */
  enableRotate?: boolean;
  /**
   * 是否启用平移
   */
  enablePan?: boolean;
  /**
   * 是否启用缩放
   */
  enableZoom?: boolean;
  /**
   * 是否启用阻尼效果
   */
  enableDamping?: boolean;
  /**
   * 阻尼系数
   */
  dampingFactor?: number;
  /**
   * 最小距离
   */
  minDistance?: number;
  /**
   * 最大距离
   */
  maxDistance?: number;
  /**
   * 最小极角（仰角）
   */
  minPolarAngle?: number;
  /**
   * 最大极角（仰角）
   */
  maxPolarAngle?: number;
  /**
   * 最小方位角
   */
  minAzimuthAngle?: number;
  /**
   * 最大方位角
   */
  maxAzimuthAngle?: number;
  /**
   * 自动旋转
   */
  autoRotate?: boolean;
  /**
   * 自动旋转速度
   */
  autoRotateSpeed?: number;
}>(), {
  enableRotate: true,
  enablePan: true,
  enableZoom: true,
  enableDamping: true,
  dampingFactor: 0.05,
  minDistance: 0,
  maxDistance: Infinity,
  minPolarAngle: 0,
  maxPolarAngle: Math.PI,
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle: Infinity,
  autoRotate: false,
  autoRotateSpeed: 2.0
});

// 控制器实例
const controls = ref<OrbitControls | null>(null);

// 使用 three 组合式函数获取场景、相机等
const { camera, renderer } = useThree();

// 创建控制器
const createControls = () => {
  // 确保相机和渲染器存在
  if (!camera.value || !renderer.value) {
    return;
  }

  // 清理旧控制器
  disposeControls();

  // 创建新的控制器
  controls.value = new OrbitControls(camera.value, renderer.value.domElement);

  // 配置控制器
  updateControlsConfig();

  // 添加变化事件监听
  controls.value.addEventListener('change', () => {
    emit('change', controls.value);
  });
};

// 更新控制器配置
const updateControlsConfig = () => {
  if (!controls.value) {
    return;
  }

  controls.value.enableRotate = props.enableRotate;
  controls.value.enablePan = props.enablePan;
  controls.value.enableZoom = props.enableZoom;
  controls.value.enableDamping = props.enableDamping;
  controls.value.dampingFactor = props.dampingFactor;
  controls.value.minDistance = props.minDistance;
  controls.value.maxDistance = props.maxDistance;
  controls.value.minPolarAngle = props.minPolarAngle;
  controls.value.maxPolarAngle = props.maxPolarAngle;
  controls.value.minAzimuthAngle = props.minAzimuthAngle;
  controls.value.maxAzimuthAngle = props.maxAzimuthAngle;
  controls.value.autoRotate = props.autoRotate;
  controls.value.autoRotateSpeed = props.autoRotateSpeed;

  // 更新控制器
  controls.value.update();
};

// 清理控制器
const disposeControls = () => {
  if (controls.value) {
    controls.value.dispose();
    controls.value = null;
  }
};

// 定义事件
const emit = defineEmits<{
  (e: 'change', controls: OrbitControls | null): void;
}>();

// 监听属性变化
watch(
  () => ({
    enableRotate: props.enableRotate,
    enablePan: props.enablePan,
    enableZoom: props.enableZoom,
    enableDamping: props.enableDamping,
    dampingFactor: props.dampingFactor,
    minDistance: props.minDistance,
    maxDistance: props.maxDistance,
    minPolarAngle: props.minPolarAngle,
    maxPolarAngle: props.maxPolarAngle,
    minAzimuthAngle: props.minAzimuthAngle,
    maxAzimuthAngle: props.maxAzimuthAngle,
    autoRotate: props.autoRotate,
    autoRotateSpeed: props.autoRotateSpeed
  }),
  () => {
    updateControlsConfig();
  },
  { deep: true }
);

// 监听相机和渲染器变化
watch(
  [camera, renderer],
  ([newCamera, newRenderer]) => {
    if (newCamera && newRenderer) {
      createControls();
    }
  },
  { immediate: true }
);

// 在组件挂载时初始化
onMounted(() => {
  if (camera.value && renderer.value) {
    createControls();
  }
});

// 在组件卸载前清理
onBeforeUnmount(() => {
  disposeControls();
});

// 暴露控制器实例
defineExpose({
  controls
});
</script> 