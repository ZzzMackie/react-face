<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, provide, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GEOMETRY_CONTEXT_KEY } from '../../constants';

const props = defineProps<{
  /**
   * 几何体类型
   */
  type?: string;
}>();

const emit = defineEmits<{
  /**
   * 几何体创建
   */
  (e: 'created', geometry: THREE.BufferGeometry): void;
  
  /**
   * 几何体更新
   */
  (e: 'updated', geometry: THREE.BufferGeometry): void;
  
  /**
   * 几何体销毁
   */
  (e: 'disposed'): void;
}>();

// 几何体对象
const geometry = ref<THREE.BufferGeometry | null>(null);

// 创建几何体
const createGeometry = (type: string, params?: Record<string, any>): THREE.BufferGeometry => {
  // 销毁旧几何体
  if (geometry.value) {
    geometry.value.dispose();
  }
  
  // 默认几何体
  let newGeometry: THREE.BufferGeometry;
  
  // 根据类型创建几何体
  switch (type) {
    case 'box':
      newGeometry = new THREE.BoxGeometry(
        params?.width ?? 1,
        params?.height ?? 1,
        params?.depth ?? 1,
        params?.widthSegments ?? 1,
        params?.heightSegments ?? 1,
        params?.depthSegments ?? 1
      );
      break;
    
    case 'sphere':
      newGeometry = new THREE.SphereGeometry(
        params?.radius ?? 1,
        params?.widthSegments ?? 32,
        params?.heightSegments ?? 16,
        params?.phiStart ?? 0,
        params?.phiLength ?? Math.PI * 2,
        params?.thetaStart ?? 0,
        params?.thetaLength ?? Math.PI
      );
      break;
    
    case 'plane':
      newGeometry = new THREE.PlaneGeometry(
        params?.width ?? 1,
        params?.height ?? 1,
        params?.widthSegments ?? 1,
        params?.heightSegments ?? 1
      );
      break;
    
    case 'circle':
      newGeometry = new THREE.CircleGeometry(
        params?.radius ?? 1,
        params?.segments ?? 32,
        params?.thetaStart ?? 0,
        params?.thetaLength ?? Math.PI * 2
      );
      break;
    
    case 'cylinder':
      newGeometry = new THREE.CylinderGeometry(
        params?.radiusTop ?? 1,
        params?.radiusBottom ?? 1,
        params?.height ?? 1,
        params?.radialSegments ?? 32,
        params?.heightSegments ?? 1,
        params?.openEnded ?? false,
        params?.thetaStart ?? 0,
        params?.thetaLength ?? Math.PI * 2
      );
      break;
    
    case 'cone':
      newGeometry = new THREE.ConeGeometry(
        params?.radius ?? 1,
        params?.height ?? 1,
        params?.radialSegments ?? 32,
        params?.heightSegments ?? 1,
        params?.openEnded ?? false,
        params?.thetaStart ?? 0,
        params?.thetaLength ?? Math.PI * 2
      );
      break;
    
    case 'torus':
      newGeometry = new THREE.TorusGeometry(
        params?.radius ?? 1,
        params?.tube ?? 0.4,
        params?.radialSegments ?? 12,
        params?.tubularSegments ?? 48,
        params?.arc ?? Math.PI * 2
      );
      break;
    
    case 'torus-knot':
      newGeometry = new THREE.TorusKnotGeometry(
        params?.radius ?? 1,
        params?.tube ?? 0.4,
        params?.tubularSegments ?? 64,
        params?.radialSegments ?? 8,
        params?.p ?? 2,
        params?.q ?? 3
      );
      break;
    
    default:
      // 默认创建一个盒子几何体
      newGeometry = new THREE.BoxGeometry(1, 1, 1);
      break;
  }
  
  // 设置几何体
  geometry.value = newGeometry;
  
  // 发出创建事件
  emit('created', geometry.value);
  
  return geometry.value;
};

// 更新几何体
const updateGeometry = (params: Record<string, any>) => {
  // 如果已经有几何体，重新创建
  if (geometry.value && props.type) {
    // 重新创建几何体
    createGeometry(props.type, params);
    
    // 发出更新事件
    emit('updated', geometry.value);
  }
};

// 释放资源
const dispose = () => {
  if (geometry.value) {
    geometry.value.dispose();
    geometry.value = null;
    
    // 发出销毁事件
    emit('disposed');
  }
};

// 创建几何体上下文
const geometryContext = {
  geometry
};

// 提供几何体上下文给子组件
provide(GEOMETRY_CONTEXT_KEY, geometryContext);

// 生命周期钩子
onBeforeUnmount(() => {
  dispose();
});

// 暴露给父组件的属性和方法
defineExpose({
  geometry,
  createGeometry,
  updateGeometry,
  dispose
});
</script> 