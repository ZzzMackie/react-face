<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useFrame } from '../../composables/useFrame';

const props = defineProps<{
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showFps?: boolean;
  showMs?: boolean;
  showMem?: boolean;
  showDrawCalls?: boolean;
  showTriangles?: boolean;
  bgColor?: string;
  fgColor?: string;
  width?: number;
  height?: number;
}>();

// 统计数据
const fps = ref<number>(0);
const ms = ref<number>(0);
const memory = ref<{
  used: number;
  total: number;
  limit: number;
}>({
  used: 0,
  total: 0,
  limit: 0
});
const drawCalls = ref<number>(0);
const triangles = ref<number>(0);

// 计时器
const frames = ref<number>(0);
const lastTime = ref<number>(performance.now());
const lastFpsUpdate = ref<number>(performance.now());
const container = ref<HTMLDivElement | null>(null);
const isEnabled = ref<boolean>(props.enabled !== false);

// 更新FPS
const updateFps = (time: number) => {
  frames.value++;
  
  // 每秒更新一次FPS
  if (time - lastFpsUpdate.value >= 1000) {
    fps.value = Math.round((frames.value * 1000) / (time - lastFpsUpdate.value));
    frames.value = 0;
    lastFpsUpdate.value = time;
  }
};

// 更新渲染时间
const updateMs = (time: number, delta: number) => {
  ms.value = delta * 1000; // 转换为毫秒
};

// 更新内存使用
const updateMemory = () => {
  if (window.performance && (performance as any).memory) {
    const mem = (performance as any).memory;
    memory.value = {
      used: Math.round(mem.usedJSHeapSize / (1024 * 1024)),
      total: Math.round(mem.totalJSHeapSize / (1024 * 1024)),
      limit: Math.round(mem.jsHeapSizeLimit / (1024 * 1024))
    };
  }
};

// 更新绘制调用和三角形数量
const updateDrawCalls = () => {
  // 这部分需要访问Three.js的渲染器信息
  // 在实际应用中，可以通过useThree获取渲染器
  // 并访问renderer.info.render.calls和renderer.info.render.triangles
  // 由于这里没有直接访问渲染器，我们使用模拟数据
  drawCalls.value = Math.round(Math.random() * 100 + 100);
  triangles.value = Math.round(Math.random() * 100000 + 50000);
};

// 更新统计信息
const update = (time: number, delta: number) => {
  if (!isEnabled.value) return;
  
  updateFps(time);
  updateMs(time, delta);
  
  // 每秒更新一次内存和绘制信息
  if (time - lastTime.value >= 1000) {
    if (props.showMem) {
      updateMemory();
    }
    
    if (props.showDrawCalls || props.showTriangles) {
      updateDrawCalls();
    }
    
    lastTime.value = time;
  }
};

// 启用/禁用统计
const setEnabled = (enabled: boolean) => {
  isEnabled.value = enabled;
  
  if (container.value) {
    container.value.style.display = enabled ? 'block' : 'none';
  }
};

// 监听属性变化
watch(() => props.enabled, (enabled) => {
  setEnabled(enabled !== false);
});

// 组件挂载和卸载
onMounted(() => {
  // 添加帧更新
  useFrame(update);
  
  // 初始化显示状态
  setEnabled(isEnabled.value);
});

// 暴露组件内部状态和方法
defineExpose({
  fps,
  ms,
  memory,
  drawCalls,
  triangles,
  isEnabled,
  setEnabled
});

// 计算位置样式
const positionStyle = () => {
  switch (props.position) {
    case 'top-right':
      return { top: '0', right: '0' };
    case 'bottom-left':
      return { bottom: '0', left: '0' };
    case 'bottom-right':
      return { bottom: '0', right: '0' };
    case 'top-left':
    default:
      return { top: '0', left: '0' };
  }
};
</script>

<template>
  <div class="three-stats" ref="container"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue';
import { CANVAS_INJECTION_KEY } from '../../constants';

export default {
  props: {
    position: {
      type: String,
      default: 'top-left',
      validator: (value) => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value)
    },
    showFps: {
      type: Boolean,
      default: true
    },
    showMs: {
      type: Boolean,
      default: true
    },
    showMem: {
      type: Boolean,
      default: false
    }
  },
  emits: ['ready', 'update'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // Stats引用
    const stats = ref(null);
    const container = ref(null);
    
    // 创建Stats
    const createStats = async () => {
      if (!canvasContext || !canvasContext.engine.value || !container.value) return;
      
      try {
        // 动态导入Stats.js
        const Stats = await import('three/examples/jsm/libs/stats.module.js')
          .then(module => module.default || module);
        
        // 创建Stats实例
        stats.value = new Stats();
        
        // 配置面板
        if (props.showFps) {
          stats.value.showPanel(0); // FPS
        }
        
        if (props.showMs) {
          stats.value.showPanel(1); // MS
        }
        
        if (props.showMem) {
          stats.value.showPanel(2); // MB
        }
        
        // 设置样式
        const panelElement = stats.value.dom;
        panelElement.style.position = 'relative';
        
        // 添加到容器
        container.value.appendChild(panelElement);
        
        // 设置容器样式
        updateContainerStyle();
        
        // 添加到引擎的动画循环
        const update = () => {
          if (stats.value) {
            stats.value.update();
          }
        };
        
        canvasContext.engine.value.onBeforeRender(update);
        
        // 触发就绪事件
        emit('ready', { stats: stats.value });
      } catch (error) {
        console.error('Failed to create stats:', error);
      }
    };
    
    // 更新容器样式
    const updateContainerStyle = () => {
      if (!container.value) return;
      
      // 基本样式
      container.value.style.position = 'absolute';
      container.value.style.zIndex = '100';
      
      // 位置
      switch (props.position) {
        case 'top-left':
          container.value.style.top = '0';
          container.value.style.left = '0';
          break;
        case 'top-right':
          container.value.style.top = '0';
          container.value.style.right = '0';
          break;
        case 'bottom-left':
          container.value.style.bottom = '0';
          container.value.style.left = '0';
          break;
        case 'bottom-right':
          container.value.style.bottom = '0';
          container.value.style.right = '0';
          break;
      }
    };
    
    // 组件挂载和卸载
    onMounted(() => {
      createStats();
    });
    
    onBeforeUnmount(() => {
      if (stats.value && container.value) {
        // 移除Stats面板
        container.value.removeChild(stats.value.dom);
        stats.value = null;
      }
    });
    
    return {
      stats,
      container
    };
  }
};
</script>

<style scoped>
.three-stats {
  pointer-events: none;
}
</style> 