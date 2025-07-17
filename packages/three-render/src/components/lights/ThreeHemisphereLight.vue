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
   * 天空颜色
   */
  skyColor?: string | number;
  /**
   * 地面颜色
   */
  groundColor?: string | number;
  /**
   * 光源强度
   */
  intensity?: number;
  /**
   * 光源位置
   */
  position?: [number, number, number];
  /**
   * 是否显示辅助对象
   */
  showHelper?: boolean;
  /**
   * 辅助对象的大小
   */
  helperSize?: number;
}>(), {
  skyColor: 0xffffff,
  groundColor: 0x444444,
  intensity: 1,
  position: [0, 1, 0] as [number, number, number],
  showHelper: false,
  helperSize: 1
});

// 创建光源
const light = ref<THREE.HemisphereLight | null>(null);
// 创建辅助对象
const helper = ref<THREE.HemisphereLightHelper | null>(null);

// 注入场景
const sceneApi = injectThreeParent(SCENE_SYMBOL);

// 创建光源
const createLight = () => {
  // 清理旧的光源
  if (light.value) {
    if (sceneApi && sceneApi.scene && sceneApi.scene.value) {
      sceneApi.scene.value.remove(light.value);
      if (helper.value) {
        sceneApi.scene.value.remove(helper.value);
      }
    }
    light.value.dispose();
    if (helper.value) {
      helper.value.dispose();
    }
  }

  // 创建新的光源
  light.value = new THREE.HemisphereLight(
    props.skyColor,
    props.groundColor,
    props.intensity
  );

  // 设置位置
  light.value.position.set(...props.position);

  // 将光源添加到场景
  if (sceneApi && sceneApi.scene && sceneApi.scene.value) {
    sceneApi.scene.value.add(light.value);
    
    // 创建辅助对象
    if (props.showHelper) {
      helper.value = new THREE.HemisphereLightHelper(light.value, props.helperSize);
      sceneApi.scene.value.add(helper.value);
    }
  }
};

// 监听属性变化
watch(
  () => ({
    skyColor: props.skyColor,
    groundColor: props.groundColor,
    intensity: props.intensity,
    position: props.position,
    showHelper: props.showHelper,
    helperSize: props.helperSize
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
      if (helper.value) {
        sceneApi.scene.value.remove(helper.value);
      }
    }
    light.value.dispose();
    if (helper.value) {
      helper.value.dispose();
    }
    light.value = null;
    helper.value = null;
  }
});

// 暴露给父组件
defineExpose({
  light: computed(() => light.value),
  helper: computed(() => helper.value)
});
</script> 