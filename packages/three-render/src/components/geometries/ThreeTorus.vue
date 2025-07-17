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
   * 环面的半径，从环面中心到管道中心的距离。默认值为1。
   */
  radius?: number;
  /**
   * 管道的半径。默认值为0.4。
   */
  tube?: number;
  /**
   * 管道横截面的分段数。默认值为8。
   */
  radialSegments?: number;
  /**
   * 管道的分段数。默认值为6。
   */
  tubularSegments?: number;
  /**
   * 圆环的圆心角（弧度）。默认值为Math.PI * 2。
   */
  arc?: number;
}>(), {
  radius: 1,
  tube: 0.4,
  radialSegments: 8,
  tubularSegments: 64,
  arc: Math.PI * 2
});

const geometry = ref<THREE.TorusGeometry | null>(null);
const parentApi = injectThreeParent(GEOMETRY_SYMBOL);

// 创建几何体
const createGeometry = () => {
  if (geometry.value) {
    geometry.value.dispose();
  }

  geometry.value = new THREE.TorusGeometry(
    props.radius,
    props.tube,
    props.radialSegments,
    props.tubularSegments,
    props.arc
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
    radialSegments: props.radialSegments,
    tubularSegments: props.tubularSegments,
    arc: props.arc
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