<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { WebGLRenderer as WebGPURenderer, Scene, Camera } from 'three'; // 临时使用WebGLRenderer代替WebGPURenderer
import { useThree } from '../../composables/useThree';
import { useFrame } from '../../composables/useFrame';
import { isWebGPUSupported } from '../../utils';

const props = defineProps<{
  enabled?: boolean;
  antialias?: boolean;
  alpha?: boolean;
  clearColor?: number | string;
  clearAlpha?: number;
  pixelRatio?: number;
  width?: number | string;
  height?: number | string;
  shadowMap?: boolean;
  toneMapping?: number;
  toneMappingExposure?: number;
  outputEncoding?: number;
  autoClear?: boolean;
  autoClearDepth?: boolean;
  autoClearColor?: boolean;
  autoClearStencil?: boolean;
  powerPreference?: 'high-performance' | 'low-power' | 'default';
}>();

const emit = defineEmits(['initialized', 'rendered', 'error']);

// 获取Three.js核心对象
const { scene, camera } = useThree();

// WebGPU渲染器
const renderer = ref<WebGPURenderer | null>(null);
const container = ref<HTMLDivElement | null>(null);
const isSupported = ref<boolean>(false);
const isInitialized = ref<boolean>(false);
const isEnabled = ref<boolean>(props.enabled !== false);

// 创建WebGPU渲染器
const createRenderer = async () => {
  if (!container.value) return;
  
  try {
    // 检查WebGPU支持
    isSupported.value = await isWebGPUSupported();
    
    if (!isSupported.value) {
      throw new Error('WebGPU is not supported in this browser');
    }
    
    // 创建渲染器 - 临时使用WebGLRenderer
    renderer.value = new WebGPURenderer({
      antialias: props.antialias !== false,
      alpha: props.alpha || false,
      powerPreference: props.powerPreference || 'high-performance'
    });
    
    // 设置大小
    const width = typeof props.width === 'number' ? props.width : container.value.clientWidth;
    const height = typeof props.height === 'number' ? props.height : container.value.clientHeight;
    renderer.value.setSize(width, height);
    
    // 设置像素比
    renderer.value.setPixelRatio(props.pixelRatio || window.devicePixelRatio);
    
    // 设置清除颜色
    if (props.clearColor !== undefined) {
      renderer.value.setClearColor(props.clearColor, props.clearAlpha || 1);
    }
    
    // 设置色调映射
    if (props.toneMapping !== undefined) {
      renderer.value.toneMapping = props.toneMapping;
    }
    
    // 设置色调映射曝光
    if (props.toneMappingExposure !== undefined) {
      renderer.value.toneMappingExposure = props.toneMappingExposure;
    }
    
    // 设置输出编码
    if (props.outputEncoding !== undefined) {
      renderer.value.outputEncoding = props.outputEncoding;
    }
    
    // 设置阴影贴图
    if (props.shadowMap) {
      renderer.value.shadowMap.enabled = true;
    }
    
    // 添加到容器
    container.value.appendChild(renderer.value.domElement);
    
    // 标记为已初始化
    isInitialized.value = true;
    
    // 触发初始化事件
    emit('initialized', renderer.value);
    
    // 提供渲染器给Three.js上下文
    const three = useThree();
    if (three && typeof three.renderer === 'object') {
      (three as any).renderer = renderer.value;
    }
  } catch (error) {
    console.error('Failed to initialize WebGPU renderer:', error);
    emit('error', error as Error);
  }
};

// 渲染场景
const render = () => {
  if (!renderer.value || !scene.value || !camera.value || !isEnabled.value || !isInitialized.value) return;
  
  // 渲染前设置自动清除选项
  if (props.autoClear !== undefined) {
    renderer.value.autoClear = props.autoClear;
  }
  if (props.autoClearDepth !== undefined) {
    renderer.value.autoClearDepth = props.autoClearDepth;
  }
  if (props.autoClearColor !== undefined) {
    renderer.value.autoClearColor = props.autoClearColor;
  }
  if (props.autoClearStencil !== undefined) {
    renderer.value.autoClearStencil = props.autoClearStencil;
  }
  
  // 渲染场景
  renderer.value.render(scene.value, camera.value);
  
  // 触发渲染事件
  emit('rendered', renderer.value);
};

// 调整大小
const resize = () => {
  if (!renderer.value || !container.value) return;
  
  const width = typeof props.width === 'number' ? props.width : container.value.clientWidth;
  const height = typeof props.height === 'number' ? props.height : container.value.clientHeight;
  
  renderer.value.setSize(width, height);
};

// 启用/禁用渲染
const setEnabled = (enabled: boolean) => {
  isEnabled.value = enabled;
};

// 监听属性变化
watch(() => props.enabled, (enabled) => {
  setEnabled(enabled !== false);
});

watch(() => props.clearColor, (color) => {
  if (renderer.value && color !== undefined) {
    renderer.value.setClearColor(color, props.clearAlpha || 1);
  }
});

watch(() => props.pixelRatio, (ratio) => {
  if (renderer.value && ratio !== undefined) {
    renderer.value.setPixelRatio(ratio);
  }
});

watch(() => [props.width, props.height], () => {
  resize();
});

watch(() => props.shadowMap, (enabled) => {
  if (renderer.value) {
    renderer.value.shadowMap.enabled = enabled || false;
    renderer.value.shadowMap.needsUpdate = true;
  }
});

// 监听窗口大小变化
const handleResize = () => {
  if (typeof props.width !== 'number' || typeof props.height !== 'number') {
    resize();
  }
};

// 组件挂载和卸载
onMounted(async () => {
  // 创建渲染器
  await createRenderer();
  
  // 添加帧更新
  useFrame(render);
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize);
  
  // 清理渲染器
  if (renderer.value) {
    renderer.value.dispose();
    
    // 从容器中移除
    if (container.value && renderer.value.domElement.parentNode === container.value) {
      container.value.removeChild(renderer.value.domElement);
    }
  }
});

// 暴露组件内部状态和方法
defineExpose({
  renderer,
  container,
  isSupported,
  isInitialized,
  isEnabled,
  render,
  resize,
  setEnabled
});
</script>

<template>
  <div 
    ref="container"
    class="three-webgpu-renderer"
    :style="{
      width: typeof width === 'number' ? `${width}px` : width || '100%',
      height: typeof height === 'number' ? `${height}px` : height || '100%'
    }"
  >
    <div v-if="!isSupported" class="webgpu-not-supported">
      <slot name="not-supported">
        <p>WebGPU is not supported in this browser.</p>
      </slot>
    </div>
    <slot 
      :renderer="renderer" 
      :is-supported="isSupported"
      :is-initialized="isInitialized"
      :is-enabled="isEnabled"
    ></slot>
  </div>
</template>

<style scoped>
.three-webgpu-renderer {
  position: relative;
  overflow: hidden;
}

.webgpu-not-supported {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 16px;
  text-align: center;
  padding: 20px;
}
</style> 