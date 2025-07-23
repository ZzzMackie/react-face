<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Object3D, AnimationMixer, AnimationAction } from 'three';
import { useParent, injectThreeParent } from '../../composables';
import { useThree } from '../../composables/useThree';
import { useFrame } from '../../composables/useFrame';

const props = defineProps<{
  src: string;
  dracoPath?: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
  animationIndex?: number;
  animationPlay?: boolean;
  animationLoop?: boolean;
}>();

const emit = defineEmits(['loaded', 'error', 'progress']);

const model = ref<Object3D | null>(null);
const mixer = ref<AnimationMixer | null>(null);
const animations = ref<AnimationAction[]>([]);
const currentAction = ref<AnimationAction | null>(null);
const loading = ref(true);
const error = ref<Error | null>(null);
const progress = ref({ loaded: 0, total: 0 });

const { scene, clock } = useThree();
const parent = injectThreeParent();

// 加载模型
const loadModel = async () => {
  if (!props.src) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // 创建加载器
    const loader = new GLTFLoader();
    
    // 如果提供了DRACO解码器路径，设置DRACO加载器
    if (props.dracoPath) {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(props.dracoPath);
      loader.setDRACOLoader(dracoLoader);
    }
    
    // 加载模型
    const gltf = await new Promise<any>((resolve, reject) => {
      loader.load(
        props.src,
        (gltf) => resolve(gltf),
        (progressEvent) => {
          progress.value = {
            loaded: progressEvent.loaded,
            total: progressEvent.total
          };
          emit('progress', progress.value);
        },
        (err) => reject(err)
      );
    });
    
    // 清除旧模型
    if (model.value && parent.value) {
      parent.value.remove(model.value);
    }
    
    // 设置新模型
    model.value = gltf.scene;
    
    // 应用属性
    if (props.position) {
      model.value.position.set(...props.position);
    }
    
    if (props.rotation) {
      model.value.rotation.set(...props.rotation);
    }
    
    if (props.scale !== undefined) {
      if (Array.isArray(props.scale)) {
        model.value.scale.set(...props.scale);
      } else {
        model.value.scale.set(props.scale, props.scale, props.scale);
      }
    }
    
    // 设置阴影
    if (props.castShadow || props.receiveShadow) {
      model.value.traverse((object: any) => {
        if (object.isMesh) {
          if (props.castShadow !== undefined) object.castShadow = props.castShadow;
          if (props.receiveShadow !== undefined) object.receiveShadow = props.receiveShadow;
        }
      });
    }
    
    // 设置动画
    if (gltf.animations && gltf.animations.length > 0) {
      mixer.value = new AnimationMixer(model.value);
      animations.value = gltf.animations.map((clip: any) => 
        mixer.value!.clipAction(clip)
      );
      
      // 如果指定了动画索引，播放该动画
      if (props.animationIndex !== undefined && animations.value[props.animationIndex]) {
        currentAction.value = animations.value[props.animationIndex];
        if (props.animationPlay) {
          currentAction.value.setLoop(props.animationLoop ? 2201 : 2200);
          currentAction.value.play();
        }
      }
    }
    
    // 添加到父对象
    if (parent.value && model.value) {
      parent.value.add(model.value);
    }
    
    loading.value = false;
    emit('loaded', model.value);
    
  } catch (err: any) {
    error.value = err;
    loading.value = false;
    emit('error', err);
  }
};

// 监听属性变化
watch(() => props.src, loadModel, { immediate: true });

watch(() => props.animationIndex, (newIndex) => {
  if (newIndex === undefined || !animations.value[newIndex]) return;
  
  if (currentAction.value) {
    currentAction.value.stop();
  }
  
  currentAction.value = animations.value[newIndex];
  
  if (props.animationPlay) {
    currentAction.value.setLoop(props.animationLoop ? 2201 : 2200);
    currentAction.value.play();
  }
});

watch(() => props.animationPlay, (play) => {
  if (!currentAction.value) return;
  
  if (play) {
    currentAction.value.setLoop(props.animationLoop ? 2201 : 2200);
    currentAction.value.play();
  } else {
    currentAction.value.stop();
  }
});

// 更新动画
useFrame((_, delta) => {
  if (mixer.value) {
    mixer.value.update(delta);
  }
});

// 组件挂载和卸载
onMounted(() => {
  loadModel();
});

onBeforeUnmount(() => {
  if (model.value && parent.value) {
    parent.value.remove(model.value);
  }
  
  if (mixer.value) {
    mixer.value.stopAllAction();
  }
});

// 提供给子组件
useParent(model);

// 暴露组件内部状态和方法
defineExpose({
  model,
  mixer,
  animations,
  currentAction,
  loading,
  error,
  progress
});
</script>

<template>
  <div>
    <slot v-if="model" :model="model" :loading="loading" :error="error" :progress="progress"></slot>
  </div>
</template> 