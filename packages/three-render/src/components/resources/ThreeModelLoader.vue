<template>
  <div class="three-model-loader">
    <slot v-if="model" :model="model" :animations="animations"></slot>
  </div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount, inject } from 'vue';
import { RESOURCE_MANAGER_INJECTION_KEY } from './ThreeResourceManager.vue';
import { SCENE_INJECTION_KEY } from '../../constants';

export default {
  props: {
    url: {
      type: String,
      required: true
    },
    id: {
      type: String,
      default: null
    },
    autoLoad: {
      type: Boolean,
      default: true
    },
    autoAdd: {
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
    castShadow: {
      type: Boolean,
      default: false
    },
    receiveShadow: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: true
    }
  },
  emits: ['ready', 'load', 'error', 'dispose', 'add', 'remove'],
  setup(props, { emit }) {
    // 获取资源管理器和场景
    const resourceManager = inject(RESOURCE_MANAGER_INJECTION_KEY, null);
    const sceneContext = inject(SCENE_INJECTION_KEY, null);
    
    // 模型引用
    const model = ref(null);
    
    // 动画引用
    const animations = ref([]);
    
    // 加载模型
    const loadModel = async () => {
      if (!resourceManager) {
        console.error('ResourceManager not found');
        return;
      }
      
      try {
        // 获取资源ID
        const id = props.id || props.url;
        
        // 加载模型
        const gltf = await resourceManager.loadModel(props.url, id);
        
        // 处理模型
        processModel(gltf);
        
        // 添加到场景
        if (props.autoAdd && sceneContext && sceneContext.scene.value) {
          addToScene();
        }
        
        // 触发加载完成事件
        emit('load', { model: model.value, animations: animations.value, id });
      } catch (error) {
        console.error('Failed to load model:', error);
        emit('error', { error, url: props.url });
      }
    };
    
    // 处理模型
    const processModel = (gltf) => {
      if (!gltf) return;
      
      // 提取模型
      model.value = gltf.scene || gltf.scenes[0];
      
      // 提取动画
      animations.value = gltf.animations || [];
      
      // 应用变换
      applyTransform();
      
      // 应用阴影设置
      applyShadowSettings();
      
      // 应用可见性
      model.value.visible = props.visible;
    };
    
    // 应用变换
    const applyTransform = () => {
      if (!model.value) return;
      
      // 应用位置
      model.value.position.set(props.position[0], props.position[1], props.position[2]);
      
      // 应用旋转
      model.value.rotation.set(props.rotation[0], props.rotation[1], props.rotation[2]);
      
      // 应用缩放
      if (Array.isArray(props.scale)) {
        model.value.scale.set(props.scale[0], props.scale[1], props.scale[2]);
      } else {
        model.value.scale.set(props.scale, props.scale, props.scale);
      }
    };
    
    // 应用阴影设置
    const applyShadowSettings = () => {
      if (!model.value) return;
      
      // 遍历模型中的所有网格
      model.value.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = props.castShadow;
          node.receiveShadow = props.receiveShadow;
          
          // 优化材质
          if (node.material) {
            // 如果是标准材质，设置合理的默认值
            if (node.material.isMeshStandardMaterial) {
              node.material.envMapIntensity = node.material.envMapIntensity || 1;
              node.material.needsUpdate = true;
            }
          }
        }
      });
    };
    
    // 添加到场景
    const addToScene = () => {
      if (!model.value || !sceneContext || !sceneContext.scene.value) return;
      
      sceneContext.scene.value.add(model.value);
      emit('add', { model: model.value });
    };
    
    // 从场景移除
    const removeFromScene = () => {
      if (!model.value || !sceneContext || !sceneContext.scene.value) return;
      
      sceneContext.scene.value.remove(model.value);
      emit('remove', { model: model.value });
    };
    
    // 销毁模型
    const disposeModel = () => {
      if (!resourceManager || !model.value) return;
      
      // 从场景中移除
      removeFromScene();
      
      // 处理材质和几何体
      model.value.traverse((node) => {
        if (node.isMesh) {
          if (node.geometry) {
            node.geometry.dispose();
          }
          
          if (node.material) {
            if (Array.isArray(node.material)) {
              node.material.forEach(material => {
                disposeMaterial(material);
              });
            } else {
              disposeMaterial(node.material);
            }
          }
        }
      });
      
      // 获取资源ID
      const id = props.id || props.url;
      
      // 移除资源
      resourceManager.removeResource(id);
      
      // 清空引用
      model.value = null;
      animations.value = [];
      
      // 触发销毁事件
      emit('dispose', { id });
    };
    
    // 销毁材质
    const disposeMaterial = (material) => {
      if (!material) return;
      
      // 处理材质纹理
      Object.keys(material).forEach(prop => {
        if (material[prop] && material[prop].isTexture) {
          material[prop].dispose();
        }
      });
      
      // 销毁材质
      material.dispose();
    };
    
    // 监听URL变化
    watch(() => props.url, () => {
      if (props.autoLoad) {
        // 先处理旧的模型
        disposeModel();
        
        // 加载新的模型
        loadModel();
      }
    });
    
    // 监听位置、旋转、缩放变化
    watch(
      () => [props.position, props.rotation, props.scale],
      () => {
        applyTransform();
      },
      { deep: true }
    );
    
    // 监听阴影设置变化
    watch(
      () => [props.castShadow, props.receiveShadow],
      () => {
        applyShadowSettings();
      }
    );
    
    // 监听可见性变化
    watch(() => props.visible, (visible) => {
      if (model.value) {
        model.value.visible = visible;
      }
    });
    
    // 监听autoAdd变化
    watch(() => props.autoAdd, (autoAdd) => {
      if (model.value) {
        if (autoAdd) {
          addToScene();
        } else {
          removeFromScene();
        }
      }
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      // 等待资源管理器就绪
      if (!resourceManager) {
        console.error('ResourceManager not found');
        emit('error', { error: new Error('ResourceManager not found'), url: props.url });
        return;
      }
      
      // 当资源管理器就绪时触发
      emit('ready', { resourceManager });
      
      // 自动加载
      if (props.autoLoad) {
        loadModel();
      }
    });
    
    onBeforeUnmount(() => {
      disposeModel();
    });
    
    // 导出方法
    return {
      model,
      animations,
      loadModel,
      disposeModel,
      addToScene,
      removeFromScene
    };
  }
};
</script>

<style scoped>
.three-model-loader {
  display: none;
}
</style> 