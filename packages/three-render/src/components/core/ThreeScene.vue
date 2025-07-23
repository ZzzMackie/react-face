<template>
  <div class="three-scene">
    <slot></slot>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, provide, inject } from 'vue';
import { CANVAS_INJECTION_KEY, SCENE_INJECTION_KEY, PARENT_INJECTION_KEY } from '../../constants';

export default {
  props: {
    background: {
      type: [Number, String],
      default: 0x000000
    },
    fog: {
      type: Object,
      default: null
    },
    environment: {
      type: String,
      default: null
    },
    visible: {
      type: Boolean,
      default: true
    },
    id: {
      type: String,
      default: 'default'
    }
  },
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 场景引用
    const scene = ref(null);
    
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 创建场景
    const createScene = async () => {
      if (!canvasContext || !canvasContext.engine.value) return;
      
      try {
        // 获取场景管理器
        const sceneManager = await canvasContext.engine.value.getOrCreateManager('scene');
        
        // 创建场景
        scene.value = sceneManager.createScene();
        
        // 设置场景属性
        updateScene();
        
        // 如果有父对象，添加到父对象
        if (parentContext && parentContext.object) {
          parentContext.object.add(scene.value);
        }
        
        // 提供场景上下文
        provide(SCENE_INJECTION_KEY, {
          scene
        });
        
        // 提供父对象上下文
        provide(PARENT_INJECTION_KEY, {
          object: scene.value
        });
      } catch (error) {
        console.error('Failed to create scene:', error);
      }
    };
    
    // 更新场景属性
    const updateScene = () => {
      if (!scene.value) return;
      
      // 设置背景色
      if (props.background !== null) {
        if (typeof props.background === 'string') {
          scene.value.background = new canvasContext.engine.value.constructor.THREE.Color(props.background);
        } else {
          scene.value.background = new canvasContext.engine.value.constructor.THREE.Color(props.background);
        }
      }
      
      // 设置雾
      if (props.fog) {
        const THREE = canvasContext.engine.value.constructor.THREE;
        if (props.fog.type === 'linear') {
          scene.value.fog = new THREE.Fog(
            props.fog.color || 0xffffff,
            props.fog.near || 1,
            props.fog.far || 1000
          );
        } else if (props.fog.type === 'exp2') {
          scene.value.fog = new THREE.FogExp2(
            props.fog.color || 0xffffff,
            props.fog.density || 0.005
          );
        }
      }
      
      // 设置环境贴图
      if (props.environment) {
        const resourceManager = canvasContext.engine.value.getManager('resource');
        if (resourceManager) {
          resourceManager.loadTexture(props.environment).then((texture) => {
            scene.value.environment = texture;
          });
        }
      }
      
      // 设置可见性
      scene.value.visible = props.visible;
    };
    
    // 监听属性变化
    watch(() => props.background, updateScene);
    watch(() => props.fog, updateScene, { deep: true });
    watch(() => props.environment, updateScene);
    watch(() => props.visible, (newValue) => {
      if (scene.value) {
        scene.value.visible = newValue;
      }
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      createScene();
    });
    
    onBeforeUnmount(() => {
      if (scene.value) {
        // 如果有父对象，从父对象中移除
        if (parentContext && parentContext.object) {
          parentContext.object.remove(scene.value);
        }
        
        // 释放资源
        scene.value.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        
        scene.value = null;
      }
    });
    
    return {
      scene
    };
  }
};
</script>

<style scoped>
.three-scene {
  display: contents;
}
</style> 