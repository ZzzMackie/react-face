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
   * 材质的高光颜色。默认值为白色。
   */
  specular?: string | number;
  /**
   * 材质的高光亮度。默认值为30。
   */
  shininess?: number;
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
   * 法线贴图。
   */
  normalMap?: THREE.Texture | null;
  /**
   * 法线贴图类型。默认值为THREE.TangentSpaceNormalMap。
   */
  normalMapType?: 'tangent' | 'object';
  /**
   * 法线贴图的缩放。默认值为[1, 1]。
   */
  normalScale?: [number, number];
  /**
   * 高光贴图。
   */
  specularMap?: THREE.Texture | null;
  /**
   * 环境贴图。
   */
  envMap?: THREE.Texture | null;
  /**
   * 环境贴图的组合方式。默认值为'multiply'。
   */
  combine?: 'multiply' | 'mix' | 'add';
  /**
   * 材质的反射率。默认值为1。
   */
  reflectivity?: number;
  /**
   * 材质的折射率。默认值为0.98。
   */
  refractionRatio?: number;
  /**
   * 材质的发光颜色。默认值为黑色。
   */
  emissive?: string | number;
  /**
   * 材质的发光强度。默认值为1。
   */
  emissiveIntensity?: number;
  /**
   * 发光贴图。
   */
  emissiveMap?: THREE.Texture | null;
  /**
   * 材质的雾化效果。默认值为true。
   */
  fog?: boolean;
  /**
   * 材质的光照效果。默认值为true。
   */
  lights?: boolean;
  /**
   * 材质的平坦着色。默认值为false。
   */
  flatShading?: boolean;
}>(), {
  color: 0xffffff,
  specular: 0x111111,
  shininess: 30,
  opacity: 1,
  transparent: false,
  side: 'front' as const,
  wireframe: false,
  wireframeLinewidth: 1,
  map: null,
  normalMap: null,
  normalMapType: 'tangent' as const,
  normalScale: [1, 1] as [number, number],
  specularMap: null,
  envMap: null,
  combine: 'multiply' as const,
  reflectivity: 1,
  refractionRatio: 0.98,
  emissive: 0x000000,
  emissiveIntensity: 1,
  emissiveMap: null,
  fog: true,
  lights: true,
  flatShading: false
});

// 创建材质
const material = ref<THREE.MeshPhongMaterial | null>(null);
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

// 将normalMapType属性转换为THREE常量
const getNormalMapType = (type: string): THREE.NormalMapTypes => {
  switch (type) {
    case 'tangent': return THREE.TangentSpaceNormalMap;
    case 'object': return THREE.ObjectSpaceNormalMap;
    default: return THREE.TangentSpaceNormalMap;
  }
};

// 将combine属性转换为THREE常量
const getCombine = (combine: string): THREE.Combine => {
  switch (combine) {
    case 'multiply': return THREE.MultiplyOperation;
    case 'mix': return THREE.MixOperation;
    case 'add': return THREE.AddOperation;
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
  material.value = new THREE.MeshPhongMaterial({
    color: props.color,
    specular: props.specular,
    shininess: props.shininess,
    opacity: props.opacity,
    transparent: props.transparent,
    side: getSide(props.side),
    wireframe: props.wireframe,
    wireframeLinewidth: props.wireframeLinewidth,
    map: props.map || undefined,
    normalMap: props.normalMap || undefined,
    normalMapType: getNormalMapType(props.normalMapType),
    normalScale: new THREE.Vector2(...props.normalScale),
    specularMap: props.specularMap || undefined,
    envMap: props.envMap || undefined,
    combine: getCombine(props.combine),
    reflectivity: props.reflectivity,
    refractionRatio: props.refractionRatio,
    emissive: props.emissive,
    emissiveIntensity: props.emissiveIntensity,
    emissiveMap: props.emissiveMap || undefined,
    fog: props.fog,
    lights: props.lights,
    flatShading: props.flatShading
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
    specular: props.specular,
    shininess: props.shininess,
    opacity: props.opacity,
    transparent: props.transparent,
    side: props.side,
    wireframe: props.wireframe,
    wireframeLinewidth: props.wireframeLinewidth,
    map: props.map,
    normalMap: props.normalMap,
    normalMapType: props.normalMapType,
    normalScale: props.normalScale,
    specularMap: props.specularMap,
    envMap: props.envMap,
    combine: props.combine,
    reflectivity: props.reflectivity,
    refractionRatio: props.refractionRatio,
    emissive: props.emissive,
    emissiveIntensity: props.emissiveIntensity,
    emissiveMap: props.emissiveMap,
    fog: props.fog,
    lights: props.lights,
    flatShading: props.flatShading
  }),
  (newProps) => {
    if (!material.value) return;
    
    // 更新材质属性
    material.value.color = new THREE.Color(newProps.color);
    material.value.specular = new THREE.Color(newProps.specular);
    material.value.shininess = newProps.shininess;
    material.value.opacity = newProps.opacity;
    material.value.transparent = newProps.transparent;
    material.value.side = getSide(newProps.side);
    material.value.wireframe = newProps.wireframe;
    material.value.wireframeLinewidth = newProps.wireframeLinewidth;
    material.value.map = newProps.map || null;
    material.value.normalMap = newProps.normalMap || null;
    material.value.normalMapType = getNormalMapType(newProps.normalMapType);
    material.value.normalScale.set(newProps.normalScale[0], newProps.normalScale[1]);
    material.value.specularMap = newProps.specularMap || null;
    material.value.envMap = newProps.envMap || null;
    material.value.combine = getCombine(newProps.combine);
    material.value.reflectivity = newProps.reflectivity;
    material.value.refractionRatio = newProps.refractionRatio;
    material.value.emissive = new THREE.Color(newProps.emissive);
    material.value.emissiveIntensity = newProps.emissiveIntensity;
    material.value.emissiveMap = newProps.emissiveMap || null;
    material.value.fog = newProps.fog;
    material.value.flatShading = newProps.flatShading;
    
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