<template>
  <canvas
    ref="container"
    :style="{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height
    }"
    class="three-canvas"
  >
    <slot></slot>
  </canvas>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, provide, InjectionKey } from 'vue';
import { Engine } from 'three-core';
import { CANVAS_INJECTION_KEY } from '../../constants';

export default {
  props: {
    width: {
      type: [Number, String],
      default: '100%'
    },
    height: {
      type: [Number, String],
      default: '100%'
    },
    antialias: {
      type: Boolean,
      default: true
    },
    alpha: {
      type: Boolean,
      default: false
    },
    shadows: {
      type: Boolean,
      default: false
    },
    physicallyCorrectLights: {
      type: Boolean,
      default: false
    },
    xr: {
      type: Boolean,
      default: false
    },
    toneMapping: {
      type: Number,
      default: undefined
    },
    outputEncoding: {
      type: Number,
      default: undefined
    },
    logarithmicDepthBuffer: {
      type: Boolean,
      default: false
    },
    powerPreference: {
      type: String,
      default: 'default'
    },
    id: {
      type: String,
      default: 'default'
    },
    autoResize: {
      type: Boolean,
      default: true
    }
  },
  emits: ['ready', 'beforeRender', 'afterRender', 'resize'],
  setup(props, { emit }) {
    // 创建容器引用
    const container = ref(null);
    
    // 创建引擎实例
    const engine = ref(null);
    
    // 初始化引擎
    const initEngine = () => {
      if (!container.value) return;
      
      // 创建引擎配置
      const config = {
        canvas: container.value,
        antialias: props.antialias,
        alpha: props.alpha,
        shadows: props.shadows,
        physicallyCorrectLights: props.physicallyCorrectLights,
        xr: props.xr,
        logarithmicDepthBuffer: props.logarithmicDepthBuffer,
        powerPreference: props.powerPreference,
        id: props.id
      };
      
      // 设置色调映射和输出编码
      if (props.toneMapping !== undefined) {
        config.toneMapping = props.toneMapping;
      }
      
      if (props.outputEncoding !== undefined) {
        config.outputEncoding = props.outputEncoding;
      }
      
      // 创建引擎实例
      engine.value = new Engine(config);
      
      // 设置尺寸
      updateSize();
      
      // 启动渲染循环
      engine.value.start();
      
      // 添加渲染钩子
      engine.value.onBeforeRender(() => {
        emit('beforeRender', { engine: engine.value });
      });
      
      engine.value.onAfterRender(() => {
        emit('afterRender', { engine: engine.value });
      });
      
      // 触发就绪事件
      emit('ready', { engine: engine.value });
    };
    
    // 更新尺寸
    const updateSize = () => {
      if (!engine.value || !container.value) return;
      
      let width, height;
      
      if (typeof props.width === 'number') {
        width = props.width;
      } else {
        width = container.value.clientWidth;
      }
      
      if (typeof props.height === 'number') {
        height = props.height;
      } else {
        height = container.value.clientHeight;
      }
      
      engine.value.setSize(width, height);
      
      emit('resize', { width, height });
    };
    
    // 处理窗口调整大小
    const handleResize = () => {
      if (props.autoResize) {
        updateSize();
      }
    };
    
    // 监听属性变化
    watch(() => props.width, updateSize);
    watch(() => props.height, updateSize);
    watch(() => props.shadows, (newValue) => {
      if (engine.value) {
        engine.value.setShadows(newValue);
      }
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      initEngine();
      
      if (props.autoResize) {
        window.addEventListener('resize', handleResize);
      }
    });
    
    onBeforeUnmount(() => {
      if (props.autoResize) {
        window.removeEventListener('resize', handleResize);
      }
      
      if (engine.value) {
        engine.value.stop();
        engine.value.dispose();
        engine.value = null;
      }
    });
    
    // 提供画布上下文
    provide(CANVAS_INJECTION_KEY, {
      engine,
      container
    });
    
    return {
      container,
      engine
    };
  }
};
</script>

<style scoped>
.three-canvas {
  display: block;
  outline: none;
}
</style> 