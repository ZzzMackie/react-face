<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { 
  Points,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  TextureLoader,
  AdditiveBlending,
  Color
} from 'three';
import { useParent, injectThreeParent } from '../../composables';
import { useFrame } from '../../composables/useFrame';

const props = defineProps({
  count: {
    type: Number,
    default: 1000
  },
  size: {
    type: Number,
    default: 0.1
  },
  color: {
    type: String,
    default: '#ffffff'
  },
  texture: {
    type: String,
    default: ''
  },
  blending: {
    type: Number,
    default: AdditiveBlending
  },
  transparent: {
    type: Boolean,
    default: true
  },
  opacity: {
    type: Number,
    default: 1
  },
  sizeAttenuation: {
    type: Boolean,
    default: true
  },
  position: {
    type: Array,
    default: () => [0, 0, 0]
  },
  rotation: {
    type: Array,
    default: () => [0, 0, 0]
  },
  scale: {
    type: [Number, Array],
    default: 1
  },
  spread: {
    type: Number,
    default: 10
  },
  animated: {
    type: Boolean,
    default: false
  },
  animationSpeed: {
    type: Number,
    default: 0.1
  }
});

const emit = defineEmits(['created', 'updated']);

const points = ref<Points | null>(null);
const geometry = ref<BufferGeometry | null>(null);
const material = ref<PointsMaterial | null>(null);
const parent = injectThreeParent();
const positions = ref<Float32Array | null>(null);
const velocities = ref<Float32Array | null>(null);

// 创建粒子系统
const createParticleSystem = () => {
  // 如果已经存在粒子系统，先移除
  if (points.value && parent.value) {
    parent.value.remove(points.value);
  }
  
  // 清理旧的几何体和材质
  if (geometry.value) {
    geometry.value.dispose();
  }
  
  if (material.value) {
    material.value.dispose();
  }
  
  // 创建几何体
  geometry.value = new BufferGeometry();
  
  // 创建粒子位置
  positions.value = new Float32Array(props.count * 3);
  velocities.value = new Float32Array(props.count * 3);
  
  for (let i = 0; i < props.count; i++) {
    const i3 = i * 3;
    
    // 随机位置
    positions.value[i3] = (Math.random() - 0.5) * props.spread;
    positions.value[i3 + 1] = (Math.random() - 0.5) * props.spread;
    positions.value[i3 + 2] = (Math.random() - 0.5) * props.spread;
    
    // 随机速度
    velocities.value[i3] = (Math.random() - 0.5) * 0.02;
    velocities.value[i3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities.value[i3 + 2] = (Math.random() - 0.5) * 0.02;
  }
  
  geometry.value.setAttribute('position', new Float32BufferAttribute(positions.value, 3));
  
  // 创建材质
  const materialOptions = {
    size: props.size,
    sizeAttenuation: props.sizeAttenuation,
    color: new Color(props.color),
    transparent: props.transparent,
    opacity: props.opacity,
    blending: props.blending
  };
  
  if (props.texture) {
    const loader = new TextureLoader();
    loader.load(props.texture, (texture) => {
      material.value!.map = texture;
      material.value!.needsUpdate = true;
    });
  }
  
  material.value = new PointsMaterial(materialOptions);
  
  // 创建粒子系统
  points.value = new Points(geometry.value, material.value);
  
  // 设置位置
  if (props.position) {
    points.value.position.set(
      props.position[0],
      props.position[1],
      props.position[2]
    );
  }
  
  // 设置旋转
  if (props.rotation) {
    points.value.rotation.set(
      props.rotation[0],
      props.rotation[1],
      props.rotation[2]
    );
  }
  
  // 设置缩放
  if (props.scale !== undefined) {
    if (Array.isArray(props.scale)) {
      points.value.scale.set(
        props.scale[0],
        props.scale[1],
        props.scale[2]
      );
    } else {
      points.value.scale.set(props.scale, props.scale, props.scale);
    }
  }
  
  // 添加到父对象
  if (parent.value) {
    parent.value.add(points.value);
  }
  
  emit('created', points.value);
};

// 更新粒子位置
const updateParticles = (_, delta: number) => {
  if (!props.animated || !points.value || !geometry.value || !positions.value || !velocities.value) return;
  
  const positionAttribute = geometry.value.getAttribute('position');
  const speed = props.animationSpeed * delta * 60;
  
  for (let i = 0; i < props.count; i++) {
    const i3 = i * 3;
    
    // 更新位置
    positions.value[i3] += velocities.value[i3] * speed;
    positions.value[i3 + 1] += velocities.value[i3 + 1] * speed;
    positions.value[i3 + 2] += velocities.value[i3 + 2] * speed;
    
    // 边界检查，如果粒子超出范围，将其反弹回来
    const limit = props.spread / 2;
    for (let j = 0; j < 3; j++) {
      if (Math.abs(positions.value[i3 + j]) > limit) {
        velocities.value[i3 + j] *= -1;
      }
    }
  }
  
  positionAttribute.needsUpdate = true;
  emit('updated', points.value);
};

// 监听属性变化
watch(() => [props.count, props.spread], () => {
  createParticleSystem();
});

watch(() => props.size, (newSize) => {
  if (material.value) {
    material.value.size = newSize;
    material.value.needsUpdate = true;
  }
});

watch(() => props.color, (newColor) => {
  if (material.value) {
    material.value.color.set(newColor);
    material.value.needsUpdate = true;
  }
});

watch(() => props.opacity, (newOpacity) => {
  if (material.value) {
    material.value.opacity = newOpacity;
    material.value.needsUpdate = true;
  }
});

watch(() => props.transparent, (newTransparent) => {
  if (material.value) {
    material.value.transparent = newTransparent;
    material.value.needsUpdate = true;
  }
});

watch(() => props.sizeAttenuation, (newSizeAttenuation) => {
  if (material.value) {
    material.value.sizeAttenuation = newSizeAttenuation;
    material.value.needsUpdate = true;
  }
});

watch(() => props.position, (newPosition) => {
  if (points.value) {
    points.value.position.set(
      newPosition[0],
      newPosition[1],
      newPosition[2]
    );
  }
}, { deep: true });

watch(() => props.rotation, (newRotation) => {
  if (points.value) {
    points.value.rotation.set(
      newRotation[0],
      newRotation[1],
      newRotation[2]
    );
  }
}, { deep: true });

watch(() => props.scale, (newScale) => {
  if (points.value) {
    if (Array.isArray(newScale)) {
      points.value.scale.set(
        newScale[0],
        newScale[1],
        newScale[2]
      );
    } else {
      points.value.scale.set(newScale, newScale, newScale);
    }
  }
}, { deep: true });

// 组件挂载和卸载
onMounted(() => {
  createParticleSystem();
  
  if (props.animated) {
    useFrame(updateParticles);
  }
});

onBeforeUnmount(() => {
  if (points.value && parent.value) {
    parent.value.remove(points.value);
  }
  
  if (geometry.value) {
    geometry.value.dispose();
  }
  
  if (material.value) {
    material.value.dispose();
  }
});

// 提供给子组件
useParent(points);

// 暴露组件内部状态和方法
defineExpose({
  points,
  geometry,
  material,
  positions,
  velocities,
  updateParticles
});
</script>

<template>
  <div class="three-particle-system"></div>
</template> 