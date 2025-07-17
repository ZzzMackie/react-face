<template>
  <three-object
    ref="objectRef"
    :object="mesh"
    v-bind="objectProps"
    @mounted="onMounted"
    @unmounted="onUnmounted"
  >
    <slot></slot>
  </three-object>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted as vueOnMounted, onBeforeUnmount, watch, toRefs } from 'vue';
import * as THREE from 'three';
import ThreeObject from './ThreeObject.vue';
import { GEOMETRY_CONTEXT_KEY, MATERIAL_CONTEXT_KEY, MESH_CONTEXT_KEY } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * 几何体对象
   */
  geometry?: THREE.BufferGeometry | null;
  
  /**
   * 材质对象
   */
  material?: THREE.Material | THREE.Material[] | null;
  
  /**
   * 位置
   */
  position?: [number, number, number] | { x: number, y: number, z: number };
  
  /**
   * 旋转
   */
  rotation?: [number, number, number] | { x: number, y: number, z: number };
  
  /**
   * 缩放
   */
  scale?: [number, number, number] | { x: number, y: number, z: number } | number;
  
  /**
   * 是否可见
   */
  visible?: boolean;
  
  /**
   * 是否投射阴影
   */
  castShadow?: boolean;
  
  /**
   * 是否接收阴影
   */
  receiveShadow?: boolean;
  
  /**
   * 是否启用视锥体剔除
   */
  frustumCulled?: boolean;
  
  /**
   * 渲染顺序
   */
  renderOrder?: number;
  
  /**
   * 用户数据
   */
  userData?: Record<string, any>;
  
  /**
   * 矩阵自动更新
   */
  matrixAutoUpdate?: boolean;
  
  /**
   * 名称
   */
  name?: string;
}>(), {
  geometry: null,
  material: null,
  position: () => [0, 0, 0],
  rotation: () => [0, 0, 0],
  scale: 1,
  visible: true,
  castShadow: false,
  receiveShadow: false,
  frustumCulled: true,
  renderOrder: 0,
  userData: () => ({}),
  matrixAutoUpdate: true,
  name: ''
});

const emit = defineEmits<{
  /**
   * 网格对象创建
   */
  (e: 'created', mesh: THREE.Mesh): void;
  
  /**
   * 网格对象更新
   */
  (e: 'updated', mesh: THREE.Mesh): void;
  
  /**
   * 网格对象销毁
   */
  (e: 'disposed'): void;
  
  /**
   * 点击事件
   */
  (e: 'click', event: THREE.Event): void;
  
  /**
   * 指针移入事件
   */
  (e: 'pointerenter', event: THREE.Event): void;
  
  /**
   * 指针移出事件
   */
  (e: 'pointerleave', event: THREE.Event): void;
}>();

// 对象引用
const objectRef = ref<any>(null);

// 网格对象
const mesh = ref<THREE.Mesh | null>(null);

// 转发给 ThreeObject 的属性
const objectProps = computed(() => {
  const { position, rotation, scale, visible, castShadow, receiveShadow, frustumCulled, renderOrder, userData, matrixAutoUpdate, name } = toRefs(props);
  
  return {
    position: position.value,
    rotation: rotation.value,
    scale: scale.value,
    visible: visible.value,
    castShadow: castShadow.value,
    receiveShadow: receiveShadow.value,
    frustumCulled: frustumCulled.value,
    renderOrder: renderOrder.value,
    userData: userData.value,
    matrixAutoUpdate: matrixAutoUpdate.value,
    name: name.value
  };
});

// 获取几何体上下文
const geometryContext = inject(GEOMETRY_CONTEXT_KEY, null);

// 获取材质上下文
const materialContext = inject(MATERIAL_CONTEXT_KEY, null);

// 创建网格对象
const createMesh = () => {
  // 销毁旧对象
  if (mesh.value) {
    mesh.value = null;
  }
  
  // 获取几何体
  let geometry: THREE.BufferGeometry;
  if (props.geometry) {
    // 使用传入的几何体
    geometry = props.geometry;
  } else if (geometryContext?.geometry?.value) {
    // 使用上下文中的几何体
    geometry = geometryContext.geometry.value;
  } else {
    // 创建默认几何体
    geometry = new THREE.BoxGeometry(1, 1, 1);
  }
  
  // 获取材质
  let material: THREE.Material | THREE.Material[];
  if (props.material) {
    // 使用传入的材质
    material = props.material;
  } else if (materialContext?.material?.value) {
    // 使用上下文中的材质
    material = materialContext.material.value;
  } else {
    // 创建默认材质
    material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  }
  
  // 创建网格
  mesh.value = new THREE.Mesh(geometry, material);
  
  // 设置属性
  mesh.value.castShadow = props.castShadow;
  mesh.value.receiveShadow = props.receiveShadow;
  
  // 发出创建事件
  emit('created', mesh.value);
  
  return mesh.value;
};

// 监听几何体和材质变化
watch(
  [
    () => props.geometry,
    () => geometryContext?.geometry?.value,
    () => props.material,
    () => materialContext?.material?.value
  ],
  () => {
    // 重新创建网格
    if (mesh.value) {
      const oldMesh = mesh.value;
      
      // 创建新的网格对象
      createMesh();
      
      // 如果有旧网格，复制位置、旋转和缩放
      if (oldMesh) {
        mesh.value.position.copy(oldMesh.position);
        mesh.value.rotation.copy(oldMesh.rotation);
        mesh.value.scale.copy(oldMesh.scale);
      }
      
      // 更新 ThreeObject 组件中的对象
      if (objectRef.value) {
        objectRef.value.object = mesh.value;
      }
      
      // 发出更新事件
      emit('updated', mesh.value);
    }
  },
  { deep: true }
);

// 网格挂载事件
const onMounted = (object: THREE.Object3D) => {
  // 这个函数由 ThreeObject 组件调用
};

// 网格卸载事件
const onUnmounted = () => {
  // 发出销毁事件
  emit('disposed');
};

// 创建网格上下文
const meshContext = {
  mesh
};

// 提供网格上下文给子组件
provide(MESH_CONTEXT_KEY, meshContext);

// 生命周期钩子
vueOnMounted(() => {
  createMesh();
});

onBeforeUnmount(() => {
  // 网格对象由 ThreeObject 组件负责从场景中移除
  mesh.value = null;
});

// 暴露给父组件的属性和方法
defineExpose({
  mesh,
  object: mesh, // 兼容 ThreeObject 接口
  createMesh
});
</script> 