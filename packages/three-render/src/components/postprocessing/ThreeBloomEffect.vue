<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { POST_PROCESSING_CONTEXT_KEY } from '../../constants';
import { useThree } from '../../composables/useThree';

const props = withDefaults(defineProps<{
  /**
   * 辉光强度。默认为1。
   */
  strength?: number;
  /**
   * 辉光半径。默认为0.7。
   */
  radius?: number;
  /**
   * 辉光阈值，低于此值的亮度不会产生辉光。默认为0.8。
   */
  threshold?: number;
  /**
   * 辉光分辨率，影响性能和质量。默认为256。
   */
  resolution?: number;
  /**
   * 是否启用。默认为true。
   */
  enabled?: boolean;
}>(), {
  strength: 1,
  radius: 0.7,
  threshold: 0.8,
  resolution: 256,
  enabled: true
});

// 使用three组合式函数
const { size } = useThree();

// 获取后处理上下文
const postProcessingContext = inject(POST_PROCESSING_CONTEXT_KEY, null);

// 创建辉光通道
const bloomPass = ref<UnrealBloomPass | null>(null);

// 创建辉光通道
const createBloomPass = () => {
  if (!size.value) {
    return;
  }

  // 创建辉光通道
  const resolution = new THREE.Vector2(props.resolution, props.resolution);
  bloomPass.value = new UnrealBloomPass(resolution, props.strength, props.radius, props.threshold);
  
  // 设置启用状态
  if (bloomPass.value) {
    bloomPass.value.enabled = props.enabled;
  }
  
  // 添加到效果合成器
  if (postProcessingContext && bloomPass.value) {
    postProcessingContext.addEffectPass(bloomPass.value);
  }
};

// 更新辉光通道配置
const updateBloomPassConfig = () => {
  if (!bloomPass.value) {
    return;
  }
  
  bloomPass.value.strength = props.strength;
  bloomPass.value.radius = props.radius;
  bloomPass.value.threshold = props.threshold;
  bloomPass.value.enabled = props.enabled;
  
  // 更新分辨率
  if (props.resolution !== bloomPass.value.resolution.x) {
    bloomPass.value.resolution.set(props.resolution, props.resolution);
  }
};

// 监听属性变化
watch(
  () => ({
    strength: props.strength,
    radius: props.radius,
    threshold: props.threshold,
    resolution: props.resolution,
    enabled: props.enabled
  }),
  () => {
    updateBloomPassConfig();
  },
  { deep: true }
);

// 监听尺寸变化
watch(
  size,
  () => {
    if (bloomPass.value) {
      // 可以根据尺寸调整分辨率
    }
  }
);

// 组件挂载时创建辉光通道
onMounted(() => {
  createBloomPass();
});

// 组件卸载时移除辉光通道
onBeforeUnmount(() => {
  if (postProcessingContext && bloomPass.value) {
    postProcessingContext.removeEffectPass(bloomPass.value);
  }
  
  if (bloomPass.value && bloomPass.value.dispose) {
    bloomPass.value.dispose();
  }
  
  bloomPass.value = null;
});

// 暴露API
defineExpose({
  bloomPass
});
</script> 