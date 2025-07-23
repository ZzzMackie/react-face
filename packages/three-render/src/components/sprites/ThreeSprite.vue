<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Sprite, SpriteMaterial, TextureLoader, Texture } from 'three';
import { useParent, injectThreeParent } from '../../composables';

const props = defineProps({
  src: {
    type: String,
    required: false
  },
  color: {
    type: String,
    default: '#ffffff'
  },
  scale: {
    type: [Number, Array],
    default: 1
  },
  position: {
    type: Array,
    default: () => [0, 0, 0]
  },
  rotation: {
    type: Array,
    default: () => [0, 0, 0]
  },
  opacity: {
    type: Number,
    default: 1
  },
  transparent: {
    type: Boolean,
    default: true
  },
  alphaTest: {
    type: Number,
    default: 0.5
  },
  depthTest: {
    type: Boolean,
    default: true
  },
  depthWrite: {
    type: Boolean,
    default: true
  },
  visible: {
    type: Boolean,
    default: true
  },
  sizeAttenuation: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['created', 'loaded']);

const sprite = ref<Sprite | null>(null);
const material = ref<SpriteMaterial | null>(null);
const texture = ref<Texture | null>(null);
const parent = injectThreeParent();

// 创建精灵
const createSprite = () => {
  // 如果已经存在精灵，先移除
  if (sprite.value && parent.value) {
    parent.value.remove(sprite.value);
  }
  
  // 创建材质
  material.value = new SpriteMaterial({
    color: props.color,
    opacity: props.opacity,
    transparent: props.transparent,
    alphaTest: props.alphaTest,
    depthTest: props.depthTest,
    depthWrite: props.depthWrite,
    sizeAttenuation: props.sizeAttenuation
  });
  
  // 如果有纹理路径，加载纹理
  if (props.src) {
    const loader = new TextureLoader();
    loader.load(
      props.src,
      (loadedTexture) => {
        texture.value = loadedTexture;
        material.value!.map = texture.value;
        material.value!.needsUpdate = true;
        emit('loaded', texture.value);
      },
      undefined,
      (err) => {
        console.error('Error loading sprite texture:', err);
      }
    );
  }
  
  // 创建精灵
  sprite.value = new Sprite(material.value);
  
  // 设置位置
  if (props.position) {
    sprite.value.position.set(
      props.position[0],
      props.position[1],
      props.position[2]
    );
  }
  
  // 设置旋转
  if (props.rotation) {
    sprite.value.rotation.set(
      props.rotation[0],
      props.rotation[1],
      props.rotation[2]
    );
  }
  
  // 设置缩放
  if (props.scale !== undefined) {
    if (Array.isArray(props.scale)) {
      sprite.value.scale.set(
        props.scale[0],
        props.scale[1],
        props.scale[2]
      );
    } else {
      sprite.value.scale.set(props.scale, props.scale, props.scale);
    }
  }
  
  // 设置可见性
  sprite.value.visible = props.visible;
  
  // 添加到父对象
  if (parent.value) {
    parent.value.add(sprite.value);
  }
  
  emit('created', sprite.value);
};

// 监听属性变化
watch(() => props.src, createSprite);
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

watch(() => props.visible, (newVisible) => {
  if (sprite.value) {
    sprite.value.visible = newVisible;
  }
});

watch(() => props.position, (newPosition) => {
  if (sprite.value) {
    sprite.value.position.set(
      newPosition[0],
      newPosition[1],
      newPosition[2]
    );
  }
}, { deep: true });

watch(() => props.rotation, (newRotation) => {
  if (sprite.value) {
    sprite.value.rotation.set(
      newRotation[0],
      newRotation[1],
      newRotation[2]
    );
  }
}, { deep: true });

watch(() => props.scale, (newScale) => {
  if (sprite.value) {
    if (Array.isArray(newScale)) {
      sprite.value.scale.set(
        newScale[0],
        newScale[1],
        newScale[2]
      );
    } else {
      sprite.value.scale.set(newScale, newScale, newScale);
    }
  }
}, { deep: true });

// 组件挂载和卸载
onMounted(() => {
  createSprite();
});

onBeforeUnmount(() => {
  if (sprite.value && parent.value) {
    parent.value.remove(sprite.value);
  }
  
  if (material.value) {
    material.value.dispose();
  }
  
  if (texture.value) {
    texture.value.dispose();
  }
});

// 提供给子组件
useParent(sprite);

// 暴露组件内部状态和方法
defineExpose({
  sprite,
  material,
  texture
});
</script>

<template>
  <div>
    <slot :sprite="sprite" :material="material" :texture="texture"></slot>
  </div>
</template> 