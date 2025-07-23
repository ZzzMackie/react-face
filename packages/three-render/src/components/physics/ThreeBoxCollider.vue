<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue';
import { Box, Vec3, Body } from 'cannon-es';
import { Object3D, Box3, Vector3 } from 'three';
import { injectThreeParent } from '../../composables/useThreeParent';
import { PHYSICS_WORLD_INJECTION_KEY } from './ThreePhysicsWorld.vue';
import { BoxColliderOptions, Vector3Tuple } from '../../types';
import { arrayToVector3, computeBoundingBox } from '../../utils';

const props = defineProps<{
  size?: Vector3Tuple;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  offset?: Vector3Tuple;
  isTrigger?: boolean;
  collisionFilterGroup?: number;
  collisionFilterMask?: number;
  autoFit?: boolean;
}>();

const emit = defineEmits<{
  collide: [event: { body: Body; contact: any }];
}>();

// 获取父对象和物理世界
const parent = injectThreeParent();
const physicsWorld = inject(PHYSICS_WORLD_INJECTION_KEY);

// 碰撞器
const collider = ref<Body | null>(null);

// 创建碰撞器
const createCollider = () => {
  if (!parent.value) return;
  
  // 创建形状
  let halfExtents: Vec3;
  
  if (props.size) {
    // 使用指定大小
    halfExtents = new Vec3(props.size[0] / 2, props.size[1] / 2, props.size[2] / 2);
  } else if (props.autoFit !== false) {
    // 自动适应对象大小
    const box = computeBoundingBox(parent.value);
    const size = new Vector3();
    box.getSize(size);
    halfExtents = new Vec3(size.x / 2, size.y / 2, size.z / 2);
  } else {
    // 默认大小
    halfExtents = new Vec3(0.5, 0.5, 0.5);
  }
  
  // 创建盒体形状
  const shape = new Box(halfExtents);
  
  // 创建刚体（质量为0，使其成为静态碰撞器）
  collider.value = new Body({
    mass: 0,
    type: Body.STATIC,
    shape,
    position: new Vec3(),
    collisionFilterGroup: props.collisionFilterGroup || 1,
    collisionFilterMask: props.collisionFilterMask || -1,
    isTrigger: props.isTrigger || false
  });
  
  // 设置位置和旋转
  updateColliderTransform();
  
  // 添加碰撞事件监听
  collider.value.addEventListener('collide', handleCollide);
  
  // 添加到物理世界
  if (physicsWorld) {
    physicsWorld.addBody(collider.value);
  }
};

// 更新碰撞器变换
const updateColliderTransform = () => {
  if (!collider.value || !parent.value) return;
  
  // 获取位置
  let position: Vec3;
  if (props.position) {
    position = new Vec3(props.position[0], props.position[1], props.position[2]);
  } else {
    position = new Vec3(
      parent.value.position.x,
      parent.value.position.y,
      parent.value.position.z
    );
  }
  
  // 应用偏移
  if (props.offset) {
    position.x += props.offset[0];
    position.y += props.offset[1];
    position.z += props.offset[2];
  }
  
  // 设置位置
  collider.value.position.copy(position);
  
  // 设置旋转
  if (props.rotation) {
    const euler = arrayToVector3(props.rotation);
    collider.value.quaternion.setFromEuler(euler.x, euler.y, euler.z, 'XYZ');
  } else {
    collider.value.quaternion.copy(parent.value.quaternion);
  }
};

// 处理碰撞事件
const handleCollide = (event: any) => {
  emit('collide', { body: event.body, contact: event.contact });
};

// 监听属性变化
watch(() => props.position, (newPosition) => {
  if (collider.value && newPosition) {
    collider.value.position.set(newPosition[0], newPosition[1], newPosition[2]);
    
    // 应用偏移
    if (props.offset) {
      collider.value.position.x += props.offset[0];
      collider.value.position.y += props.offset[1];
      collider.value.position.z += props.offset[2];
    }
  }
});

watch(() => props.rotation, (newRotation) => {
  if (collider.value && newRotation) {
    const euler = arrayToVector3(newRotation);
    collider.value.quaternion.setFromEuler(euler.x, euler.y, euler.z, 'XYZ');
  }
});

watch(() => props.offset, (newOffset) => {
  if (collider.value && parent.value && newOffset) {
    // 重新计算位置
    let position: Vec3;
    if (props.position) {
      position = new Vec3(props.position[0], props.position[1], props.position[2]);
    } else {
      position = new Vec3(
        parent.value.position.x,
        parent.value.position.y,
        parent.value.position.z
      );
    }
    
    // 应用新偏移
    position.x += newOffset[0];
    position.y += newOffset[1];
    position.z += newOffset[2];
    
    // 设置位置
    collider.value.position.copy(position);
  }
}, { deep: true });

watch(() => props.isTrigger, (newIsTrigger) => {
  if (collider.value && newIsTrigger !== undefined) {
    collider.value.isTrigger = newIsTrigger;
  }
});

watch(() => props.collisionFilterGroup, (newGroup) => {
  if (collider.value && newGroup !== undefined) {
    collider.value.collisionFilterGroup = newGroup;
  }
});

watch(() => props.collisionFilterMask, (newMask) => {
  if (collider.value && newMask !== undefined) {
    collider.value.collisionFilterMask = newMask;
  }
});

// 组件挂载和卸载
onMounted(() => {
  // 创建碰撞器
  createCollider();
});

onBeforeUnmount(() => {
  if (collider.value) {
    // 移除碰撞事件监听
    collider.value.removeEventListener('collide', handleCollide);
    
    // 从物理世界移除
    if (physicsWorld) {
      physicsWorld.removeBody(collider.value);
    }
  }
});

// 暴露组件内部状态和方法
defineExpose({
  collider,
  updateColliderTransform
});
</script>

<template>
  <div>
    <slot :collider="collider"></slot>
  </div>
</template> 