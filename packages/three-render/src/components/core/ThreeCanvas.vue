<template>
  <div ref="containerRef" class="three-canvas" :style="containerStyle">
    <slot></slot>
    <div v-if="stats" class="three-stats"></div>
    <div v-if="showLoading && loading" class="three-loading">
      <slot name="loading">
        <div class="three-loading-spinner"></div>
        <div class="three-loading-text">{{ loadingText }}</div>
      </slot>
    </div>
    <div v-if="showFps" class="three-fps">{{ fps }} FPS</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, provide, watch, computed, nextTick } from 'vue';
import * as THREE from 'three';
import { Engine } from 'three-core';
import { useThreeSize } from '../../composables/useThreeSize';
import { CANVAS_CONTEXT_KEY } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * 是否启用抗锯齿
   */
  antialias?: boolean;
  
  /**
   * 是否自动调整大小
   */
  autoResize?: boolean;
  
  /**
   * 是否自动渲染
   */
  autoRender?: boolean;
  
  /**
   * 像素比
   */
  pixelRatio?: number;
  
  /**
   * 是否显示性能统计
   */
  stats?: boolean;
  
  /**
   * 背景颜色
   */
  backgroundColor?: string | number;
  
  /**
   * 宽度
   */
  width?: string | number;
  
  /**
   * 高度
   */
  height?: string | number;
  
  /**
   * 是否启用阴影
   */
  shadows?: boolean;
  
  /**
   * 是否启用 alpha
   */
  alpha?: boolean;
  
  /**
   * 是否启用 WebXR
   */
  xr?: boolean;
  
  /**
   * 是否启用物理正确渲染
   */
  physicallyCorrectLights?: boolean;
  
  /**
   * 是否启用 HDR 输出
   */
  outputEncoding?: 'sRGB' | 'Linear';
  
  /**
   * 色调映射
   */
  toneMapping?: 'None' | 'Linear' | 'Reinhard' | 'Cineon' | 'ACESFilmic';
  
  /**
   * 色调映射曝光
   */
  toneMappingExposure?: number;
  
  /**
   * 是否启用 MSAA
   */
  samples?: number;
  
  /**
   * 要启用的管理器
   */
  enableManagers?: string[];

  /**
   * 是否尝试使用 WebGPU (实验性)
   */
  webgpu?: boolean;

  /**
   * 是否显示 FPS
   */
  showFps?: boolean;

  /**
   * 是否显示加载中状态
   */
  showLoading?: boolean;

  /**
   * 加载中文本
   */
  loadingText?: string;

  /**
   * 是否启用后处理
   */
  postProcessing?: boolean;

  /**
   * 是否启用视锥体剔除
   */
  frustumCulling?: boolean;

  /**
   * 是否启用实例化渲染优化
   */
  instancedRendering?: boolean;

  /**
   * 是否启用场景优化
   */
  sceneOptimization?: boolean;

  /**
   * 是否启用内存监控
   */
  memoryMonitor?: boolean;

  /**
   * 渲染质量 (影响多个渲染参数)
   */
  quality?: 'low' | 'medium' | 'high' | 'ultra';

  /**
   * 是否启用描边效果
   */
  outline?: boolean;

  /**
   * 降低移动设备上的渲染质量
   */
  mobileOptimization?: boolean;
}>(), {
  antialias: true,
  autoResize: true,
  autoRender: true,
  pixelRatio: undefined,
  stats: false,
  backgroundColor: 0x000000,
  width: '100%',
  height: '100%',
  shadows: true,
  alpha: false,
  xr: false,
  physicallyCorrectLights: false,
  outputEncoding: 'sRGB',
  toneMapping: 'ACESFilmic',
  toneMappingExposure: 1,
  samples: 0,
  enableManagers: () => ['scene', 'camera', 'renderer', 'controls', 'lights'],
  webgpu: false,
  showFps: false,
  showLoading: true,
  loadingText: '加载中...',
  postProcessing: false,
  frustumCulling: true,
  instancedRendering: false,
  sceneOptimization: false,
  memoryMonitor: false,
  quality: 'medium',
  outline: false,
  mobileOptimization: true
});

const emit = defineEmits<{
  /**
   * 引擎初始化完成
   */
  (e: 'initialized', engine: any): void;
  
  /**
   * 每帧渲染前
   */
  (e: 'beforeRender'): void;
  
  /**
   * 每帧渲染后
   */
  (e: 'afterRender'): void;
  
  /**
   * 窗口大小改变
   */
  (e: 'resize', size: { width: number, height: number }): void;

  /**
   * 场景加载进度
   */
  (e: 'loading-progress', progress: number): void;

  /**
   * 渲染错误
   */
  (e: 'error', error: Error): void;

  /**
   * 内存使用情况
   */
  (e: 'memory', stats: { geometries: number, textures: number, triangles: number, points: number, lines: number, calls: number, memory: { total: number, used: number } }): void;
}>();

// DOM 引用
const containerRef = ref<HTMLElement | null>(null);

// 引擎实例
const engine = ref<any>(null);

// 加载状态
const loading = ref<boolean>(true);

// 帧率
const fps = ref<number>(0);
let fpsUpdateInterval: number | undefined;
let frameCount = 0;
let lastTime = performance.now();

// 是否为移动设备
const isMobile = computed(() => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
});

// 根据质量和设备类型计算实际渲染质量
const actualQuality = computed(() => {
  if (props.mobileOptimization && isMobile.value) {
    // 移动设备降低一级质量
    if (props.quality === 'ultra') return 'high';
    if (props.quality === 'high') return 'medium';
    if (props.quality === 'medium') return 'low';
    return 'low';
  }
  return props.quality;
});

// 容器样式
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  position: 'relative',
  overflow: 'hidden'
}));

// 监听容器大小变化
const { width, height } = useThreeSize(containerRef);

// 更新 FPS 计数
function updateFps() {
  frameCount++;
  const now = performance.now();
  
  if (now - lastTime >= 1000) { // 每秒更新一次
    fps.value = Math.round(frameCount * 1000 / (now - lastTime));
    frameCount = 0;
    lastTime = now;
    
    // 如果启用内存监控，发出内存使用情况事件
    if (props.memoryMonitor && engine.value) {
      const renderer = engine.value.getRenderer?.();
      if (renderer && renderer.info) {
        const info = renderer.info;
        const memory = (performance as any).memory ? {
          total: (performance as any).memory.totalJSHeapSize / (1024 * 1024),
          used: (performance as any).memory.usedJSHeapSize / (1024 * 1024)
        } : { total: 0, used: 0 };
        
        emit('memory', {
          geometries: info.memory?.geometries || 0,
          textures: info.memory?.textures || 0,
          triangles: info.render?.triangles || 0,
          points: info.render?.points || 0,
          lines: info.render?.lines || 0,
          calls: info.render?.calls || 0,
          memory
        });
      }
    }
  }
}

// 初始化引擎
async function initEngine() {
  if (!containerRef.value) return;

  try {
    loading.value = true;
    
    // 获取渲染器类型
    const rendererType = props.webgpu && 
      typeof navigator !== 'undefined' && 
      navigator.gpu ? 'webgpu' : 'webgl';
      
    // 根据质量级别设置抗锯齿和阴影质量
    const qualitySettings = {
      low: { 
        antialias: false, 
        shadowMapType: THREE.BasicShadowMap,
        pixelRatio: Math.min(window.devicePixelRatio, 1),
        shadows: props.shadows
      },
      medium: { 
        antialias: props.antialias, 
        shadowMapType: THREE.PCFShadowMap,
        pixelRatio: window.devicePixelRatio,
        shadows: props.shadows
      },
      high: { 
        antialias: true, 
        shadowMapType: THREE.PCFSoftShadowMap,
        pixelRatio: window.devicePixelRatio,
        shadows: props.shadows
      },
      ultra: { 
        antialias: true, 
        shadowMapType: THREE.VSMShadowMap,
        pixelRatio: window.devicePixelRatio,
        shadows: props.shadows
      }
    };
    
    const quality = qualitySettings[actualQuality.value];
    
    // 创建引擎实例
    engine.value = new Engine({
      container: containerRef.value,
      rendererType,
      antialias: quality.antialias,
      autoRender: props.autoRender,
      autoResize: props.autoResize,
      pixelRatio: props.pixelRatio || quality.pixelRatio,
      alpha: props.alpha,
      enableManagers: [
        ...props.enableManagers,
        // 根据配置启用额外的管理器
        ...(props.postProcessing ? ['composer'] : []),
        ...(props.outline ? ['outline'] : []),
        ...(props.stats || props.memoryMonitor || props.showFps ? ['performance'] : [])
      ]
    });
    
    // 监听加载进度
    engine.value.on('loading-progress', (progress) => {
      emit('loading-progress', progress);
      if (progress >= 100) {
        loading.value = false;
      }
    });
    
    // 添加错误处理
    engine.value.on('error', (error) => {
      emit('error', error);
      console.error('ThreeCanvas 渲染错误:', error);
    });
    
    // 初始化引擎
    await engine.value.initialize();
    
    // 获取渲染器并配置
    const renderer = await engine.value.getRenderer();
    if (renderer) {
      // 配置阴影
      renderer.shadowMap.enabled = quality.shadows;
      renderer.shadowMap.type = quality.shadowMapType;
      
      // 配置物理正确光照
      renderer.physicallyCorrectLights = props.physicallyCorrectLights;
      
      // 配置输出编码
      if (props.outputEncoding === 'sRGB') {
        renderer.outputEncoding = THREE.sRGBEncoding;
      } else {
        renderer.outputEncoding = THREE.LinearEncoding;
      }
      
      // 配置色调映射
      const toneMappingOptions = {
        'None': THREE.NoToneMapping,
        'Linear': THREE.LinearToneMapping,
        'Reinhard': THREE.ReinhardToneMapping,
        'Cineon': THREE.CineonToneMapping,
        'ACESFilmic': THREE.ACESFilmicToneMapping
      };
      renderer.toneMapping = toneMappingOptions[props.toneMapping];
      renderer.toneMappingExposure = props.toneMappingExposure;
      
      // 配置 MSAA
      if (props.samples > 0) {
        renderer.samples = props.samples;
      }
      
      // 配置 WebXR
      if (props.xr) {
        renderer.xr.enabled = true;
      }
      
      // 配置视锥体剔除
      if (props.frustumCulling === false) {
        renderer.frustumCulled = false;
      }

      // 配置优化选项
      if (props.sceneOptimization) {
        const optimizationManager = await engine.value.getOrCreateManager('optimization');
        if (optimizationManager) {
          optimizationManager.enableSceneOptimization({
            mergeGeometries: true,
            batchMaterials: true,
            occlusionCulling: true,
            instancedMeshes: props.instancedRendering
          });
        }
      }
    }
    
    // 获取场景并设置背景色
    const scene = await engine.value.getScene();
    if (scene) {
      if (typeof props.backgroundColor === 'string') {
        scene.background = new THREE.Color(props.backgroundColor);
      } else {
        scene.background = new THREE.Color(props.backgroundColor);
      }
    }
    
    // 配置后处理
    if (props.postProcessing) {
      const composerManager = await engine.value.getOrCreateManager('composer');
      if (composerManager) {
        await composerManager.initialize({
          rendererInstance: renderer,
          sceneInstance: scene,
          cameraInstance: await engine.value.getCamera()
        });
      }
    }
    
    // 配置描边效果
    if (props.outline) {
      const outlineManager = await engine.value.getOrCreateManager('outline');
      if (outlineManager) {
        outlineManager.initialize({
          thickness: 2,
          color: 0xffffff,
          visibleEdgeColor: 0xffffff,
          hiddenEdgeColor: 0x222222
        });
      }
    }

    // 添加渲染钩子
    if (props.autoRender) {
      engine.value.beforeRender.subscribe(() => {
        emit('beforeRender');
        if (props.showFps) {
          updateFps();
        }
      });
      
      engine.value.afterRender.subscribe(() => {
        emit('afterRender');
      });
    }
    
    // 设置性能监控
    if (props.stats) {
      const statsContainer = containerRef.value.querySelector('.three-stats');
      if (statsContainer) {
        const performanceManager = await engine.value.getOrCreateManager('performance');
        performanceManager.enableStats(statsContainer);
      }
    }

    // 如果启用 FPS 显示，开始计算帧率
    if (props.showFps) {
      fpsUpdateInterval = window.setInterval(updateFps, 1000);
    }
    
    // 发出初始化完成事件
    emit('initialized', engine.value);
    
    // 加载完成
    nextTick(() => {
      loading.value = false;
    });
  } catch (error) {
    console.error('ThreeCanvas 初始化失败:', error);
    emit('error', error instanceof Error ? error : new Error(String(error)));
    loading.value = false;
  }
}

// 监听大小变化
watch([width, height], ([newWidth, newHeight]) => {
  if (engine.value && props.autoResize) {
    engine.value.resize(newWidth, newHeight);
    emit('resize', { width: newWidth, height: newHeight });
  }
});

// 生命周期钩子
onMounted(async () => {
  await initEngine();
});

onBeforeUnmount(() => {
  if (fpsUpdateInterval) {
    clearInterval(fpsUpdateInterval);
  }
  
  if (engine.value) {
    engine.value.dispose();
    engine.value = null;
  }
});

// 提供上下文
provide(CANVAS_CONTEXT_KEY, {
  engine,
  containerRef
});

// 暴露给父组件的属性和方法
defineExpose({
  engine,
  containerRef,
  resize: (width: number, height: number) => {
    if (engine.value) {
      engine.value.resize(width, height);
    }
  },
  render: () => {
    if (engine.value) {
      engine.value.render();
    }
  },
  captureScreenshot: (options?: { width?: number, height?: number, format?: 'png' | 'jpg', quality?: number }) => {
    if (engine.value) {
      return engine.value.captureScreenshot(options);
    }
    return null;
  },
  enableOutline: (object: any, color?: number) => {
    if (engine.value && props.outline) {
      const outlineManager = engine.value.getManager('outline');
      outlineManager?.addOutline(object, color);
    }
  },
  disableOutline: (object: any) => {
    if (engine.value && props.outline) {
      const outlineManager = engine.value.getManager('outline');
      outlineManager?.removeOutline(object);
    }
  }
});
</script>

<style scoped>
.three-canvas {
  position: relative;
  overflow: hidden;
  touch-action: none; /* 防止移动设备上的默认触摸行为 */
}

.three-stats {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
}

.three-fps {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-family: monospace;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  z-index: 100;
}

.three-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  z-index: 101;
}

.three-loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.three-loading-text {
  font-size: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 