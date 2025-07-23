<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, watch, toRefs } from 'vue';
import * as THREE from 'three';
import { SCENE_CONTEXT_KEY, OBJECT_CONTEXT_KEY, OBJECT_EVENTS } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * Three.js 对象或对象参考
   */
  object?: THREE.Object3D | null;

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
  object: null,
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

// 修改defineEmits部分，避免使用映射类型
const emit = defineEmits([
  // 基础事件
  'created',
  'mounted',
  'beforeUnmount',
  'unmounted',
  'updated',
  
  // Three.js对象事件
  'click',
  'dblclick',
  'contextmenu',
  'pointerdown',
  'pointerup',
  'pointermove',
  'pointerenter',
  'pointerleave',
  'pointerover',
  'pointerout',
  'wheel',
  'keydown',
  'keyup',
  'focus',
  'blur',
  'drag',
  'dragstart',
  'dragend',
  'drop'
]);

// 获取场景上下文
const sceneContext = inject(SCENE_CONTEXT_KEY);
if (!sceneContext) {
  console.error('ThreeObject 必须在 ThreeScene 组件内部使用');
}

// 获取父对象上下文
const parentContext = inject(OBJECT_CONTEXT_KEY, null);

// 对象引用
const objectRef = ref<THREE.Object3D | null>(null);

// 提供给子组件的上下文
const objectContext = {
  object: objectRef
};

// 响应式属性
const {
  object,
  position,
  rotation,
  scale,
  visible,
  castShadow,
  receiveShadow,
  frustumCulled,
  renderOrder,
  userData,
  matrixAutoUpdate,
  name
} = toRefs(props);

// 处理位置属性
const setPosition = (obj: THREE.Object3D, pos: typeof props.position) => {
  if (Array.isArray(pos)) {
    obj.position.set(pos[0], pos[1], pos[2]);
  } else if (typeof pos === 'object') {
    obj.position.set(pos.x, pos.y, pos.z);
  }
};

// 处理旋转属性
const setRotation = (obj: THREE.Object3D, rot: typeof props.rotation) => {
  if (Array.isArray(rot)) {
    obj.rotation.set(rot[0], rot[1], rot[2]);
  } else if (typeof rot === 'object') {
    obj.rotation.set(rot.x, rot.y, rot.z);
  }
};

// 处理缩放属性
const setScale = (obj: THREE.Object3D, sc: typeof props.scale) => {
  if (Array.isArray(sc)) {
    obj.scale.set(sc[0], sc[1], sc[2]);
  } else if (typeof sc === 'object') {
    obj.scale.set(sc.x, sc.y, sc.z);
  } else if (typeof sc === 'number') {
    obj.scale.set(sc, sc, sc);
  }
};

// 更新对象属性
const updateObjectProps = (obj: THREE.Object3D) => {
  if (!obj) return;

  // 设置基本属性
  obj.visible = visible.value;
  obj.castShadow = castShadow.value;
  obj.receiveShadow = receiveShadow.value;
  obj.frustumCulled = frustumCulled.value;
  obj.renderOrder = renderOrder.value;
  obj.matrixAutoUpdate = matrixAutoUpdate.value;
  obj.name = name.value;

  // 设置位置、旋转和缩放
  setPosition(obj, position.value);
  setRotation(obj, rotation.value);
  setScale(obj, scale.value);

  // 更新用户数据
  Object.assign(obj.userData, userData.value);

  // 更新矩阵
  if (matrixAutoUpdate.value) {
    obj.updateMatrix();
  }
};

// 添加对象到场景或父对象
const addObject = () => {
  const obj = props.object || objectRef.value;
  if (!obj) return;

  // 更新对象属性
  updateObjectProps(obj);

  // 添加到父对象或场景
  if (parentContext?.object?.value) {
    parentContext.object.value.add(obj);
  } else if (sceneContext?.scene?.value) {
    sceneContext.scene.value.add(obj);
  }

  // 保存对象引用
  objectRef.value = obj;

  // 发出添加事件
  emit('mounted', obj);
};

// 从场景或父对象移除对象
const removeObject = () => {
  const obj = objectRef.value;
  if (!obj) return;

  // 从父对象或场景移除
  if (obj.parent) {
    obj.parent.remove(obj);
  }

  // 发出移除事件
  emit('unmounted', obj);
};

// 添加事件监听
const addEventListeners = (obj: THREE.Object3D) => {
  if (!obj) return;

  // 遍历所有事件
  Object.entries(OBJECT_EVENTS).forEach(([key, eventName]) => {
    // 添加事件监听
    obj.addEventListener(eventName, (event) => {
      emit(eventName as any, event);
    });
  });
};

// 移除事件监听
const removeEventListeners = (obj: THREE.Object3D) => {
  if (!obj) return;

  // 遍历所有事件
  Object.entries(OBJECT_EVENTS).forEach(([key, eventName]) => {
    // 移除事件监听
    obj.removeEventListener(eventName, (event) => {
      emit(eventName as any, event);
    });
  });
};

// 监听对象属性变化
watch(
  [
    position,
    rotation,
    scale,
    visible,
    castShadow,
    receiveShadow,
    frustumCulled,
    renderOrder,
    userData,
    matrixAutoUpdate,
    name
  ],
  () => {
    const obj = props.object || objectRef.value;
    if (!obj) return;

    // 更新对象属性
    updateObjectProps(obj);

    // 发出更新事件
    emit('update', obj);
  },
  { deep: true }
);

// 监听对象变化
watch(object, (newObject, oldObject) => {
  // 如果有旧对象，移除它
  if (oldObject) {
    removeEventListeners(oldObject);
    removeObject();
  }

  // 如果有新对象，添加它
  if (newObject) {
    objectRef.value = newObject;
    addEventListeners(newObject);
    addObject();
  }
});

// 生命周期钩子
onMounted(() => {
  // 如果有对象，添加它
  if (props.object) {
    objectRef.value = props.object;
    addEventListeners(props.object);
    addObject();
  }
});

onBeforeUnmount(() => {
  // 移除对象
  if (objectRef.value) {
    removeEventListeners(objectRef.value);
    removeObject();
  }
});

// 提供上下文给子组件
provide(OBJECT_CONTEXT_KEY, objectContext);

// 暴露给父组件的属性和方法
defineExpose({
  object: objectRef,
  addObject,
  removeObject,
  updateObjectProps
});
</script> 