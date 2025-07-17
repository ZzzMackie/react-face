<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch, computed } from 'vue';
import * as THREE from 'three';
import { injectThreeParent } from '../../composables/useThree';
import { SCENE_SYMBOL } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * 光源颜色
   */
  color?: string | number;
  /**
   * 光源强度
   */
  intensity?: number;
}>(), {
  color: 0xffffff,
  intensity: 1
});

// 创建光源
const light = ref<THREE.AmbientLight | null>(null);

// 注入场景
const sceneApi = injectThreeParent(SCENE_SYMBOL);

// 创建光源
const createLight = () => {
  // 清理旧的光源
  if (light.value) {
    if (sceneApi && sceneApi.scene && sceneApi.scene.value) {
      sceneApi.scene.value.remove(light.value);
    }
    light.value.dispose();
  }

  // 创建新的光源
  light.value = new THREE.AmbientLight(props.color, props.intensity);

  // 将光源添加到场景
  if (sceneApi && sceneApi.scene && sceneApi.scene.value) {
    sceneApi.scene.value.add(light.value);
  }
};

// 监听属性变化
watch(
  () => ({
    color: props.color,
    intensity: props.intensity
  }),
  () => {
    createLight();
  },
  { deep: true }
);

// 初始化时创建光源
createLight();

// 组件销毁时清理资源
onBeforeUnmount(() => {
  if (light.value) {
    if (sceneApi && sceneApi.scene && sceneApi.scene.value) {
      sceneApi.scene.value.remove(light.value);
    }
    light.value.dispose();
    light.value = null;
  }
});

// 暴露给父组件
defineExpose({
  light: computed(() => light.value)
});
</script> 