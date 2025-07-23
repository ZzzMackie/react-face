<template>
  <div class="three-spot-light"></div>
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
    angle: {
      type: Number,
      default: Math.PI / 3
    },
    penumbra: {
      type: Number,
      default: 0
    },
    decay: {
      type: Number,
      default: 2
    },
    position: {
      type: Array,
      default: () => [0, 5, 0]
    },
    target: {
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
      default: -0.0005
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
      default: 0xffffff
    }
  },
  emits: ['ready', 'update'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 灯光引用
    const light = ref(null);
    
    // 灯光辅助对象引用
    const lightHelper = ref(null);
    
    // 创建灯光
    const createLight = async () => {
      if (!canvasContext || !canvasContext.engine.value) return;
      
      try {
        // 获取灯光管理器
        const lightManager = await canvasContext.engine.value.getOrCreateManager('light');
        
        // 获取Three.js
        const THREE = canvasContext.engine.value.constructor.THREE;
        
        // 创建聚光灯
        light.value = new THREE.SpotLight(
          props.color,
          props.intensity,
          props.distance,
          props.angle,
          props.penumbra,
          props.decay
        );
        
        // 设置位置
        if (Array.isArray(props.position) && props.position.length >= 3) {
          light.value.position.set(props.position[0], props.position[1], props.position[2]);
        }
        
        // 设置目标点
        if (Array.isArray(props.target) && props.target.length >= 3) {
          light.value.target.position.set(props.target[0], props.target[1], props.target[2]);
        }
        
        // 设置阴影
        light.value.castShadow = props.castShadow;
        
        if (props.castShadow) {
          // 设置阴影贴图大小
          if (Array.isArray(props.shadowMapSize) && props.shadowMapSize.length >= 2) {
            light.value.shadow.mapSize.width = props.shadowMapSize[0];
            light.value.shadow.mapSize.height = props.shadowMapSize[1];
          }
          
          // 设置阴影偏差
          light.value.shadow.bias = props.shadowBias;
          
          // 设置阴影半径
          light.value.shadow.radius = props.shadowRadius;
        }
        
        // 添加到场景
        if (parentContext && parentContext.object) {
          parentContext.object.add(light.value);
          // 聚光灯的目标也需要添加到场景
          parentContext.object.add(light.value.target);
        }
        
        // 创建灯光辅助对象
        if (props.helper) {
          lightHelper.value = new THREE.SpotLightHelper(light.value, props.helperColor);
          
          if (parentContext && parentContext.object) {
            parentContext.object.add(lightHelper.value);
          }
        }
        
        // 提供父对象上下文
        provide(PARENT_INJECTION_KEY, {
          object: light.value
        });
        
        // 触发就绪事件
        emit('ready', { light: light.value });
      } catch (error) {
        console.error('Failed to create spot light:', error);
      }
    };
    
    // 更新灯光
    const updateLight = () => {
      if (!light.value) return;
      
      // 更新颜色
      light.value.color.set(props.color);
      
      // 更新强度
      light.value.intensity = props.intensity;
      
      // 更新距离
      light.value.distance = props.distance;
      
      // 更新角度
      light.value.angle = props.angle;
      
      // 更新半影
      light.value.penumbra = props.penumbra;
      
      // 更新衰减
      light.value.decay = props.decay;
      
      // 更新位置
      if (Array.isArray(props.position) && props.position.length >= 3) {
        light.value.position.set(props.position[0], props.position[1], props.position[2]);
      }
      
      // 更新目标点
      if (Array.isArray(props.target) && props.target.length >= 3) {
        light.value.target.position.set(props.target[0], props.target[1], props.target[2]);
      }
      
      // 更新阴影
      light.value.castShadow = props.castShadow;
      
      if (props.castShadow) {
        // 更新阴影贴图大小
        if (Array.isArray(props.shadowMapSize) && props.shadowMapSize.length >= 2) {
          light.value.shadow.mapSize.width = props.shadowMapSize[0];
          light.value.shadow.mapSize.height = props.shadowMapSize[1];
        }
        
        // 更新阴影偏差
        light.value.shadow.bias = props.shadowBias;
        
        // 更新阴影半径
        light.value.shadow.radius = props.shadowRadius;
      }
      
      // 更新辅助对象
      if (props.helper) {
        if (!lightHelper.value && parentContext && parentContext.object) {
          const THREE = canvasContext.engine.value.constructor.THREE;
          lightHelper.value = new THREE.SpotLightHelper(light.value, props.helperColor);
          parentContext.object.add(lightHelper.value);
        } else if (lightHelper.value) {
          lightHelper.value.update();
        }
      } else if (!props.helper && lightHelper.value && parentContext && parentContext.object) {
        parentContext.object.remove(lightHelper.value);
        lightHelper.value.dispose();
        lightHelper.value = null;
      }
      
      // 触发更新事件
      emit('update', { light: light.value });
    };
    
    // 监听属性变化
    watch(() => props.color, updateLight);
    watch(() => props.intensity, updateLight);
    watch(() => props.distance, updateLight);
    watch(() => props.angle, updateLight);
    watch(() => props.penumbra, updateLight);
    watch(() => props.decay, updateLight);
    watch(() => props.position, updateLight, { deep: true });
    watch(() => props.target, updateLight, { deep: true });
    watch(() => props.castShadow, updateLight);
    watch(() => props.shadowMapSize, updateLight, { deep: true });
    watch(() => props.shadowBias, updateLight);
    watch(() => props.shadowRadius, updateLight);
    watch(() => props.helper, updateLight);
    watch(() => props.helperColor, updateLight);
    
    // 组件挂载和卸载
    onMounted(() => {
      createLight();
    });
    
    onBeforeUnmount(() => {
      if (light.value) {
        // 移除灯光
        if (parentContext && parentContext.object) {
          parentContext.object.remove(light.value);
          parentContext.object.remove(light.value.target);
        }
        
        // 移除辅助对象
        if (lightHelper.value && parentContext && parentContext.object) {
          parentContext.object.remove(lightHelper.value);
          lightHelper.value.dispose();
          lightHelper.value = null;
        }
        
        // 释放资源
        light.value.dispose();
        light.value = null;
      }
    });
    
    return {
      light,
      lightHelper
    };
  }
};
</script>

<style scoped>
.three-spot-light {
  display: none;
}
</style> 