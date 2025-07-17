<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { useThree } from '../../composables/useThree';
import { POST_PROCESSING_CONTEXT_KEY } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * 渲染比例，影响性能和质量。默认为1。
   */
  renderScale?: number;
  /**
   * 是否使用物理曝光。默认为false。
   */
  usePhysicalExposure?: boolean;
  /**
   * 曝光值。默认为1。
   */
  exposure?: number;
  /**
   * 是否自动清除。默认为true。
   */
  autoClear?: boolean;
  /**
   * 是否自动清除深度。默认为true。
   */
  autoClearDepth?: boolean;
  /**
   * 是否自动更新。默认为true。
   */
  autoUpdate?: boolean;
  /**
   * 精度。默认为'highp'。
   */
  precision?: 'lowp' | 'mediump' | 'highp';
}>(), {
  renderScale: 1,
  usePhysicalExposure: false,
  exposure: 1,
  autoClear: true,
  autoClearDepth: true,
  autoUpdate: true,
  precision: 'highp' as const
});

// 使用three组合式函数
const { renderer, scene, camera } = useThree();

// 创建效果合成器
const composer = ref<EffectComposer | null>(null);

// 渲染通道
const renderPass = ref<RenderPass | null>(null);

// 效果通道列表
const effectPasses = ref<any[]>([]);

// 创建效果合成器
const createComposer = () => {
  if (!renderer.value || !scene.value || !camera.value) {
    return;
  }

  // 创建效果合成器
  composer.value = new EffectComposer(renderer.value);
  
  // 设置渲染比例
  composer.value.setPixelRatio(window.devicePixelRatio * props.renderScale);
  
  // 设置精度
  (composer.value as any).outputEncoding = renderer.value.outputEncoding;
  (composer.value as any).toneMapping = renderer.value.toneMapping;
  (composer.value as any).toneMappingExposure = renderer.value.toneMappingExposure;
  
  // 创建渲染通道
  renderPass.value = new RenderPass(scene.value, camera.value);
  composer.value.addPass(renderPass.value);
};

// 更新效果合成器配置
const updateComposerConfig = () => {
  if (!composer.value || !renderer.value) {
    return;
  }
  
  // 设置渲染比例
  composer.value.setPixelRatio(window.devicePixelRatio * props.renderScale);
  
  // 设置曝光
  if (props.usePhysicalExposure && renderer.value) {
    renderer.value.toneMappingExposure = props.exposure;
  }
  
  // 设置自动清除
  if (renderPass.value) {
    renderPass.value.clear = props.autoClear;
    renderPass.value.clearDepth = props.autoClearDepth;
  }
};

// 添加效果通道
const addEffectPass = (pass: any) => {
  if (composer.value) {
    composer.value.addPass(pass);
    effectPasses.value.push(pass);
  }
};

// 移除效果通道
const removeEffectPass = (pass: any) => {
  if (composer.value) {
    const index = effectPasses.value.indexOf(pass);
    if (index !== -1) {
      composer.value.removePass(pass);
      effectPasses.value.splice(index, 1);
    }
  }
};

// 监听属性变化
watch(
  () => ({
    renderScale: props.renderScale,
    usePhysicalExposure: props.usePhysicalExposure,
    exposure: props.exposure,
    autoClear: props.autoClear,
    autoClearDepth: props.autoClearDepth
  }),
  () => {
    updateComposerConfig();
  },
  { deep: true }
);

// 监听渲染器、场景和相机变化
watch(
  [renderer, scene, camera],
  ([newRenderer, newScene, newCamera]) => {
    if (newRenderer && newScene && newCamera) {
      createComposer();
      updateComposerConfig();
    }
  },
  { immediate: true }
);

// 提供后处理上下文
provide(POST_PROCESSING_CONTEXT_KEY, {
  composer,
  addEffectPass,
  removeEffectPass
});

// 组件卸载时清理资源
onBeforeUnmount(() => {
  if (composer.value) {
    // 清理效果通道
    effectPasses.value.forEach(pass => {
      if (pass.dispose) {
        pass.dispose();
      }
    });
    
    // 清空效果通道列表
    effectPasses.value = [];
    
    // 清理渲染通道
    if (renderPass.value && renderPass.value.dispose) {
      renderPass.value.dispose();
    }
    
    // 清理效果合成器
    composer.value.dispose();
    composer.value = null;
  }
});

// 暴露API
defineExpose({
  composer,
  addEffectPass,
  removeEffectPass
});
</script> 