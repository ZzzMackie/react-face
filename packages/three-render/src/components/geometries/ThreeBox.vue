<template>
  <three-object
    :object="mesh"
    v-bind="$attrs"
    @mounted="onMounted"
    @unmounted="onUnmounted"
  >
    <slot></slot>
  </three-object>
</template>

<script setup lang="ts">
import { ref, onMounted as vueOnMounted, watch, inject } from 'vue';
import * as THREE from 'three';
import ThreeObject from '../core/ThreeObject.vue';
import { MATERIAL_CONTEXT_KEY } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * 宽度
   */
  width?: number;
  
  /**
   * 高度
   */
  height?: number;
  
  /**
   * 深度
   */
  depth?: number;
  
  /**
   * 宽度分段数
   */
  widthSegments?: number;
  
  /**
   * 高度分段数
   */
  heightSegments?: number;
  
  /**
   * 深度分段数
   */
  depthSegments?: number;
  
  /**
   * 是否居中
   */
  center?: boolean;
}>(), {
  width: 1,
  height: 1,
  depth: 1,
  widthSegments: 1,
  heightSegments: 1,
  depthSegments: 1,
  center: false
});

const emit = defineEmits<{
  /**
   * 几何体创建
   */
  (e: 'created', geometry: THREE.BoxGeometry): void;
  
  /**
   * 网格对象创建
   */
  (e: 'mesh-created', mesh: THREE.Mesh): void;
  
  /**
   * 几何体销毁
   */
  (e: 'disposed'): void;
}>();

// 获取父级材质上下文
const materialContext = inject(MATERIAL_CONTEXT_KEY, null);

// 几何体
const geometry = ref<THREE.BoxGeometry | null>(null);

// 网格对象
const mesh = ref<THREE.Mesh | null>(null);

// 创建几何体
const createGeometry = () => {
  // 销毁旧几何体
  if (geometry.value) {
    geometry.value.dispose();
  }
  
  // 创建几何体
  geometry.value = new THREE.BoxGeometry(
    props.width,
    props.height,
    props.depth,
    props.widthSegments,
    props.heightSegments,
    props.depthSegments
  );
  
  // 居中
  if (props.center) {
    geometry.value.center();
  }
  
  // 发出创建事件
  emit('created', geometry.value);
  
  return geometry.value;
};

// 创建网格
const createMesh = () => {
  // 创建几何体
  const geo = createGeometry();
  
  // 使用父级材质或创建默认材质
  const material = materialContext?.material?.value || 
    new THREE.MeshStandardMaterial({ color: 0xcccccc });
  
  // 创建网格对象
  mesh.value = new THREE.Mesh(geo, material);
  
  // 发出网格创建事件
  emit('mesh-created', mesh.value);
  
  return mesh.value;
};

// 网格挂载事件
const onMounted = (object: THREE.Object3D) => {
  // 这个函数由 ThreeObject 组件调用
};

// 网格卸载事件
const onUnmounted = () => {
  // 销毁几何体
  if (geometry.value) {
    geometry.value.dispose();
    geometry.value = null;
    emit('disposed');
  }
};

// 监听属性变化
watch(
  () => [
    props.width,
    props.height,
    props.depth,
    props.widthSegments,
    props.heightSegments,
    props.depthSegments,
    props.center
  ],
  () => {
    // 如果已经创建了网格，则更新几何体
    if (mesh.value) {
      const oldGeometry = mesh.value.geometry;
      const newGeometry = createGeometry();
      
      // 更新网格的几何体
      mesh.value.geometry = newGeometry;
      
      // 销毁旧几何体
      if (oldGeometry) {
        oldGeometry.dispose();
      }
    }
  }
);

// 在 Vue 组件挂载时创建网格
vueOnMounted(() => {
  createMesh();
});

// 暴露给父组件的属性和方法
defineExpose({
  geometry,
  mesh
});
</script> 