<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, provide, inject, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { SCENE_CONTEXT_KEY, RENDER_CONTEXT_KEY } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * 背景色
   */
  background?: string | number | THREE.Texture | THREE.Color | null;
  
  /**
   * 环境色
   */
  environment?: string | THREE.Texture | null;
  
  /**
   * 雾效
   */
  fog?: {
    color?: string | number;
    near?: number;
    far?: number;
    density?: number;
    type?: 'normal' | 'exp2';
  } | null;
  
  /**
   * 是否启用物理正确照明
   */
  physicallyCorrectLights?: boolean;
  
  /**
   * 是否启用自动更新
   */
  autoUpdate?: boolean;
  
  /**
   * 场景名称
   */
  name?: string;
}>(), {
  background: null,
  environment: null,
  fog: null,
  physicallyCorrectLights: false,
  autoUpdate: true,
  name: 'Scene'
});

const emit = defineEmits<{
  /**
   * 场景创建
   */
  (e: 'created', scene: THREE.Scene): void;
  
  /**
   * 场景更新
   */
  (e: 'updated', scene: THREE.Scene): void;
  
  /**
   * 场景销毁
   */
  (e: 'disposed'): void;
}>();

// 获取渲染上下文
const renderContext = inject(RENDER_CONTEXT_KEY, null);

// 场景对象
const scene = ref<THREE.Scene | null>(null);

// 纹理加载器
const textureLoader = new THREE.TextureLoader();

// 设置背景
const setBackground = async (value: string | number | THREE.Texture | THREE.Color | null) => {
  if (!scene.value) return;
  
  // 清除背景
  if (value === null) {
    scene.value.background = null;
    return;
  }
  
  // 颜色
  if (typeof value === 'string' || typeof value === 'number') {
    scene.value.background = new THREE.Color(value);
    return;
  }
  
  // 纹理或颜色
  scene.value.background = value;
};

// 设置环境贴图
const setEnvironment = async (value: string | THREE.Texture | null) => {
  if (!scene.value) return;
  
  // 清除环境
  if (value === null) {
    scene.value.environment = null;
    return;
  }
  
  // 如果是字符串，加载环境贴图
  if (typeof value === 'string') {
    try {
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        textureLoader.load(value, resolve, undefined, reject);
      });
      
      if (scene.value) {
        scene.value.environment = texture;
      }
    } catch (error) {
      console.error('加载环境贴图失败:', error);
    }
    return;
  }
  
  // 纹理
  scene.value.environment = value;
};

// 设置雾效
const setFog = (fogConfig: typeof props.fog) => {
  if (!scene.value) return;
  
  // 清除雾效
  if (!fogConfig) {
    scene.value.fog = null;
    return;
  }
  
  // 获取雾效颜色
  const fogColor = fogConfig.color ? new THREE.Color(fogConfig.color) : new THREE.Color(0xcccccc);
  
  // 创建雾效
  if (fogConfig.type === 'exp2') {
    // 指数雾效
    scene.value.fog = new THREE.FogExp2(
      fogColor,
      fogConfig.density ?? 0.005
    );
  } else {
    // 线性雾效
    scene.value.fog = new THREE.Fog(
      fogColor,
      fogConfig.near ?? 1,
      fogConfig.far ?? 1000
    );
  }
};
  
// 创建场景
const createScene = () => {
  // 创建场景
  scene.value = new THREE.Scene();
  
  // 设置场景属性
  scene.value.name = props.name;
  
  // 设置背景
  if (props.background !== null) {
    setBackground(props.background);
  }
  
  // 设置环境贴图
  if (props.environment !== null) {
    setEnvironment(props.environment);
  }
  
  // 设置雾效
  if (props.fog !== null) {
    setFog(props.fog);
  }
  
  // 发出创建事件
  emit('created', scene.value);
  
  return scene.value;
};

// 更新场景
const updateScene = () => {
  if (!scene.value) return;
  
  // 更新场景属性
  scene.value.name = props.name;
  
  // 设置背景
  setBackground(props.background);
  
  // 设置环境贴图
  setEnvironment(props.environment);
  
  // 设置雾效
  setFog(props.fog);
  
  // 更新物理正确照明设置
  if (renderContext?.renderer?.value) {
    renderContext.renderer.value.physicallyCorrectLights = props.physicallyCorrectLights;
  }
  
  // 更新自动更新设置
  if (renderContext?.renderer?.value) {
    renderContext.renderer.value.autoUpdate = props.autoUpdate;
  }
  
  // 发出更新事件
  emit('updated', scene.value);
};

// 释放资源
const dispose = () => {
  if (scene.value) {
    scene.value.clear();
    scene.value = null;
    
    // 发出销毁事件
    emit('disposed');
  }
};

// 监听属性变化
watch(
  () => [
    props.background,
    props.environment,
    props.fog,
    props.physicallyCorrectLights,
    props.autoUpdate,
    props.name
  ],
  updateScene,
  { deep: true }
);

// 创建场景上下文
const sceneContext = {
  scene
};

// 提供场景上下文给子组件
provide(SCENE_CONTEXT_KEY, sceneContext);

// 生命周期钩子
onMounted(() => {
  createScene();
  
  // 更新渲染器中的场景
  if (renderContext?.scene) {
    renderContext.scene.value = scene.value;
  }
});

onBeforeUnmount(() => {
  dispose();
  
  // 清除渲染器中的场景
  if (renderContext?.scene) {
    renderContext.scene.value = null;
  }
});

// 暴露给父组件的属性和方法
defineExpose({
  scene,
  createScene,
  updateScene,
  dispose
});
</script> 