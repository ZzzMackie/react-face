<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, inject } from 'vue';
import { CANVAS_INJECTION_KEY, PARENT_INJECTION_KEY, PHYSICS_WORLD_INJECTION_KEY } from '../../constants';
import { Body, Vec3, Quaternion, Box, Sphere, Cylinder, Plane } from 'cannon-es';
import { Object3D, Box3, Vector3, Quaternion as ThreeQuaternion } from 'three';
import { injectThreeParent } from '../../composables/useThreeParent';
import { PHYSICS_WORLD_INJECTION_KEY } from './ThreePhysicsWorld.vue';
import { useFrame } from '../../composables/useFrame';
import { arrayToVector3, arrayToQuaternion, computeBoundingBox } from '../../utils';
import { RigidBodyOptions, BodyType, Vector3Tuple } from '../../types';

const props = defineProps<{
  type?: BodyType;
  mass?: number;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  linearDamping?: number;
  angularDamping?: number;
  linearFactor?: Vector3Tuple;
  angularFactor?: Vector3Tuple;
  fixedRotation?: boolean;
  allowSleep?: boolean;
  sleepSpeedLimit?: number;
  sleepTimeLimit?: number;
  collisionFilterGroup?: number;
  collisionFilterMask?: number;
  shape?: 'auto' | 'box' | 'sphere' | 'cylinder' | 'plane';
  shapeOptions?: Record<string, any>;
  autoFit?: boolean;
  offset?: Vector3Tuple;
}>();

const emit = defineEmits<{
  collide: [event: { body: Body; contact: any }];
  sleep: [event: { body: Body }];
  wakeup: [event: { body: Body }];
}>();

// 获取父对象和物理世界
const parent = injectThreeParent();
const physicsWorld = inject(PHYSICS_WORLD_INJECTION_KEY);

// 刚体
const body = ref<Body | null>(null);
const isSleeping = ref<boolean>(false);

// 创建刚体
const createRigidBody = () => {
  if (!parent.value) return;
  
  // 创建形状
  const shape = createShape();
  if (!shape) return;
  
  // 创建刚体
  const bodyOptions = {
    mass: props.type === 'static' ? 0 : (props.mass || 1),
    type: props.type || 'dynamic',
    position: new Vec3(),
    quaternion: new Quaternion(),
    linearDamping: props.linearDamping || 0.01,
    angularDamping: props.angularDamping || 0.01,
    fixedRotation: props.fixedRotation || false,
    allowSleep: props.allowSleep || false,
    sleepSpeedLimit: props.sleepSpeedLimit || 0.1,
    sleepTimeLimit: props.sleepTimeLimit || 1,
    collisionFilterGroup: props.collisionFilterGroup || 1,
    collisionFilterMask: props.collisionFilterMask || -1,
    material: undefined
  };
  
  // 创建刚体
  body.value = new Body(bodyOptions);
  
  // 添加形状
  const offset = props.offset ? new Vec3(props.offset[0], props.offset[1], props.offset[2]) : new Vec3();
  body.value.addShape(shape, offset);
  
  // 设置线性和角因子
  if (props.linearFactor) {
    body.value.linearFactor.set(
      props.linearFactor[0],
      props.linearFactor[1],
      props.linearFactor[2]
    );
  }
  
  if (props.angularFactor) {
    body.value.angularFactor.set(
      props.angularFactor[0],
      props.angularFactor[1],
      props.angularFactor[2]
    );
  }
  
  // 设置位置和旋转
  updateBodyTransform();
  
  // 添加事件监听
  body.value.addEventListener('collide', handleCollide);
  body.value.addEventListener('sleep', handleSleep);
  body.value.addEventListener('wakeup', handleWakeup);
  
  // 添加到物理世界
  if (physicsWorld) {
    physicsWorld.addBody(body.value);
  }
};

// 创建形状
const createShape = () => {
  if (!parent.value) return null;
  
  // 如果指定了形状类型
  if (props.shape && props.shape !== 'auto') {
    return createSpecificShape(props.shape);
  }
  
  // 自动创建形状
  if (props.autoFit !== false) {
    // 计算包围盒
    const box = computeBoundingBox(parent.value);
    const size = new Vector3();
    box.getSize(size);
    
    // 创建盒体形状
    return new Box(new Vec3(size.x / 2, size.y / 2, size.z / 2));
  }
  
  // 默认创建盒体形状
  return new Box(new Vec3(0.5, 0.5, 0.5));
};

// 创建特定形状
const createSpecificShape = (shapeType: string) => {
  const options = props.shapeOptions || {};
  
  switch (shapeType) {
    case 'box':
      const halfExtents = options.halfExtents || [0.5, 0.5, 0.5];
      return new Box(new Vec3(halfExtents[0], halfExtents[1], halfExtents[2]));
    
    case 'sphere':
      const radius = options.radius || 0.5;
      return new Sphere(radius);
    
    case 'cylinder':
      const radiusTop = options.radiusTop || 0.5;
      const radiusBottom = options.radiusBottom || 0.5;
      const height = options.height || 1;
      const numSegments = options.numSegments || 8;
      return new Cylinder(radiusTop, radiusBottom, height, numSegments);
    
    case 'plane':
      return new Plane();
    
    default:
      return new Box(new Vec3(0.5, 0.5, 0.5));
  }
};

// 更新刚体变换
const updateBodyTransform = () => {
  if (!body.value || !parent.value) return;
  
  // 获取位置
  const position = props.position 
    ? new Vec3(props.position[0], props.position[1], props.position[2])
    : new Vec3(parent.value.position.x, parent.value.position.y, parent.value.position.z);
  
  // 获取旋转
  let quaternion;
  if (props.rotation) {
    const euler = arrayToVector3(props.rotation);
    quaternion = new Quaternion();
    quaternion.setFromEuler(euler.x, euler.y, euler.z, 'XYZ');
  } else {
    const threeQuat = new ThreeQuaternion();
    parent.value.getWorldQuaternion(threeQuat);
    quaternion = new Quaternion(threeQuat.x, threeQuat.y, threeQuat.z, threeQuat.w);
  }
  
  // 设置位置和旋转
  body.value.position.copy(position);
  body.value.quaternion.copy(quaternion);
};

// 更新对象变换
const updateObjectTransform = () => {
  if (!body.value || !parent.value) return;
  
  // 更新位置
  parent.value.position.set(
    body.value.position.x,
    body.value.position.y,
    body.value.position.z
  );
  
  // 更新旋转
  parent.value.quaternion.set(
    body.value.quaternion.x,
    body.value.quaternion.y,
    body.value.quaternion.z,
    body.value.quaternion.w
  );
};

// 应用力
const applyForce = (force: Vector3Tuple, worldPoint?: Vector3Tuple) => {
  if (!body.value) return;
  
  const forceVec = new Vec3(force[0], force[1], force[2]);
  
  if (worldPoint) {
    const pointVec = new Vec3(worldPoint[0], worldPoint[1], worldPoint[2]);
    body.value.applyForce(forceVec, pointVec);
  } else {
    body.value.applyForce(forceVec, body.value.position);
  }
};

// 应用冲量
const applyImpulse = (impulse: Vector3Tuple, worldPoint?: Vector3Tuple) => {
  if (!body.value) return;
  
  const impulseVec = new Vec3(impulse[0], impulse[1], impulse[2]);
  
  if (worldPoint) {
    const pointVec = new Vec3(worldPoint[0], worldPoint[1], worldPoint[2]);
    body.value.applyImpulse(impulseVec, pointVec);
  } else {
    body.value.applyImpulse(impulseVec, body.value.position);
  }
};

// 应用局部力
const applyLocalForce = (force: Vector3Tuple, localPoint?: Vector3Tuple) => {
  if (!body.value) return;
  
  const forceVec = new Vec3(force[0], force[1], force[2]);
  
  if (localPoint) {
    const pointVec = new Vec3(localPoint[0], localPoint[1], localPoint[2]);
    body.value.applyLocalForce(forceVec, pointVec);
  } else {
    body.value.applyLocalForce(forceVec, new Vec3());
  }
};

// 应用局部冲量
const applyLocalImpulse = (impulse: Vector3Tuple, localPoint?: Vector3Tuple) => {
  if (!body.value) return;
  
  const impulseVec = new Vec3(impulse[0], impulse[1], impulse[2]);
  
  if (localPoint) {
    const pointVec = new Vec3(localPoint[0], localPoint[1], localPoint[2]);
    body.value.applyLocalImpulse(impulseVec, pointVec);
  } else {
    body.value.applyLocalImpulse(impulseVec, new Vec3());
  }
};

// 处理碰撞事件
const handleCollide = (event: any) => {
  emit('collide', { body: event.body, contact: event.contact });
};

// 处理睡眠事件
const handleSleep = () => {
  isSleeping.value = true;
  emit('sleep', { body: body.value });
};

// 处理唤醒事件
const handleWakeup = () => {
  isSleeping.value = false;
  emit('wakeup', { body: body.value });
};

// 在每一帧更新
const onFrame = () => {
  if (body.value && parent.value) {
    updateObjectTransform();
  }
};

// 监听属性变化
watch(() => props.mass, (newMass) => {
  if (body.value && newMass !== undefined && props.type !== 'static') {
    body.value.mass = newMass;
    body.value.updateMassProperties();
  }
});

watch(() => props.type, (newType) => {
  if (body.value && newType) {
    if (newType === 'static') {
      body.value.mass = 0;
      body.value.updateMassProperties();
      body.value.type = Body.STATIC;
    } else if (newType === 'dynamic') {
      body.value.mass = props.mass || 1;
      body.value.updateMassProperties();
      body.value.type = Body.DYNAMIC;
    } else if (newType === 'kinematic') {
      body.value.mass = props.mass || 1;
      body.value.updateMassProperties();
      body.value.type = Body.KINEMATIC;
    }
  }
});

watch(() => props.position, (newPosition) => {
  if (body.value && newPosition) {
    body.value.position.set(newPosition[0], newPosition[1], newPosition[2]);
    body.value.previousPosition.set(newPosition[0], newPosition[1], newPosition[2]);
    body.value.initPosition.set(newPosition[0], newPosition[1], newPosition[2]);
  }
});

watch(() => props.rotation, (newRotation) => {
  if (body.value && newRotation) {
    const euler = arrayToVector3(newRotation);
    body.value.quaternion.setFromEuler(euler.x, euler.y, euler.z, 'XYZ');
    body.value.previousQuaternion.copy(body.value.quaternion);
    body.value.initQuaternion.copy(body.value.quaternion);
  }
});

watch(() => props.linearDamping, (newLinearDamping) => {
  if (body.value && newLinearDamping !== undefined) {
    body.value.linearDamping = newLinearDamping;
  }
});

watch(() => props.angularDamping, (newAngularDamping) => {
  if (body.value && newAngularDamping !== undefined) {
    body.value.angularDamping = newAngularDamping;
  }
});

watch(() => props.linearFactor, (newLinearFactor) => {
  if (body.value && newLinearFactor) {
    body.value.linearFactor.set(
      newLinearFactor[0],
      newLinearFactor[1],
      newLinearFactor[2]
    );
  }
});

watch(() => props.angularFactor, (newAngularFactor) => {
  if (body.value && newAngularFactor) {
    body.value.angularFactor.set(
      newAngularFactor[0],
      newAngularFactor[1],
      newAngularFactor[2]
    );
  }
});

watch(() => props.fixedRotation, (newFixedRotation) => {
  if (body.value && newFixedRotation !== undefined) {
    body.value.fixedRotation = newFixedRotation;
    body.value.updateMassProperties();
  }
});

watch(() => props.allowSleep, (newAllowSleep) => {
  if (body.value && newAllowSleep !== undefined) {
    body.value.allowSleep = newAllowSleep;
  }
});

watch(() => props.sleepSpeedLimit, (newSleepSpeedLimit) => {
  if (body.value && newSleepSpeedLimit !== undefined) {
    body.value.sleepSpeedLimit = newSleepSpeedLimit;
  }
});

watch(() => props.sleepTimeLimit, (newSleepTimeLimit) => {
  if (body.value && newSleepTimeLimit !== undefined) {
    body.value.sleepTimeLimit = newSleepTimeLimit;
  }
});

watch(() => props.collisionFilterGroup, (newCollisionFilterGroup) => {
  if (body.value && newCollisionFilterGroup !== undefined) {
    body.value.collisionFilterGroup = newCollisionFilterGroup;
  }
});

watch(() => props.collisionFilterMask, (newCollisionFilterMask) => {
  if (body.value && newCollisionFilterMask !== undefined) {
    body.value.collisionFilterMask = newCollisionFilterMask;
  }
});

// 组件挂载和卸载
onMounted(() => {
  // 创建刚体
  createRigidBody();
  
  // 添加帧更新
  useFrame(onFrame);
});

onBeforeUnmount(() => {
  if (body.value) {
    // 移除事件监听
    body.value.removeEventListener('collide', handleCollide);
    body.value.removeEventListener('sleep', handleSleep);
    body.value.removeEventListener('wakeup', handleWakeup);
    
    // 从物理世界移除
    if (physicsWorld) {
      physicsWorld.removeBody(body.value);
    }
  }
});

// 暴露组件内部状态和方法
defineExpose({
  body,
  isSleeping,
  applyForce,
  applyImpulse,
  applyLocalForce,
  applyLocalImpulse,
  updateBodyTransform,
  updateObjectTransform
});
</script>

<template>
  <div class="three-rigid-body"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, inject } from 'vue';
import { CANVAS_INJECTION_KEY, PARENT_INJECTION_KEY, PHYSICS_WORLD_INJECTION_KEY } from '../../constants';

export default {
  props: {
    type: {
      type: String,
      default: 'box',
      validator: (value) => ['box', 'sphere', 'plane', 'cylinder', 'convex', 'trimesh'].includes(value)
    },
    mass: {
      type: Number,
      default: 0
    },
    position: {
      type: Array,
      default: () => [0, 0, 0]
    },
    rotation: {
      type: Array,
      default: () => [0, 0, 0]
    },
    size: {
      type: Array,
      default: () => [1, 1, 1]
    },
    material: {
      type: Object,
      default: () => ({
        friction: 0.3,
        restitution: 0.3
      })
    },
    linearDamping: {
      type: Number,
      default: 0.01
    },
    angularDamping: {
      type: Number,
      default: 0.01
    },
    fixedRotation: {
      type: Boolean,
      default: false
    },
    allowSleep: {
      type: Boolean,
      default: true
    },
    sleepSpeedLimit: {
      type: Number,
      default: 0.1
    },
    sleepTimeLimit: {
      type: Number,
      default: 1
    },
    collisionFilterGroup: {
      type: Number,
      default: 1
    },
    collisionFilterMask: {
      type: Number,
      default: -1
    },
    autoSync: {
      type: Boolean,
      default: true
    }
  },
  emits: ['ready', 'update', 'collision'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 获取物理世界上下文
    const physicsContext = inject(PHYSICS_WORLD_INJECTION_KEY, null);
    
    // 刚体引用
    const body = ref(null);
    
    // 物理材质引用
    const bodyMaterial = ref(null);
    
    // 形状引用
    const shape = ref(null);
    
    // 创建物理材质
    const createMaterial = async (CANNON) => {
      if (!CANNON) return null;
      
      // 创建物理材质
      bodyMaterial.value = new CANNON.Material();
      
      // 设置材质属性
      if (props.material) {
        if (props.material.friction !== undefined) {
          bodyMaterial.value.friction = props.material.friction;
        }
        
        if (props.material.restitution !== undefined) {
          bodyMaterial.value.restitution = props.material.restitution;
        }
      }
      
      return bodyMaterial.value;
    };
    
    // 创建形状
    const createShape = async (CANNON) => {
      if (!CANNON || !parentContext || !parentContext.object) return null;
      
      const object = parentContext.object;
      
      switch (props.type) {
        case 'box':
          // 创建盒体形状
          const halfExtents = Array.isArray(props.size) && props.size.length >= 3
            ? new CANNON.Vec3(props.size[0] / 2, props.size[1] / 2, props.size[2] / 2)
            : new CANNON.Vec3(0.5, 0.5, 0.5);
          
          shape.value = new CANNON.Box(halfExtents);
          break;
          
        case 'sphere':
          // 创建球体形状
          const radius = Array.isArray(props.size) && props.size.length >= 1
            ? props.size[0] / 2
            : 0.5;
          
          shape.value = new CANNON.Sphere(radius);
          break;
          
        case 'plane':
          // 创建平面形状
          shape.value = new CANNON.Plane();
          break;
          
        case 'cylinder':
          // 创建圆柱形状
          const radiusTop = Array.isArray(props.size) && props.size.length >= 1
            ? props.size[0] / 2
            : 0.5;
          
          const radiusBottom = Array.isArray(props.size) && props.size.length >= 2
            ? props.size[1] / 2
            : radiusTop;
          
          const height = Array.isArray(props.size) && props.size.length >= 3
            ? props.size[2]
            : 1;
          
          const segments = 16;
          
          shape.value = new CANNON.Cylinder(radiusTop, radiusBottom, height, segments);
          break;
          
        case 'convex':
          // 创建凸多面体形状
          if (object.geometry) {
            const vertices = [];
            const faces = [];
            
            // 获取顶点
            const position = object.geometry.attributes.position;
            for (let i = 0; i < position.count; i++) {
              vertices.push(new CANNON.Vec3(
                position.getX(i),
                position.getY(i),
                position.getZ(i)
              ));
            }
            
            // 获取面
            if (object.geometry.index) {
              const index = object.geometry.index;
              for (let i = 0; i < index.count; i += 3) {
                faces.push([index.getX(i), index.getX(i + 1), index.getX(i + 2)]);
              }
            }
            
            shape.value = new CANNON.ConvexPolyhedron({ vertices, faces });
          }
          break;
          
        case 'trimesh':
          // 创建三角网格形状
          if (object.geometry) {
            const vertices = [];
            const indices = [];
            
            // 获取顶点
            const position = object.geometry.attributes.position;
            for (let i = 0; i < position.count; i++) {
              vertices.push(position.getX(i));
              vertices.push(position.getY(i));
              vertices.push(position.getZ(i));
            }
            
            // 获取索引
            if (object.geometry.index) {
              const index = object.geometry.index;
              for (let i = 0; i < index.count; i++) {
                indices.push(index.getX(i));
              }
            } else {
              for (let i = 0; i < position.count; i++) {
                indices.push(i);
              }
            }
            
            shape.value = new CANNON.Trimesh(vertices, indices);
          }
          break;
          
        default:
          console.error(`Unsupported rigid body type: ${props.type}`);
          return null;
      }
      
      return shape.value;
    };
    
    // 创建刚体
    const createBody = async () => {
      if (!canvasContext || !canvasContext.engine.value || !physicsContext || !parentContext || !parentContext.object) return;
      
      try {
        // 动态导入 cannon-es
        const CANNON = await import('cannon-es');
        
        // 创建物理材质
        const material = await createMaterial(CANNON);
        
        // 创建形状
        const shape = await createShape(CANNON);
        
        if (!shape) {
          console.error('Failed to create shape');
          return;
        }
        
        // 创建刚体
        body.value = new CANNON.Body({
          mass: props.mass,
          material: material,
          shape: shape,
          linearDamping: props.linearDamping,
          angularDamping: props.angularDamping,
          fixedRotation: props.fixedRotation,
          allowSleep: props.allowSleep,
          sleepSpeedLimit: props.sleepSpeedLimit,
          sleepTimeLimit: props.sleepTimeLimit,
          collisionFilterGroup: props.collisionFilterGroup,
          collisionFilterMask: props.collisionFilterMask
        });
        
        // 设置位置
        if (Array.isArray(props.position) && props.position.length >= 3) {
          body.value.position.set(props.position[0], props.position[1], props.position[2]);
        }
        
        // 设置旋转
        if (Array.isArray(props.rotation) && props.rotation.length >= 3) {
          const quaternion = new CANNON.Quaternion();
          quaternion.setFromEuler(props.rotation[0], props.rotation[1], props.rotation[2], 'XYZ');
          body.value.quaternion.copy(quaternion);
        }
        
        // 添加碰撞事件监听
        body.value.addEventListener('collide', (event) => {
          emit('collision', {
            body: body.value,
            target: event.target,
            contact: event.contact
          });
        });
        
        // 添加到物理世界
        physicsContext.addBody(body.value);
        
        // 同步3D对象和物理对象
        if (props.autoSync) {
          // 添加更新函数
          canvasContext.engine.value.addEventListener('afterRender', syncObjectToBody);
        }
        
        // 触发就绪事件
        emit('ready', { body: body.value });
      } catch (error) {
        console.error('Failed to create rigid body:', error);
      }
    };
    
    // 同步3D对象和物理对象
    const syncObjectToBody = () => {
      if (!body.value || !parentContext || !parentContext.object) return;
      
      const object = parentContext.object;
      
      // 同步位置
      object.position.set(
        body.value.position.x,
        body.value.position.y,
        body.value.position.z
      );
      
      // 同步旋转
      object.quaternion.set(
        body.value.quaternion.x,
        body.value.quaternion.y,
        body.value.quaternion.z,
        body.value.quaternion.w
      );
      
      // 触发更新事件
      emit('update', {
        body: body.value,
        object: object,
        position: object.position.toArray(),
        quaternion: object.quaternion.toArray()
      });
    };
    
    // 应用力
    const applyForce = (force, worldPoint) => {
      if (!body.value) return;
      
      body.value.applyForce(force, worldPoint);
    };
    
    // 应用冲量
    const applyImpulse = (impulse, worldPoint) => {
      if (!body.value) return;
      
      body.value.applyImpulse(impulse, worldPoint);
    };
    
    // 应用局部力
    const applyLocalForce = (force, localPoint) => {
      if (!body.value) return;
      
      body.value.applyLocalForce(force, localPoint);
    };
    
    // 应用局部冲量
    const applyLocalImpulse = (impulse, localPoint) => {
      if (!body.value) return;
      
      body.value.applyLocalImpulse(impulse, localPoint);
    };
    
    // 监听属性变化
    watch(() => props.position, (newPosition) => {
      if (!body.value) return;
      
      if (Array.isArray(newPosition) && newPosition.length >= 3) {
        body.value.position.set(newPosition[0], newPosition[1], newPosition[2]);
      }
    }, { deep: true });
    
    watch(() => props.rotation, (newRotation) => {
      if (!body.value) return;
      
      if (Array.isArray(newRotation) && newRotation.length >= 3) {
        const CANNON = body.value.constructor;
        const quaternion = new CANNON.Quaternion();
        quaternion.setFromEuler(newRotation[0], newRotation[1], newRotation[2], 'XYZ');
        body.value.quaternion.copy(quaternion);
      }
    }, { deep: true });
    
    watch(() => props.mass, (newMass) => {
      if (!body.value) return;
      
      body.value.mass = newMass;
      body.value.updateMassProperties();
    });
    
    watch(() => props.linearDamping, (newDamping) => {
      if (!body.value) return;
      
      body.value.linearDamping = newDamping;
    });
    
    watch(() => props.angularDamping, (newDamping) => {
      if (!body.value) return;
      
      body.value.angularDamping = newDamping;
    });
    
    watch(() => props.fixedRotation, (newFixedRotation) => {
      if (!body.value) return;
      
      body.value.fixedRotation = newFixedRotation;
      body.value.updateMassProperties();
    });
    
    watch(() => props.allowSleep, (newAllowSleep) => {
      if (!body.value) return;
      
      body.value.allowSleep = newAllowSleep;
    });
    
    watch(() => props.autoSync, (newAutoSync) => {
      if (!canvasContext || !canvasContext.engine.value) return;
      
      if (newAutoSync) {
        canvasContext.engine.value.addEventListener('afterRender', syncObjectToBody);
      } else {
        canvasContext.engine.value.removeEventListener('afterRender', syncObjectToBody);
      }
    });
    
    // 组件挂载和卸载
    onMounted(async () => {
      // 创建刚体
      await createBody();
    });
    
    onBeforeUnmount(() => {
      if (canvasContext && canvasContext.engine.value) {
        // 移除更新函数
        canvasContext.engine.value.removeEventListener('afterRender', syncObjectToBody);
      }
      
      if (body.value && physicsContext) {
        // 从物理世界移除
        physicsContext.removeBody(body.value);
        body.value = null;
      }
      
      // 清除引用
      shape.value = null;
      bodyMaterial.value = null;
    });
    
    return {
      body,
      shape,
      bodyMaterial,
      applyForce,
      applyImpulse,
      applyLocalForce,
      applyLocalImpulse
    };
  }
};
</script>

<style scoped>
.three-rigid-body {
  display: none;
}
</style> 