<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import * as THREE from 'three';
import { injectThreeParent } from '../../composables/useThree';
import { GEOMETRY_SYMBOL } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * 圆锥体底部的半径。默认值为1。
   */
  radius?: number;
  /**
   * 圆锥体的高度。默认值为1。
   */
  height?: number;
  /**
   * 圆锥体周围的分段数。默认值为32。
   */
  radialSegments?: number;
  /**
   * 沿着圆锥体高度的分段数。默认值为1。
   */
  heightSegments?: number;
  /**
   * 圆锥体是否在底部有开口。默认值为false。
   */
  openEnded?: boolean;
  /**
   * 圆周方向的起始角度。默认值为0。
   */
  thetaStart?: number;
  /**
   * 圆周方向的角度。默认值为Math.PI * 2。
   */
  thetaLength?: number;
}>(), {
  radius: 1,
  height: 1,
  radialSegments: 32,
  heightSegments: 1,
  openEnded: false,
  thetaStart: 0,
  thetaLength: Math.PI * 2
});

const geometry = ref<THREE.ConeGeometry | null>(null);
const parentApi = injectThreeParent(GEOMETRY_SYMBOL);

// 创建几何体
const createGeometry = () => {
  if (geometry.value) {
    geometry.value.dispose();
  }

  geometry.value = new THREE.ConeGeometry(
    props.radius,
    props.height,
    props.radialSegments,
    props.heightSegments,
    props.openEnded,
    props.thetaStart,
    props.thetaLength
  );
  
  if (parentApi) {
    parentApi.setGeometry(geometry.value);
  }
};

// 监听属性变化
watch(
  () => ({
    radius: props.radius,
    height: props.height,
    radialSegments: props.radialSegments,
    heightSegments: props.heightSegments,
    openEnded: props.openEnded,
    thetaStart: props.thetaStart,
    thetaLength: props.thetaLength
  }),
  () => {
    createGeometry();
  },
  { deep: true }
);

// 初始化创建几何体
createGeometry();

// 清理资源
onBeforeUnmount(() => {
  if (geometry.value) {
    geometry.value.dispose();
    geometry.value = null;
  }
});

// 暴露给父组件
defineExpose({
  geometry: computed(() => geometry.value),
});
</script> 