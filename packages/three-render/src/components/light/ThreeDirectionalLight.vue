<template>
  <div class="three-directional-light"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, provide, inject } from 'vue';
import { CANVAS_INJECTION_KEY, PARENT_INJECTION_KEY } from '../../constants';

export default {
  props: {
    color: {
      type: [Number, String],
      default: 0xffffff
    },
    intensity: {
      type: Number,
      default: 1
    },
    position: {
      type: Array,
      default: () => [1, 1, 1]
    },
    castShadow: {
      type: Boolean,
      default: false
    },
    shadowMapSize: {
      type: Array,
      default: () => [512, 512]
    },
    shadowBias: {
      type: Number,
      default: 0
    },
    shadowRadius: {
      type: Number,
      default: 1
    },
    target: {
      type: Array,
      default: () => [0, 0, 0]
    },
    helper: {
      type: Boolean,
      default: false
    },
    helperColor: {
      type: [Number, String],
      default: 0xffff00
    },
    helperSize: {
      type: Number,
      default: 1
    }
  },
  emits: ['ready', 'update'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 光源引用
    const light = ref(null);
    const helper = ref(null);
    
    // 创建光源
    const createLight = async () => {
      if (!canvasContext || !canvasContext.engine.value) return;
      
      try {
        // 获取光照管理器
        const lightManager = await canvasContext.engine.value.getOrCreateManager('light');
        
        // 获取Three.js
        const THREE = canvasContext.engine.value.constructor.THREE;
        
        // 创建平行光
        light.value = new THREE.DirectionalLight(props.color, props.intensity);
        
        // 设置位置
        if (props.position && props.position.length === 3) {
          light.value.position.set(
            props.position[0],
            props.position[1],
            props.position[2]
          );
        }
        
        // 设置阴影
        light.value.castShadow = props.castShadow;
        
        if (props.castShadow) {
          // 配置阴影
          if (props.shadowMapSize && props.shadowMapSize.length === 2) {
            light.value.shadow.mapSize.width = props.shadowMapSize[0];
            light.value.shadow.mapSize.height = props.shadowMapSize[1];
          }
          
          light.value.shadow.bias = props.shadowBias;
          light.value.shadow.radius = props.shadowRadius;
          
          // 配置阴影相机
          light.value.shadow.camera.near = 0.5;
          light.value.shadow.camera.far = 500;
          light.value.shadow.camera.left = -10;
          light.value.shadow.camera.right = 10;
          light.value.shadow.camera.top = 10;
          light.value.shadow.camera.bottom = -10;
        }
        
        // 设置目标点
        if (props.target && props.target.length === 3) {
          light.value.target.position.set(
            props.target[0],
            props.target[1],
            props.target[2]
          );
        }
        
        // 添加到场景
        if (parentContext && parentContext.object) {
          parentContext.object.add(light.value);
          // 必须同时添加目标对象，否则光照方向不会更新
          parentContext.object.add(light.value.target);
        }
        
        // 创建辅助对象
        if (props.helper) {
          helper.value = new THREE.DirectionalLightHelper(
            light.value,
            props.helperSize,
            props.helperColor
          );
          
          if (parentContext && parentContext.object) {
            parentContext.object.add(helper.value);
          }
        }
        
        // 提供父对象上下文
        provide(PARENT_INJECTION_KEY, {
          object: light.value
        });
        
        // 触发就绪事件
        emit('ready', { light: light.value });
      } catch (error) {
        console.error('Failed to create directional light:', error);
      }
    };
    
    // 更新光源
    const updateLight = () => {
      if (!light.value) return;
      
      // 更新颜色
      light.value.color.set(props.color);
      
      // 更新强度
      light.value.intensity = props.intensity;
      
      // 更新位置
      if (props.position && props.position.length === 3) {
        light.value.position.set(
          props.position[0],
          props.position[1],
          props.position[2]
        );
      }
      
      // 更新阴影设置
      light.value.castShadow = props.castShadow;
      
      if (props.castShadow) {
        if (props.shadowMapSize && props.shadowMapSize.length === 2) {
          light.value.shadow.mapSize.width = props.shadowMapSize[0];
          light.value.shadow.mapSize.height = props.shadowMapSize[1];
        }
        
        light.value.shadow.bias = props.shadowBias;
        light.value.shadow.radius = props.shadowRadius;
      }
      
      // 更新目标点
      if (props.target && props.target.length === 3) {
        light.value.target.position.set(
          props.target[0],
          props.target[1],
          props.target[2]
        );
      }
      
      // 更新辅助对象
      if (helper.value) {
        helper.value.update();
      }
      
      // 触发更新事件
      emit('update', { light: light.value });
    };
    
    // 更新辅助对象可见性
    const updateHelper = () => {
      if (!light.value || !parentContext || !parentContext.object) return;
      
      // 移除旧的辅助对象
      if (helper.value) {
        parentContext.object.remove(helper.value);
        helper.value.dispose();
        helper.value = null;
      }
      
      // 创建新的辅助对象
      if (props.helper) {
        const THREE = canvasContext.engine.value.constructor.THREE;
        helper.value = new THREE.DirectionalLightHelper(
          light.value,
          props.helperSize,
          props.helperColor
        );
        
        parentContext.object.add(helper.value);
      }
    };
    
    // 监听属性变化
    watch(() => props.color, updateLight);
    watch(() => props.intensity, updateLight);
    watch(() => props.position, updateLight, { deep: true });
    watch(() => props.castShadow, updateLight);
    watch(() => props.shadowMapSize, updateLight, { deep: true });
    watch(() => props.shadowBias, updateLight);
    watch(() => props.shadowRadius, updateLight);
    watch(() => props.target, updateLight, { deep: true });
    watch(() => props.helper, updateHelper);
    watch(() => props.helperColor, () => {
      if (helper.value) {
        updateHelper();
      }
    });
    watch(() => props.helperSize, () => {
      if (helper.value) {
        updateHelper();
      }
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      createLight();
    });
    
    onBeforeUnmount(() => {
      if (light.value) {
        // 移除辅助对象
        if (helper.value && parentContext && parentContext.object) {
          parentContext.object.remove(helper.value);
          helper.value.dispose();
          helper.value = null;
        }
        
        // 移除目标对象
        if (parentContext && parentContext.object) {
          parentContext.object.remove(light.value.target);
        }
        
        // 移除光源
        if (parentContext && parentContext.object) {
          parentContext.object.remove(light.value);
        }
        
        light.value = null;
      }
    });
    
    return {
      light,
      helper
    };
  }
};
</script>

<style scoped>
.three-directional-light {
  display: none;
}
</style> 