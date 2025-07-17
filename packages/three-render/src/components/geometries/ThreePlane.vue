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
   * 平面的宽度。默认值为1。
   */
  width?: number;
  /**
   * 平面的高度。默认值为1。
   */
  height?: number;
  /**
   * 宽度方向上的分段数。默认值为1。
   */
  widthSegments?: number;
  /**
   * 高度方向上的分段数。默认值为1。
   */
  heightSegments?: number;
}>(), {
  width: 1,
  height: 1,
  widthSegments: 1,
  heightSegments: 1,
});

const geometry = ref<THREE.PlaneGeometry | null>(null);
const parentApi = injectThreeParent(GEOMETRY_SYMBOL);

// 创建几何体
const createGeometry = () => {
  if (geometry.value) {
    geometry.value.dispose();
  }

  geometry.value = new THREE.PlaneGeometry(
    props.width,
    props.height,
    props.widthSegments,
    props.heightSegments
  );
  
  if (parentApi) {
    parentApi.setGeometry(geometry.value);
  }
};

// 监听属性变化
watch(
  () => ({
    width: props.width,
    height: props.height,
    widthSegments: props.widthSegments,
    heightSegments: props.heightSegments,
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