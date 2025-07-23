<template>
  <div class="three-point-light"></div>
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
    distance: {
      type: Number,
      default: 0
    },
    decay: {
      type: Number,
      default: 2
    },
    position: {
      type: Array,
      default: () => [0, 0, 0]
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
        
        // 创建点光源
        light.value = new THREE.PointLight(
          props.color,
          props.intensity,
          props.distance,
          props.decay
        );
        
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
        }
        
        // 添加到场景
        if (parentContext && parentContext.object) {
          parentContext.object.add(light.value);
        }
        
        // 创建辅助对象
        if (props.helper) {
          helper.value = new THREE.PointLightHelper(
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
        console.error('Failed to create point light:', error);
      }
    };
    
    // 更新光源
    const updateLight = () => {
      if (!light.value) return;
      
      // 更新颜色
      light.value.color.set(props.color);
      
      // 更新强度
      light.value.intensity = props.intensity;
      
      // 更新距离
      light.value.distance = props.distance;
      
      // 更新衰减
      light.value.decay = props.decay;
      
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
        helper.value = new THREE.PointLightHelper(
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
    watch(() => props.distance, updateLight);
    watch(() => props.decay, updateLight);
    watch(() => props.position, updateLight, { deep: true });
    watch(() => props.castShadow, updateLight);
    watch(() => props.shadowMapSize, updateLight, { deep: true });
    watch(() => props.shadowBias, updateLight);
    watch(() => props.shadowRadius, updateLight);
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
.three-point-light {
  display: none;
}
</style> 