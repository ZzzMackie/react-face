<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import * as THREE from 'three';
import { injectThreeParent } from '../../composables/useThree';
import { MATERIAL_SYMBOL } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * 材质的颜色。默认值为白色。
   */
  color?: string | number;
  /**
   * 材质的透明度。默认值为1（完全不透明）。
   */
  opacity?: number;
  /**
   * 材质是否透明。默认值为false。
   */
  transparent?: boolean;
  /**
   * 材质的可见面。默认值为'front'。
   */
  side?: 'front' | 'back' | 'double';
  /**
   * 材质是否以线框模式渲染。默认值为false。
   */
  wireframe?: boolean;
  /**
   * 线框宽度。默认值为1。
   */
  wireframeLinewidth?: number;
  /**
   * 漫反射贴图。
   */
  map?: THREE.Texture | null;
  /**
   * 环境贴图。
   */
  envMap?: THREE.Texture | null;
  /**
   * 材质的反射率。默认值为1。
   */
  reflectivity?: number;
  /**
   * 材质的折射率。默认值为0.98。
   */
  refractionRatio?: number;
  /**
   * 材质的组合方式。默认值为'MultiplyOperation'。
   */
  combine?: 'MultiplyOperation' | 'MixOperation' | 'AddOperation';
  /**
   * 材质的雾化效果。默认值为true。
   */
  fog?: boolean;
}>(), {
  color: 0xffffff,
  opacity: 1,
  transparent: false,
  side: 'front' as const,
  wireframe: false,
  wireframeLinewidth: 1,
  map: null,
  envMap: null,
  reflectivity: 1,
  refractionRatio: 0.98,
  combine: 'MultiplyOperation' as const,
  fog: true
});

// 创建材质
const material = ref<THREE.MeshBasicMaterial | null>(null);
const parentApi = injectThreeParent(MATERIAL_SYMBOL);

// 将side属性转换为THREE常量
const getSide = (side: string): THREE.Side => {
  switch (side) {
    case 'front': return THREE.FrontSide;
    case 'back': return THREE.BackSide;
    case 'double': return THREE.DoubleSide;
    default: return THREE.FrontSide;
  }
};

// 将combine属性转换为THREE常量
const getCombine = (combine: string): THREE.Combine => {
  switch (combine) {
    case 'MultiplyOperation': return THREE.MultiplyOperation;
    case 'MixOperation': return THREE.MixOperation;
    case 'AddOperation': return THREE.AddOperation;
    default: return THREE.MultiplyOperation;
  }
};

// 创建材质
const createMaterial = () => {
  // 清理旧材质
  if (material.value) {
    material.value.dispose();
  }

  // 创建新材质
  material.value = new THREE.MeshBasicMaterial({
    color: props.color,
    opacity: props.opacity,
    transparent: props.transparent,
    side: getSide(props.side),
    wireframe: props.wireframe,
    wireframeLinewidth: props.wireframeLinewidth,
    map: props.map || undefined,
    envMap: props.envMap || undefined,
    reflectivity: props.reflectivity,
    refractionRatio: props.refractionRatio,
    combine: getCombine(props.combine),
    fog: props.fog
  });

  // 通知父组件
  if (parentApi) {
    parentApi.setMaterial(material.value);
  }
};

// 监听属性变化
watch(
  () => ({
    color: props.color,
    opacity: props.opacity,
    transparent: props.transparent,
    side: props.side,
    wireframe: props.wireframe,
    wireframeLinewidth: props.wireframeLinewidth,
    map: props.map,
    envMap: props.envMap,
    reflectivity: props.reflectivity,
    refractionRatio: props.refractionRatio,
    combine: props.combine,
    fog: props.fog
  }),
  (newProps) => {
    if (!material.value) return;
    
    // 更新材质属性
    material.value.color = new THREE.Color(newProps.color);
    material.value.opacity = newProps.opacity;
    material.value.transparent = newProps.transparent;
    material.value.side = getSide(newProps.side);
    material.value.wireframe = newProps.wireframe;
    material.value.wireframeLinewidth = newProps.wireframeLinewidth;
    material.value.map = newProps.map || null;
    material.value.envMap = newProps.envMap || null;
    material.value.reflectivity = newProps.reflectivity;
    material.value.refractionRatio = newProps.refractionRatio;
    material.value.combine = getCombine(newProps.combine);
    material.value.fog = newProps.fog;
    
    // 标记需要更新
    material.value.needsUpdate = true;
  },
  { deep: true }
);

// 初始化创建材质
createMaterial();

// 清理资源
onBeforeUnmount(() => {
  if (material.value) {
    material.value.dispose();
    material.value = null;
  }
});

// 暴露给父组件
defineExpose({
  material: computed(() => material.value),
});
</script> 