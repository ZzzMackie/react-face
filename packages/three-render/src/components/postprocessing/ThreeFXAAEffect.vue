<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { POST_PROCESSING_CONTEXT_KEY } from '../../constants';
import { useThree } from '../../composables/useThree';

const props = withDefaults(defineProps<{
  /**
   * 是否启用。默认为true。
   */
  enabled?: boolean;
}>(), {
  enabled: true
});

// 使用three组合式函数
const { size, renderer } = useThree();

// 获取后处理上下文
const postProcessingContext = inject(POST_PROCESSING_CONTEXT_KEY, null);

// 创建FXAA通道
const fxaaPass = ref<ShaderPass | null>(null);

// 创建FXAA通道
const createFXAAPass = () => {
  if (!size.value) {
    return;
  }

  // 创建FXAA通道
  fxaaPass.value = new ShaderPass(FXAAShader);
  
  // 更新分辨率
  updateResolution();
  
  // 设置启用状态
  if (fxaaPass.value) {
    fxaaPass.value.enabled = props.enabled;
  }
  
  // 添加到效果合成器
  if (postProcessingContext && fxaaPass.value) {
    postProcessingContext.addEffectPass(fxaaPass.value);
  }
};

// 更新分辨率
const updateResolution = () => {
  if (!fxaaPass.value || !size.value || !renderer.value) {
    return;
  }
  
  const pixelRatio = renderer.value.getPixelRatio();
  const uniforms = fxaaPass.value.material.uniforms;
  
  uniforms['resolution'].value.x = 1 / (size.value.width * pixelRatio);
  uniforms['resolution'].value.y = 1 / (size.value.height * pixelRatio);
};

// 更新FXAA通道配置
const updateFXAAPassConfig = () => {
  if (!fxaaPass.value) {
    return;
  }
  
  fxaaPass.value.enabled = props.enabled;
};

// 监听属性变化
watch(
  () => ({
    enabled: props.enabled
  }),
  () => {
    updateFXAAPassConfig();
  },
  { deep: true }
);

// 监听尺寸变化
watch(
  size,
  () => {
    updateResolution();
  }
);

// 组件挂载时创建FXAA通道
onMounted(() => {
  createFXAAPass();
});

// 组件卸载时移除FXAA通道
onBeforeUnmount(() => {
  if (postProcessingContext && fxaaPass.value) {
    postProcessingContext.removeEffectPass(fxaaPass.value);
  }
  
  if (fxaaPass.value && fxaaPass.value.dispose) {
    fxaaPass.value.dispose();
  }
  
  fxaaPass.value = null;
});

// 暴露API
defineExpose({
  fxaaPass
});
</script> 