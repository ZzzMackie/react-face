<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue';
import { 
  Constraint, PointToPointConstraint, DistanceConstraint, 
  HingeConstraint, LockConstraint, Vec3, Body 
} from 'cannon-es';
import { injectThreeParent } from '../../composables/useThreeParent';
import { PHYSICS_WORLD_INJECTION_KEY } from './ThreePhysicsWorld.vue';
import { ConstraintOptions, ConstraintType, Vector3Tuple } from '../../types';
import { arrayToVector3 } from '../../utils';

const props = defineProps<{
  type: ConstraintType;
  bodyA: Body;
  bodyB?: Body | null;
  pivotA?: Vector3Tuple;
  pivotB?: Vector3Tuple;
  axisA?: Vector3Tuple;
  axisB?: Vector3Tuple;
  distance?: number;
  maxForce?: number;
  collideConnected?: boolean;
  stiffness?: number;
  damping?: number;
  restLength?: number;
  motorEnabled?: boolean;
  motorSpeed?: number;
  motorMaxForce?: number;
}>();

const emit = defineEmits<{
  created: [constraint: Constraint];
}>();

// 获取父对象和物理世界
const parent = injectThreeParent();
const physicsWorld = inject(PHYSICS_WORLD_INJECTION_KEY);

// 约束
const constraint = ref<Constraint | null>(null);

// 创建约束
const createConstraint = () => {
  if (!props.bodyA) return;
  
  switch (props.type) {
    case 'point':
      createPointConstraint();
      break;
    case 'distance':
      createDistanceConstraint();
      break;
    case 'hinge':
      createHingeConstraint();
      break;
    case 'lock':
      createLockConstraint();
      break;
    case 'spring':
      createSpringConstraint();
      break;
    default:
      console.warn(`Unknown constraint type: ${props.type}`);
  }
  
  // 添加到物理世界
  if (constraint.value && physicsWorld) {
    physicsWorld.world.addConstraint(constraint.value);
    emit('created', constraint.value);
  }
};

// 创建点对点约束
const createPointConstraint = () => {
  const pivotA = props.pivotA ? new Vec3(props.pivotA[0], props.pivotA[1], props.pivotA[2]) : new Vec3();
  const pivotB = props.pivotB && props.bodyB ? new Vec3(props.pivotB[0], props.pivotB[1], props.pivotB[2]) : new Vec3();
  
  if (props.bodyB) {
    constraint.value = new PointToPointConstraint(
      props.bodyA,
      pivotA,
      props.bodyB,
      pivotB,
      props.maxForce || undefined
    );
  } else {
    constraint.value = new PointToPointConstraint(
      props.bodyA,
      pivotA,
      props.bodyA, // 自身约束
      new Vec3(),
      props.maxForce || undefined
    );
  }
};

// 创建距离约束
const createDistanceConstraint = () => {
  if (!props.bodyB) return;
  
  const distance = props.distance || 1;
  
  constraint.value = new DistanceConstraint(
    props.bodyA,
    props.bodyB,
    distance,
    props.maxForce || undefined
  );
};

// 创建铰链约束
const createHingeConstraint = () => {
  if (!props.bodyB) return;
  
  const pivotA = props.pivotA ? new Vec3(props.pivotA[0], props.pivotA[1], props.pivotA[2]) : new Vec3();
  const pivotB = props.pivotB ? new Vec3(props.pivotB[0], props.pivotB[1], props.pivotB[2]) : new Vec3();
  const axisA = props.axisA ? new Vec3(props.axisA[0], props.axisA[1], props.axisA[2]) : new Vec3(1, 0, 0);
  const axisB = props.axisB ? new Vec3(props.axisB[0], props.axisB[1], props.axisB[2]) : new Vec3(1, 0, 0);
  
  const hingeConstraint = new HingeConstraint(
    props.bodyA,
    props.bodyB,
    {
      pivotA,
      pivotB,
      axisA,
      axisB,
      maxForce: props.maxForce || undefined,
      collideConnected: props.collideConnected || false
    }
  );
  
  // 设置电机
  if (props.motorEnabled) {
    hingeConstraint.enableMotor();
    if (props.motorSpeed !== undefined) {
      hingeConstraint.setMotorSpeed(props.motorSpeed);
    }
    if (props.motorMaxForce !== undefined) {
      hingeConstraint.setMotorMaxForce(props.motorMaxForce);
    }
  }
  
  constraint.value = hingeConstraint;
};

// 创建锁定约束
const createLockConstraint = () => {
  if (!props.bodyB) return;
  
  constraint.value = new LockConstraint(
    props.bodyA,
    props.bodyB,
    {
      maxForce: props.maxForce || undefined,
      collideConnected: props.collideConnected || false
    }
  );
};

// 创建弹簧约束
const createSpringConstraint = () => {
  if (!props.bodyB) return;
  
  const localAnchorA = props.pivotA ? new Vec3(props.pivotA[0], props.pivotA[1], props.pivotA[2]) : new Vec3();
  const localAnchorB = props.pivotB ? new Vec3(props.pivotB[0], props.pivotB[1], props.pivotB[2]) : new Vec3();
  
  // 创建距离约束并添加弹簧属性
  const distanceConstraint = new DistanceConstraint(
    props.bodyA,
    props.bodyB,
    props.restLength || 1,
    props.maxForce || undefined
  );
  
  // 设置弹簧属性
  if (props.stiffness !== undefined) {
    distanceConstraint.stiffness = props.stiffness;
  }
  if (props.damping !== undefined) {
    distanceConstraint.damping = props.damping;
  }
  if (props.restLength !== undefined) {
    distanceConstraint.restLength = props.restLength;
  }
  
  constraint.value = distanceConstraint;
};

// 启用/禁用约束
const enableConstraint = (enabled: boolean) => {
  if (!constraint.value || !physicsWorld) return;
  
  if (enabled) {
    if (!physicsWorld.world.constraints.includes(constraint.value)) {
      physicsWorld.world.addConstraint(constraint.value);
    }
  } else {
    if (physicsWorld.world.constraints.includes(constraint.value)) {
      physicsWorld.world.removeConstraint(constraint.value);
    }
  }
};

// 更新约束参数
const updateConstraint = () => {
  if (!constraint.value) return;
  
  // 根据约束类型更新参数
  if (props.type === 'distance' || props.type === 'spring') {
    const distanceConstraint = constraint.value as DistanceConstraint;
    
    if (props.stiffness !== undefined) {
      distanceConstraint.stiffness = props.stiffness;
    }
    if (props.damping !== undefined) {
      distanceConstraint.damping = props.damping;
    }
    if (props.restLength !== undefined) {
      distanceConstraint.restLength = props.restLength;
    }
  } else if (props.type === 'hinge') {
    const hingeConstraint = constraint.value as HingeConstraint;
    
    if (props.motorEnabled) {
      hingeConstraint.enableMotor();
      if (props.motorSpeed !== undefined) {
        hingeConstraint.setMotorSpeed(props.motorSpeed);
      }
      if (props.motorMaxForce !== undefined) {
        hingeConstraint.setMotorMaxForce(props.motorMaxForce);
      }
    } else {
      hingeConstraint.disableMotor();
    }
  }
};

// 监听属性变化
watch(() => props.bodyA, (newBodyA) => {
  if (newBodyA && physicsWorld) {
    // 重新创建约束
    if (constraint.value) {
      physicsWorld.world.removeConstraint(constraint.value);
    }
    createConstraint();
  }
});

watch(() => props.bodyB, (newBodyB) => {
  if (props.bodyA && newBodyB && physicsWorld) {
    // 重新创建约束
    if (constraint.value) {
      physicsWorld.world.removeConstraint(constraint.value);
    }
    createConstraint();
  }
});

watch(() => props.type, (newType) => {
  if (props.bodyA && physicsWorld) {
    // 重新创建约束
    if (constraint.value) {
      physicsWorld.world.removeConstraint(constraint.value);
    }
    createConstraint();
  }
});

watch([() => props.stiffness, () => props.damping, () => props.restLength], () => {
  if (props.type === 'distance' || props.type === 'spring') {
    updateConstraint();
  }
});

watch([() => props.motorEnabled, () => props.motorSpeed, () => props.motorMaxForce], () => {
  if (props.type === 'hinge') {
    updateConstraint();
  }
});

// 组件挂载和卸载
onMounted(() => {
  // 创建约束
  createConstraint();
});

onBeforeUnmount(() => {
  // 从物理世界移除约束
  if (constraint.value && physicsWorld) {
    physicsWorld.world.removeConstraint(constraint.value);
  }
});

// 暴露组件内部状态和方法
defineExpose({
  constraint,
  enableConstraint,
  updateConstraint
});
</script>

<template>
  <div>
    <slot :constraint="constraint"></slot>
  </div>
</template> 