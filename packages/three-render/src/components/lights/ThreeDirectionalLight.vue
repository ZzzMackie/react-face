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
  /**
   * 光源位置
   */
  position?: [number, number, number];
  /**
   * 光源目标点
   */
  target?: [number, number, number];
  /**
   * 是否投射阴影
   */
  castShadow?: boolean;
  /**
   * 阴影贴图尺寸
   */
  shadowMapSize?: [number, number];
  /**
   * 阴影相机视锥体的远端
   */
  shadowCameraFar?: number;
  /**
   * 阴影相机视锥体的近端
   */
  shadowCameraNear?: number;
  /**
   * 阴影相机视锥体的顶部
   */
  shadowCameraTop?: number;
  /**
   * 阴影相机视锥体的底部
   */
  shadowCameraBottom?: number;
  /**
   * 阴影相机视锥体的左侧
   */
  shadowCameraLeft?: number;
  /**
   * 阴影相机视锥体的右侧
   */
  shadowCameraRight?: number;
  /**
   * 阴影模糊样本数
   */
  shadowSamples?: number;
  /**
   * 阴影偏差
   */
  shadowBias?: number;
  /**
   * 是否自动更新阴影
   */
  shadowAutoUpdate?: boolean;
}>(), {
  color: 0xffffff,
  intensity: 1,
  position: [5, 5, 5] as [number, number, number],
  target: [0, 0, 0] as [number, number, number],
  castShadow: false,
  shadowMapSize: [512, 512] as [number, number],
  shadowCameraFar: 500,
  shadowCameraNear: 0.5,
  shadowCameraTop: 5,
  shadowCameraBottom: -5,
  shadowCameraLeft: -5,
  shadowCameraRight: 5,
  shadowSamples: 8,
  shadowBias: -0.0005,
  shadowAutoUpdate: true
});

// 创建光源
const light = ref<THREE.DirectionalLight | null>(null);
// 创建目标
const targetObject = ref<THREE.Object3D | null>(null);

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
  light.value = new THREE.DirectionalLight(props.color, props.intensity);

  // 设置位置
  light.value.position.set(...props.position);

  // 创建目标对象
  targetObject.value = new THREE.Object3D();
  targetObject.value.position.set(...props.target);
  light.value.target = targetObject.value;

  // 设置阴影
  light.value.castShadow = props.castShadow;
  
  if (props.castShadow && light.value.shadow) {
    // 设置阴影贴图尺寸
    light.value.shadow.mapSize.width = props.shadowMapSize[0];
    light.value.shadow.mapSize.height = props.shadowMapSize[1];
    
    // 设置阴影相机参数
    if (light.value.shadow.camera instanceof THREE.OrthographicCamera) {
      light.value.shadow.camera.far = props.shadowCameraFar;
      light.value.shadow.camera.near = props.shadowCameraNear;
      light.value.shadow.camera.top = props.shadowCameraTop;
      light.value.shadow.camera.bottom = props.shadowCameraBottom;
      light.value.shadow.camera.left = props.shadowCameraLeft;
      light.value.shadow.camera.right = props.shadowCameraRight;
    }
    
    // 设置阴影偏差
    light.value.shadow.bias = props.shadowBias;
    
    // 设置阴影样本数（如果支持）
    if ('samples' in light.value.shadow) {
      (light.value.shadow as any).samples = props.shadowSamples;
    }
    
    // 设置阴影自动更新
    light.value.shadow.autoUpdate = props.shadowAutoUpdate;
    
    // 更新阴影相机
    light.value.shadow.camera.updateProjectionMatrix();
  }

  // 将光源和目标添加到场景
  if (sceneApi && sceneApi.scene && sceneApi.scene.value) {
    sceneApi.scene.value.add(light.value);
    sceneApi.scene.value.add(targetObject.value);
  }
};

// 监听属性变化
watch(
  () => ({
    color: props.color,
    intensity: props.intensity,
    position: props.position,
    target: props.target,
    castShadow: props.castShadow,
    shadowMapSize: props.shadowMapSize,
    shadowCameraFar: props.shadowCameraFar,
    shadowCameraNear: props.shadowCameraNear,
    shadowCameraTop: props.shadowCameraTop,
    shadowCameraBottom: props.shadowCameraBottom,
    shadowCameraLeft: props.shadowCameraLeft,
    shadowCameraRight: props.shadowCameraRight,
    shadowSamples: props.shadowSamples,
    shadowBias: props.shadowBias,
    shadowAutoUpdate: props.shadowAutoUpdate
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
      if (targetObject.value) {
        sceneApi.scene.value.remove(targetObject.value);
      }
    }
    light.value.dispose();
    light.value = null;
    targetObject.value = null;
  }
});

// 暴露给父组件
defineExpose({
  light: computed(() => light.value)
});
</script> 