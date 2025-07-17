<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, provide, onBeforeUnmount, watch, onMounted } from 'vue';
import * as THREE from 'three';
import { MATERIAL_CONTEXT_KEY } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * 颜色
   */
  color?: string | number;
  
  /**
   * 粗糙度 (0 到 1 之间)
   */
  roughness?: number;
  
  /**
   * 金属度 (0 到 1 之间)
   */
  metalness?: number;
  
  /**
   * 发光颜色
   */
  emissive?: string | number;
  
  /**
   * 发光强度
   */
  emissiveIntensity?: number;
  
  /**
   * 环境光遮挡强度 (0 到 1 之间)
   */
  aoMapIntensity?: number;
  
  /**
   * 法线贴图缩放
   */
  normalScale?: [number, number];
  
  /**
   * 是否开启透明度
   */
  transparent?: boolean;
  
  /**
   * 透明度 (0 到 1 之间)
   */
  opacity?: number;
  
  /**
   * 透明度裁剪值 (0 到 1 之间)
   */
  alphaTest?: number;
  
  /**
   * 是否双面渲染
   */
  side?: 'front' | 'back' | 'double';
  
  /**
   * 纹理贴图
   */
  map?: string | THREE.Texture | null;
  
  /**
   * 环境光遮挡贴图
   */
  aoMap?: string | THREE.Texture | null;
  
  /**
   * 法线贴图
   */
  normalMap?: string | THREE.Texture | null;
  
  /**
   * 粗糙度贴图
   */
  roughnessMap?: string | THREE.Texture | null;
  
  /**
   * 金属度贴图
   */
  metalnessMap?: string | THREE.Texture | null;
  
  /**
   * 发光贴图
   */
  emissiveMap?: string | THREE.Texture | null;
  
  /**
   * 位移贴图
   */
  displacementMap?: string | THREE.Texture | null;
  
  /**
   * 位移贴图缩放
   */
  displacementScale?: number;
  
  /**
   * 位移贴图偏移
   */
  displacementBias?: number;
  
  /**
   * 环境贴图
   */
  envMap?: string | THREE.Texture | null;
  
  /**
   * 环境贴图强度
   */
  envMapIntensity?: number;
  
  /**
   * 是否接受光照
   */
  flatShading?: boolean;
  
  /**
   * 是否接受光照
   */
  receiveShadow?: boolean;
  
  /**
   * 是否投射阴影
   */
  castShadow?: boolean;
  
  /**
   * 材质名称
   */
  name?: string;
  
  /**
   * 是否线框渲染
   */
  wireframe?: boolean;
  
  /**
   * 材质自定义着色器
   */
  onBeforeCompile?: (shader: THREE.Shader) => void;
}>(), {
  color: 0xcccccc,
  roughness: 0.5,
  metalness: 0.5,
  emissive: 0x000000,
  emissiveIntensity: 1,
  aoMapIntensity: 1,
  normalScale: () => [1, 1],
  transparent: false,
  opacity: 1,
  alphaTest: 0,
  side: 'front',
  map: null,
  aoMap: null,
  normalMap: null,
  roughnessMap: null,
  metalnessMap: null,
  emissiveMap: null,
  displacementMap: null,
  displacementScale: 1,
  displacementBias: 0,
  envMap: null,
  envMapIntensity: 1,
  flatShading: false,
  receiveShadow: false,
  castShadow: false,
  name: '',
  wireframe: false,
  onBeforeCompile: undefined
});

const emit = defineEmits<{
  /**
   * 材质创建
   */
  (e: 'created', material: THREE.MeshStandardMaterial): void;
  
  /**
   * 材质更新
   */
  (e: 'updated', material: THREE.MeshStandardMaterial): void;
  
  /**
   * 材质销毁
   */
  (e: 'disposed'): void;
}>();

// 材质对象引用
const material = ref<THREE.MeshStandardMaterial | null>(null);

// 纹理加载器
const textureLoader = new THREE.TextureLoader();

// 纹理缓存
const textureCache: Record<string, THREE.Texture> = {};

// 加载纹理
const loadTexture = (src: string): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    // 如果已经在缓存中，直接返回
    if (textureCache[src]) {
      resolve(textureCache[src]);
      return;
    }
    
    textureLoader.load(
      src,
      (texture) => {
        // 缓存纹理
        textureCache[src] = texture;
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error(`加载纹理失败: ${src}`, error);
        reject(error);
      }
    );
  });
};

// 设置材质纹理
const setMaterialTexture = async (key: string, value: string | THREE.Texture | null) => {
  if (!material.value) return;
  
  try {
    // 如果是空值，清除纹理
    if (value === null) {
      material.value[key] = null;
      return;
    }
    
    // 如果是已经是纹理对象，直接设置
    if (typeof value !== 'string' && value.isTexture) {
      material.value[key] = value;
      return;
    }
    
    // 如果是字符串，加载纹理
    if (typeof value === 'string') {
      const texture = await loadTexture(value);
      if (material.value) {  // 再次检查，确保异步加载期间没有被销毁
        material.value[key] = texture;
      }
    }
  } catch (error) {
    console.error(`设置材质纹理失败: ${key}`, error);
  }
};

// 创建材质
const createMaterial = () => {
  // 销毁旧材质
  if (material.value) {
    material.value.dispose();
  }
  
  // 获取材质侧面设置
  let side: THREE.Side = THREE.FrontSide;
  if (props.side === 'back') side = THREE.BackSide;
  if (props.side === 'double') side = THREE.DoubleSide;
  
  // 创建标准材质
  material.value = new THREE.MeshStandardMaterial({
    color: props.color,
    roughness: props.roughness,
    metalness: props.metalness,
    emissive: props.emissive,
    emissiveIntensity: props.emissiveIntensity,
    aoMapIntensity: props.aoMapIntensity,
    normalScale: new THREE.Vector2(...props.normalScale),
    transparent: props.transparent,
    opacity: props.opacity,
    alphaTest: props.alphaTest,
    side,
    wireframe: props.wireframe,
    flatShading: props.flatShading,
    name: props.name,
    onBeforeCompile: props.onBeforeCompile
  });
  
  // 发出创建事件
  emit('created', material.value);
  
  // 异步设置纹理
  const textureProps = [
    'map', 'aoMap', 'normalMap', 'roughnessMap', 'metalnessMap',
    'emissiveMap', 'displacementMap', 'envMap'
  ] as const;
  
  textureProps.forEach(key => {
    const value = props[key];
    if (value) {
      setMaterialTexture(key, value);
    }
  });
  
  return material.value;
};

// 更新材质属性
const updateMaterial = () => {
  if (!material.value) return;
  
  // 更新基本属性
  material.value.color.set(props.color);
  material.value.roughness = props.roughness;
  material.value.metalness = props.metalness;
  material.value.emissive.set(props.emissive);
  material.value.emissiveIntensity = props.emissiveIntensity;
  material.value.aoMapIntensity = props.aoMapIntensity;
  material.value.normalScale.set(props.normalScale[0], props.normalScale[1]);
  material.value.transparent = props.transparent;
  material.value.opacity = props.opacity;
  material.value.alphaTest = props.alphaTest;
  material.value.wireframe = props.wireframe;
  material.value.flatShading = props.flatShading;
  material.value.name = props.name;
  
  // 更新侧面渲染模式
  if (props.side === 'front') material.value.side = THREE.FrontSide;
  else if (props.side === 'back') material.value.side = THREE.BackSide;
  else if (props.side === 'double') material.value.side = THREE.DoubleSide;
  
  // 更新位移相关属性
  material.value.displacementScale = props.displacementScale;
  material.value.displacementBias = props.displacementBias;
  material.value.envMapIntensity = props.envMapIntensity;
  
  // 需要重新编译标志
  material.value.needsUpdate = true;
  
  // 发出更新事件
  emit('updated', material.value);
};

// 释放资源
const dispose = () => {
  if (material.value) {
    material.value.dispose();
    material.value = null;
    emit('disposed');
  }
};

// 监听属性变化
const watchProperties = () => {
  // 监听基础属性
  watch(
    () => [
      props.color,
      props.roughness,
      props.metalness,
      props.emissive,
      props.emissiveIntensity,
      props.aoMapIntensity,
      props.normalScale,
      props.transparent,
      props.opacity,
      props.alphaTest,
      props.side,
      props.wireframe,
      props.flatShading,
      props.displacementScale,
      props.displacementBias,
      props.envMapIntensity,
      props.name
    ],
    updateMaterial,
    { deep: true }
  );
  
  // 监听纹理
  const textureProps = [
    'map', 'aoMap', 'normalMap', 'roughnessMap', 'metalnessMap',
    'emissiveMap', 'displacementMap', 'envMap'
  ] as const;
  
  textureProps.forEach(key => {
    watch(
      () => props[key],
      (newValue) => {
        if (material.value) {
          setMaterialTexture(key, newValue);
        }
      }
    );
  });
};

// 创建材质上下文
const materialContext = {
  material
};

// 提供材质上下文给子组件
provide(MATERIAL_CONTEXT_KEY, materialContext);

// 生命周期钩子
onMounted(() => {
  createMaterial();
  watchProperties();
});

onBeforeUnmount(() => {
  dispose();
});

// 暴露给父组件的属性和方法
defineExpose({
  material,
  createMaterial,
  updateMaterial,
  dispose
});
</script> 