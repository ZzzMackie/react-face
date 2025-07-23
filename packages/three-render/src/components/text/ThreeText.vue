<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { 
  Mesh, 
  MeshStandardMaterial, 
  Color, 
  Font, 
  FontLoader 
} from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { useParent, injectThreeParent } from '../../composables';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  fontPath: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 1
  },
  height: {
    type: Number,
    default: 0.2
  },
  curveSegments: {
    type: Number,
    default: 4
  },
  bevelEnabled: {
    type: Boolean,
    default: false
  },
  bevelThickness: {
    type: Number,
    default: 0.1
  },
  bevelSize: {
    type: Number,
    default: 0.1
  },
  bevelOffset: {
    type: Number,
    default: 0
  },
  bevelSegments: {
    type: Number,
    default: 3
  },
  color: {
    type: String,
    default: '#ffffff'
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
  castShadow: {
    type: Boolean,
    default: false
  },
  receiveShadow: {
    type: Boolean,
    default: false
  },
  metalness: {
    type: Number,
    default: 0
  },
  roughness: {
    type: Number,
    default: 0.5
  }
});

const emit = defineEmits(['created', 'loaded', 'error']);

const mesh = ref<Mesh | null>(null);
const material = ref<MeshStandardMaterial | null>(null);
const geometry = ref<TextGeometry | null>(null);
const font = ref<Font | null>(null);
const loading = ref(true);
const error = ref<Error | null>(null);
const parent = injectThreeParent();

// 加载字体
const loadFont = () => {
  loading.value = true;
  error.value = null;
  
  const loader = new FontLoader();
  loader.load(
    props.fontPath,
    (loadedFont) => {
      font.value = loadedFont;
      loading.value = false;
      createText();
      emit('loaded', font.value);
    },
    undefined,
    (err) => {
      console.error('Error loading font:', err);
      error.value = err;
      loading.value = false;
      emit('error', err);
    }
  );
};

// 创建文本
const createText = () => {
  if (!font.value) return;
  
  // 如果已经存在网格，先移除
  if (mesh.value && parent.value) {
    parent.value.remove(mesh.value);
  }
  
  // 清理旧的几何体
  if (geometry.value) {
    geometry.value.dispose();
  }
  
  // 创建文本几何体
  geometry.value = new TextGeometry(props.text, {
    font: font.value,
    size: props.size,
    height: props.height,
    curveSegments: props.curveSegments,
    bevelEnabled: props.bevelEnabled,
    bevelThickness: props.bevelThickness,
    bevelSize: props.bevelSize,
    bevelOffset: props.bevelOffset,
    bevelSegments: props.bevelSegments
  });
  
  // 居中几何体
  geometry.value.computeBoundingBox();
  if (geometry.value.boundingBox) {
    const centerOffset = [
      -(geometry.value.boundingBox.max.x - geometry.value.boundingBox.min.x) / 2,
      -(geometry.value.boundingBox.max.y - geometry.value.boundingBox.min.y) / 2,
      -(geometry.value.boundingBox.max.z - geometry.value.boundingBox.min.z) / 2
    ];
    geometry.value.translate(centerOffset[0], centerOffset[1], centerOffset[2]);
  }
  
  // 创建或更新材质
  if (!material.value) {
    material.value = new MeshStandardMaterial({
      color: new Color(props.color),
      metalness: props.metalness,
      roughness: props.roughness
    });
  } else {
    material.value.color.set(props.color);
    material.value.metalness = props.metalness;
    material.value.roughness = props.roughness;
    material.value.needsUpdate = true;
  }
  
  // 创建网格
  mesh.value = new Mesh(geometry.value, material.value);
  mesh.value.castShadow = props.castShadow;
  mesh.value.receiveShadow = props.receiveShadow;
  
  // 设置位置
  if (props.position) {
    mesh.value.position.set(
      props.position[0],
      props.position[1],
      props.position[2]
    );
  }
  
  // 设置旋转
  if (props.rotation) {
    mesh.value.rotation.set(
      props.rotation[0],
      props.rotation[1],
      props.rotation[2]
    );
  }
  
  // 设置缩放
  if (props.scale !== undefined) {
    if (Array.isArray(props.scale)) {
      mesh.value.scale.set(
        props.scale[0],
        props.scale[1],
        props.scale[2]
      );
    } else {
      mesh.value.scale.set(props.scale, props.scale, props.scale);
    }
  }
  
  // 添加到父对象
  if (parent.value) {
    parent.value.add(mesh.value);
  }
  
  emit('created', mesh.value);
};

// 监听属性变化
watch(() => props.fontPath, loadFont);

watch(() => props.text, () => {
  if (font.value) {
    createText();
  }
});

watch(() => props.color, (newColor) => {
  if (material.value) {
    material.value.color.set(newColor);
    material.value.needsUpdate = true;
  }
});

watch(() => [props.metalness, props.roughness], ([newMetalness, newRoughness]) => {
  if (material.value) {
    material.value.metalness = newMetalness;
    material.value.roughness = newRoughness;
    material.value.needsUpdate = true;
  }
});

watch(() => [props.castShadow, props.receiveShadow], ([newCastShadow, newReceiveShadow]) => {
  if (mesh.value) {
    mesh.value.castShadow = newCastShadow;
    mesh.value.receiveShadow = newReceiveShadow;
  }
});

watch(() => props.position, (newPosition) => {
  if (mesh.value) {
    mesh.value.position.set(
      newPosition[0],
      newPosition[1],
      newPosition[2]
    );
  }
}, { deep: true });

watch(() => props.rotation, (newRotation) => {
  if (mesh.value) {
    mesh.value.rotation.set(
      newRotation[0],
      newRotation[1],
      newRotation[2]
    );
  }
}, { deep: true });

watch(() => props.scale, (newScale) => {
  if (mesh.value) {
    if (Array.isArray(newScale)) {
      mesh.value.scale.set(
        newScale[0],
        newScale[1],
        newScale[2]
      );
    } else {
      mesh.value.scale.set(newScale, newScale, newScale);
    }
  }
}, { deep: true });

// 组件挂载和卸载
onMounted(() => {
  loadFont();
});

onBeforeUnmount(() => {
  if (mesh.value && parent.value) {
    parent.value.remove(mesh.value);
  }
  
  if (material.value) {
    material.value.dispose();
  }
  
  if (geometry.value) {
    geometry.value.dispose();
  }
});

// 提供给子组件
useParent(mesh);

// 暴露组件内部状态和方法
defineExpose({
  mesh,
  material,
  geometry,
  font,
  loading,
  error
});
</script>

<template>
  <div>
    <slot :mesh="mesh" :material="material" :geometry="geometry" :font="font" :loading="loading" :error="error"></slot>
  </div>
</template> 