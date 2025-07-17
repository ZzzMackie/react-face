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
   * 环形结的半径。默认值为1。
   */
  radius?: number;
  /**
   * 管道的半径。默认值为0.4。
   */
  tube?: number;
  /**
   * 管道横截面的分段数。默认值为8。
   */
  tubularSegments?: number;
  /**
   * 管道的分段数。默认值为64。
   */
  radialSegments?: number;
  /**
   * 环形结的P参数，影响环形结的形状。默认值为2。
   */
  p?: number;
  /**
   * 环形结的Q参数，影响环形结的形状。默认值为3。
   */
  q?: number;
}>(), {
  radius: 1,
  tube: 0.4,
  tubularSegments: 64,
  radialSegments: 8,
  p: 2,
  q: 3
});

const geometry = ref<THREE.TorusKnotGeometry | null>(null);
const parentApi = injectThreeParent(GEOMETRY_SYMBOL);

// 创建几何体
const createGeometry = () => {
  if (geometry.value) {
    geometry.value.dispose();
  }

  geometry.value = new THREE.TorusKnotGeometry(
    props.radius,
    props.tube,
    props.tubularSegments,
    props.radialSegments,
    props.p,
    props.q
  );
  
  if (parentApi) {
    parentApi.setGeometry(geometry.value);
  }
};

// 监听属性变化
watch(
  () => ({
    radius: props.radius,
    tube: props.tube,
    tubularSegments: props.tubularSegments,
    radialSegments: props.radialSegments,
    p: props.p,
    q: props.q
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