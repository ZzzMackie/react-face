<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import * as THREE from 'three';
import { useParent } from '../../composables/useThree';
import { geometryKeys } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * 球体的半径。默认值为1。
   */
  radius?: number;
  /**
   * 水平方向的分段数。默认值为32。
   */
  widthSegments?: number;
  /**
   * 垂直方向的分段数。默认值为16。
   */
  heightSegments?: number;
  /**
   * 水平方向上的起始角度。默认值为0。
   */
  phiStart?: number;
  /**
   * 水平方向上的角度。默认值为Math.PI * 2。
   */
  phiLength?: number;
  /**
   * 垂直方向上的起始角度。默认值为0。
   */
  thetaStart?: number;
  /**
   * 垂直方向上的角度。默认值为Math.PI。
   */
  thetaLength?: number;
}>(), {
  radius: 1,
  widthSegments: 32,
  heightSegments: 16,
  phiStart: 0,
  phiLength: Math.PI * 2,
  thetaStart: 0,
  thetaLength: Math.PI,
});

const geometry = ref<THREE.SphereGeometry | null>(null);
const { parentApi } = useParent(geometryKeys);

// 创建几何体
const createGeometry = () => {
  if (geometry.value) {
    geometry.value.dispose();
  }

  geometry.value = new THREE.SphereGeometry(
    props.radius,
    props.widthSegments,
    props.heightSegments,
    props.phiStart,
    props.phiLength,
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
    widthSegments: props.widthSegments,
    heightSegments: props.heightSegments,
    phiStart: props.phiStart,
    phiLength: props.phiLength,
    thetaStart: props.thetaStart,
    thetaLength: props.thetaLength,
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