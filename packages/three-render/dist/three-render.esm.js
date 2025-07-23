var x=`<template>\r
  <div ref="containerRef" class="three-canvas" :style="containerStyle">\r
    <slot></slot>\r
    <div v-if="stats" class="three-stats"></div>\r
    <div v-if="showLoading && loading" class="three-loading">\r
      <slot name="loading">\r
        <div class="three-loading-spinner"></div>\r
        <div class="three-loading-text">{{ loadingText }}</div>\r
      </slot>\r
    </div>\r
    <div v-if="showFps" class="three-fps">{{ fps }} FPS</div>\r
  </div>\r
</template>\r
\r
<script setup lang="ts">\r
import { ref, onMounted, onBeforeUnmount, provide, watch, computed, nextTick } from 'vue';\r
import * as THREE from 'three';\r
import { Engine } from 'three-core';\r
import { useThreeSize } from '../../composables/useThreeSize';\r
import { CANVAS_CONTEXT_KEY } from '../../constants';\r
\r
const props = withDefaults(defineProps<{\r
  /**\r
   * \u662F\u5426\u542F\u7528\u6297\u952F\u9F7F\r
   */\r
  antialias?: boolean;\r
  \r
  /**\r
   * \u662F\u5426\u81EA\u52A8\u8C03\u6574\u5927\u5C0F\r
   */\r
  autoResize?: boolean;\r
  \r
  /**\r
   * \u662F\u5426\u81EA\u52A8\u6E32\u67D3\r
   */\r
  autoRender?: boolean;\r
  \r
  /**\r
   * \u50CF\u7D20\u6BD4\r
   */\r
  pixelRatio?: number;\r
  \r
  /**\r
   * \u662F\u5426\u663E\u793A\u6027\u80FD\u7EDF\u8BA1\r
   */\r
  stats?: boolean;\r
  \r
  /**\r
   * \u80CC\u666F\u989C\u8272\r
   */\r
  backgroundColor?: string | number;\r
  \r
  /**\r
   * \u5BBD\u5EA6\r
   */\r
  width?: string | number;\r
  \r
  /**\r
   * \u9AD8\u5EA6\r
   */\r
  height?: string | number;\r
  \r
  /**\r
   * \u662F\u5426\u542F\u7528\u9634\u5F71\r
   */\r
  shadows?: boolean;\r
  \r
  /**\r
   * \u662F\u5426\u542F\u7528 alpha\r
   */\r
  alpha?: boolean;\r
  \r
  /**\r
   * \u662F\u5426\u542F\u7528 WebXR\r
   */\r
  xr?: boolean;\r
  \r
  /**\r
   * \u662F\u5426\u542F\u7528\u7269\u7406\u6B63\u786E\u6E32\u67D3\r
   */\r
  physicallyCorrectLights?: boolean;\r
  \r
  /**\r
   * \u662F\u5426\u542F\u7528 HDR \u8F93\u51FA\r
   */\r
  outputEncoding?: 'sRGB' | 'Linear';\r
  \r
  /**\r
   * \u8272\u8C03\u6620\u5C04\r
   */\r
  toneMapping?: 'None' | 'Linear' | 'Reinhard' | 'Cineon' | 'ACESFilmic';\r
  \r
  /**\r
   * \u8272\u8C03\u6620\u5C04\u66DD\u5149\r
   */\r
  toneMappingExposure?: number;\r
  \r
  /**\r
   * \u662F\u5426\u542F\u7528 MSAA\r
   */\r
  samples?: number;\r
  \r
  /**\r
   * \u8981\u542F\u7528\u7684\u7BA1\u7406\u5668\r
   */\r
  enableManagers?: string[];\r
\r
  /**\r
   * \u662F\u5426\u5C1D\u8BD5\u4F7F\u7528 WebGPU (\u5B9E\u9A8C\u6027)\r
   */\r
  webgpu?: boolean;\r
\r
  /**\r
   * \u662F\u5426\u663E\u793A FPS\r
   */\r
  showFps?: boolean;\r
\r
  /**\r
   * \u662F\u5426\u663E\u793A\u52A0\u8F7D\u4E2D\u72B6\u6001\r
   */\r
  showLoading?: boolean;\r
\r
  /**\r
   * \u52A0\u8F7D\u4E2D\u6587\u672C\r
   */\r
  loadingText?: string;\r
\r
  /**\r
   * \u662F\u5426\u542F\u7528\u540E\u5904\u7406\r
   */\r
  postProcessing?: boolean;\r
\r
  /**\r
   * \u662F\u5426\u542F\u7528\u89C6\u9525\u4F53\u5254\u9664\r
   */\r
  frustumCulling?: boolean;\r
\r
  /**\r
   * \u662F\u5426\u542F\u7528\u5B9E\u4F8B\u5316\u6E32\u67D3\u4F18\u5316\r
   */\r
  instancedRendering?: boolean;\r
\r
  /**\r
   * \u662F\u5426\u542F\u7528\u573A\u666F\u4F18\u5316\r
   */\r
  sceneOptimization?: boolean;\r
\r
  /**\r
   * \u662F\u5426\u542F\u7528\u5185\u5B58\u76D1\u63A7\r
   */\r
  memoryMonitor?: boolean;\r
\r
  /**\r
   * \u6E32\u67D3\u8D28\u91CF (\u5F71\u54CD\u591A\u4E2A\u6E32\u67D3\u53C2\u6570)\r
   */\r
  quality?: 'low' | 'medium' | 'high' | 'ultra';\r
\r
  /**\r
   * \u662F\u5426\u542F\u7528\u63CF\u8FB9\u6548\u679C\r
   */\r
  outline?: boolean;\r
\r
  /**\r
   * \u964D\u4F4E\u79FB\u52A8\u8BBE\u5907\u4E0A\u7684\u6E32\u67D3\u8D28\u91CF\r
   */\r
  mobileOptimization?: boolean;\r
}>(), {\r
  antialias: true,\r
  autoResize: true,\r
  autoRender: true,\r
  pixelRatio: undefined,\r
  stats: false,\r
  backgroundColor: 0x000000,\r
  width: '100%',\r
  height: '100%',\r
  shadows: true,\r
  alpha: false,\r
  xr: false,\r
  physicallyCorrectLights: false,\r
  outputEncoding: 'sRGB',\r
  toneMapping: 'ACESFilmic',\r
  toneMappingExposure: 1,\r
  samples: 0,\r
  enableManagers: () => ['scene', 'camera', 'renderer', 'controls', 'lights'],\r
  webgpu: false,\r
  showFps: false,\r
  showLoading: true,\r
  loadingText: '\u52A0\u8F7D\u4E2D...',\r
  postProcessing: false,\r
  frustumCulling: true,\r
  instancedRendering: false,\r
  sceneOptimization: false,\r
  memoryMonitor: false,\r
  quality: 'medium',\r
  outline: false,\r
  mobileOptimization: true\r
});\r
\r
const emit = defineEmits<{\r
  /**\r
   * \u5F15\u64CE\u521D\u59CB\u5316\u5B8C\u6210\r
   */\r
  (e: 'initialized', engine: any): void;\r
  \r
  /**\r
   * \u6BCF\u5E27\u6E32\u67D3\u524D\r
   */\r
  (e: 'beforeRender'): void;\r
  \r
  /**\r
   * \u6BCF\u5E27\u6E32\u67D3\u540E\r
   */\r
  (e: 'afterRender'): void;\r
  \r
  /**\r
   * \u7A97\u53E3\u5927\u5C0F\u6539\u53D8\r
   */\r
  (e: 'resize', size: { width: number, height: number }): void;\r
\r
  /**\r
   * \u573A\u666F\u52A0\u8F7D\u8FDB\u5EA6\r
   */\r
  (e: 'loading-progress', progress: number): void;\r
\r
  /**\r
   * \u6E32\u67D3\u9519\u8BEF\r
   */\r
  (e: 'error', error: Error): void;\r
\r
  /**\r
   * \u5185\u5B58\u4F7F\u7528\u60C5\u51B5\r
   */\r
  (e: 'memory', stats: { geometries: number, textures: number, triangles: number, points: number, lines: number, calls: number, memory: { total: number, used: number } }): void;\r
}>();\r
\r
// DOM \u5F15\u7528\r
const containerRef = ref<HTMLElement | null>(null);\r
\r
// \u5F15\u64CE\u5B9E\u4F8B\r
const engine = ref<any>(null);\r
\r
// \u52A0\u8F7D\u72B6\u6001\r
const loading = ref<boolean>(true);\r
\r
// \u5E27\u7387\r
const fps = ref<number>(0);\r
let fpsUpdateInterval: number | undefined;\r
let frameCount = 0;\r
let lastTime = performance.now();\r
\r
// \u662F\u5426\u4E3A\u79FB\u52A8\u8BBE\u5907\r
const isMobile = computed(() => {\r
  if (typeof navigator === 'undefined') return false;\r
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);\r
});\r
\r
// \u6839\u636E\u8D28\u91CF\u548C\u8BBE\u5907\u7C7B\u578B\u8BA1\u7B97\u5B9E\u9645\u6E32\u67D3\u8D28\u91CF\r
const actualQuality = computed(() => {\r
  if (props.mobileOptimization && isMobile.value) {\r
    // \u79FB\u52A8\u8BBE\u5907\u964D\u4F4E\u4E00\u7EA7\u8D28\u91CF\r
    if (props.quality === 'ultra') return 'high';\r
    if (props.quality === 'high') return 'medium';\r
    if (props.quality === 'medium') return 'low';\r
    return 'low';\r
  }\r
  return props.quality;\r
});\r
\r
// \u5BB9\u5668\u6837\u5F0F\r
const containerStyle = computed(() => ({\r
  width: typeof props.width === 'number' ? \`\${props.width}px\` : props.width,\r
  height: typeof props.height === 'number' ? \`\${props.height}px\` : props.height,\r
  position: 'relative',\r
  overflow: 'hidden'\r
}));\r
\r
// \u76D1\u542C\u5BB9\u5668\u5927\u5C0F\u53D8\u5316\r
const { width, height } = useThreeSize(containerRef);\r
\r
// \u66F4\u65B0 FPS \u8BA1\u6570\r
function updateFps() {\r
  frameCount++;\r
  const now = performance.now();\r
  \r
  if (now - lastTime >= 1000) { // \u6BCF\u79D2\u66F4\u65B0\u4E00\u6B21\r
    fps.value = Math.round(frameCount * 1000 / (now - lastTime));\r
    frameCount = 0;\r
    lastTime = now;\r
    \r
    // \u5982\u679C\u542F\u7528\u5185\u5B58\u76D1\u63A7\uFF0C\u53D1\u51FA\u5185\u5B58\u4F7F\u7528\u60C5\u51B5\u4E8B\u4EF6\r
    if (props.memoryMonitor && engine.value) {\r
      const renderer = engine.value.getRenderer?.();\r
      if (renderer && renderer.info) {\r
        const info = renderer.info;\r
        const memory = (performance as any).memory ? {\r
          total: (performance as any).memory.totalJSHeapSize / (1024 * 1024),\r
          used: (performance as any).memory.usedJSHeapSize / (1024 * 1024)\r
        } : { total: 0, used: 0 };\r
        \r
        emit('memory', {\r
          geometries: info.memory?.geometries || 0,\r
          textures: info.memory?.textures || 0,\r
          triangles: info.render?.triangles || 0,\r
          points: info.render?.points || 0,\r
          lines: info.render?.lines || 0,\r
          calls: info.render?.calls || 0,\r
          memory\r
        });\r
      }\r
    }\r
  }\r
}\r
\r
// \u521D\u59CB\u5316\u5F15\u64CE\r
async function initEngine() {\r
  if (!containerRef.value) return;\r
\r
  try {\r
    loading.value = true;\r
    \r
    // \u83B7\u53D6\u6E32\u67D3\u5668\u7C7B\u578B\r
    const rendererType = props.webgpu && \r
      typeof navigator !== 'undefined' && \r
      navigator.gpu ? 'webgpu' : 'webgl';\r
      \r
    // \u6839\u636E\u8D28\u91CF\u7EA7\u522B\u8BBE\u7F6E\u6297\u952F\u9F7F\u548C\u9634\u5F71\u8D28\u91CF\r
    const qualitySettings = {\r
      low: { \r
        antialias: false, \r
        shadowMapType: THREE.BasicShadowMap,\r
        pixelRatio: Math.min(window.devicePixelRatio, 1),\r
        shadows: props.shadows\r
      },\r
      medium: { \r
        antialias: props.antialias, \r
        shadowMapType: THREE.PCFShadowMap,\r
        pixelRatio: window.devicePixelRatio,\r
        shadows: props.shadows\r
      },\r
      high: { \r
        antialias: true, \r
        shadowMapType: THREE.PCFSoftShadowMap,\r
        pixelRatio: window.devicePixelRatio,\r
        shadows: props.shadows\r
      },\r
      ultra: { \r
        antialias: true, \r
        shadowMapType: THREE.VSMShadowMap,\r
        pixelRatio: window.devicePixelRatio,\r
        shadows: props.shadows\r
      }\r
    };\r
    \r
    const quality = qualitySettings[actualQuality.value];\r
    \r
    // \u521B\u5EFA\u5F15\u64CE\u5B9E\u4F8B\r
    engine.value = new Engine({\r
      container: containerRef.value,\r
      rendererType,\r
      antialias: quality.antialias,\r
      autoRender: props.autoRender,\r
      autoResize: props.autoResize,\r
      pixelRatio: props.pixelRatio || quality.pixelRatio,\r
      alpha: props.alpha,\r
      enableManagers: [\r
        ...props.enableManagers,\r
        // \u6839\u636E\u914D\u7F6E\u542F\u7528\u989D\u5916\u7684\u7BA1\u7406\u5668\r
        ...(props.postProcessing ? ['composer'] : []),\r
        ...(props.outline ? ['outline'] : []),\r
        ...(props.stats || props.memoryMonitor || props.showFps ? ['performance'] : [])\r
      ]\r
    });\r
    \r
    // \u76D1\u542C\u52A0\u8F7D\u8FDB\u5EA6\r
    engine.value.on('loading-progress', (progress) => {\r
      emit('loading-progress', progress);\r
      if (progress >= 100) {\r
        loading.value = false;\r
      }\r
    });\r
    \r
    // \u6DFB\u52A0\u9519\u8BEF\u5904\u7406\r
    engine.value.on('error', (error) => {\r
      emit('error', error);\r
      console.error('ThreeCanvas \u6E32\u67D3\u9519\u8BEF:', error);\r
    });\r
    \r
    // \u521D\u59CB\u5316\u5F15\u64CE\r
    await engine.value.initialize();\r
    \r
    // \u83B7\u53D6\u6E32\u67D3\u5668\u5E76\u914D\u7F6E\r
    const renderer = await engine.value.getRenderer();\r
    if (renderer) {\r
      // \u914D\u7F6E\u9634\u5F71\r
      renderer.shadowMap.enabled = quality.shadows;\r
      renderer.shadowMap.type = quality.shadowMapType;\r
      \r
      // \u914D\u7F6E\u7269\u7406\u6B63\u786E\u5149\u7167\r
      renderer.physicallyCorrectLights = props.physicallyCorrectLights;\r
      \r
      // \u914D\u7F6E\u8F93\u51FA\u7F16\u7801\r
      if (props.outputEncoding === 'sRGB') {\r
        renderer.outputEncoding = THREE.sRGBEncoding;\r
      } else {\r
        renderer.outputEncoding = THREE.LinearEncoding;\r
      }\r
      \r
      // \u914D\u7F6E\u8272\u8C03\u6620\u5C04\r
      const toneMappingOptions = {\r
        'None': THREE.NoToneMapping,\r
        'Linear': THREE.LinearToneMapping,\r
        'Reinhard': THREE.ReinhardToneMapping,\r
        'Cineon': THREE.CineonToneMapping,\r
        'ACESFilmic': THREE.ACESFilmicToneMapping\r
      };\r
      renderer.toneMapping = toneMappingOptions[props.toneMapping];\r
      renderer.toneMappingExposure = props.toneMappingExposure;\r
      \r
      // \u914D\u7F6E MSAA\r
      if (props.samples > 0) {\r
        renderer.samples = props.samples;\r
      }\r
      \r
      // \u914D\u7F6E WebXR\r
      if (props.xr) {\r
        renderer.xr.enabled = true;\r
      }\r
      \r
      // \u914D\u7F6E\u89C6\u9525\u4F53\u5254\u9664\r
      if (props.frustumCulling === false) {\r
        renderer.frustumCulled = false;\r
      }\r
\r
      // \u914D\u7F6E\u4F18\u5316\u9009\u9879\r
      if (props.sceneOptimization) {\r
        const optimizationManager = await engine.value.getOrCreateManager('optimization');\r
        if (optimizationManager) {\r
          optimizationManager.enableSceneOptimization({\r
            mergeGeometries: true,\r
            batchMaterials: true,\r
            occlusionCulling: true,\r
            instancedMeshes: props.instancedRendering\r
          });\r
        }\r
      }\r
    }\r
    \r
    // \u83B7\u53D6\u573A\u666F\u5E76\u8BBE\u7F6E\u80CC\u666F\u8272\r
    const scene = await engine.value.getScene();\r
    if (scene) {\r
      if (typeof props.backgroundColor === 'string') {\r
        scene.background = new THREE.Color(props.backgroundColor);\r
      } else {\r
        scene.background = new THREE.Color(props.backgroundColor);\r
      }\r
    }\r
    \r
    // \u914D\u7F6E\u540E\u5904\u7406\r
    if (props.postProcessing) {\r
      const composerManager = await engine.value.getOrCreateManager('composer');\r
      if (composerManager) {\r
        await composerManager.initialize({\r
          rendererInstance: renderer,\r
          sceneInstance: scene,\r
          cameraInstance: await engine.value.getCamera()\r
        });\r
      }\r
    }\r
    \r
    // \u914D\u7F6E\u63CF\u8FB9\u6548\u679C\r
    if (props.outline) {\r
      const outlineManager = await engine.value.getOrCreateManager('outline');\r
      if (outlineManager) {\r
        outlineManager.initialize({\r
          thickness: 2,\r
          color: 0xffffff,\r
          visibleEdgeColor: 0xffffff,\r
          hiddenEdgeColor: 0x222222\r
        });\r
      }\r
    }\r
\r
    // \u6DFB\u52A0\u6E32\u67D3\u94A9\u5B50\r
    if (props.autoRender) {\r
      engine.value.beforeRender.subscribe(() => {\r
        emit('beforeRender');\r
        if (props.showFps) {\r
          updateFps();\r
        }\r
      });\r
      \r
      engine.value.afterRender.subscribe(() => {\r
        emit('afterRender');\r
      });\r
    }\r
    \r
    // \u8BBE\u7F6E\u6027\u80FD\u76D1\u63A7\r
    if (props.stats) {\r
      const statsContainer = containerRef.value.querySelector('.three-stats');\r
      if (statsContainer) {\r
        const performanceManager = await engine.value.getOrCreateManager('performance');\r
        performanceManager.enableStats(statsContainer);\r
      }\r
    }\r
\r
    // \u5982\u679C\u542F\u7528 FPS \u663E\u793A\uFF0C\u5F00\u59CB\u8BA1\u7B97\u5E27\u7387\r
    if (props.showFps) {\r
      fpsUpdateInterval = window.setInterval(updateFps, 1000);\r
    }\r
    \r
    // \u53D1\u51FA\u521D\u59CB\u5316\u5B8C\u6210\u4E8B\u4EF6\r
    emit('initialized', engine.value);\r
    \r
    // \u52A0\u8F7D\u5B8C\u6210\r
    nextTick(() => {\r
      loading.value = false;\r
    });\r
  } catch (error) {\r
    console.error('ThreeCanvas \u521D\u59CB\u5316\u5931\u8D25:', error);\r
    emit('error', error instanceof Error ? error : new Error(String(error)));\r
    loading.value = false;\r
  }\r
}\r
\r
// \u76D1\u542C\u5927\u5C0F\u53D8\u5316\r
watch([width, height], ([newWidth, newHeight]) => {\r
  if (engine.value && props.autoResize) {\r
    engine.value.resize(newWidth, newHeight);\r
    emit('resize', { width: newWidth, height: newHeight });\r
  }\r
});\r
\r
// \u751F\u547D\u5468\u671F\u94A9\u5B50\r
onMounted(async () => {\r
  await initEngine();\r
});\r
\r
onBeforeUnmount(() => {\r
  if (fpsUpdateInterval) {\r
    clearInterval(fpsUpdateInterval);\r
  }\r
  \r
  if (engine.value) {\r
    engine.value.dispose();\r
    engine.value = null;\r
  }\r
});\r
\r
// \u63D0\u4F9B\u4E0A\u4E0B\u6587\r
provide(CANVAS_CONTEXT_KEY, {\r
  engine,\r
  containerRef\r
});\r
\r
// \u66B4\u9732\u7ED9\u7236\u7EC4\u4EF6\u7684\u5C5E\u6027\u548C\u65B9\u6CD5\r
defineExpose({\r
  engine,\r
  containerRef,\r
  resize: (width: number, height: number) => {\r
    if (engine.value) {\r
      engine.value.resize(width, height);\r
    }\r
  },\r
  render: () => {\r
    if (engine.value) {\r
      engine.value.render();\r
    }\r
  },\r
  captureScreenshot: (options?: { width?: number, height?: number, format?: 'png' | 'jpg', quality?: number }) => {\r
    if (engine.value) {\r
      return engine.value.captureScreenshot(options);\r
    }\r
    return null;\r
  },\r
  enableOutline: (object: any, color?: number) => {\r
    if (engine.value && props.outline) {\r
      const outlineManager = engine.value.getManager('outline');\r
      outlineManager?.addOutline(object, color);\r
    }\r
  },\r
  disableOutline: (object: any) => {\r
    if (engine.value && props.outline) {\r
      const outlineManager = engine.value.getManager('outline');\r
      outlineManager?.removeOutline(object);\r
    }\r
  }\r
});\r
</script>\r
\r
<style scoped>\r
.three-canvas {\r
  position: relative;\r
  overflow: hidden;\r
  touch-action: none; /* \u9632\u6B62\u79FB\u52A8\u8BBE\u5907\u4E0A\u7684\u9ED8\u8BA4\u89E6\u6478\u884C\u4E3A */\r
}\r
\r
.three-stats {\r
  position: absolute;\r
  top: 0;\r
  left: 0;\r
  z-index: 100;\r
}\r
\r
.three-fps {\r
  position: absolute;\r
  top: 10px;\r
  right: 10px;\r
  background-color: rgba(0, 0, 0, 0.5);\r
  color: #fff;\r
  font-family: monospace;\r
  font-size: 12px;\r
  padding: 4px 8px;\r
  border-radius: 4px;\r
  z-index: 100;\r
}\r
\r
.three-loading {\r
  position: absolute;\r
  top: 0;\r
  left: 0;\r
  width: 100%;\r
  height: 100%;\r
  display: flex;\r
  flex-direction: column;\r
  align-items: center;\r
  justify-content: center;\r
  background-color: rgba(0, 0, 0, 0.5);\r
  color: #fff;\r
  z-index: 101;\r
}\r
\r
.three-loading-spinner {\r
  width: 40px;\r
  height: 40px;\r
  border: 4px solid rgba(255, 255, 255, 0.3);\r
  border-radius: 50%;\r
  border-top-color: #fff;\r
  animation: spin 1s linear infinite;\r
  margin-bottom: 10px;\r
}\r
\r
.three-loading-text {\r
  font-size: 16px;\r
}\r
\r
@keyframes spin {\r
  0% { transform: rotate(0deg); }\r
  100% { transform: rotate(360deg); }\r
}\r
</style> `;var C=`<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, provide, inject, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { SCENE_CONTEXT_KEY, RENDER_CONTEXT_KEY } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * \u80CC\u666F\u8272
   */
  background?: string | number | THREE.Texture | THREE.Color | null;
  
  /**
   * \u73AF\u5883\u8272
   */
  environment?: string | THREE.Texture | null;
  
  /**
   * \u96FE\u6548
   */
  fog?: {
    color?: string | number;
    near?: number;
    far?: number;
    density?: number;
    type?: 'normal' | 'exp2';
  } | null;
  
  /**
   * \u662F\u5426\u542F\u7528\u7269\u7406\u6B63\u786E\u7167\u660E
   */
  physicallyCorrectLights?: boolean;
  
  /**
   * \u662F\u5426\u542F\u7528\u81EA\u52A8\u66F4\u65B0
   */
  autoUpdate?: boolean;
  
  /**
   * \u573A\u666F\u540D\u79F0
   */
  name?: string;
}>(), {
  background: null,
  environment: null,
  fog: null,
  physicallyCorrectLights: false,
  autoUpdate: true,
  name: 'Scene'
});

const emit = defineEmits<{
  /**
   * \u573A\u666F\u521B\u5EFA
   */
  (e: 'created', scene: THREE.Scene): void;
  
  /**
   * \u573A\u666F\u66F4\u65B0
   */
  (e: 'updated', scene: THREE.Scene): void;
  
  /**
   * \u573A\u666F\u9500\u6BC1
   */
  (e: 'disposed'): void;
}>();

// \u83B7\u53D6\u6E32\u67D3\u4E0A\u4E0B\u6587
const renderContext = inject(RENDER_CONTEXT_KEY, null);

// \u573A\u666F\u5BF9\u8C61
const scene = ref<THREE.Scene | null>(null);

// \u7EB9\u7406\u52A0\u8F7D\u5668
const textureLoader = new THREE.TextureLoader();

// \u8BBE\u7F6E\u80CC\u666F
const setBackground = async (value: string | number | THREE.Texture | THREE.Color | null) => {
  if (!scene.value) return;
  
  // \u6E05\u9664\u80CC\u666F
  if (value === null) {
    scene.value.background = null;
    return;
  }
  
  // \u989C\u8272
  if (typeof value === 'string' || typeof value === 'number') {
    scene.value.background = new THREE.Color(value);
    return;
  }
  
  // \u7EB9\u7406\u6216\u989C\u8272
  scene.value.background = value;
};

// \u8BBE\u7F6E\u73AF\u5883\u8D34\u56FE
const setEnvironment = async (value: string | THREE.Texture | null) => {
  if (!scene.value) return;
  
  // \u6E05\u9664\u73AF\u5883
  if (value === null) {
    scene.value.environment = null;
    return;
  }
  
  // \u5982\u679C\u662F\u5B57\u7B26\u4E32\uFF0C\u52A0\u8F7D\u73AF\u5883\u8D34\u56FE
  if (typeof value === 'string') {
    try {
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        textureLoader.load(value, resolve, undefined, reject);
      });
      
      if (scene.value) {
        scene.value.environment = texture;
      }
    } catch (error) {
      console.error('\u52A0\u8F7D\u73AF\u5883\u8D34\u56FE\u5931\u8D25:', error);
    }
    return;
  }
  
  // \u7EB9\u7406
  scene.value.environment = value;
};

// \u8BBE\u7F6E\u96FE\u6548
const setFog = (fogConfig: typeof props.fog) => {
  if (!scene.value) return;
  
  // \u6E05\u9664\u96FE\u6548
  if (!fogConfig) {
    scene.value.fog = null;
    return;
  }
  
  // \u83B7\u53D6\u96FE\u6548\u989C\u8272
  const fogColor = fogConfig.color ? new THREE.Color(fogConfig.color) : new THREE.Color(0xcccccc);
  
  // \u521B\u5EFA\u96FE\u6548
  if (fogConfig.type === 'exp2') {
    // \u6307\u6570\u96FE\u6548
    scene.value.fog = new THREE.FogExp2(
      fogColor,
      fogConfig.density ?? 0.005
    );
  } else {
    // \u7EBF\u6027\u96FE\u6548
    scene.value.fog = new THREE.Fog(
      fogColor,
      fogConfig.near ?? 1,
      fogConfig.far ?? 1000
    );
  }
};
  
// \u521B\u5EFA\u573A\u666F
const createScene = () => {
  // \u521B\u5EFA\u573A\u666F
  scene.value = new THREE.Scene();
  
  // \u8BBE\u7F6E\u573A\u666F\u5C5E\u6027
  scene.value.name = props.name;
  
  // \u8BBE\u7F6E\u80CC\u666F
  if (props.background !== null) {
    setBackground(props.background);
  }
  
  // \u8BBE\u7F6E\u73AF\u5883\u8D34\u56FE
  if (props.environment !== null) {
    setEnvironment(props.environment);
  }
  
  // \u8BBE\u7F6E\u96FE\u6548
  if (props.fog !== null) {
    setFog(props.fog);
  }
  
  // \u53D1\u51FA\u521B\u5EFA\u4E8B\u4EF6
  emit('created', scene.value);
  
  return scene.value;
};

// \u66F4\u65B0\u573A\u666F
const updateScene = () => {
  if (!scene.value) return;
  
  // \u66F4\u65B0\u573A\u666F\u5C5E\u6027
  scene.value.name = props.name;
  
  // \u8BBE\u7F6E\u80CC\u666F
  setBackground(props.background);
  
  // \u8BBE\u7F6E\u73AF\u5883\u8D34\u56FE
  setEnvironment(props.environment);
  
  // \u8BBE\u7F6E\u96FE\u6548
  setFog(props.fog);
  
  // \u66F4\u65B0\u7269\u7406\u6B63\u786E\u7167\u660E\u8BBE\u7F6E
  if (renderContext?.renderer?.value) {
    renderContext.renderer.value.physicallyCorrectLights = props.physicallyCorrectLights;
  }
  
  // \u66F4\u65B0\u81EA\u52A8\u66F4\u65B0\u8BBE\u7F6E
  if (renderContext?.renderer?.value) {
    renderContext.renderer.value.autoUpdate = props.autoUpdate;
  }
  
  // \u53D1\u51FA\u66F4\u65B0\u4E8B\u4EF6
  emit('updated', scene.value);
};

// \u91CA\u653E\u8D44\u6E90
const dispose = () => {
  if (scene.value) {
    scene.value.clear();
    scene.value = null;
    
    // \u53D1\u51FA\u9500\u6BC1\u4E8B\u4EF6
    emit('disposed');
  }
};

// \u76D1\u542C\u5C5E\u6027\u53D8\u5316
watch(
  () => [
    props.background,
    props.environment,
    props.fog,
    props.physicallyCorrectLights,
    props.autoUpdate,
    props.name
  ],
  updateScene,
  { deep: true }
);

// \u521B\u5EFA\u573A\u666F\u4E0A\u4E0B\u6587
const sceneContext = {
  scene
};

// \u63D0\u4F9B\u573A\u666F\u4E0A\u4E0B\u6587\u7ED9\u5B50\u7EC4\u4EF6
provide(SCENE_CONTEXT_KEY, sceneContext);

// \u751F\u547D\u5468\u671F\u94A9\u5B50
onMounted(() => {
  createScene();
  
  // \u66F4\u65B0\u6E32\u67D3\u5668\u4E2D\u7684\u573A\u666F
  if (renderContext?.scene) {
    renderContext.scene.value = scene.value;
  }
});

onBeforeUnmount(() => {
  dispose();
  
  // \u6E05\u9664\u6E32\u67D3\u5668\u4E2D\u7684\u573A\u666F
  if (renderContext?.scene) {
    renderContext.scene.value = null;
  }
});

// \u66B4\u9732\u7ED9\u7236\u7EC4\u4EF6\u7684\u5C5E\u6027\u548C\u65B9\u6CD5
defineExpose({
  scene,
  createScene,
  updateScene,
  dispose
});
</script> `;var S=`<template>\r
  <three-object\r
    v-if="camera"\r
    :object="camera"\r
    v-bind="objectProps"\r
    @mounted="onMounted"\r
    @unmounted="onUnmounted"\r
  >\r
    <slot></slot>\r
  </three-object>\r
</template>\r
\r
<script setup lang="ts">\r
import { ref, computed, provide, inject, onMounted as vueOnMounted, onBeforeUnmount, watch, toRefs } from 'vue';\r
import * as THREE from 'three';\r
import ThreeObject from './ThreeObject.vue';\r
import { CAMERA_CONTEXT_KEY, RENDER_CONTEXT_KEY } from '../../constants';\r
\r
const props = withDefaults(defineProps<{\r
  /**\r
   * \u76F8\u673A\u7C7B\u578B\r
   */\r
  type?: 'perspective' | 'orthographic';\r
  \r
  /**\r
   * \u76F8\u673A\u89C6\u91CE(PerspectiveCamera only)\r
   */\r
  fov?: number;\r
  \r
  /**\r
   * \u957F\u5BBD\u6BD4(PerspectiveCamera only)\r
   */\r
  aspect?: number;\r
  \r
  /**\r
   * \u8FD1\u88C1\u526A\u9762\r
   */\r
  near?: number;\r
  \r
  /**\r
   * \u8FDC\u88C1\u526A\u9762\r
   */\r
  far?: number;\r
  \r
  /**\r
   * \u6B63\u4EA4\u76F8\u673A\u5C3A\u5BF8(OrthographicCamera only)\r
   */\r
  size?: number;\r
  \r
  /**\r
   * \u76F8\u673A\u4F4D\u7F6E\r
   */\r
  position?: [number, number, number] | { x: number, y: number, z: number };\r
  \r
  /**\r
   * \u76F8\u673A\u671D\u5411(\u76EE\u6807\u70B9)\r
   */\r
  lookAt?: [number, number, number] | { x: number, y: number, z: number };\r
  \r
  /**\r
   * \u662F\u5426\u8BBE\u4E3A\u4E3B\u76F8\u673A\r
   */\r
  makeDefault?: boolean;\r
  \r
  /**\r
   * \u76F8\u673A\u540D\u79F0\r
   */\r
  name?: string;\r
  \r
  /**\r
   * \u662F\u5426\u624B\u52A8\u66F4\u65B0\r
   */\r
  manual?: boolean;\r
  \r
  /**\r
   * \u76F8\u673A\u89C6\u56FE\u504F\u79FB\r
   */\r
  viewOffset?: {\r
    fullWidth: number;\r
    fullHeight: number;\r
    x: number;\r
    y: number;\r
    width: number;\r
    height: number;\r
  };\r
  \r
  /**\r
   * \u76F8\u673A\u5C42\u7EA7\r
   */\r
  layers?: number[];\r
  \r
  /**\r
   * \u76F8\u673A\u65CB\u8F6C\r
   */\r
  rotation?: [number, number, number] | { x: number, y: number, z: number };\r
  \r
  /**\r
   * \u7F29\u653E\r
   */\r
  scale?: [number, number, number] | { x: number, y: number, z: number } | number;\r
  \r
  /**\r
   * \u662F\u5426\u53EF\u89C1\r
   */\r
  visible?: boolean;\r
  \r
  /**\r
   * \u6E32\u67D3\u987A\u5E8F\r
   */\r
  renderOrder?: number;\r
  \r
  /**\r
   * \u7528\u6237\u6570\u636E\r
   */\r
  userData?: Record<string, any>;\r
  \r
  /**\r
   * \u77E9\u9635\u81EA\u52A8\u66F4\u65B0\r
   */\r
  matrixAutoUpdate?: boolean;\r
}>(), {\r
  type: 'perspective',\r
  fov: 75,\r
  aspect: 1,\r
  near: 0.1,\r
  far: 1000,\r
  size: 5,\r
  position: () => [0, 0, 5],\r
  lookAt: () => [0, 0, 0],\r
  makeDefault: false,\r
  name: '',\r
  manual: false,\r
  viewOffset: undefined,\r
  layers: () => [],\r
  rotation: () => [0, 0, 0],\r
  scale: 1,\r
  visible: true,\r
  renderOrder: 0,\r
  userData: () => ({}),\r
  matrixAutoUpdate: true\r
});\r
\r
const emit = defineEmits<{\r
  /**\r
   * \u76F8\u673A\u521B\u5EFA\r
   */\r
  (e: 'created', camera: THREE.Camera): void;\r
  \r
  /**\r
   * \u76F8\u673A\u66F4\u65B0\r
   */\r
  (e: 'updated', camera: THREE.Camera): void;\r
  \r
  /**\r
   * \u76F8\u673A\u9500\u6BC1\r
   */\r
  (e: 'disposed'): void;\r
}>();\r
\r
// \u83B7\u53D6\u6E32\u67D3\u4E0A\u4E0B\u6587\r
const renderContext = inject(RENDER_CONTEXT_KEY, null);\r
\r
// \u76F8\u673A\u5BF9\u8C61\r
const camera = ref<THREE.Camera | null>(null);\r
\r
// \u8F6C\u53D1\u7ED9 ThreeObject \u7684\u5C5E\u6027\r
const objectProps = computed(() => {\r
  const { position, rotation, scale, visible, renderOrder, userData, matrixAutoUpdate, name } = toRefs(props);\r
  \r
  return {\r
    position: position.value,\r
    rotation: rotation.value,\r
    scale: scale.value,\r
    visible: visible.value,\r
    renderOrder: renderOrder.value,\r
    userData: userData.value,\r
    matrixAutoUpdate: matrixAutoUpdate.value,\r
    name: name.value || \`\${props.type}Camera\`\r
  };\r
});\r
\r
// \u521B\u5EFA\u76F8\u673A\r
const createCamera = () => {\r
  // \u9500\u6BC1\u65E7\u76F8\u673A\r
  if (camera.value) {\r
    camera.value = null;\r
  }\r
  \r
  // \u521B\u5EFA\u65B0\u76F8\u673A\r
  if (props.type === 'orthographic') {\r
    // \u8BA1\u7B97\u6B63\u4EA4\u76F8\u673A\u7684\u5C3A\u5BF8\r
    const aspect = props.aspect;\r
    const size = props.size;\r
    const halfSize = size / 2;\r
    const halfWidth = halfSize * aspect;\r
    const halfHeight = halfSize;\r
    \r
    // \u521B\u5EFA\u6B63\u4EA4\u76F8\u673A\r
    camera.value = new THREE.OrthographicCamera(\r
      -halfWidth,\r
      halfWidth,\r
      halfHeight,\r
      -halfHeight,\r
      props.near,\r
      props.far\r
    );\r
  } else {\r
    // \u521B\u5EFA\u900F\u89C6\u76F8\u673A\r
    camera.value = new THREE.PerspectiveCamera(\r
      props.fov,\r
      props.aspect,\r
      props.near,\r
      props.far\r
    );\r
  }\r
  \r
  // \u8BBE\u7F6E\u76F8\u673A\u540D\u79F0\r
  camera.value.name = props.name || \`\${props.type}Camera\`;\r
  \r
  // \u8BBE\u7F6E\u89C6\u56FE\u504F\u79FB\r
  if (props.viewOffset && camera.value instanceof THREE.PerspectiveCamera) {\r
    camera.value.setViewOffset(\r
      props.viewOffset.fullWidth,\r
      props.viewOffset.fullHeight,\r
      props.viewOffset.x,\r
      props.viewOffset.y,\r
      props.viewOffset.width,\r
      props.viewOffset.height\r
    );\r
  }\r
  \r
  // \u8BBE\u7F6E\u5C42\u7EA7\r
  if (props.layers.length > 0) {\r
    camera.value.layers.disableAll();\r
    props.layers.forEach(layer => {\r
      camera.value?.layers.enable(layer);\r
    });\r
  }\r
  \r
  // \u53D1\u51FA\u521B\u5EFA\u4E8B\u4EF6\r
  emit('created', camera.value);\r
  \r
  return camera.value;\r
};\r
\r
// \u66F4\u65B0\u76F8\u673A\u53C2\u6570\r
const updateCamera = () => {\r
  if (!camera.value) return;\r
  \r
  // \u66F4\u65B0\u900F\u89C6\u76F8\u673A\u53C2\u6570\r
  if (props.type === 'perspective' && camera.value instanceof THREE.PerspectiveCamera) {\r
    camera.value.fov = props.fov;\r
    camera.value.aspect = props.aspect;\r
    camera.value.near = props.near;\r
    camera.value.far = props.far;\r
    camera.value.updateProjectionMatrix();\r
  }\r
  \r
  // \u66F4\u65B0\u6B63\u4EA4\u76F8\u673A\u53C2\u6570\r
  if (props.type === 'orthographic' && camera.value instanceof THREE.OrthographicCamera) {\r
    const aspect = props.aspect;\r
    const size = props.size;\r
    const halfSize = size / 2;\r
    const halfWidth = halfSize * aspect;\r
    const halfHeight = halfSize;\r
    \r
    camera.value.left = -halfWidth;\r
    camera.value.right = halfWidth;\r
    camera.value.top = halfHeight;\r
    camera.value.bottom = -halfHeight;\r
    camera.value.near = props.near;\r
    camera.value.far = props.far;\r
    camera.value.updateProjectionMatrix();\r
  }\r
  \r
  // \u8BBE\u7F6E\u5C42\u7EA7\r
  if (props.layers.length > 0) {\r
    camera.value.layers.disableAll();\r
    props.layers.forEach(layer => {\r
      camera.value?.layers.enable(layer);\r
    });\r
  }\r
  \r
  // \u66F4\u65B0\u89C6\u56FE\u504F\u79FB\r
  if (props.viewOffset && camera.value instanceof THREE.PerspectiveCamera) {\r
    camera.value.setViewOffset(\r
      props.viewOffset.fullWidth,\r
      props.viewOffset.fullHeight,\r
      props.viewOffset.x,\r
      props.viewOffset.y,\r
      props.viewOffset.width,\r
      props.viewOffset.height\r
    );\r
  }\r
  \r
  // \u66F4\u65B0\u76F8\u673A\u671D\u5411\r
  if (props.lookAt) {\r
    // \u83B7\u53D6\u76EE\u6807\u70B9\r
    let target: THREE.Vector3;\r
    if (Array.isArray(props.lookAt)) {\r
      target = new THREE.Vector3(props.lookAt[0], props.lookAt[1], props.lookAt[2]);\r
    } else {\r
      target = new THREE.Vector3(props.lookAt.x, props.lookAt.y, props.lookAt.z);\r
    }\r
    \r
    // \u66F4\u65B0\u76F8\u673A\u671D\u5411\r
    camera.value.lookAt(target);\r
  }\r
  \r
  // \u53D1\u51FA\u66F4\u65B0\u4E8B\u4EF6\r
  emit('updated', camera.value);\r
};\r
\r
// \u91CA\u653E\u8D44\u6E90\r
const dispose = () => {\r
  if (camera.value) {\r
    camera.value = null;\r
    emit('disposed');\r
  }\r
};\r
\r
// \u7F51\u683C\u6302\u8F7D\u4E8B\u4EF6\r
const onMounted = (object: THREE.Object3D) => {\r
  // \u8FD9\u4E2A\u51FD\u6570\u7531 ThreeObject \u7EC4\u4EF6\u8C03\u7528\r
  // \u5982\u679C\u9700\u8981\u8BBE\u4E3A\u4E3B\u76F8\u673A\uFF0C\u5219\u66F4\u65B0\u6E32\u67D3\u4E0A\u4E0B\u6587\r
  if (props.makeDefault && renderContext?.camera) {\r
    renderContext.camera.value = camera.value;\r
  }\r
  \r
  // \u66F4\u65B0\u76F8\u673A\u671D\u5411\r
  if (camera.value && props.lookAt) {\r
    // \u83B7\u53D6\u76EE\u6807\u70B9\r
    let target: THREE.Vector3;\r
    if (Array.isArray(props.lookAt)) {\r
      target = new THREE.Vector3(props.lookAt[0], props.lookAt[1], props.lookAt[2]);\r
    } else {\r
      target = new THREE.Vector3(props.lookAt.x, props.lookAt.y, props.lookAt.z);\r
    }\r
    \r
    // \u66F4\u65B0\u76F8\u673A\u671D\u5411\r
    camera.value.lookAt(target);\r
  }\r
};\r
\r
// \u7F51\u683C\u5378\u8F7D\u4E8B\u4EF6\r
const onUnmounted = () => {\r
  // \u5982\u679C\u662F\u4E3B\u76F8\u673A\uFF0C\u5219\u6E05\u9664\u6E32\u67D3\u4E0A\u4E0B\u6587\u4E2D\u7684\u76F8\u673A\r
  if (props.makeDefault && renderContext?.camera?.value === camera.value) {\r
    renderContext.camera.value = null;\r
  }\r
};\r
\r
// \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
watch(\r
  () => [\r
    props.type,\r
    props.fov,\r
    props.aspect,\r
    props.near,\r
    props.far,\r
    props.size,\r
    props.viewOffset,\r
    props.layers\r
  ],\r
  updateCamera,\r
  { deep: true }\r
);\r
\r
// \u76D1\u542C lookAt \u5C5E\u6027\u53D8\u5316\r
watch(\r
  () => props.lookAt,\r
  () => {\r
    if (camera.value && props.lookAt) {\r
      // \u83B7\u53D6\u76EE\u6807\u70B9\r
      let target: THREE.Vector3;\r
      if (Array.isArray(props.lookAt)) {\r
        target = new THREE.Vector3(props.lookAt[0], props.lookAt[1], props.lookAt[2]);\r
      } else {\r
        target = new THREE.Vector3(props.lookAt.x, props.lookAt.y, props.lookAt.z);\r
      }\r
      \r
      // \u66F4\u65B0\u76F8\u673A\u671D\u5411\r
      camera.value.lookAt(target);\r
    }\r
  },\r
  { deep: true }\r
);\r
\r
// \u76D1\u542C makeDefault \u5C5E\u6027\u53D8\u5316\r
watch(\r
  () => props.makeDefault,\r
  (value) => {\r
    if (value && renderContext?.camera && camera.value) {\r
      renderContext.camera.value = camera.value;\r
    }\r
  }\r
);\r
\r
// \u521B\u5EFA\u76F8\u673A\u4E0A\u4E0B\u6587\r
const cameraContext = {\r
  camera\r
};\r
\r
// \u63D0\u4F9B\u76F8\u673A\u4E0A\u4E0B\u6587\u7ED9\u5B50\u7EC4\u4EF6\r
provide(CAMERA_CONTEXT_KEY, cameraContext);\r
\r
// \u751F\u547D\u5468\u671F\u94A9\u5B50\r
vueOnMounted(() => {\r
  createCamera();\r
  \r
  // \u5982\u679C\u8BBE\u4E3A\u4E3B\u76F8\u673A\uFF0C\u5219\u66F4\u65B0\u6E32\u67D3\u4E0A\u4E0B\u6587\r
  if (props.makeDefault && renderContext?.camera && camera.value) {\r
    renderContext.camera.value = camera.value;\r
  }\r
});\r
\r
onBeforeUnmount(() => {\r
  // \u5982\u679C\u662F\u4E3B\u76F8\u673A\uFF0C\u5219\u6E05\u9664\u6E32\u67D3\u4E0A\u4E0B\u6587\u4E2D\u7684\u76F8\u673A\r
  if (props.makeDefault && renderContext?.camera?.value === camera.value) {\r
    renderContext.camera.value = null;\r
  }\r
  \r
  // \u91CA\u653E\u8D44\u6E90\r
  dispose();\r
});\r
\r
// \u66B4\u9732\u7ED9\u7236\u7EC4\u4EF6\u7684\u5C5E\u6027\u548C\u65B9\u6CD5\r
defineExpose({\r
  camera,\r
  createCamera,\r
  updateCamera,\r
  dispose\r
});\r
</script> `;var R=`<template>\r
  <three-object\r
    ref="objectRef"\r
    :object="mesh"\r
    v-bind="objectProps"\r
    @mounted="onMounted"\r
    @unmounted="onUnmounted"\r
  >\r
    <slot></slot>\r
  </three-object>\r
</template>\r
\r
<script setup lang="ts">\r
import { ref, computed, provide, onMounted as vueOnMounted, onBeforeUnmount, watch, toRefs } from 'vue';\r
import * as THREE from 'three';\r
import ThreeObject from './ThreeObject.vue';\r
import { GEOMETRY_CONTEXT_KEY, MATERIAL_CONTEXT_KEY, MESH_CONTEXT_KEY } from '../../constants';\r
\r
const props = withDefaults(defineProps<{\r
  /**\r
   * \u51E0\u4F55\u4F53\u5BF9\u8C61\r
   */\r
  geometry?: THREE.BufferGeometry | null;\r
  \r
  /**\r
   * \u6750\u8D28\u5BF9\u8C61\r
   */\r
  material?: THREE.Material | THREE.Material[] | null;\r
  \r
  /**\r
   * \u4F4D\u7F6E\r
   */\r
  position?: [number, number, number] | { x: number, y: number, z: number };\r
  \r
  /**\r
   * \u65CB\u8F6C\r
   */\r
  rotation?: [number, number, number] | { x: number, y: number, z: number };\r
  \r
  /**\r
   * \u7F29\u653E\r
   */\r
  scale?: [number, number, number] | { x: number, y: number, z: number } | number;\r
  \r
  /**\r
   * \u662F\u5426\u53EF\u89C1\r
   */\r
  visible?: boolean;\r
  \r
  /**\r
   * \u662F\u5426\u6295\u5C04\u9634\u5F71\r
   */\r
  castShadow?: boolean;\r
  \r
  /**\r
   * \u662F\u5426\u63A5\u6536\u9634\u5F71\r
   */\r
  receiveShadow?: boolean;\r
  \r
  /**\r
   * \u662F\u5426\u542F\u7528\u89C6\u9525\u4F53\u5254\u9664\r
   */\r
  frustumCulled?: boolean;\r
  \r
  /**\r
   * \u6E32\u67D3\u987A\u5E8F\r
   */\r
  renderOrder?: number;\r
  \r
  /**\r
   * \u7528\u6237\u6570\u636E\r
   */\r
  userData?: Record<string, any>;\r
  \r
  /**\r
   * \u77E9\u9635\u81EA\u52A8\u66F4\u65B0\r
   */\r
  matrixAutoUpdate?: boolean;\r
  \r
  /**\r
   * \u540D\u79F0\r
   */\r
  name?: string;\r
}>(), {\r
  geometry: null,\r
  material: null,\r
  position: () => [0, 0, 0],\r
  rotation: () => [0, 0, 0],\r
  scale: 1,\r
  visible: true,\r
  castShadow: false,\r
  receiveShadow: false,\r
  frustumCulled: true,\r
  renderOrder: 0,\r
  userData: () => ({}),\r
  matrixAutoUpdate: true,\r
  name: ''\r
});\r
\r
const emit = defineEmits<{\r
  /**\r
   * \u7F51\u683C\u5BF9\u8C61\u521B\u5EFA\r
   */\r
  (e: 'created', mesh: THREE.Mesh): void;\r
  \r
  /**\r
   * \u7F51\u683C\u5BF9\u8C61\u66F4\u65B0\r
   */\r
  (e: 'updated', mesh: THREE.Mesh): void;\r
  \r
  /**\r
   * \u7F51\u683C\u5BF9\u8C61\u9500\u6BC1\r
   */\r
  (e: 'disposed'): void;\r
  \r
  /**\r
   * \u70B9\u51FB\u4E8B\u4EF6\r
   */\r
  (e: 'click', event: THREE.Event): void;\r
  \r
  /**\r
   * \u6307\u9488\u79FB\u5165\u4E8B\u4EF6\r
   */\r
  (e: 'pointerenter', event: THREE.Event): void;\r
  \r
  /**\r
   * \u6307\u9488\u79FB\u51FA\u4E8B\u4EF6\r
   */\r
  (e: 'pointerleave', event: THREE.Event): void;\r
}>();\r
\r
// \u5BF9\u8C61\u5F15\u7528\r
const objectRef = ref<any>(null);\r
\r
// \u7F51\u683C\u5BF9\u8C61\r
const mesh = ref<THREE.Mesh | null>(null);\r
\r
// \u8F6C\u53D1\u7ED9 ThreeObject \u7684\u5C5E\u6027\r
const objectProps = computed(() => {\r
  const { position, rotation, scale, visible, castShadow, receiveShadow, frustumCulled, renderOrder, userData, matrixAutoUpdate, name } = toRefs(props);\r
  \r
  return {\r
    position: position.value,\r
    rotation: rotation.value,\r
    scale: scale.value,\r
    visible: visible.value,\r
    castShadow: castShadow.value,\r
    receiveShadow: receiveShadow.value,\r
    frustumCulled: frustumCulled.value,\r
    renderOrder: renderOrder.value,\r
    userData: userData.value,\r
    matrixAutoUpdate: matrixAutoUpdate.value,\r
    name: name.value\r
  };\r
});\r
\r
// \u83B7\u53D6\u51E0\u4F55\u4F53\u4E0A\u4E0B\u6587\r
const geometryContext = inject(GEOMETRY_CONTEXT_KEY, null);\r
\r
// \u83B7\u53D6\u6750\u8D28\u4E0A\u4E0B\u6587\r
const materialContext = inject(MATERIAL_CONTEXT_KEY, null);\r
\r
// \u521B\u5EFA\u7F51\u683C\u5BF9\u8C61\r
const createMesh = () => {\r
  // \u9500\u6BC1\u65E7\u5BF9\u8C61\r
  if (mesh.value) {\r
    mesh.value = null;\r
  }\r
  \r
  // \u83B7\u53D6\u51E0\u4F55\u4F53\r
  let geometry: THREE.BufferGeometry;\r
  if (props.geometry) {\r
    // \u4F7F\u7528\u4F20\u5165\u7684\u51E0\u4F55\u4F53\r
    geometry = props.geometry;\r
  } else if (geometryContext?.geometry?.value) {\r
    // \u4F7F\u7528\u4E0A\u4E0B\u6587\u4E2D\u7684\u51E0\u4F55\u4F53\r
    geometry = geometryContext.geometry.value;\r
  } else {\r
    // \u521B\u5EFA\u9ED8\u8BA4\u51E0\u4F55\u4F53\r
    geometry = new THREE.BoxGeometry(1, 1, 1);\r
  }\r
  \r
  // \u83B7\u53D6\u6750\u8D28\r
  let material: THREE.Material | THREE.Material[];\r
  if (props.material) {\r
    // \u4F7F\u7528\u4F20\u5165\u7684\u6750\u8D28\r
    material = props.material;\r
  } else if (materialContext?.material?.value) {\r
    // \u4F7F\u7528\u4E0A\u4E0B\u6587\u4E2D\u7684\u6750\u8D28\r
    material = materialContext.material.value;\r
  } else {\r
    // \u521B\u5EFA\u9ED8\u8BA4\u6750\u8D28\r
    material = new THREE.MeshStandardMaterial({ color: 0xcccccc });\r
  }\r
  \r
  // \u521B\u5EFA\u7F51\u683C\r
  mesh.value = new THREE.Mesh(geometry, material);\r
  \r
  // \u8BBE\u7F6E\u5C5E\u6027\r
  mesh.value.castShadow = props.castShadow;\r
  mesh.value.receiveShadow = props.receiveShadow;\r
  \r
  // \u53D1\u51FA\u521B\u5EFA\u4E8B\u4EF6\r
  emit('created', mesh.value);\r
  \r
  return mesh.value;\r
};\r
\r
// \u76D1\u542C\u51E0\u4F55\u4F53\u548C\u6750\u8D28\u53D8\u5316\r
watch(\r
  [\r
    () => props.geometry,\r
    () => geometryContext?.geometry?.value,\r
    () => props.material,\r
    () => materialContext?.material?.value\r
  ],\r
  () => {\r
    // \u91CD\u65B0\u521B\u5EFA\u7F51\u683C\r
    if (mesh.value) {\r
      const oldMesh = mesh.value;\r
      \r
      // \u521B\u5EFA\u65B0\u7684\u7F51\u683C\u5BF9\u8C61\r
      createMesh();\r
      \r
      // \u5982\u679C\u6709\u65E7\u7F51\u683C\uFF0C\u590D\u5236\u4F4D\u7F6E\u3001\u65CB\u8F6C\u548C\u7F29\u653E\r
      if (oldMesh) {\r
        mesh.value.position.copy(oldMesh.position);\r
        mesh.value.rotation.copy(oldMesh.rotation);\r
        mesh.value.scale.copy(oldMesh.scale);\r
      }\r
      \r
      // \u66F4\u65B0 ThreeObject \u7EC4\u4EF6\u4E2D\u7684\u5BF9\u8C61\r
      if (objectRef.value) {\r
        objectRef.value.object = mesh.value;\r
      }\r
      \r
      // \u53D1\u51FA\u66F4\u65B0\u4E8B\u4EF6\r
      emit('updated', mesh.value);\r
    }\r
  },\r
  { deep: true }\r
);\r
\r
// \u7F51\u683C\u6302\u8F7D\u4E8B\u4EF6\r
const onMounted = (object: THREE.Object3D) => {\r
  // \u8FD9\u4E2A\u51FD\u6570\u7531 ThreeObject \u7EC4\u4EF6\u8C03\u7528\r
};\r
\r
// \u7F51\u683C\u5378\u8F7D\u4E8B\u4EF6\r
const onUnmounted = () => {\r
  // \u53D1\u51FA\u9500\u6BC1\u4E8B\u4EF6\r
  emit('disposed');\r
};\r
\r
// \u521B\u5EFA\u7F51\u683C\u4E0A\u4E0B\u6587\r
const meshContext = {\r
  mesh\r
};\r
\r
// \u63D0\u4F9B\u7F51\u683C\u4E0A\u4E0B\u6587\u7ED9\u5B50\u7EC4\u4EF6\r
provide(MESH_CONTEXT_KEY, meshContext);\r
\r
// \u751F\u547D\u5468\u671F\u94A9\u5B50\r
vueOnMounted(() => {\r
  createMesh();\r
});\r
\r
onBeforeUnmount(() => {\r
  // \u7F51\u683C\u5BF9\u8C61\u7531 ThreeObject \u7EC4\u4EF6\u8D1F\u8D23\u4ECE\u573A\u666F\u4E2D\u79FB\u9664\r
  mesh.value = null;\r
});\r
\r
// \u66B4\u9732\u7ED9\u7236\u7EC4\u4EF6\u7684\u5C5E\u6027\u548C\u65B9\u6CD5\r
defineExpose({\r
  mesh,\r
  object: mesh, // \u517C\u5BB9 ThreeObject \u63A5\u53E3\r
  createMesh\r
});\r
</script> `;var O=`<template>\r
  <slot></slot>\r
</template>\r
\r
<script setup lang="ts">\r
import { ref, inject, onMounted, onBeforeUnmount, watch, toRefs } from 'vue';\r
import * as THREE from 'three';\r
import { SCENE_CONTEXT_KEY, OBJECT_CONTEXT_KEY, OBJECT_EVENTS } from '../../constants';\r
\r
const props = withDefaults(defineProps<{\r
  /**\r
   * Three.js \u5BF9\u8C61\u6216\u5BF9\u8C61\u53C2\u8003\r
   */\r
  object?: THREE.Object3D | null;\r
\r
  /**\r
   * \u4F4D\u7F6E\r
   */\r
  position?: [number, number, number] | { x: number, y: number, z: number };\r
\r
  /**\r
   * \u65CB\u8F6C\r
   */\r
  rotation?: [number, number, number] | { x: number, y: number, z: number };\r
\r
  /**\r
   * \u7F29\u653E\r
   */\r
  scale?: [number, number, number] | { x: number, y: number, z: number } | number;\r
\r
  /**\r
   * \u662F\u5426\u53EF\u89C1\r
   */\r
  visible?: boolean;\r
\r
  /**\r
   * \u662F\u5426\u6295\u5C04\u9634\u5F71\r
   */\r
  castShadow?: boolean;\r
\r
  /**\r
   * \u662F\u5426\u63A5\u6536\u9634\u5F71\r
   */\r
  receiveShadow?: boolean;\r
\r
  /**\r
   * \u662F\u5426\u542F\u7528\u89C6\u9525\u4F53\u5254\u9664\r
   */\r
  frustumCulled?: boolean;\r
\r
  /**\r
   * \u6E32\u67D3\u987A\u5E8F\r
   */\r
  renderOrder?: number;\r
\r
  /**\r
   * \u7528\u6237\u6570\u636E\r
   */\r
  userData?: Record<string, any>;\r
\r
  /**\r
   * \u77E9\u9635\u81EA\u52A8\u66F4\u65B0\r
   */\r
  matrixAutoUpdate?: boolean;\r
\r
  /**\r
   * \u540D\u79F0\r
   */\r
  name?: string;\r
}>(), {\r
  object: null,\r
  position: () => [0, 0, 0],\r
  rotation: () => [0, 0, 0],\r
  scale: 1,\r
  visible: true,\r
  castShadow: false,\r
  receiveShadow: false,\r
  frustumCulled: true,\r
  renderOrder: 0,\r
  userData: () => ({}),\r
  matrixAutoUpdate: true,\r
  name: ''\r
});\r
\r
// \u4FEE\u6539defineEmits\u90E8\u5206\uFF0C\u907F\u514D\u4F7F\u7528\u6620\u5C04\u7C7B\u578B\r
const emit = defineEmits([\r
  // \u57FA\u7840\u4E8B\u4EF6\r
  'created',\r
  'mounted',\r
  'beforeUnmount',\r
  'unmounted',\r
  'updated',\r
  \r
  // Three.js\u5BF9\u8C61\u4E8B\u4EF6\r
  'click',\r
  'dblclick',\r
  'contextmenu',\r
  'pointerdown',\r
  'pointerup',\r
  'pointermove',\r
  'pointerenter',\r
  'pointerleave',\r
  'pointerover',\r
  'pointerout',\r
  'wheel',\r
  'keydown',\r
  'keyup',\r
  'focus',\r
  'blur',\r
  'drag',\r
  'dragstart',\r
  'dragend',\r
  'drop'\r
]);\r
\r
// \u83B7\u53D6\u573A\u666F\u4E0A\u4E0B\u6587\r
const sceneContext = inject(SCENE_CONTEXT_KEY);\r
if (!sceneContext) {\r
  console.error('ThreeObject \u5FC5\u987B\u5728 ThreeScene \u7EC4\u4EF6\u5185\u90E8\u4F7F\u7528');\r
}\r
\r
// \u83B7\u53D6\u7236\u5BF9\u8C61\u4E0A\u4E0B\u6587\r
const parentContext = inject(OBJECT_CONTEXT_KEY, null);\r
\r
// \u5BF9\u8C61\u5F15\u7528\r
const objectRef = ref<THREE.Object3D | null>(null);\r
\r
// \u63D0\u4F9B\u7ED9\u5B50\u7EC4\u4EF6\u7684\u4E0A\u4E0B\u6587\r
const objectContext = {\r
  object: objectRef\r
};\r
\r
// \u54CD\u5E94\u5F0F\u5C5E\u6027\r
const {\r
  object,\r
  position,\r
  rotation,\r
  scale,\r
  visible,\r
  castShadow,\r
  receiveShadow,\r
  frustumCulled,\r
  renderOrder,\r
  userData,\r
  matrixAutoUpdate,\r
  name\r
} = toRefs(props);\r
\r
// \u5904\u7406\u4F4D\u7F6E\u5C5E\u6027\r
const setPosition = (obj: THREE.Object3D, pos: typeof props.position) => {\r
  if (Array.isArray(pos)) {\r
    obj.position.set(pos[0], pos[1], pos[2]);\r
  } else if (typeof pos === 'object') {\r
    obj.position.set(pos.x, pos.y, pos.z);\r
  }\r
};\r
\r
// \u5904\u7406\u65CB\u8F6C\u5C5E\u6027\r
const setRotation = (obj: THREE.Object3D, rot: typeof props.rotation) => {\r
  if (Array.isArray(rot)) {\r
    obj.rotation.set(rot[0], rot[1], rot[2]);\r
  } else if (typeof rot === 'object') {\r
    obj.rotation.set(rot.x, rot.y, rot.z);\r
  }\r
};\r
\r
// \u5904\u7406\u7F29\u653E\u5C5E\u6027\r
const setScale = (obj: THREE.Object3D, sc: typeof props.scale) => {\r
  if (Array.isArray(sc)) {\r
    obj.scale.set(sc[0], sc[1], sc[2]);\r
  } else if (typeof sc === 'object') {\r
    obj.scale.set(sc.x, sc.y, sc.z);\r
  } else if (typeof sc === 'number') {\r
    obj.scale.set(sc, sc, sc);\r
  }\r
};\r
\r
// \u66F4\u65B0\u5BF9\u8C61\u5C5E\u6027\r
const updateObjectProps = (obj: THREE.Object3D) => {\r
  if (!obj) return;\r
\r
  // \u8BBE\u7F6E\u57FA\u672C\u5C5E\u6027\r
  obj.visible = visible.value;\r
  obj.castShadow = castShadow.value;\r
  obj.receiveShadow = receiveShadow.value;\r
  obj.frustumCulled = frustumCulled.value;\r
  obj.renderOrder = renderOrder.value;\r
  obj.matrixAutoUpdate = matrixAutoUpdate.value;\r
  obj.name = name.value;\r
\r
  // \u8BBE\u7F6E\u4F4D\u7F6E\u3001\u65CB\u8F6C\u548C\u7F29\u653E\r
  setPosition(obj, position.value);\r
  setRotation(obj, rotation.value);\r
  setScale(obj, scale.value);\r
\r
  // \u66F4\u65B0\u7528\u6237\u6570\u636E\r
  Object.assign(obj.userData, userData.value);\r
\r
  // \u66F4\u65B0\u77E9\u9635\r
  if (matrixAutoUpdate.value) {\r
    obj.updateMatrix();\r
  }\r
};\r
\r
// \u6DFB\u52A0\u5BF9\u8C61\u5230\u573A\u666F\u6216\u7236\u5BF9\u8C61\r
const addObject = () => {\r
  const obj = props.object || objectRef.value;\r
  if (!obj) return;\r
\r
  // \u66F4\u65B0\u5BF9\u8C61\u5C5E\u6027\r
  updateObjectProps(obj);\r
\r
  // \u6DFB\u52A0\u5230\u7236\u5BF9\u8C61\u6216\u573A\u666F\r
  if (parentContext?.object?.value) {\r
    parentContext.object.value.add(obj);\r
  } else if (sceneContext?.scene?.value) {\r
    sceneContext.scene.value.add(obj);\r
  }\r
\r
  // \u4FDD\u5B58\u5BF9\u8C61\u5F15\u7528\r
  objectRef.value = obj;\r
\r
  // \u53D1\u51FA\u6DFB\u52A0\u4E8B\u4EF6\r
  emit('mounted', obj);\r
};\r
\r
// \u4ECE\u573A\u666F\u6216\u7236\u5BF9\u8C61\u79FB\u9664\u5BF9\u8C61\r
const removeObject = () => {\r
  const obj = objectRef.value;\r
  if (!obj) return;\r
\r
  // \u4ECE\u7236\u5BF9\u8C61\u6216\u573A\u666F\u79FB\u9664\r
  if (obj.parent) {\r
    obj.parent.remove(obj);\r
  }\r
\r
  // \u53D1\u51FA\u79FB\u9664\u4E8B\u4EF6\r
  emit('unmounted', obj);\r
};\r
\r
// \u6DFB\u52A0\u4E8B\u4EF6\u76D1\u542C\r
const addEventListeners = (obj: THREE.Object3D) => {\r
  if (!obj) return;\r
\r
  // \u904D\u5386\u6240\u6709\u4E8B\u4EF6\r
  Object.entries(OBJECT_EVENTS).forEach(([key, eventName]) => {\r
    // \u6DFB\u52A0\u4E8B\u4EF6\u76D1\u542C\r
    obj.addEventListener(eventName, (event) => {\r
      emit(eventName as any, event);\r
    });\r
  });\r
};\r
\r
// \u79FB\u9664\u4E8B\u4EF6\u76D1\u542C\r
const removeEventListeners = (obj: THREE.Object3D) => {\r
  if (!obj) return;\r
\r
  // \u904D\u5386\u6240\u6709\u4E8B\u4EF6\r
  Object.entries(OBJECT_EVENTS).forEach(([key, eventName]) => {\r
    // \u79FB\u9664\u4E8B\u4EF6\u76D1\u542C\r
    obj.removeEventListener(eventName, (event) => {\r
      emit(eventName as any, event);\r
    });\r
  });\r
};\r
\r
// \u76D1\u542C\u5BF9\u8C61\u5C5E\u6027\u53D8\u5316\r
watch(\r
  [\r
    position,\r
    rotation,\r
    scale,\r
    visible,\r
    castShadow,\r
    receiveShadow,\r
    frustumCulled,\r
    renderOrder,\r
    userData,\r
    matrixAutoUpdate,\r
    name\r
  ],\r
  () => {\r
    const obj = props.object || objectRef.value;\r
    if (!obj) return;\r
\r
    // \u66F4\u65B0\u5BF9\u8C61\u5C5E\u6027\r
    updateObjectProps(obj);\r
\r
    // \u53D1\u51FA\u66F4\u65B0\u4E8B\u4EF6\r
    emit('update', obj);\r
  },\r
  { deep: true }\r
);\r
\r
// \u76D1\u542C\u5BF9\u8C61\u53D8\u5316\r
watch(object, (newObject, oldObject) => {\r
  // \u5982\u679C\u6709\u65E7\u5BF9\u8C61\uFF0C\u79FB\u9664\u5B83\r
  if (oldObject) {\r
    removeEventListeners(oldObject);\r
    removeObject();\r
  }\r
\r
  // \u5982\u679C\u6709\u65B0\u5BF9\u8C61\uFF0C\u6DFB\u52A0\u5B83\r
  if (newObject) {\r
    objectRef.value = newObject;\r
    addEventListeners(newObject);\r
    addObject();\r
  }\r
});\r
\r
// \u751F\u547D\u5468\u671F\u94A9\u5B50\r
onMounted(() => {\r
  // \u5982\u679C\u6709\u5BF9\u8C61\uFF0C\u6DFB\u52A0\u5B83\r
  if (props.object) {\r
    objectRef.value = props.object;\r
    addEventListeners(props.object);\r
    addObject();\r
  }\r
});\r
\r
onBeforeUnmount(() => {\r
  // \u79FB\u9664\u5BF9\u8C61\r
  if (objectRef.value) {\r
    removeEventListeners(objectRef.value);\r
    removeObject();\r
  }\r
});\r
\r
// \u63D0\u4F9B\u4E0A\u4E0B\u6587\u7ED9\u5B50\u7EC4\u4EF6\r
provide(OBJECT_CONTEXT_KEY, objectContext);\r
\r
// \u66B4\u9732\u7ED9\u7236\u7EC4\u4EF6\u7684\u5C5E\u6027\u548C\u65B9\u6CD5\r
defineExpose({\r
  object: objectRef,\r
  addObject,\r
  removeObject,\r
  updateObjectProps\r
});\r
</script> `;var P=`<script>\r
import { ref, onMounted, onBeforeUnmount, provide, InjectionKey } from 'vue';\r
import {\r
  Texture,\r
  Material,\r
  BufferGeometry,\r
  Object3D,\r
  Scene\r
} from 'three';\r
import { useThree } from '../../composables/useThree';\r
import { disposeObject, disposeMaterial } from '../../utils';\r
\r
// \u8D44\u6E90\u7BA1\u7406\u5668\u6CE8\u5165\u952E\r
export const RESOURCE_MANAGER_INJECTION_KEY = Symbol('resource-manager');\r
\r
export default {\r
  props: {\r
    autoDispose: {\r
      type: Boolean,\r
      default: false\r
    },\r
    disposeInterval: {\r
      type: Number,\r
      default: 60000\r
    },\r
    debug: {\r
      type: Boolean,\r
      default: false\r
    }\r
  },\r
  setup(props) {\r
    // \u8D44\u6E90\u96C6\u5408\r
    const textures = ref(new Map());\r
    const materials = ref(new Map());\r
    const geometries = ref(new Map());\r
    const objects = ref(new Map());\r
\r
    // \u83B7\u53D6Three.js\u6838\u5FC3\u5BF9\u8C61\r
    const { scene } = useThree();\r
\r
    // \u6CE8\u518C\u7EB9\u7406\r
    const registerTexture = (id, texture) => {\r
      textures.value.set(id, { resource: texture, lastUsed: Date.now() });\r
      if (props.debug) {\r
        console.log(\`[ResourceManager] Registered texture: \${id}\`);\r
      }\r
    };\r
\r
    // \u6CE8\u9500\u7EB9\u7406\r
    const unregisterTexture = (id) => {\r
      const textureEntry = textures.value.get(id);\r
      if (textureEntry) {\r
        textureEntry.resource.dispose();\r
        textures.value.delete(id);\r
        if (props.debug) {\r
          console.log(\`[ResourceManager] Unregistered texture: \${id}\`);\r
        }\r
      }\r
    };\r
\r
    // \u83B7\u53D6\u7EB9\u7406\r
    const getTexture = (id) => {\r
      const textureEntry = textures.value.get(id);\r
      if (textureEntry) {\r
        textureEntry.lastUsed = Date.now();\r
        return textureEntry.resource;\r
      }\r
      return undefined;\r
    };\r
\r
    // \u6CE8\u518C\u6750\u8D28\r
    const registerMaterial = (id, material) => {\r
      materials.value.set(id, { resource: material, lastUsed: Date.now() });\r
      if (props.debug) {\r
        console.log(\`[ResourceManager] Registered material: \${id}\`);\r
      }\r
    };\r
\r
    // \u6CE8\u9500\u6750\u8D28\r
    const unregisterMaterial = (id) => {\r
      const materialEntry = materials.value.get(id);\r
      if (materialEntry) {\r
        disposeMaterial(materialEntry.resource);\r
        materials.value.delete(id);\r
        if (props.debug) {\r
          console.log(\`[ResourceManager] Unregistered material: \${id}\`);\r
        }\r
      }\r
    };\r
\r
    // \u83B7\u53D6\u6750\u8D28\r
    const getMaterial = (id) => {\r
      const materialEntry = materials.value.get(id);\r
      if (materialEntry) {\r
        materialEntry.lastUsed = Date.now();\r
        return materialEntry.resource;\r
      }\r
      return undefined;\r
    };\r
\r
    // \u6CE8\u518C\u51E0\u4F55\u4F53\r
    const registerGeometry = (id, geometry) => {\r
      geometries.value.set(id, { resource: geometry, lastUsed: Date.now() });\r
      if (props.debug) {\r
        console.log(\`[ResourceManager] Registered geometry: \${id}\`);\r
      }\r
    };\r
\r
    // \u6CE8\u9500\u51E0\u4F55\u4F53\r
    const unregisterGeometry = (id) => {\r
      const geometryEntry = geometries.value.get(id);\r
      if (geometryEntry) {\r
        geometryEntry.resource.dispose();\r
        geometries.value.delete(id);\r
        if (props.debug) {\r
          console.log(\`[ResourceManager] Unregistered geometry: \${id}\`);\r
        }\r
      }\r
    };\r
\r
    // \u83B7\u53D6\u51E0\u4F55\u4F53\r
    const getGeometry = (id) => {\r
      const geometryEntry = geometries.value.get(id);\r
      if (geometryEntry) {\r
        geometryEntry.lastUsed = Date.now();\r
        return geometryEntry.resource;\r
      }\r
      return undefined;\r
    };\r
\r
    // \u6CE8\u518C\u5BF9\u8C61\r
    const registerObject = (id, object) => {\r
      objects.value.set(id, { resource: object, lastUsed: Date.now() });\r
      if (props.debug) {\r
        console.log(\`[ResourceManager] Registered object: \${id}\`);\r
      }\r
    };\r
\r
    // \u6CE8\u9500\u5BF9\u8C61\r
    const unregisterObject = (id) => {\r
      const objectEntry = objects.value.get(id);\r
      if (objectEntry) {\r
        disposeObject(objectEntry.resource);\r
        objects.value.delete(id);\r
        if (props.debug) {\r
          console.log(\`[ResourceManager] Unregistered object: \${id}\`);\r
        }\r
      }\r
    };\r
\r
    // \u83B7\u53D6\u5BF9\u8C61\r
    const getObject = (id) => {\r
      const objectEntry = objects.value.get(id);\r
      if (objectEntry) {\r
        objectEntry.lastUsed = Date.now();\r
        return objectEntry.resource;\r
      }\r
      return undefined;\r
    };\r
\r
    // \u5904\u7406\u672A\u4F7F\u7528\u7684\u8D44\u6E90\r
    const disposeUnused = (maxAge = 60000) => { // \u9ED8\u8BA460\u79D2\u672A\u4F7F\u7528\u5219\u91CA\u653E\r
      const now = Date.now();\r
      \r
      // \u5904\u7406\u7EB9\u7406\r
      textures.value.forEach((entry, id) => {\r
        if (now - entry.lastUsed > maxAge) {\r
          unregisterTexture(id);\r
        }\r
      });\r
      \r
      // \u5904\u7406\u6750\u8D28\r
      materials.value.forEach((entry, id) => {\r
        if (now - entry.lastUsed > maxAge) {\r
          unregisterMaterial(id);\r
        }\r
      });\r
      \r
      // \u5904\u7406\u51E0\u4F55\u4F53\r
      geometries.value.forEach((entry, id) => {\r
        if (now - entry.lastUsed > maxAge) {\r
          unregisterGeometry(id);\r
        }\r
      });\r
      \r
      // \u5904\u7406\u5BF9\u8C61\r
      objects.value.forEach((entry, id) => {\r
        if (now - entry.lastUsed > maxAge) {\r
          unregisterObject(id);\r
        }\r
      });\r
      \r
      if (props.debug) {\r
        console.log(\`[ResourceManager] Disposed unused resources. Remaining: textures=\${textures.value.size}, materials=\${materials.value.size}, geometries=\${geometries.value.size}, objects=\${objects.value.size}\`);\r
      }\r
    };\r
\r
    // \u91CA\u653E\u6240\u6709\u8D44\u6E90\r
    const disposeAll = () => {\r
      // \u5904\u7406\u7EB9\u7406\r
      textures.value.forEach((entry, id) => {\r
        unregisterTexture(id);\r
      });\r
      \r
      // \u5904\u7406\u6750\u8D28\r
      materials.value.forEach((entry, id) => {\r
        unregisterMaterial(id);\r
      });\r
      \r
      // \u5904\u7406\u51E0\u4F55\u4F53\r
      geometries.value.forEach((entry, id) => {\r
        unregisterGeometry(id);\r
      });\r
      \r
      // \u5904\u7406\u5BF9\u8C61\r
      objects.value.forEach((entry, id) => {\r
        unregisterObject(id);\r
      });\r
      \r
      if (props.debug) {\r
        console.log('[ResourceManager] Disposed all resources');\r
      }\r
    };\r
\r
    // \u81EA\u52A8\u5904\u7406\u672A\u4F7F\u7528\u7684\u8D44\u6E90\r
    let disposeInterval = null;\r
\r
    // \u7EC4\u4EF6\u6302\u8F7D\u548C\u5378\u8F7D\r
    onMounted(() => {\r
      if (props.autoDispose && props.disposeInterval) {\r
        disposeInterval = window.setInterval(() => {\r
          disposeUnused();\r
        }, props.disposeInterval);\r
      }\r
      \r
      // \u63D0\u4F9B\u8D44\u6E90\u7BA1\u7406\u5668\u7ED9\u5B50\u7EC4\u4EF6\r
      provide(RESOURCE_MANAGER_INJECTION_KEY, {\r
        registerTexture,\r
        unregisterTexture,\r
        getTexture,\r
        registerMaterial,\r
        unregisterMaterial,\r
        getMaterial,\r
        registerGeometry,\r
        unregisterGeometry,\r
        getGeometry,\r
        registerObject,\r
        unregisterObject,\r
        getObject,\r
        disposeUnused,\r
        disposeAll\r
      });\r
    });\r
\r
    onBeforeUnmount(() => {\r
      // \u6E05\u7406\u5B9A\u65F6\u5668\r
      if (disposeInterval !== null) {\r
        clearInterval(disposeInterval);\r
      }\r
      \r
      // \u91CA\u653E\u6240\u6709\u8D44\u6E90\r
      disposeAll();\r
    });\r
\r
    return {\r
      textures,\r
      materials,\r
      geometries,\r
      objects,\r
      registerTexture,\r
      unregisterTexture,\r
      getTexture,\r
      registerMaterial,\r
      unregisterMaterial,\r
      getMaterial,\r
      registerGeometry,\r
      unregisterGeometry,\r
      getGeometry,\r
      registerObject,\r
      unregisterObject,\r
      getObject,\r
      disposeUnused,\r
      disposeAll\r
    };\r
  }\r
};\r
</script>\r
\r
<template>\r
  <div class="three-resource-manager">\r
    <slot \r
      :textures="textures"\r
      :materials="materials"\r
      :geometries="geometries"\r
      :objects="objects"\r
      :register-texture="registerTexture"\r
      :unregister-texture="unregisterTexture"\r
      :get-texture="getTexture"\r
      :register-material="registerMaterial"\r
      :unregister-material="unregisterMaterial"\r
      :get-material="getMaterial"\r
      :register-geometry="registerGeometry"\r
      :unregister-geometry="unregisterGeometry"\r
      :get-geometry="getGeometry"\r
      :register-object="registerObject"\r
      :unregister-object="unregisterObject"\r
      :get-object="getObject"\r
      :dispose-unused="disposeUnused"\r
      :dispose-all="disposeAll"\r
    ></slot>\r
  </div>\r
</template>\r
\r
<style scoped>\r
.three-resource-manager {\r
  display: contents;\r
}\r
</style> `;var M=`<script setup lang="ts">\r
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';\r
import { WebGLRenderer as WebGPURenderer, Scene, Camera } from 'three'; // \u4E34\u65F6\u4F7F\u7528WebGLRenderer\u4EE3\u66FFWebGPURenderer\r
import { useThree } from '../../composables/useThree';\r
import { useFrame } from '../../composables/useFrame';\r
import { isWebGPUSupported } from '../../utils';\r
\r
const props = defineProps<{\r
  enabled?: boolean;\r
  antialias?: boolean;\r
  alpha?: boolean;\r
  clearColor?: number | string;\r
  clearAlpha?: number;\r
  pixelRatio?: number;\r
  width?: number | string;\r
  height?: number | string;\r
  shadowMap?: boolean;\r
  toneMapping?: number;\r
  toneMappingExposure?: number;\r
  outputEncoding?: number;\r
  autoClear?: boolean;\r
  autoClearDepth?: boolean;\r
  autoClearColor?: boolean;\r
  autoClearStencil?: boolean;\r
  powerPreference?: 'high-performance' | 'low-power' | 'default';\r
}>();\r
\r
const emit = defineEmits(['initialized', 'rendered', 'error']);\r
\r
// \u83B7\u53D6Three.js\u6838\u5FC3\u5BF9\u8C61\r
const { scene, camera } = useThree();\r
\r
// WebGPU\u6E32\u67D3\u5668\r
const renderer = ref<WebGPURenderer | null>(null);\r
const container = ref<HTMLDivElement | null>(null);\r
const isSupported = ref<boolean>(false);\r
const isInitialized = ref<boolean>(false);\r
const isEnabled = ref<boolean>(props.enabled !== false);\r
\r
// \u521B\u5EFAWebGPU\u6E32\u67D3\u5668\r
const createRenderer = async () => {\r
  if (!container.value) return;\r
  \r
  try {\r
    // \u68C0\u67E5WebGPU\u652F\u6301\r
    isSupported.value = await isWebGPUSupported();\r
    \r
    if (!isSupported.value) {\r
      throw new Error('WebGPU is not supported in this browser');\r
    }\r
    \r
    // \u521B\u5EFA\u6E32\u67D3\u5668 - \u4E34\u65F6\u4F7F\u7528WebGLRenderer\r
    renderer.value = new WebGPURenderer({\r
      antialias: props.antialias !== false,\r
      alpha: props.alpha || false,\r
      powerPreference: props.powerPreference || 'high-performance'\r
    });\r
    \r
    // \u8BBE\u7F6E\u5927\u5C0F\r
    const width = typeof props.width === 'number' ? props.width : container.value.clientWidth;\r
    const height = typeof props.height === 'number' ? props.height : container.value.clientHeight;\r
    renderer.value.setSize(width, height);\r
    \r
    // \u8BBE\u7F6E\u50CF\u7D20\u6BD4\r
    renderer.value.setPixelRatio(props.pixelRatio || window.devicePixelRatio);\r
    \r
    // \u8BBE\u7F6E\u6E05\u9664\u989C\u8272\r
    if (props.clearColor !== undefined) {\r
      renderer.value.setClearColor(props.clearColor, props.clearAlpha || 1);\r
    }\r
    \r
    // \u8BBE\u7F6E\u8272\u8C03\u6620\u5C04\r
    if (props.toneMapping !== undefined) {\r
      renderer.value.toneMapping = props.toneMapping;\r
    }\r
    \r
    // \u8BBE\u7F6E\u8272\u8C03\u6620\u5C04\u66DD\u5149\r
    if (props.toneMappingExposure !== undefined) {\r
      renderer.value.toneMappingExposure = props.toneMappingExposure;\r
    }\r
    \r
    // \u8BBE\u7F6E\u8F93\u51FA\u7F16\u7801\r
    if (props.outputEncoding !== undefined) {\r
      renderer.value.outputEncoding = props.outputEncoding;\r
    }\r
    \r
    // \u8BBE\u7F6E\u9634\u5F71\u8D34\u56FE\r
    if (props.shadowMap) {\r
      renderer.value.shadowMap.enabled = true;\r
    }\r
    \r
    // \u6DFB\u52A0\u5230\u5BB9\u5668\r
    container.value.appendChild(renderer.value.domElement);\r
    \r
    // \u6807\u8BB0\u4E3A\u5DF2\u521D\u59CB\u5316\r
    isInitialized.value = true;\r
    \r
    // \u89E6\u53D1\u521D\u59CB\u5316\u4E8B\u4EF6\r
    emit('initialized', renderer.value);\r
    \r
    // \u63D0\u4F9B\u6E32\u67D3\u5668\u7ED9Three.js\u4E0A\u4E0B\u6587\r
    const three = useThree();\r
    if (three && typeof three.renderer === 'object') {\r
      (three as any).renderer = renderer.value;\r
    }\r
  } catch (error) {\r
    console.error('Failed to initialize WebGPU renderer:', error);\r
    emit('error', error as Error);\r
  }\r
};\r
\r
// \u6E32\u67D3\u573A\u666F\r
const render = () => {\r
  if (!renderer.value || !scene.value || !camera.value || !isEnabled.value || !isInitialized.value) return;\r
  \r
  // \u6E32\u67D3\u524D\u8BBE\u7F6E\u81EA\u52A8\u6E05\u9664\u9009\u9879\r
  if (props.autoClear !== undefined) {\r
    renderer.value.autoClear = props.autoClear;\r
  }\r
  if (props.autoClearDepth !== undefined) {\r
    renderer.value.autoClearDepth = props.autoClearDepth;\r
  }\r
  if (props.autoClearColor !== undefined) {\r
    renderer.value.autoClearColor = props.autoClearColor;\r
  }\r
  if (props.autoClearStencil !== undefined) {\r
    renderer.value.autoClearStencil = props.autoClearStencil;\r
  }\r
  \r
  // \u6E32\u67D3\u573A\u666F\r
  renderer.value.render(scene.value, camera.value);\r
  \r
  // \u89E6\u53D1\u6E32\u67D3\u4E8B\u4EF6\r
  emit('rendered', renderer.value);\r
};\r
\r
// \u8C03\u6574\u5927\u5C0F\r
const resize = () => {\r
  if (!renderer.value || !container.value) return;\r
  \r
  const width = typeof props.width === 'number' ? props.width : container.value.clientWidth;\r
  const height = typeof props.height === 'number' ? props.height : container.value.clientHeight;\r
  \r
  renderer.value.setSize(width, height);\r
};\r
\r
// \u542F\u7528/\u7981\u7528\u6E32\u67D3\r
const setEnabled = (enabled: boolean) => {\r
  isEnabled.value = enabled;\r
};\r
\r
// \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
watch(() => props.enabled, (enabled) => {\r
  setEnabled(enabled !== false);\r
});\r
\r
watch(() => props.clearColor, (color) => {\r
  if (renderer.value && color !== undefined) {\r
    renderer.value.setClearColor(color, props.clearAlpha || 1);\r
  }\r
});\r
\r
watch(() => props.pixelRatio, (ratio) => {\r
  if (renderer.value && ratio !== undefined) {\r
    renderer.value.setPixelRatio(ratio);\r
  }\r
});\r
\r
watch(() => [props.width, props.height], () => {\r
  resize();\r
});\r
\r
watch(() => props.shadowMap, (enabled) => {\r
  if (renderer.value) {\r
    renderer.value.shadowMap.enabled = enabled || false;\r
    renderer.value.shadowMap.needsUpdate = true;\r
  }\r
});\r
\r
// \u76D1\u542C\u7A97\u53E3\u5927\u5C0F\u53D8\u5316\r
const handleResize = () => {\r
  if (typeof props.width !== 'number' || typeof props.height !== 'number') {\r
    resize();\r
  }\r
};\r
\r
// \u7EC4\u4EF6\u6302\u8F7D\u548C\u5378\u8F7D\r
onMounted(async () => {\r
  // \u521B\u5EFA\u6E32\u67D3\u5668\r
  await createRenderer();\r
  \r
  // \u6DFB\u52A0\u5E27\u66F4\u65B0\r
  useFrame(render);\r
  \r
  // \u6DFB\u52A0\u7A97\u53E3\u5927\u5C0F\u53D8\u5316\u76D1\u542C\r
  window.addEventListener('resize', handleResize);\r
});\r
\r
onBeforeUnmount(() => {\r
  // \u79FB\u9664\u7A97\u53E3\u5927\u5C0F\u53D8\u5316\u76D1\u542C\r
  window.removeEventListener('resize', handleResize);\r
  \r
  // \u6E05\u7406\u6E32\u67D3\u5668\r
  if (renderer.value) {\r
    renderer.value.dispose();\r
    \r
    // \u4ECE\u5BB9\u5668\u4E2D\u79FB\u9664\r
    if (container.value && renderer.value.domElement.parentNode === container.value) {\r
      container.value.removeChild(renderer.value.domElement);\r
    }\r
  }\r
});\r
\r
// \u66B4\u9732\u7EC4\u4EF6\u5185\u90E8\u72B6\u6001\u548C\u65B9\u6CD5\r
defineExpose({\r
  renderer,\r
  container,\r
  isSupported,\r
  isInitialized,\r
  isEnabled,\r
  render,\r
  resize,\r
  setEnabled\r
});\r
</script>\r
\r
<template>\r
  <div \r
    ref="container"\r
    class="three-webgpu-renderer"\r
    :style="{\r
      width: typeof width === 'number' ? \`\${width}px\` : width || '100%',\r
      height: typeof height === 'number' ? \`\${height}px\` : height || '100%'\r
    }"\r
  >\r
    <div v-if="!isSupported" class="webgpu-not-supported">\r
      <slot name="not-supported">\r
        <p>WebGPU is not supported in this browser.</p>\r
      </slot>\r
    </div>\r
    <slot \r
      :renderer="renderer" \r
      :is-supported="isSupported"\r
      :is-initialized="isInitialized"\r
      :is-enabled="isEnabled"\r
    ></slot>\r
  </div>\r
</template>\r
\r
<style scoped>\r
.three-webgpu-renderer {\r
  position: relative;\r
  overflow: hidden;\r
}\r
\r
.webgpu-not-supported {\r
  position: absolute;\r
  top: 0;\r
  left: 0;\r
  width: 100%;\r
  height: 100%;\r
  display: flex;\r
  justify-content: center;\r
  align-items: center;\r
  background-color: rgba(0, 0, 0, 0.7);\r
  color: white;\r
  font-size: 16px;\r
  text-align: center;\r
  padding: 20px;\r
}\r
</style> `;var A=`<script>\r
import { ref, onMounted, onBeforeUnmount, provide, watch, InjectionKey } from 'vue';\r
import { World, Vec3, Body, Shape, NaiveBroadphase, SAPBroadphase, GridBroadphase } from 'cannon-es';\r
import { useFrame } from '../../composables/useFrame';\r
import { PhysicsWorldOptions } from '../../types';\r
\r
// \u7269\u7406\u4E16\u754C\u6CE8\u5165\u952E\r
const PHYSICS_WORLD_INJECTION_KEY = Symbol('physics-world');\r
\r
export { PHYSICS_WORLD_INJECTION_KEY };\r
\r
export default {\r
  props: {\r
    gravity: {\r
      type: Array,\r
      default: () => [0, -9.82, 0]\r
    },\r
    iterations: {\r
      type: Number,\r
      default: 10\r
    },\r
    tolerance: {\r
      type: Number,\r
      default: 0.001\r
    },\r
    broadphase: {\r
      type: String,\r
      default: 'naive',\r
      validator: (value) => ['naive', 'sap', 'grid'].includes(value)\r
    },\r
    allowSleep: {\r
      type: Boolean,\r
      default: false\r
    },\r
    axisIndex: {\r
      type: Number,\r
      default: 1\r
    },\r
    defaultContactMaterial: {\r
      type: Object,\r
      default: () => ({\r
        friction: 0.3,\r
        restitution: 0.3,\r
        contactEquationStiffness: 1e7,\r
        contactEquationRelaxation: 3,\r
        frictionEquationStiffness: 1e7,\r
        frictionEquationRelaxation: 3\r
      })\r
    },\r
    debug: {\r
      type: Boolean,\r
      default: false\r
    }\r
  },\r
  emits: [\r
    'init',\r
    'step',\r
    'collide'\r
  ],\r
  setup(props, { emit }) {\r
    // \u521B\u5EFA\u7269\u7406\u4E16\u754C\r
    const world = ref(new World());\r
    \r
    // \u521D\u59CB\u5316\u7269\u7406\u4E16\u754C\r
    const initWorld = () => {\r
      // \u8BBE\u7F6E\u91CD\u529B\r
      world.value.gravity.set(\r
        props.gravity[0],\r
        props.gravity[1],\r
        props.gravity[2]\r
      );\r
      \r
      // \u8BBE\u7F6E\u6C42\u89E3\u5668\u53C2\u6570\r
      world.value.solver.iterations = props.iterations;\r
      world.value.solver.tolerance = props.tolerance;\r
      \r
      // \u8BBE\u7F6E\u78B0\u649E\u68C0\u6D4B\u7B97\u6CD5\r
      if (props.broadphase === 'naive') {\r
        world.value.broadphase = new NaiveBroadphase();\r
      } else if (props.broadphase === 'sap') {\r
        world.value.broadphase = new SAPBroadphase(world.value);\r
      } else if (props.broadphase === 'grid') {\r
        world.value.broadphase = new GridBroadphase();\r
      }\r
      \r
      // \u8BBE\u7F6E\u662F\u5426\u5141\u8BB8\u4F11\u7720\r
      world.value.allowSleep = props.allowSleep;\r
      \r
      // \u8BBE\u7F6E\u9ED8\u8BA4\u63A5\u89E6\u6750\u8D28\r
      world.value.defaultContactMaterial.friction = props.defaultContactMaterial.friction;\r
      world.value.defaultContactMaterial.restitution = props.defaultContactMaterial.restitution;\r
      \r
      if (props.defaultContactMaterial.contactEquationStiffness) {\r
        world.value.defaultContactMaterial.contactEquationStiffness = props.defaultContactMaterial.contactEquationStiffness;\r
      }\r
      \r
      if (props.defaultContactMaterial.contactEquationRelaxation) {\r
        world.value.defaultContactMaterial.contactEquationRelaxation = props.defaultContactMaterial.contactEquationRelaxation;\r
      }\r
      \r
      if (props.defaultContactMaterial.frictionEquationStiffness) {\r
        world.value.defaultContactMaterial.frictionEquationStiffness = props.defaultContactMaterial.frictionEquationStiffness;\r
      }\r
      \r
      if (props.defaultContactMaterial.frictionEquationRelaxation) {\r
        world.value.defaultContactMaterial.frictionEquationRelaxation = props.defaultContactMaterial.frictionEquationRelaxation;\r
      }\r
      \r
      // \u6DFB\u52A0\u78B0\u649E\u4E8B\u4EF6\u76D1\u542C\r
      world.value.addEventListener('collide', (event) => {\r
        emit('collide', event);\r
      });\r
      \r
      // \u89E6\u53D1\u521D\u59CB\u5316\u4E8B\u4EF6\r
      emit('init', { world: world.value });\r
      \r
      if (props.debug) {\r
        console.log('[PhysicsWorld] Initialized with:', {\r
          gravity: props.gravity,\r
          iterations: props.iterations,\r
          tolerance: props.tolerance,\r
          broadphase: props.broadphase,\r
          allowSleep: props.allowSleep\r
        });\r
      }\r
    };\r
    \r
    // \u66F4\u65B0\u7269\u7406\u4E16\u754C\r
    const fixedTimeStep = 1 / 60;\r
    const maxSubSteps = 10;\r
    let lastTime = 0;\r
    \r
    const step = (time) => {\r
      if (!world.value) return;\r
      \r
      const deltaTime = lastTime ? (time - lastTime) / 1000 : 0;\r
      lastTime = time;\r
      \r
      // \u66F4\u65B0\u7269\u7406\u4E16\u754C\r
      world.value.step(fixedTimeStep, deltaTime, maxSubSteps);\r
      \r
      // \u89E6\u53D1\u6B65\u8FDB\u4E8B\u4EF6\r
      emit('step', {\r
        time,\r
        deltaTime,\r
        bodies: world.value.bodies\r
      });\r
    };\r
    \r
    // \u6E05\u7406\u7269\u7406\u4E16\u754C\r
    const clearWorld = () => {\r
      if (!world.value) return;\r
      \r
      // \u79FB\u9664\u6240\u6709\u7269\u4F53\r
      while (world.value.bodies.length > 0) {\r
        world.value.removeBody(world.value.bodies[0]);\r
      }\r
      \r
      if (props.debug) {\r
        console.log('[PhysicsWorld] Cleared all bodies');\r
      }\r
    };\r
    \r
    // \u6DFB\u52A0\u7269\u4F53\r
    const addBody = (body) => {\r
      if (!world.value || !body) return;\r
      \r
      world.value.addBody(body);\r
      \r
      if (props.debug) {\r
        console.log('[PhysicsWorld] Added body:', body);\r
      }\r
    };\r
    \r
    // \u79FB\u9664\u7269\u4F53\r
    const removeBody = (body) => {\r
      if (!world.value || !body) return;\r
      \r
      world.value.removeBody(body);\r
      \r
      if (props.debug) {\r
        console.log('[PhysicsWorld] Removed body:', body);\r
      }\r
    };\r
    \r
    // \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
    watch(() => props.iterations, (newIterations) => {\r
      if (world.value && newIterations) {\r
        world.value.solver.iterations = newIterations;\r
      }\r
    });\r
    \r
    watch(() => props.tolerance, (newTolerance) => {\r
      if (world.value && newTolerance) {\r
        world.value.solver.tolerance = newTolerance;\r
      }\r
    });\r
    \r
    watch(() => props.gravity, (newGravity) => {\r
      if (world.value && newGravity) {\r
        world.value.gravity.set(\r
          newGravity[0],\r
          newGravity[1],\r
          newGravity[2]\r
        );\r
      }\r
    }, { deep: true });\r
    \r
    watch(() => props.allowSleep, (newAllowSleep) => {\r
      if (world.value) {\r
        world.value.allowSleep = newAllowSleep;\r
      }\r
    });\r
    \r
    // \u7EC4\u4EF6\u6302\u8F7D\u548C\u5378\u8F7D\r
    onMounted(() => {\r
      // \u521D\u59CB\u5316\u7269\u7406\u4E16\u754C\r
      initWorld();\r
      \r
      // \u6DFB\u52A0\u5E27\u66F4\u65B0\r
      useFrame(step);\r
      \r
      // \u63D0\u4F9B\u7269\u7406\u4E16\u754C\u4E0A\u4E0B\u6587\r
      provide(PHYSICS_WORLD_INJECTION_KEY, {\r
        world: world.value,\r
        addBody,\r
        removeBody\r
      });\r
    });\r
    \r
    onBeforeUnmount(() => {\r
      // \u6E05\u7406\u7269\u7406\u4E16\u754C\r
      clearWorld();\r
      \r
      // \u6E05\u7406\u5F15\u7528\r
      world.value = null;\r
      lastTime = 0;\r
    });\r
    \r
    return {\r
      world,\r
      addBody,\r
      removeBody,\r
      step,\r
      clearWorld\r
    };\r
  }\r
};\r
</script>\r
\r
<template>\r
  <div class="three-physics-world">\r
    <slot \r
      :world="world"\r
      :add-body="addBody"\r
      :remove-body="removeBody"\r
    ></slot>\r
  </div>\r
</template>\r
\r
<style scoped>\r
.three-physics-world {\r
  display: contents;\r
}\r
</style> `;var j=`<script setup lang="ts">\r
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue';\r
import { Body, Vec3, Quaternion, Box, Sphere, Cylinder, Plane } from 'cannon-es';\r
import { Object3D, Box3, Vector3, Quaternion as ThreeQuaternion } from 'three';\r
import { injectThreeParent } from '../../composables/useThreeParent';\r
import { PHYSICS_WORLD_INJECTION_KEY } from './ThreePhysicsWorld.vue';\r
import { useFrame } from '../../composables/useFrame';\r
import { arrayToVector3, arrayToQuaternion, computeBoundingBox } from '../../utils';\r
import { RigidBodyOptions, BodyType, Vector3Tuple } from '../../types';\r
\r
const props = defineProps<{\r
  type?: BodyType;\r
  mass?: number;\r
  position?: Vector3Tuple;\r
  rotation?: Vector3Tuple;\r
  linearDamping?: number;\r
  angularDamping?: number;\r
  linearFactor?: Vector3Tuple;\r
  angularFactor?: Vector3Tuple;\r
  fixedRotation?: boolean;\r
  allowSleep?: boolean;\r
  sleepSpeedLimit?: number;\r
  sleepTimeLimit?: number;\r
  collisionFilterGroup?: number;\r
  collisionFilterMask?: number;\r
  shape?: 'auto' | 'box' | 'sphere' | 'cylinder' | 'plane';\r
  shapeOptions?: Record<string, any>;\r
  autoFit?: boolean;\r
  offset?: Vector3Tuple;\r
}>();\r
\r
const emit = defineEmits<{\r
  collide: [event: { body: Body; contact: any }];\r
  sleep: [event: { body: Body }];\r
  wakeup: [event: { body: Body }];\r
}>();\r
\r
// \u83B7\u53D6\u7236\u5BF9\u8C61\u548C\u7269\u7406\u4E16\u754C\r
const parent = injectThreeParent();\r
const physicsWorld = inject(PHYSICS_WORLD_INJECTION_KEY);\r
\r
// \u521A\u4F53\r
const body = ref<Body | null>(null);\r
const isSleeping = ref<boolean>(false);\r
\r
// \u521B\u5EFA\u521A\u4F53\r
const createRigidBody = () => {\r
  if (!parent.value) return;\r
  \r
  // \u521B\u5EFA\u5F62\u72B6\r
  const shape = createShape();\r
  if (!shape) return;\r
  \r
  // \u521B\u5EFA\u521A\u4F53\r
  const bodyOptions = {\r
    mass: props.type === 'static' ? 0 : (props.mass || 1),\r
    type: props.type || 'dynamic',\r
    position: new Vec3(),\r
    quaternion: new Quaternion(),\r
    linearDamping: props.linearDamping || 0.01,\r
    angularDamping: props.angularDamping || 0.01,\r
    fixedRotation: props.fixedRotation || false,\r
    allowSleep: props.allowSleep || false,\r
    sleepSpeedLimit: props.sleepSpeedLimit || 0.1,\r
    sleepTimeLimit: props.sleepTimeLimit || 1,\r
    collisionFilterGroup: props.collisionFilterGroup || 1,\r
    collisionFilterMask: props.collisionFilterMask || -1,\r
    material: undefined\r
  };\r
  \r
  // \u521B\u5EFA\u521A\u4F53\r
  body.value = new Body(bodyOptions);\r
  \r
  // \u6DFB\u52A0\u5F62\u72B6\r
  const offset = props.offset ? new Vec3(props.offset[0], props.offset[1], props.offset[2]) : new Vec3();\r
  body.value.addShape(shape, offset);\r
  \r
  // \u8BBE\u7F6E\u7EBF\u6027\u548C\u89D2\u56E0\u5B50\r
  if (props.linearFactor) {\r
    body.value.linearFactor.set(\r
      props.linearFactor[0],\r
      props.linearFactor[1],\r
      props.linearFactor[2]\r
    );\r
  }\r
  \r
  if (props.angularFactor) {\r
    body.value.angularFactor.set(\r
      props.angularFactor[0],\r
      props.angularFactor[1],\r
      props.angularFactor[2]\r
    );\r
  }\r
  \r
  // \u8BBE\u7F6E\u4F4D\u7F6E\u548C\u65CB\u8F6C\r
  updateBodyTransform();\r
  \r
  // \u6DFB\u52A0\u4E8B\u4EF6\u76D1\u542C\r
  body.value.addEventListener('collide', handleCollide);\r
  body.value.addEventListener('sleep', handleSleep);\r
  body.value.addEventListener('wakeup', handleWakeup);\r
  \r
  // \u6DFB\u52A0\u5230\u7269\u7406\u4E16\u754C\r
  if (physicsWorld) {\r
    physicsWorld.addBody(body.value);\r
  }\r
};\r
\r
// \u521B\u5EFA\u5F62\u72B6\r
const createShape = () => {\r
  if (!parent.value) return null;\r
  \r
  // \u5982\u679C\u6307\u5B9A\u4E86\u5F62\u72B6\u7C7B\u578B\r
  if (props.shape && props.shape !== 'auto') {\r
    return createSpecificShape(props.shape);\r
  }\r
  \r
  // \u81EA\u52A8\u521B\u5EFA\u5F62\u72B6\r
  if (props.autoFit !== false) {\r
    // \u8BA1\u7B97\u5305\u56F4\u76D2\r
    const box = computeBoundingBox(parent.value);\r
    const size = new Vector3();\r
    box.getSize(size);\r
    \r
    // \u521B\u5EFA\u76D2\u4F53\u5F62\u72B6\r
    return new Box(new Vec3(size.x / 2, size.y / 2, size.z / 2));\r
  }\r
  \r
  // \u9ED8\u8BA4\u521B\u5EFA\u76D2\u4F53\u5F62\u72B6\r
  return new Box(new Vec3(0.5, 0.5, 0.5));\r
};\r
\r
// \u521B\u5EFA\u7279\u5B9A\u5F62\u72B6\r
const createSpecificShape = (shapeType: string) => {\r
  const options = props.shapeOptions || {};\r
  \r
  switch (shapeType) {\r
    case 'box':\r
      const halfExtents = options.halfExtents || [0.5, 0.5, 0.5];\r
      return new Box(new Vec3(halfExtents[0], halfExtents[1], halfExtents[2]));\r
    \r
    case 'sphere':\r
      const radius = options.radius || 0.5;\r
      return new Sphere(radius);\r
    \r
    case 'cylinder':\r
      const radiusTop = options.radiusTop || 0.5;\r
      const radiusBottom = options.radiusBottom || 0.5;\r
      const height = options.height || 1;\r
      const numSegments = options.numSegments || 8;\r
      return new Cylinder(radiusTop, radiusBottom, height, numSegments);\r
    \r
    case 'plane':\r
      return new Plane();\r
    \r
    default:\r
      return new Box(new Vec3(0.5, 0.5, 0.5));\r
  }\r
};\r
\r
// \u66F4\u65B0\u521A\u4F53\u53D8\u6362\r
const updateBodyTransform = () => {\r
  if (!body.value || !parent.value) return;\r
  \r
  // \u83B7\u53D6\u4F4D\u7F6E\r
  const position = props.position \r
    ? new Vec3(props.position[0], props.position[1], props.position[2])\r
    : new Vec3(parent.value.position.x, parent.value.position.y, parent.value.position.z);\r
  \r
  // \u83B7\u53D6\u65CB\u8F6C\r
  let quaternion;\r
  if (props.rotation) {\r
    const euler = arrayToVector3(props.rotation);\r
    quaternion = new Quaternion();\r
    quaternion.setFromEuler(euler.x, euler.y, euler.z, 'XYZ');\r
  } else {\r
    const threeQuat = new ThreeQuaternion();\r
    parent.value.getWorldQuaternion(threeQuat);\r
    quaternion = new Quaternion(threeQuat.x, threeQuat.y, threeQuat.z, threeQuat.w);\r
  }\r
  \r
  // \u8BBE\u7F6E\u4F4D\u7F6E\u548C\u65CB\u8F6C\r
  body.value.position.copy(position);\r
  body.value.quaternion.copy(quaternion);\r
};\r
\r
// \u66F4\u65B0\u5BF9\u8C61\u53D8\u6362\r
const updateObjectTransform = () => {\r
  if (!body.value || !parent.value) return;\r
  \r
  // \u66F4\u65B0\u4F4D\u7F6E\r
  parent.value.position.set(\r
    body.value.position.x,\r
    body.value.position.y,\r
    body.value.position.z\r
  );\r
  \r
  // \u66F4\u65B0\u65CB\u8F6C\r
  parent.value.quaternion.set(\r
    body.value.quaternion.x,\r
    body.value.quaternion.y,\r
    body.value.quaternion.z,\r
    body.value.quaternion.w\r
  );\r
};\r
\r
// \u5E94\u7528\u529B\r
const applyForce = (force: Vector3Tuple, worldPoint?: Vector3Tuple) => {\r
  if (!body.value) return;\r
  \r
  const forceVec = new Vec3(force[0], force[1], force[2]);\r
  \r
  if (worldPoint) {\r
    const pointVec = new Vec3(worldPoint[0], worldPoint[1], worldPoint[2]);\r
    body.value.applyForce(forceVec, pointVec);\r
  } else {\r
    body.value.applyForce(forceVec, body.value.position);\r
  }\r
};\r
\r
// \u5E94\u7528\u51B2\u91CF\r
const applyImpulse = (impulse: Vector3Tuple, worldPoint?: Vector3Tuple) => {\r
  if (!body.value) return;\r
  \r
  const impulseVec = new Vec3(impulse[0], impulse[1], impulse[2]);\r
  \r
  if (worldPoint) {\r
    const pointVec = new Vec3(worldPoint[0], worldPoint[1], worldPoint[2]);\r
    body.value.applyImpulse(impulseVec, pointVec);\r
  } else {\r
    body.value.applyImpulse(impulseVec, body.value.position);\r
  }\r
};\r
\r
// \u5E94\u7528\u5C40\u90E8\u529B\r
const applyLocalForce = (force: Vector3Tuple, localPoint?: Vector3Tuple) => {\r
  if (!body.value) return;\r
  \r
  const forceVec = new Vec3(force[0], force[1], force[2]);\r
  \r
  if (localPoint) {\r
    const pointVec = new Vec3(localPoint[0], localPoint[1], localPoint[2]);\r
    body.value.applyLocalForce(forceVec, pointVec);\r
  } else {\r
    body.value.applyLocalForce(forceVec, new Vec3());\r
  }\r
};\r
\r
// \u5E94\u7528\u5C40\u90E8\u51B2\u91CF\r
const applyLocalImpulse = (impulse: Vector3Tuple, localPoint?: Vector3Tuple) => {\r
  if (!body.value) return;\r
  \r
  const impulseVec = new Vec3(impulse[0], impulse[1], impulse[2]);\r
  \r
  if (localPoint) {\r
    const pointVec = new Vec3(localPoint[0], localPoint[1], localPoint[2]);\r
    body.value.applyLocalImpulse(impulseVec, pointVec);\r
  } else {\r
    body.value.applyLocalImpulse(impulseVec, new Vec3());\r
  }\r
};\r
\r
// \u5904\u7406\u78B0\u649E\u4E8B\u4EF6\r
const handleCollide = (event: any) => {\r
  emit('collide', { body: event.body, contact: event.contact });\r
};\r
\r
// \u5904\u7406\u7761\u7720\u4E8B\u4EF6\r
const handleSleep = () => {\r
  isSleeping.value = true;\r
  emit('sleep', { body: body.value });\r
};\r
\r
// \u5904\u7406\u5524\u9192\u4E8B\u4EF6\r
const handleWakeup = () => {\r
  isSleeping.value = false;\r
  emit('wakeup', { body: body.value });\r
};\r
\r
// \u5728\u6BCF\u4E00\u5E27\u66F4\u65B0\r
const onFrame = () => {\r
  if (body.value && parent.value) {\r
    updateObjectTransform();\r
  }\r
};\r
\r
// \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
watch(() => props.mass, (newMass) => {\r
  if (body.value && newMass !== undefined && props.type !== 'static') {\r
    body.value.mass = newMass;\r
    body.value.updateMassProperties();\r
  }\r
});\r
\r
watch(() => props.type, (newType) => {\r
  if (body.value && newType) {\r
    if (newType === 'static') {\r
      body.value.mass = 0;\r
      body.value.updateMassProperties();\r
      body.value.type = Body.STATIC;\r
    } else if (newType === 'dynamic') {\r
      body.value.mass = props.mass || 1;\r
      body.value.updateMassProperties();\r
      body.value.type = Body.DYNAMIC;\r
    } else if (newType === 'kinematic') {\r
      body.value.mass = props.mass || 1;\r
      body.value.updateMassProperties();\r
      body.value.type = Body.KINEMATIC;\r
    }\r
  }\r
});\r
\r
watch(() => props.position, (newPosition) => {\r
  if (body.value && newPosition) {\r
    body.value.position.set(newPosition[0], newPosition[1], newPosition[2]);\r
    body.value.previousPosition.set(newPosition[0], newPosition[1], newPosition[2]);\r
    body.value.initPosition.set(newPosition[0], newPosition[1], newPosition[2]);\r
  }\r
});\r
\r
watch(() => props.rotation, (newRotation) => {\r
  if (body.value && newRotation) {\r
    const euler = arrayToVector3(newRotation);\r
    body.value.quaternion.setFromEuler(euler.x, euler.y, euler.z, 'XYZ');\r
    body.value.previousQuaternion.copy(body.value.quaternion);\r
    body.value.initQuaternion.copy(body.value.quaternion);\r
  }\r
});\r
\r
watch(() => props.linearDamping, (newLinearDamping) => {\r
  if (body.value && newLinearDamping !== undefined) {\r
    body.value.linearDamping = newLinearDamping;\r
  }\r
});\r
\r
watch(() => props.angularDamping, (newAngularDamping) => {\r
  if (body.value && newAngularDamping !== undefined) {\r
    body.value.angularDamping = newAngularDamping;\r
  }\r
});\r
\r
watch(() => props.linearFactor, (newLinearFactor) => {\r
  if (body.value && newLinearFactor) {\r
    body.value.linearFactor.set(\r
      newLinearFactor[0],\r
      newLinearFactor[1],\r
      newLinearFactor[2]\r
    );\r
  }\r
});\r
\r
watch(() => props.angularFactor, (newAngularFactor) => {\r
  if (body.value && newAngularFactor) {\r
    body.value.angularFactor.set(\r
      newAngularFactor[0],\r
      newAngularFactor[1],\r
      newAngularFactor[2]\r
    );\r
  }\r
});\r
\r
watch(() => props.fixedRotation, (newFixedRotation) => {\r
  if (body.value && newFixedRotation !== undefined) {\r
    body.value.fixedRotation = newFixedRotation;\r
    body.value.updateMassProperties();\r
  }\r
});\r
\r
watch(() => props.allowSleep, (newAllowSleep) => {\r
  if (body.value && newAllowSleep !== undefined) {\r
    body.value.allowSleep = newAllowSleep;\r
  }\r
});\r
\r
watch(() => props.sleepSpeedLimit, (newSleepSpeedLimit) => {\r
  if (body.value && newSleepSpeedLimit !== undefined) {\r
    body.value.sleepSpeedLimit = newSleepSpeedLimit;\r
  }\r
});\r
\r
watch(() => props.sleepTimeLimit, (newSleepTimeLimit) => {\r
  if (body.value && newSleepTimeLimit !== undefined) {\r
    body.value.sleepTimeLimit = newSleepTimeLimit;\r
  }\r
});\r
\r
watch(() => props.collisionFilterGroup, (newCollisionFilterGroup) => {\r
  if (body.value && newCollisionFilterGroup !== undefined) {\r
    body.value.collisionFilterGroup = newCollisionFilterGroup;\r
  }\r
});\r
\r
watch(() => props.collisionFilterMask, (newCollisionFilterMask) => {\r
  if (body.value && newCollisionFilterMask !== undefined) {\r
    body.value.collisionFilterMask = newCollisionFilterMask;\r
  }\r
});\r
\r
// \u7EC4\u4EF6\u6302\u8F7D\u548C\u5378\u8F7D\r
onMounted(() => {\r
  // \u521B\u5EFA\u521A\u4F53\r
  createRigidBody();\r
  \r
  // \u6DFB\u52A0\u5E27\u66F4\u65B0\r
  useFrame(onFrame);\r
});\r
\r
onBeforeUnmount(() => {\r
  if (body.value) {\r
    // \u79FB\u9664\u4E8B\u4EF6\u76D1\u542C\r
    body.value.removeEventListener('collide', handleCollide);\r
    body.value.removeEventListener('sleep', handleSleep);\r
    body.value.removeEventListener('wakeup', handleWakeup);\r
    \r
    // \u4ECE\u7269\u7406\u4E16\u754C\u79FB\u9664\r
    if (physicsWorld) {\r
      physicsWorld.removeBody(body.value);\r
    }\r
  }\r
});\r
\r
// \u66B4\u9732\u7EC4\u4EF6\u5185\u90E8\u72B6\u6001\u548C\u65B9\u6CD5\r
defineExpose({\r
  body,\r
  isSleeping,\r
  applyForce,\r
  applyImpulse,\r
  applyLocalForce,\r
  applyLocalImpulse,\r
  updateBodyTransform,\r
  updateObjectTransform\r
});\r
</script>\r
\r
<template>\r
  <div>\r
    <slot \r
      :body="body" \r
      :is-sleeping="isSleeping"\r
      :apply-force="applyForce"\r
      :apply-impulse="applyImpulse"\r
      :apply-local-force="applyLocalForce"\r
      :apply-local-impulse="applyLocalImpulse"\r
    ></slot>\r
  </div>\r
</template> `;var B=`<script setup lang="ts">\r
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue';\r
import { Box, Vec3, Body } from 'cannon-es';\r
import { Object3D, Box3, Vector3 } from 'three';\r
import { injectThreeParent } from '../../composables/useThreeParent';\r
import { PHYSICS_WORLD_INJECTION_KEY } from './ThreePhysicsWorld.vue';\r
import { BoxColliderOptions, Vector3Tuple } from '../../types';\r
import { arrayToVector3, computeBoundingBox } from '../../utils';\r
\r
const props = defineProps<{\r
  size?: Vector3Tuple;\r
  position?: Vector3Tuple;\r
  rotation?: Vector3Tuple;\r
  offset?: Vector3Tuple;\r
  isTrigger?: boolean;\r
  collisionFilterGroup?: number;\r
  collisionFilterMask?: number;\r
  autoFit?: boolean;\r
}>();\r
\r
const emit = defineEmits<{\r
  collide: [event: { body: Body; contact: any }];\r
}>();\r
\r
// \u83B7\u53D6\u7236\u5BF9\u8C61\u548C\u7269\u7406\u4E16\u754C\r
const parent = injectThreeParent();\r
const physicsWorld = inject(PHYSICS_WORLD_INJECTION_KEY);\r
\r
// \u78B0\u649E\u5668\r
const collider = ref<Body | null>(null);\r
\r
// \u521B\u5EFA\u78B0\u649E\u5668\r
const createCollider = () => {\r
  if (!parent.value) return;\r
  \r
  // \u521B\u5EFA\u5F62\u72B6\r
  let halfExtents: Vec3;\r
  \r
  if (props.size) {\r
    // \u4F7F\u7528\u6307\u5B9A\u5927\u5C0F\r
    halfExtents = new Vec3(props.size[0] / 2, props.size[1] / 2, props.size[2] / 2);\r
  } else if (props.autoFit !== false) {\r
    // \u81EA\u52A8\u9002\u5E94\u5BF9\u8C61\u5927\u5C0F\r
    const box = computeBoundingBox(parent.value);\r
    const size = new Vector3();\r
    box.getSize(size);\r
    halfExtents = new Vec3(size.x / 2, size.y / 2, size.z / 2);\r
  } else {\r
    // \u9ED8\u8BA4\u5927\u5C0F\r
    halfExtents = new Vec3(0.5, 0.5, 0.5);\r
  }\r
  \r
  // \u521B\u5EFA\u76D2\u4F53\u5F62\u72B6\r
  const shape = new Box(halfExtents);\r
  \r
  // \u521B\u5EFA\u521A\u4F53\uFF08\u8D28\u91CF\u4E3A0\uFF0C\u4F7F\u5176\u6210\u4E3A\u9759\u6001\u78B0\u649E\u5668\uFF09\r
  collider.value = new Body({\r
    mass: 0,\r
    type: Body.STATIC,\r
    shape,\r
    position: new Vec3(),\r
    collisionFilterGroup: props.collisionFilterGroup || 1,\r
    collisionFilterMask: props.collisionFilterMask || -1,\r
    isTrigger: props.isTrigger || false\r
  });\r
  \r
  // \u8BBE\u7F6E\u4F4D\u7F6E\u548C\u65CB\u8F6C\r
  updateColliderTransform();\r
  \r
  // \u6DFB\u52A0\u78B0\u649E\u4E8B\u4EF6\u76D1\u542C\r
  collider.value.addEventListener('collide', handleCollide);\r
  \r
  // \u6DFB\u52A0\u5230\u7269\u7406\u4E16\u754C\r
  if (physicsWorld) {\r
    physicsWorld.addBody(collider.value);\r
  }\r
};\r
\r
// \u66F4\u65B0\u78B0\u649E\u5668\u53D8\u6362\r
const updateColliderTransform = () => {\r
  if (!collider.value || !parent.value) return;\r
  \r
  // \u83B7\u53D6\u4F4D\u7F6E\r
  let position: Vec3;\r
  if (props.position) {\r
    position = new Vec3(props.position[0], props.position[1], props.position[2]);\r
  } else {\r
    position = new Vec3(\r
      parent.value.position.x,\r
      parent.value.position.y,\r
      parent.value.position.z\r
    );\r
  }\r
  \r
  // \u5E94\u7528\u504F\u79FB\r
  if (props.offset) {\r
    position.x += props.offset[0];\r
    position.y += props.offset[1];\r
    position.z += props.offset[2];\r
  }\r
  \r
  // \u8BBE\u7F6E\u4F4D\u7F6E\r
  collider.value.position.copy(position);\r
  \r
  // \u8BBE\u7F6E\u65CB\u8F6C\r
  if (props.rotation) {\r
    const euler = arrayToVector3(props.rotation);\r
    collider.value.quaternion.setFromEuler(euler.x, euler.y, euler.z, 'XYZ');\r
  } else {\r
    collider.value.quaternion.copy(parent.value.quaternion);\r
  }\r
};\r
\r
// \u5904\u7406\u78B0\u649E\u4E8B\u4EF6\r
const handleCollide = (event: any) => {\r
  emit('collide', { body: event.body, contact: event.contact });\r
};\r
\r
// \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
watch(() => props.position, (newPosition) => {\r
  if (collider.value && newPosition) {\r
    collider.value.position.set(newPosition[0], newPosition[1], newPosition[2]);\r
    \r
    // \u5E94\u7528\u504F\u79FB\r
    if (props.offset) {\r
      collider.value.position.x += props.offset[0];\r
      collider.value.position.y += props.offset[1];\r
      collider.value.position.z += props.offset[2];\r
    }\r
  }\r
});\r
\r
watch(() => props.rotation, (newRotation) => {\r
  if (collider.value && newRotation) {\r
    const euler = arrayToVector3(newRotation);\r
    collider.value.quaternion.setFromEuler(euler.x, euler.y, euler.z, 'XYZ');\r
  }\r
});\r
\r
watch(() => props.offset, (newOffset) => {\r
  if (collider.value && parent.value && newOffset) {\r
    // \u91CD\u65B0\u8BA1\u7B97\u4F4D\u7F6E\r
    let position: Vec3;\r
    if (props.position) {\r
      position = new Vec3(props.position[0], props.position[1], props.position[2]);\r
    } else {\r
      position = new Vec3(\r
        parent.value.position.x,\r
        parent.value.position.y,\r
        parent.value.position.z\r
      );\r
    }\r
    \r
    // \u5E94\u7528\u65B0\u504F\u79FB\r
    position.x += newOffset[0];\r
    position.y += newOffset[1];\r
    position.z += newOffset[2];\r
    \r
    // \u8BBE\u7F6E\u4F4D\u7F6E\r
    collider.value.position.copy(position);\r
  }\r
}, { deep: true });\r
\r
watch(() => props.isTrigger, (newIsTrigger) => {\r
  if (collider.value && newIsTrigger !== undefined) {\r
    collider.value.isTrigger = newIsTrigger;\r
  }\r
});\r
\r
watch(() => props.collisionFilterGroup, (newGroup) => {\r
  if (collider.value && newGroup !== undefined) {\r
    collider.value.collisionFilterGroup = newGroup;\r
  }\r
});\r
\r
watch(() => props.collisionFilterMask, (newMask) => {\r
  if (collider.value && newMask !== undefined) {\r
    collider.value.collisionFilterMask = newMask;\r
  }\r
});\r
\r
// \u7EC4\u4EF6\u6302\u8F7D\u548C\u5378\u8F7D\r
onMounted(() => {\r
  // \u521B\u5EFA\u78B0\u649E\u5668\r
  createCollider();\r
});\r
\r
onBeforeUnmount(() => {\r
  if (collider.value) {\r
    // \u79FB\u9664\u78B0\u649E\u4E8B\u4EF6\u76D1\u542C\r
    collider.value.removeEventListener('collide', handleCollide);\r
    \r
    // \u4ECE\u7269\u7406\u4E16\u754C\u79FB\u9664\r
    if (physicsWorld) {\r
      physicsWorld.removeBody(collider.value);\r
    }\r
  }\r
});\r
\r
// \u66B4\u9732\u7EC4\u4EF6\u5185\u90E8\u72B6\u6001\u548C\u65B9\u6CD5\r
defineExpose({\r
  collider,\r
  updateColliderTransform\r
});\r
</script>\r
\r
<template>\r
  <div>\r
    <slot :collider="collider"></slot>\r
  </div>\r
</template> `;var I=`<script setup lang="ts">\r
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue';\r
import { Sphere, Vec3, Body } from 'cannon-es';\r
import { Object3D, Box3, Vector3 } from 'three';\r
import { injectThreeParent } from '../../composables/useThreeParent';\r
import { PHYSICS_WORLD_INJECTION_KEY } from './ThreePhysicsWorld.vue';\r
import { SphereColliderOptions, Vector3Tuple } from '../../types';\r
import { arrayToVector3, computeBoundingSphere } from '../../utils';\r
\r
const props = defineProps<{\r
  radius?: number;\r
  position?: Vector3Tuple;\r
  rotation?: Vector3Tuple;\r
  offset?: Vector3Tuple;\r
  isTrigger?: boolean;\r
  collisionFilterGroup?: number;\r
  collisionFilterMask?: number;\r
  autoFit?: boolean;\r
}>();\r
\r
const emit = defineEmits<{\r
  collide: [event: { body: Body; contact: any }];\r
}>();\r
\r
// \u83B7\u53D6\u7236\u5BF9\u8C61\u548C\u7269\u7406\u4E16\u754C\r
const parent = injectThreeParent();\r
const physicsWorld = inject(PHYSICS_WORLD_INJECTION_KEY);\r
\r
// \u78B0\u649E\u5668\r
const collider = ref<Body | null>(null);\r
\r
// \u521B\u5EFA\u78B0\u649E\u5668\r
const createCollider = () => {\r
  if (!parent.value) return;\r
  \r
  // \u521B\u5EFA\u5F62\u72B6\r
  let radius: number;\r
  \r
  if (props.radius) {\r
    // \u4F7F\u7528\u6307\u5B9A\u534A\u5F84\r
    radius = props.radius;\r
  } else if (props.autoFit !== false) {\r
    // \u81EA\u52A8\u9002\u5E94\u5BF9\u8C61\u5927\u5C0F\r
    const boundingSphere = computeBoundingSphere(parent.value);\r
    radius = boundingSphere.radius;\r
  } else {\r
    // \u9ED8\u8BA4\u534A\u5F84\r
    radius = 0.5;\r
  }\r
  \r
  // \u521B\u5EFA\u7403\u4F53\u5F62\u72B6\r
  const shape = new Sphere(radius);\r
  \r
  // \u521B\u5EFA\u521A\u4F53\uFF08\u8D28\u91CF\u4E3A0\uFF0C\u4F7F\u5176\u6210\u4E3A\u9759\u6001\u78B0\u649E\u5668\uFF09\r
  collider.value = new Body({\r
    mass: 0,\r
    type: Body.STATIC,\r
    shape,\r
    position: new Vec3(),\r
    collisionFilterGroup: props.collisionFilterGroup || 1,\r
    collisionFilterMask: props.collisionFilterMask || -1,\r
    isTrigger: props.isTrigger || false\r
  });\r
  \r
  // \u8BBE\u7F6E\u4F4D\u7F6E\u548C\u65CB\u8F6C\r
  updateColliderTransform();\r
  \r
  // \u6DFB\u52A0\u78B0\u649E\u4E8B\u4EF6\u76D1\u542C\r
  collider.value.addEventListener('collide', handleCollide);\r
  \r
  // \u6DFB\u52A0\u5230\u7269\u7406\u4E16\u754C\r
  if (physicsWorld) {\r
    physicsWorld.addBody(collider.value);\r
  }\r
};\r
\r
// \u66F4\u65B0\u78B0\u649E\u5668\u53D8\u6362\r
const updateColliderTransform = () => {\r
  if (!collider.value || !parent.value) return;\r
  \r
  // \u83B7\u53D6\u4F4D\u7F6E\r
  let position: Vec3;\r
  if (props.position) {\r
    position = new Vec3(props.position[0], props.position[1], props.position[2]);\r
  } else {\r
    position = new Vec3(\r
      parent.value.position.x,\r
      parent.value.position.y,\r
      parent.value.position.z\r
    );\r
  }\r
  \r
  // \u5E94\u7528\u504F\u79FB\r
  if (props.offset) {\r
    position.x += props.offset[0];\r
    position.y += props.offset[1];\r
    position.z += props.offset[2];\r
  }\r
  \r
  // \u8BBE\u7F6E\u4F4D\u7F6E\r
  collider.value.position.copy(position);\r
  \r
  // \u8BBE\u7F6E\u65CB\u8F6C\r
  if (props.rotation) {\r
    const euler = arrayToVector3(props.rotation);\r
    collider.value.quaternion.setFromEuler(euler.x, euler.y, euler.z, 'XYZ');\r
  } else {\r
    collider.value.quaternion.copy(parent.value.quaternion);\r
  }\r
};\r
\r
// \u5904\u7406\u78B0\u649E\u4E8B\u4EF6\r
const handleCollide = (event: any) => {\r
  emit('collide', { body: event.body, contact: event.contact });\r
};\r
\r
// \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
watch(() => props.position, (newPosition) => {\r
  if (collider.value && newPosition) {\r
    collider.value.position.set(newPosition[0], newPosition[1], newPosition[2]);\r
    \r
    // \u5E94\u7528\u504F\u79FB\r
    if (props.offset) {\r
      collider.value.position.x += props.offset[0];\r
      collider.value.position.y += props.offset[1];\r
      collider.value.position.z += props.offset[2];\r
    }\r
  }\r
});\r
\r
watch(() => props.rotation, (newRotation) => {\r
  if (collider.value && newRotation) {\r
    const euler = arrayToVector3(newRotation);\r
    collider.value.quaternion.setFromEuler(euler.x, euler.y, euler.z, 'XYZ');\r
  }\r
});\r
\r
watch(() => props.offset, (newOffset) => {\r
  if (collider.value && parent.value && newOffset) {\r
    // \u91CD\u65B0\u8BA1\u7B97\u4F4D\u7F6E\r
    let position: Vec3;\r
    if (props.position) {\r
      position = new Vec3(props.position[0], props.position[1], props.position[2]);\r
    } else {\r
      position = new Vec3(\r
        parent.value.position.x,\r
        parent.value.position.y,\r
        parent.value.position.z\r
      );\r
    }\r
    \r
    // \u5E94\u7528\u65B0\u504F\u79FB\r
    position.x += newOffset[0];\r
    position.y += newOffset[1];\r
    position.z += newOffset[2];\r
    \r
    // \u8BBE\u7F6E\u4F4D\u7F6E\r
    collider.value.position.copy(position);\r
  }\r
}, { deep: true });\r
\r
watch(() => props.radius, (newRadius) => {\r
  if (collider.value && physicsWorld && newRadius) {\r
    // \u4ECE\u7269\u7406\u4E16\u754C\u79FB\u9664\u65E7\u78B0\u649E\u5668\r
    physicsWorld.removeBody(collider.value);\r
    \r
    // \u91CD\u65B0\u521B\u5EFA\u78B0\u649E\u5668\r
    createCollider();\r
  }\r
});\r
\r
watch(() => props.isTrigger, (newIsTrigger) => {\r
  if (collider.value && newIsTrigger !== undefined) {\r
    collider.value.isTrigger = newIsTrigger;\r
  }\r
});\r
\r
watch(() => props.collisionFilterGroup, (newGroup) => {\r
  if (collider.value && newGroup !== undefined) {\r
    collider.value.collisionFilterGroup = newGroup;\r
  }\r
});\r
\r
watch(() => props.collisionFilterMask, (newMask) => {\r
  if (collider.value && newMask !== undefined) {\r
    collider.value.collisionFilterMask = newMask;\r
  }\r
});\r
\r
// \u7EC4\u4EF6\u6302\u8F7D\u548C\u5378\u8F7D\r
onMounted(() => {\r
  // \u521B\u5EFA\u78B0\u649E\u5668\r
  createCollider();\r
});\r
\r
onBeforeUnmount(() => {\r
  if (collider.value) {\r
    // \u79FB\u9664\u78B0\u649E\u4E8B\u4EF6\u76D1\u542C\r
    collider.value.removeEventListener('collide', handleCollide);\r
    \r
    // \u4ECE\u7269\u7406\u4E16\u754C\u79FB\u9664\r
    if (physicsWorld) {\r
      physicsWorld.removeBody(collider.value);\r
    }\r
  }\r
});\r
\r
// \u66B4\u9732\u7EC4\u4EF6\u5185\u90E8\u72B6\u6001\u548C\u65B9\u6CD5\r
defineExpose({\r
  collider,\r
  updateColliderTransform\r
});\r
</script>\r
\r
<template>\r
  <div>\r
    <slot :collider="collider"></slot>\r
  </div>\r
</template> `;var L=`<script setup lang="ts">\r
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue';\r
import { \r
  Constraint, PointToPointConstraint, DistanceConstraint, \r
  HingeConstraint, LockConstraint, Vec3, Body \r
} from 'cannon-es';\r
import { injectThreeParent } from '../../composables/useThreeParent';\r
import { PHYSICS_WORLD_INJECTION_KEY } from './ThreePhysicsWorld.vue';\r
import { ConstraintOptions, ConstraintType, Vector3Tuple } from '../../types';\r
import { arrayToVector3 } from '../../utils';\r
\r
const props = defineProps<{\r
  type: ConstraintType;\r
  bodyA: Body;\r
  bodyB?: Body | null;\r
  pivotA?: Vector3Tuple;\r
  pivotB?: Vector3Tuple;\r
  axisA?: Vector3Tuple;\r
  axisB?: Vector3Tuple;\r
  distance?: number;\r
  maxForce?: number;\r
  collideConnected?: boolean;\r
  stiffness?: number;\r
  damping?: number;\r
  restLength?: number;\r
  motorEnabled?: boolean;\r
  motorSpeed?: number;\r
  motorMaxForce?: number;\r
}>();\r
\r
const emit = defineEmits<{\r
  created: [constraint: Constraint];\r
}>();\r
\r
// \u83B7\u53D6\u7236\u5BF9\u8C61\u548C\u7269\u7406\u4E16\u754C\r
const parent = injectThreeParent();\r
const physicsWorld = inject(PHYSICS_WORLD_INJECTION_KEY);\r
\r
// \u7EA6\u675F\r
const constraint = ref<Constraint | null>(null);\r
\r
// \u521B\u5EFA\u7EA6\u675F\r
const createConstraint = () => {\r
  if (!props.bodyA) return;\r
  \r
  switch (props.type) {\r
    case 'point':\r
      createPointConstraint();\r
      break;\r
    case 'distance':\r
      createDistanceConstraint();\r
      break;\r
    case 'hinge':\r
      createHingeConstraint();\r
      break;\r
    case 'lock':\r
      createLockConstraint();\r
      break;\r
    case 'spring':\r
      createSpringConstraint();\r
      break;\r
    default:\r
      console.warn(\`Unknown constraint type: \${props.type}\`);\r
  }\r
  \r
  // \u6DFB\u52A0\u5230\u7269\u7406\u4E16\u754C\r
  if (constraint.value && physicsWorld) {\r
    physicsWorld.world.addConstraint(constraint.value);\r
    emit('created', constraint.value);\r
  }\r
};\r
\r
// \u521B\u5EFA\u70B9\u5BF9\u70B9\u7EA6\u675F\r
const createPointConstraint = () => {\r
  const pivotA = props.pivotA ? new Vec3(props.pivotA[0], props.pivotA[1], props.pivotA[2]) : new Vec3();\r
  const pivotB = props.pivotB && props.bodyB ? new Vec3(props.pivotB[0], props.pivotB[1], props.pivotB[2]) : new Vec3();\r
  \r
  if (props.bodyB) {\r
    constraint.value = new PointToPointConstraint(\r
      props.bodyA,\r
      pivotA,\r
      props.bodyB,\r
      pivotB,\r
      props.maxForce || undefined\r
    );\r
  } else {\r
    constraint.value = new PointToPointConstraint(\r
      props.bodyA,\r
      pivotA,\r
      props.bodyA, // \u81EA\u8EAB\u7EA6\u675F\r
      new Vec3(),\r
      props.maxForce || undefined\r
    );\r
  }\r
};\r
\r
// \u521B\u5EFA\u8DDD\u79BB\u7EA6\u675F\r
const createDistanceConstraint = () => {\r
  if (!props.bodyB) return;\r
  \r
  const distance = props.distance || 1;\r
  \r
  constraint.value = new DistanceConstraint(\r
    props.bodyA,\r
    props.bodyB,\r
    distance,\r
    props.maxForce || undefined\r
  );\r
};\r
\r
// \u521B\u5EFA\u94F0\u94FE\u7EA6\u675F\r
const createHingeConstraint = () => {\r
  if (!props.bodyB) return;\r
  \r
  const pivotA = props.pivotA ? new Vec3(props.pivotA[0], props.pivotA[1], props.pivotA[2]) : new Vec3();\r
  const pivotB = props.pivotB ? new Vec3(props.pivotB[0], props.pivotB[1], props.pivotB[2]) : new Vec3();\r
  const axisA = props.axisA ? new Vec3(props.axisA[0], props.axisA[1], props.axisA[2]) : new Vec3(1, 0, 0);\r
  const axisB = props.axisB ? new Vec3(props.axisB[0], props.axisB[1], props.axisB[2]) : new Vec3(1, 0, 0);\r
  \r
  const hingeConstraint = new HingeConstraint(\r
    props.bodyA,\r
    props.bodyB,\r
    {\r
      pivotA,\r
      pivotB,\r
      axisA,\r
      axisB,\r
      maxForce: props.maxForce || undefined,\r
      collideConnected: props.collideConnected || false\r
    }\r
  );\r
  \r
  // \u8BBE\u7F6E\u7535\u673A\r
  if (props.motorEnabled) {\r
    hingeConstraint.enableMotor();\r
    if (props.motorSpeed !== undefined) {\r
      hingeConstraint.setMotorSpeed(props.motorSpeed);\r
    }\r
    if (props.motorMaxForce !== undefined) {\r
      hingeConstraint.setMotorMaxForce(props.motorMaxForce);\r
    }\r
  }\r
  \r
  constraint.value = hingeConstraint;\r
};\r
\r
// \u521B\u5EFA\u9501\u5B9A\u7EA6\u675F\r
const createLockConstraint = () => {\r
  if (!props.bodyB) return;\r
  \r
  constraint.value = new LockConstraint(\r
    props.bodyA,\r
    props.bodyB,\r
    {\r
      maxForce: props.maxForce || undefined,\r
      collideConnected: props.collideConnected || false\r
    }\r
  );\r
};\r
\r
// \u521B\u5EFA\u5F39\u7C27\u7EA6\u675F\r
const createSpringConstraint = () => {\r
  if (!props.bodyB) return;\r
  \r
  const localAnchorA = props.pivotA ? new Vec3(props.pivotA[0], props.pivotA[1], props.pivotA[2]) : new Vec3();\r
  const localAnchorB = props.pivotB ? new Vec3(props.pivotB[0], props.pivotB[1], props.pivotB[2]) : new Vec3();\r
  \r
  // \u521B\u5EFA\u8DDD\u79BB\u7EA6\u675F\u5E76\u6DFB\u52A0\u5F39\u7C27\u5C5E\u6027\r
  const distanceConstraint = new DistanceConstraint(\r
    props.bodyA,\r
    props.bodyB,\r
    props.restLength || 1,\r
    props.maxForce || undefined\r
  );\r
  \r
  // \u8BBE\u7F6E\u5F39\u7C27\u5C5E\u6027\r
  if (props.stiffness !== undefined) {\r
    distanceConstraint.stiffness = props.stiffness;\r
  }\r
  if (props.damping !== undefined) {\r
    distanceConstraint.damping = props.damping;\r
  }\r
  if (props.restLength !== undefined) {\r
    distanceConstraint.restLength = props.restLength;\r
  }\r
  \r
  constraint.value = distanceConstraint;\r
};\r
\r
// \u542F\u7528/\u7981\u7528\u7EA6\u675F\r
const enableConstraint = (enabled: boolean) => {\r
  if (!constraint.value || !physicsWorld) return;\r
  \r
  if (enabled) {\r
    if (!physicsWorld.world.constraints.includes(constraint.value)) {\r
      physicsWorld.world.addConstraint(constraint.value);\r
    }\r
  } else {\r
    if (physicsWorld.world.constraints.includes(constraint.value)) {\r
      physicsWorld.world.removeConstraint(constraint.value);\r
    }\r
  }\r
};\r
\r
// \u66F4\u65B0\u7EA6\u675F\u53C2\u6570\r
const updateConstraint = () => {\r
  if (!constraint.value) return;\r
  \r
  // \u6839\u636E\u7EA6\u675F\u7C7B\u578B\u66F4\u65B0\u53C2\u6570\r
  if (props.type === 'distance' || props.type === 'spring') {\r
    const distanceConstraint = constraint.value as DistanceConstraint;\r
    \r
    if (props.stiffness !== undefined) {\r
      distanceConstraint.stiffness = props.stiffness;\r
    }\r
    if (props.damping !== undefined) {\r
      distanceConstraint.damping = props.damping;\r
    }\r
    if (props.restLength !== undefined) {\r
      distanceConstraint.restLength = props.restLength;\r
    }\r
  } else if (props.type === 'hinge') {\r
    const hingeConstraint = constraint.value as HingeConstraint;\r
    \r
    if (props.motorEnabled) {\r
      hingeConstraint.enableMotor();\r
      if (props.motorSpeed !== undefined) {\r
        hingeConstraint.setMotorSpeed(props.motorSpeed);\r
      }\r
      if (props.motorMaxForce !== undefined) {\r
        hingeConstraint.setMotorMaxForce(props.motorMaxForce);\r
      }\r
    } else {\r
      hingeConstraint.disableMotor();\r
    }\r
  }\r
};\r
\r
// \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
watch(() => props.bodyA, (newBodyA) => {\r
  if (newBodyA && physicsWorld) {\r
    // \u91CD\u65B0\u521B\u5EFA\u7EA6\u675F\r
    if (constraint.value) {\r
      physicsWorld.world.removeConstraint(constraint.value);\r
    }\r
    createConstraint();\r
  }\r
});\r
\r
watch(() => props.bodyB, (newBodyB) => {\r
  if (props.bodyA && newBodyB && physicsWorld) {\r
    // \u91CD\u65B0\u521B\u5EFA\u7EA6\u675F\r
    if (constraint.value) {\r
      physicsWorld.world.removeConstraint(constraint.value);\r
    }\r
    createConstraint();\r
  }\r
});\r
\r
watch(() => props.type, (newType) => {\r
  if (props.bodyA && physicsWorld) {\r
    // \u91CD\u65B0\u521B\u5EFA\u7EA6\u675F\r
    if (constraint.value) {\r
      physicsWorld.world.removeConstraint(constraint.value);\r
    }\r
    createConstraint();\r
  }\r
});\r
\r
watch([() => props.stiffness, () => props.damping, () => props.restLength], () => {\r
  if (props.type === 'distance' || props.type === 'spring') {\r
    updateConstraint();\r
  }\r
});\r
\r
watch([() => props.motorEnabled, () => props.motorSpeed, () => props.motorMaxForce], () => {\r
  if (props.type === 'hinge') {\r
    updateConstraint();\r
  }\r
});\r
\r
// \u7EC4\u4EF6\u6302\u8F7D\u548C\u5378\u8F7D\r
onMounted(() => {\r
  // \u521B\u5EFA\u7EA6\u675F\r
  createConstraint();\r
});\r
\r
onBeforeUnmount(() => {\r
  // \u4ECE\u7269\u7406\u4E16\u754C\u79FB\u9664\u7EA6\u675F\r
  if (constraint.value && physicsWorld) {\r
    physicsWorld.world.removeConstraint(constraint.value);\r
  }\r
});\r
\r
// \u66B4\u9732\u7EC4\u4EF6\u5185\u90E8\u72B6\u6001\u548C\u65B9\u6CD5\r
defineExpose({\r
  constraint,\r
  enableConstraint,\r
  updateConstraint\r
});\r
</script>\r
\r
<template>\r
  <div>\r
    <slot :constraint="constraint"></slot>\r
  </div>\r
</template> `;var N=`<script>\r
import { ref, onMounted, onBeforeUnmount, provide, watch, InjectionKey } from 'vue';\r
import {\r
  EffectComposer,\r
  RenderPass,\r
  NormalPass,\r
  SMAAPass,\r
  EffectPass,\r
  BloomEffect,\r
  DepthOfFieldEffect,\r
  SSAOEffect\r
} from 'postprocessing';\r
import { useThree } from '../../composables/useThree';\r
import { useFrame } from '../../composables/useFrame';\r
import { getDevicePixelRatio } from '../../utils';\r
\r
// \u540E\u5904\u7406\u4E0A\u4E0B\u6587\u6CE8\u5165\u952E\r
const POST_PROCESSING_INJECTION_KEY = Symbol('post-processing');\r
\r
export { POST_PROCESSING_INJECTION_KEY };\r
\r
export default {\r
  props: {\r
    enabled: {\r
      type: Boolean,\r
      default: true\r
    },\r
    autoClear: {\r
      type: Boolean,\r
      default: true\r
    },\r
    renderToScreen: {\r
      type: Boolean,\r
      default: true\r
    },\r
    multisampling: {\r
      type: Number,\r
      default: 0\r
    },\r
    depthBuffer: {\r
      type: Boolean,\r
      default: true\r
    },\r
    stencilBuffer: {\r
      type: Boolean,\r
      default: false\r
    },\r
    normalPass: {\r
      type: Boolean,\r
      default: false\r
    },\r
    smaa: {\r
      type: Boolean,\r
      default: false\r
    },\r
    debug: {\r
      type: Boolean,\r
      default: false\r
    }\r
  },\r
  setup(props, { emit }) {\r
    // \u83B7\u53D6Three.js\u6838\u5FC3\u5BF9\u8C61\r
    const { scene, camera, renderer } = useThree();\r
    \r
    // \u540E\u5904\u7406\u7EC4\u5408\u5668\r
    const composer = ref(null);\r
    const renderPass = ref(null);\r
    const normalPass = ref(null);\r
    const smaaPass = ref(null);\r
    const passes = ref([]);\r
    \r
    // \u521D\u59CB\u5316\r
    const init = () => {\r
      if (!scene.value || !camera.value || !renderer.value) {\r
        console.warn('Scene, camera or renderer not available');\r
        return;\r
      }\r
      \r
      const pixelRatio = getDevicePixelRatio();\r
      \r
      // \u521B\u5EFA\u6548\u679C\u7EC4\u5408\u5668\r
      composer.value = new EffectComposer(renderer.value, {\r
        multisampling: props.multisampling,\r
        depthBuffer: props.depthBuffer,\r
        stencilBuffer: props.stencilBuffer\r
      });\r
      \r
      // \u6DFB\u52A0\u6E32\u67D3\u901A\u9053\r
      renderPass.value = new RenderPass(scene.value, camera.value);\r
      renderPass.value.enabled = true;\r
      composer.value.addPass(renderPass.value);\r
      \r
      // \u6DFB\u52A0\u6CD5\u7EBF\u901A\u9053\uFF08\u5982\u679C\u9700\u8981\uFF09\r
      if (props.normalPass) {\r
        normalPass.value = new NormalPass(scene.value, camera.value);\r
        normalPass.value.enabled = true;\r
        composer.value.addPass(normalPass.value);\r
      }\r
      \r
      // \u6DFB\u52A0SMAA\u6297\u952F\u9F7F\u901A\u9053\uFF08\u5982\u679C\u9700\u8981\uFF09\r
      if (props.smaa) {\r
        smaaPass.value = new SMAAPass(\r
          renderer.value.getSize().width * pixelRatio,\r
          renderer.value.getSize().height * pixelRatio\r
        );\r
        smaaPass.value.enabled = true;\r
        composer.value.addPass(smaaPass.value);\r
      }\r
      \r
      // \u63D0\u4F9B\u540E\u5904\u7406\u4E0A\u4E0B\u6587\r
      provide(POST_PROCESSING_INJECTION_KEY, {\r
        composer: composer.value,\r
        normalPass: normalPass.value,\r
        renderPass: renderPass.value,\r
        addPass: (pass) => {\r
          if (pass) {\r
            composer.value.addPass(pass);\r
            passes.value.push(pass);\r
          }\r
        },\r
        removePass: (pass) => {\r
          if (pass) {\r
            composer.value.removePass(pass);\r
            const index = passes.value.indexOf(pass);\r
            if (index !== -1) {\r
              passes.value.splice(index, 1);\r
            }\r
          }\r
        }\r
      });\r
      \r
      // \u89E6\u53D1\u521D\u59CB\u5316\u4E8B\u4EF6\r
      emit('initialized', composer.value);\r
    };\r
    \r
    // \u8C03\u6574\u5927\u5C0F\r
    const resize = () => {\r
      if (composer.value && renderer.value) {\r
        composer.value.setSize(\r
          renderer.value.domElement.width,\r
          renderer.value.domElement.height\r
        );\r
      }\r
    };\r
    \r
    // \u6E32\u67D3\r
    const render = () => {\r
      if (!composer.value || !props.enabled) return;\r
      \r
      // \u6E32\u67D3\u573A\u666F\r
      composer.value.render();\r
      \r
      // \u89E6\u53D1\u6E32\u67D3\u4E8B\u4EF6\r
      emit('rendered', composer.value);\r
    };\r
    \r
    // \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
    watch(() => props.enabled, (enabled) => {\r
      if (composer.value) {\r
        if (enabled) {\r
          useFrame(render);\r
        }\r
      }\r
    });\r
    \r
    watch(() => props.renderToScreen, (renderToScreen) => {\r
      if (composer.value) {\r
        // \u83B7\u53D6\u6700\u540E\u4E00\u4E2A\u901A\u9053\r
        const lastPass = composer.value.passes[composer.value.passes.length - 1];\r
        if (lastPass) {\r
          lastPass.renderToScreen = renderToScreen;\r
        }\r
      }\r
    });\r
    \r
    // \u7EC4\u4EF6\u6302\u8F7D\u548C\u5378\u8F7D\r
    onMounted(() => {\r
      // \u521D\u59CB\u5316\u540E\u5904\u7406\r
      init();\r
      \r
      // \u6DFB\u52A0\u5E27\u66F4\u65B0\r
      if (props.enabled) {\r
        useFrame(render);\r
      }\r
      \r
      // \u6DFB\u52A0\u7A97\u53E3\u5927\u5C0F\u53D8\u5316\u76D1\u542C\r
      window.addEventListener('resize', resize);\r
    });\r
    \r
    onBeforeUnmount(() => {\r
      // \u79FB\u9664\u7A97\u53E3\u5927\u5C0F\u53D8\u5316\u76D1\u542C\r
      window.removeEventListener('resize', resize);\r
      \r
      // \u6E05\u7406\u901A\u9053\r
      if (composer.value) {\r
        composer.value.passes.forEach(pass => {\r
          if (pass.dispose) {\r
            pass.dispose();\r
          }\r
        });\r
      }\r
      \r
      // \u6E05\u7406\u5F15\u7528\r
      composer.value = null;\r
      renderPass.value = null;\r
      normalPass.value = null;\r
      smaaPass.value = null;\r
      passes.value = [];\r
    });\r
    \r
    return {\r
      composer,\r
      renderPass,\r
      normalPass,\r
      smaaPass,\r
      passes,\r
      render,\r
      resize\r
    };\r
  }\r
};\r
</script>\r
\r
<template>\r
  <div class="three-post-processing">\r
    <slot \r
      :composer="composer"\r
      :render-pass="renderPass"\r
      :normal-pass="normalPass"\r
      :smaa-pass="smaaPass"\r
      :passes="passes"\r
    ></slot>\r
  </div>\r
</template>\r
\r
<style scoped>\r
.three-post-processing {\r
  display: contents;\r
}\r
</style> `;var F=`<template>\r
  <slot></slot>\r
</template>\r
\r
<script setup lang="ts">\r
import { ref, inject, onMounted, onBeforeUnmount, watch } from 'vue';\r
import * as THREE from 'three';\r
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';\r
import { POST_PROCESSING_CONTEXT_KEY } from '../../constants';\r
import { useThree } from '../../composables/useThree';\r
\r
const props = withDefaults(defineProps<{\r
  /**\r
   * \u8F89\u5149\u5F3A\u5EA6\u3002\u9ED8\u8BA4\u4E3A1\u3002\r
   */\r
  strength?: number;\r
  /**\r
   * \u8F89\u5149\u534A\u5F84\u3002\u9ED8\u8BA4\u4E3A0.7\u3002\r
   */\r
  radius?: number;\r
  /**\r
   * \u8F89\u5149\u9608\u503C\uFF0C\u4F4E\u4E8E\u6B64\u503C\u7684\u4EAE\u5EA6\u4E0D\u4F1A\u4EA7\u751F\u8F89\u5149\u3002\u9ED8\u8BA4\u4E3A0.8\u3002\r
   */\r
  threshold?: number;\r
  /**\r
   * \u8F89\u5149\u5206\u8FA8\u7387\uFF0C\u5F71\u54CD\u6027\u80FD\u548C\u8D28\u91CF\u3002\u9ED8\u8BA4\u4E3A256\u3002\r
   */\r
  resolution?: number;\r
  /**\r
   * \u662F\u5426\u542F\u7528\u3002\u9ED8\u8BA4\u4E3Atrue\u3002\r
   */\r
  enabled?: boolean;\r
}>(), {\r
  strength: 1,\r
  radius: 0.7,\r
  threshold: 0.8,\r
  resolution: 256,\r
  enabled: true\r
});\r
\r
// \u4F7F\u7528three\u7EC4\u5408\u5F0F\u51FD\u6570\r
const { size } = useThree();\r
\r
// \u83B7\u53D6\u540E\u5904\u7406\u4E0A\u4E0B\u6587\r
const postProcessingContext = inject(POST_PROCESSING_CONTEXT_KEY, null);\r
\r
// \u521B\u5EFA\u8F89\u5149\u901A\u9053\r
const bloomPass = ref<UnrealBloomPass | null>(null);\r
\r
// \u521B\u5EFA\u8F89\u5149\u901A\u9053\r
const createBloomPass = () => {\r
  if (!size.value) {\r
    return;\r
  }\r
\r
  // \u521B\u5EFA\u8F89\u5149\u901A\u9053\r
  const resolution = new THREE.Vector2(props.resolution, props.resolution);\r
  bloomPass.value = new UnrealBloomPass(resolution, props.strength, props.radius, props.threshold);\r
  \r
  // \u8BBE\u7F6E\u542F\u7528\u72B6\u6001\r
  if (bloomPass.value) {\r
    bloomPass.value.enabled = props.enabled;\r
  }\r
  \r
  // \u6DFB\u52A0\u5230\u6548\u679C\u5408\u6210\u5668\r
  if (postProcessingContext && bloomPass.value) {\r
    postProcessingContext.addEffectPass(bloomPass.value);\r
  }\r
};\r
\r
// \u66F4\u65B0\u8F89\u5149\u901A\u9053\u914D\u7F6E\r
const updateBloomPassConfig = () => {\r
  if (!bloomPass.value) {\r
    return;\r
  }\r
  \r
  bloomPass.value.strength = props.strength;\r
  bloomPass.value.radius = props.radius;\r
  bloomPass.value.threshold = props.threshold;\r
  bloomPass.value.enabled = props.enabled;\r
  \r
  // \u66F4\u65B0\u5206\u8FA8\u7387\r
  if (props.resolution !== bloomPass.value.resolution.x) {\r
    bloomPass.value.resolution.set(props.resolution, props.resolution);\r
  }\r
};\r
\r
// \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
watch(\r
  () => ({\r
    strength: props.strength,\r
    radius: props.radius,\r
    threshold: props.threshold,\r
    resolution: props.resolution,\r
    enabled: props.enabled\r
  }),\r
  () => {\r
    updateBloomPassConfig();\r
  },\r
  { deep: true }\r
);\r
\r
// \u76D1\u542C\u5C3A\u5BF8\u53D8\u5316\r
watch(\r
  size,\r
  () => {\r
    if (bloomPass.value) {\r
      // \u53EF\u4EE5\u6839\u636E\u5C3A\u5BF8\u8C03\u6574\u5206\u8FA8\u7387\r
    }\r
  }\r
);\r
\r
// \u7EC4\u4EF6\u6302\u8F7D\u65F6\u521B\u5EFA\u8F89\u5149\u901A\u9053\r
onMounted(() => {\r
  createBloomPass();\r
});\r
\r
// \u7EC4\u4EF6\u5378\u8F7D\u65F6\u79FB\u9664\u8F89\u5149\u901A\u9053\r
onBeforeUnmount(() => {\r
  if (postProcessingContext && bloomPass.value) {\r
    postProcessingContext.removeEffectPass(bloomPass.value);\r
  }\r
  \r
  if (bloomPass.value && bloomPass.value.dispose) {\r
    bloomPass.value.dispose();\r
  }\r
  \r
  bloomPass.value = null;\r
});\r
\r
// \u66B4\u9732API\r
defineExpose({\r
  bloomPass\r
});\r
</script> `;var _=`<template>\r
  <slot></slot>\r
</template>\r
\r
<script setup lang="ts">\r
import { ref, inject, onMounted, onBeforeUnmount, watch } from 'vue';\r
import * as THREE from 'three';\r
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';\r
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';\r
import { POST_PROCESSING_CONTEXT_KEY } from '../../constants';\r
import { useThree } from '../../composables/useThree';\r
\r
const props = withDefaults(defineProps<{\r
  /**\r
   * \u662F\u5426\u542F\u7528\u3002\u9ED8\u8BA4\u4E3Atrue\u3002\r
   */\r
  enabled?: boolean;\r
}>(), {\r
  enabled: true\r
});\r
\r
// \u4F7F\u7528three\u7EC4\u5408\u5F0F\u51FD\u6570\r
const { size, renderer } = useThree();\r
\r
// \u83B7\u53D6\u540E\u5904\u7406\u4E0A\u4E0B\u6587\r
const postProcessingContext = inject(POST_PROCESSING_CONTEXT_KEY, null);\r
\r
// \u521B\u5EFAFXAA\u901A\u9053\r
const fxaaPass = ref<ShaderPass | null>(null);\r
\r
// \u521B\u5EFAFXAA\u901A\u9053\r
const createFXAAPass = () => {\r
  if (!size.value) {\r
    return;\r
  }\r
\r
  // \u521B\u5EFAFXAA\u901A\u9053\r
  fxaaPass.value = new ShaderPass(FXAAShader);\r
  \r
  // \u66F4\u65B0\u5206\u8FA8\u7387\r
  updateResolution();\r
  \r
  // \u8BBE\u7F6E\u542F\u7528\u72B6\u6001\r
  if (fxaaPass.value) {\r
    fxaaPass.value.enabled = props.enabled;\r
  }\r
  \r
  // \u6DFB\u52A0\u5230\u6548\u679C\u5408\u6210\u5668\r
  if (postProcessingContext && fxaaPass.value) {\r
    postProcessingContext.addEffectPass(fxaaPass.value);\r
  }\r
};\r
\r
// \u66F4\u65B0\u5206\u8FA8\u7387\r
const updateResolution = () => {\r
  if (!fxaaPass.value || !size.value || !renderer.value) {\r
    return;\r
  }\r
  \r
  const pixelRatio = renderer.value.getPixelRatio();\r
  const uniforms = fxaaPass.value.material.uniforms;\r
  \r
  uniforms['resolution'].value.x = 1 / (size.value.width * pixelRatio);\r
  uniforms['resolution'].value.y = 1 / (size.value.height * pixelRatio);\r
};\r
\r
// \u66F4\u65B0FXAA\u901A\u9053\u914D\u7F6E\r
const updateFXAAPassConfig = () => {\r
  if (!fxaaPass.value) {\r
    return;\r
  }\r
  \r
  fxaaPass.value.enabled = props.enabled;\r
};\r
\r
// \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
watch(\r
  () => ({\r
    enabled: props.enabled\r
  }),\r
  () => {\r
    updateFXAAPassConfig();\r
  },\r
  { deep: true }\r
);\r
\r
// \u76D1\u542C\u5C3A\u5BF8\u53D8\u5316\r
watch(\r
  size,\r
  () => {\r
    updateResolution();\r
  }\r
);\r
\r
// \u7EC4\u4EF6\u6302\u8F7D\u65F6\u521B\u5EFAFXAA\u901A\u9053\r
onMounted(() => {\r
  createFXAAPass();\r
});\r
\r
// \u7EC4\u4EF6\u5378\u8F7D\u65F6\u79FB\u9664FXAA\u901A\u9053\r
onBeforeUnmount(() => {\r
  if (postProcessingContext && fxaaPass.value) {\r
    postProcessingContext.removeEffectPass(fxaaPass.value);\r
  }\r
  \r
  if (fxaaPass.value && fxaaPass.value.dispose) {\r
    fxaaPass.value.dispose();\r
  }\r
  \r
  fxaaPass.value = null;\r
});\r
\r
// \u66B4\u9732API\r
defineExpose({\r
  fxaaPass\r
});\r
</script> `;var D=`<script setup lang="ts">\r
import { ref, watch, onMounted, onBeforeUnmount, inject } from 'vue';\r
import { \r
  EffectComposer, \r
  RenderPass, \r
  DepthOfFieldEffect, \r
  EffectPass \r
} from 'postprocessing';\r
import { Vector2 } from 'three';\r
import { useThree } from '../../composables/useThree';\r
import { POST_PROCESSING_INJECTION_KEY } from './ThreePostProcessing.vue';\r
\r
const props = defineProps<{\r
  enabled?: boolean;\r
  focusDistance?: number;\r
  focalLength?: number;\r
  bokehScale?: number;\r
  height?: number;\r
  width?: number;\r
  blur?: number;\r
  focus?: number;\r
  dof?: boolean;\r
  aperture?: number;\r
  maxBlur?: number;\r
}>();\r
\r
// \u83B7\u53D6Three.js\u6838\u5FC3\u5BF9\u8C61\r
const { scene, camera, renderer } = useThree();\r
\r
// \u83B7\u53D6\u540E\u5904\u7406\u4E0A\u4E0B\u6587\r
const postProcessing = inject(POST_PROCESSING_INJECTION_KEY);\r
\r
// \u6548\u679C\r
const effect = ref<DepthOfFieldEffect | null>(null);\r
const effectPass = ref<EffectPass | null>(null);\r
\r
// \u521B\u5EFA\u6548\u679C\r
const createEffect = () => {\r
  if (!camera.value || !renderer.value || !postProcessing?.composer) return;\r
  \r
  // \u521B\u5EFA\u666F\u6DF1\u6548\u679C\r
  effect.value = new DepthOfFieldEffect(camera.value, {\r
    focusDistance: props.focusDistance || 0.0,\r
    focalLength: props.focalLength || 0.05,\r
    bokehScale: props.bokehScale || 2.0,\r
    height: props.height,\r
    width: props.width,\r
    blur: props.blur,\r
    focus: props.focus,\r
    dof: props.dof,\r
    aperture: props.aperture,\r
    maxBlur: props.maxBlur\r
  });\r
  \r
  // \u521B\u5EFA\u6548\u679C\u901A\u9053\r
  effectPass.value = new EffectPass(camera.value, effect.value);\r
  effectPass.value.enabled = props.enabled !== false;\r
  \r
  // \u6DFB\u52A0\u5230\u5408\u6210\u5668\r
  postProcessing.composer.addPass(effectPass.value);\r
};\r
\r
// \u66F4\u65B0\u6548\u679C\u53C2\u6570\r
const updateEffect = () => {\r
  if (!effect.value) return;\r
  \r
  if (props.focusDistance !== undefined) {\r
    effect.value.focusDistance = props.focusDistance;\r
  }\r
  \r
  if (props.focalLength !== undefined) {\r
    effect.value.focalLength = props.focalLength;\r
  }\r
  \r
  if (props.bokehScale !== undefined) {\r
    effect.value.bokehScale = props.bokehScale;\r
  }\r
  \r
  if (props.blur !== undefined) {\r
    effect.value.blur = props.blur;\r
  }\r
  \r
  if (props.focus !== undefined) {\r
    effect.value.focus = props.focus;\r
  }\r
  \r
  if (props.aperture !== undefined) {\r
    effect.value.aperture = props.aperture;\r
  }\r
  \r
  if (props.maxBlur !== undefined) {\r
    effect.value.maxBlur = props.maxBlur;\r
  }\r
};\r
\r
// \u542F\u7528/\u7981\u7528\u6548\u679C\r
const setEnabled = (enabled: boolean) => {\r
  if (effectPass.value) {\r
    effectPass.value.enabled = enabled;\r
  }\r
};\r
\r
// \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
watch(() => props.enabled, (enabled) => {\r
  setEnabled(enabled !== false);\r
});\r
\r
watch(\r
  () => [\r
    props.focusDistance,\r
    props.focalLength,\r
    props.bokehScale,\r
    props.blur,\r
    props.focus,\r
    props.aperture,\r
    props.maxBlur\r
  ],\r
  () => {\r
    updateEffect();\r
  }\r
);\r
\r
// \u7EC4\u4EF6\u6302\u8F7D\u548C\u5378\u8F7D\r
onMounted(() => {\r
  createEffect();\r
});\r
\r
onBeforeUnmount(() => {\r
  // \u4ECE\u5408\u6210\u5668\u79FB\u9664\u6548\u679C\r
  if (effectPass.value && postProcessing?.composer) {\r
    postProcessing.composer.removePass(effectPass.value);\r
  }\r
});\r
\r
// \u66B4\u9732\u7EC4\u4EF6\u5185\u90E8\u72B6\u6001\u548C\u65B9\u6CD5\r
defineExpose({\r
  effect,\r
  effectPass,\r
  setEnabled,\r
  updateEffect\r
});\r
</script>\r
\r
<template>\r
  <div>\r
    <slot \r
      :effect="effect" \r
      :effect-pass="effectPass"\r
      :set-enabled="setEnabled"\r
    ></slot>\r
  </div>\r
</template> `;var H=`<script setup lang="ts">\r
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';\r
import { useFrame } from '../../composables/useFrame';\r
\r
const props = defineProps<{\r
  enabled?: boolean;\r
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';\r
  showFps?: boolean;\r
  showMs?: boolean;\r
  showMem?: boolean;\r
  showDrawCalls?: boolean;\r
  showTriangles?: boolean;\r
  bgColor?: string;\r
  fgColor?: string;\r
  width?: number;\r
  height?: number;\r
}>();\r
\r
// \u7EDF\u8BA1\u6570\u636E\r
const fps = ref<number>(0);\r
const ms = ref<number>(0);\r
const memory = ref<{\r
  used: number;\r
  total: number;\r
  limit: number;\r
}>({\r
  used: 0,\r
  total: 0,\r
  limit: 0\r
});\r
const drawCalls = ref<number>(0);\r
const triangles = ref<number>(0);\r
\r
// \u8BA1\u65F6\u5668\r
const frames = ref<number>(0);\r
const lastTime = ref<number>(performance.now());\r
const lastFpsUpdate = ref<number>(performance.now());\r
const container = ref<HTMLDivElement | null>(null);\r
const isEnabled = ref<boolean>(props.enabled !== false);\r
\r
// \u66F4\u65B0FPS\r
const updateFps = (time: number) => {\r
  frames.value++;\r
  \r
  // \u6BCF\u79D2\u66F4\u65B0\u4E00\u6B21FPS\r
  if (time - lastFpsUpdate.value >= 1000) {\r
    fps.value = Math.round((frames.value * 1000) / (time - lastFpsUpdate.value));\r
    frames.value = 0;\r
    lastFpsUpdate.value = time;\r
  }\r
};\r
\r
// \u66F4\u65B0\u6E32\u67D3\u65F6\u95F4\r
const updateMs = (time: number, delta: number) => {\r
  ms.value = delta * 1000; // \u8F6C\u6362\u4E3A\u6BEB\u79D2\r
};\r
\r
// \u66F4\u65B0\u5185\u5B58\u4F7F\u7528\r
const updateMemory = () => {\r
  if (window.performance && (performance as any).memory) {\r
    const mem = (performance as any).memory;\r
    memory.value = {\r
      used: Math.round(mem.usedJSHeapSize / (1024 * 1024)),\r
      total: Math.round(mem.totalJSHeapSize / (1024 * 1024)),\r
      limit: Math.round(mem.jsHeapSizeLimit / (1024 * 1024))\r
    };\r
  }\r
};\r
\r
// \u66F4\u65B0\u7ED8\u5236\u8C03\u7528\u548C\u4E09\u89D2\u5F62\u6570\u91CF\r
const updateDrawCalls = () => {\r
  // \u8FD9\u90E8\u5206\u9700\u8981\u8BBF\u95EEThree.js\u7684\u6E32\u67D3\u5668\u4FE1\u606F\r
  // \u5728\u5B9E\u9645\u5E94\u7528\u4E2D\uFF0C\u53EF\u4EE5\u901A\u8FC7useThree\u83B7\u53D6\u6E32\u67D3\u5668\r
  // \u5E76\u8BBF\u95EErenderer.info.render.calls\u548Crenderer.info.render.triangles\r
  // \u7531\u4E8E\u8FD9\u91CC\u6CA1\u6709\u76F4\u63A5\u8BBF\u95EE\u6E32\u67D3\u5668\uFF0C\u6211\u4EEC\u4F7F\u7528\u6A21\u62DF\u6570\u636E\r
  drawCalls.value = Math.round(Math.random() * 100 + 100);\r
  triangles.value = Math.round(Math.random() * 100000 + 50000);\r
};\r
\r
// \u66F4\u65B0\u7EDF\u8BA1\u4FE1\u606F\r
const update = (time: number, delta: number) => {\r
  if (!isEnabled.value) return;\r
  \r
  updateFps(time);\r
  updateMs(time, delta);\r
  \r
  // \u6BCF\u79D2\u66F4\u65B0\u4E00\u6B21\u5185\u5B58\u548C\u7ED8\u5236\u4FE1\u606F\r
  if (time - lastTime.value >= 1000) {\r
    if (props.showMem) {\r
      updateMemory();\r
    }\r
    \r
    if (props.showDrawCalls || props.showTriangles) {\r
      updateDrawCalls();\r
    }\r
    \r
    lastTime.value = time;\r
  }\r
};\r
\r
// \u542F\u7528/\u7981\u7528\u7EDF\u8BA1\r
const setEnabled = (enabled: boolean) => {\r
  isEnabled.value = enabled;\r
  \r
  if (container.value) {\r
    container.value.style.display = enabled ? 'block' : 'none';\r
  }\r
};\r
\r
// \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
watch(() => props.enabled, (enabled) => {\r
  setEnabled(enabled !== false);\r
});\r
\r
// \u7EC4\u4EF6\u6302\u8F7D\u548C\u5378\u8F7D\r
onMounted(() => {\r
  // \u6DFB\u52A0\u5E27\u66F4\u65B0\r
  useFrame(update);\r
  \r
  // \u521D\u59CB\u5316\u663E\u793A\u72B6\u6001\r
  setEnabled(isEnabled.value);\r
});\r
\r
// \u66B4\u9732\u7EC4\u4EF6\u5185\u90E8\u72B6\u6001\u548C\u65B9\u6CD5\r
defineExpose({\r
  fps,\r
  ms,\r
  memory,\r
  drawCalls,\r
  triangles,\r
  isEnabled,\r
  setEnabled\r
});\r
\r
// \u8BA1\u7B97\u4F4D\u7F6E\u6837\u5F0F\r
const positionStyle = () => {\r
  switch (props.position) {\r
    case 'top-right':\r
      return { top: '0', right: '0' };\r
    case 'bottom-left':\r
      return { bottom: '0', left: '0' };\r
    case 'bottom-right':\r
      return { bottom: '0', right: '0' };\r
    case 'top-left':\r
    default:\r
      return { top: '0', left: '0' };\r
  }\r
};\r
</script>\r
\r
<template>\r
  <div \r
    ref="container"\r
    class="three-stats"\r
    :style="{\r
      ...positionStyle(),\r
      width: \`\${props.width || 80}px\`,\r
      backgroundColor: props.bgColor || 'rgba(0, 0, 0, 0.5)',\r
      color: props.fgColor || '#fff'\r
    }"\r
  >\r
    <div v-if="props.showFps" class="stat-item">\r
      <div class="stat-label">FPS</div>\r
      <div class="stat-value">{{ fps }}</div>\r
    </div>\r
    <div v-if="props.showMs" class="stat-item">\r
      <div class="stat-label">MS</div>\r
      <div class="stat-value">{{ ms.toFixed(2) }}</div>\r
    </div>\r
    <div v-if="props.showMem" class="stat-item">\r
      <div class="stat-label">MEM</div>\r
      <div class="stat-value">{{ memory.used }}MB</div>\r
    </div>\r
    <div v-if="props.showDrawCalls" class="stat-item">\r
      <div class="stat-label">CALLS</div>\r
      <div class="stat-value">{{ drawCalls }}</div>\r
    </div>\r
    <div v-if="props.showTriangles" class="stat-item">\r
      <div class="stat-label">TRIS</div>\r
      <div class="stat-value">{{ (triangles / 1000).toFixed(1) }}k</div>\r
    </div>\r
  </div>\r
</template>\r
\r
<style scoped>\r
.three-stats {\r
  position: absolute;\r
  padding: 5px;\r
  font-family: monospace;\r
  font-size: 12px;\r
  z-index: 1000;\r
  pointer-events: none;\r
  border-radius: 3px;\r
}\r
\r
.stat-item {\r
  margin-bottom: 2px;\r
  display: flex;\r
  justify-content: space-between;\r
}\r
\r
.stat-label {\r
  font-weight: bold;\r
  margin-right: 5px;\r
}\r
\r
.stat-value {\r
  text-align: right;\r
}\r
</style> `;var z=`<script>\r
import { ref, onMounted, onBeforeUnmount, provide, watch, InjectionKey } from 'vue';\r
import { Raycaster, Vector2, Object3D, Intersection } from 'three';\r
import { useThree } from '../../composables/useThree';\r
import { useFrame } from '../../composables/useFrame';\r
import { throttle } from '../../utils';\r
import { RaycasterOptions, RaycasterEvent } from '../../types';\r
\r
// \u5C04\u7EBF\u4EA4\u4E92\u6CE8\u5165\u952E\r
const RAYCASTER_INJECTION_KEY = Symbol('raycaster');\r
\r
export { RAYCASTER_INJECTION_KEY };\r
\r
export default {\r
  props: {\r
    enabled: {\r
      type: Boolean,\r
      default: true\r
    },\r
    recursive: {\r
      type: Boolean,\r
      default: false\r
    },\r
    near: {\r
      type: Number,\r
      default: 0\r
    },\r
    far: {\r
      type: Number,\r
      default: Infinity\r
    },\r
    throttleMs: {\r
      type: Number,\r
      default: 0\r
    },\r
    layers: {\r
      type: Number,\r
      default: undefined\r
    },\r
    debug: {\r
      type: Boolean,\r
      default: false\r
    }\r
  },\r
  emits: [\r
    'click',\r
    'dblclick',\r
    'contextmenu',\r
    'pointerdown',\r
    'pointerup',\r
    'pointermove',\r
    'pointerenter',\r
    'pointerleave',\r
    'pointerover',\r
    'pointerout',\r
    'wheel',\r
    'keydown',\r
    'keyup',\r
    'focus',\r
    'blur',\r
    'drag',\r
    'dragstart',\r
    'dragend',\r
    'drop',\r
    'intersect',\r
    'intersectstart',\r
    'intersectend'\r
  ],\r
  setup(props, { emit }) {\r
    // \u5C04\u7EBF\u6295\u5C04\u5668\r
    const raycaster = ref(new Raycaster(undefined, undefined, props.near, props.far));\r
    \r
    // \u9F20\u6807\u4F4D\u7F6E\r
    const pointer = ref(new Vector2(-1, -1));\r
    \r
    // \u4EA4\u53C9\u7ED3\u679C\r
    const intersections = ref([]);\r
    \r
    // \u4E0A\u4E00\u6B21\u4EA4\u53C9\u7684\u5BF9\u8C61\r
    const previousIntersectedObjects = ref([]);\r
    \r
    // \u4EA4\u4E92\u5BF9\u8C61\r
    const interactiveObjects = ref([]);\r
    \r
    // \u83B7\u53D6Three.js\u6838\u5FC3\u5BF9\u8C61\r
    const { scene, camera, renderer } = useThree();\r
    \r
    // \u6DFB\u52A0\u4EA4\u4E92\u5BF9\u8C61\r
    const addInteractiveObject = (object) => {\r
      if (!interactiveObjects.value.includes(object)) {\r
        interactiveObjects.value.push(object);\r
        \r
        if (props.debug) {\r
          console.log('[Raycaster] Added interactive object:', object);\r
        }\r
      }\r
    };\r
    \r
    // \u79FB\u9664\u4EA4\u4E92\u5BF9\u8C61\r
    const removeInteractiveObject = (object) => {\r
      const index = interactiveObjects.value.indexOf(object);\r
      if (index !== -1) {\r
        interactiveObjects.value.splice(index, 1);\r
        \r
        if (props.debug) {\r
          console.log('[Raycaster] Removed interactive object:', object);\r
        }\r
      }\r
    };\r
    \r
    // \u66F4\u65B0\u5C04\u7EBF\u6295\u5C04\u5668\r
    const update = () => {\r
      if (!camera.value || !props.enabled) return;\r
      \r
      // \u8BBE\u7F6E\u5C04\u7EBF\u6295\u5C04\u5668\u7684\u53C2\u6570\r
      raycaster.value.near = props.near;\r
      raycaster.value.far = props.far;\r
      \r
      // \u8BBE\u7F6E\u5C04\u7EBF\u6295\u5C04\u5668\u7684\u5C42\r
      if (props.layers !== undefined) {\r
        raycaster.value.layers.set(props.layers);\r
      }\r
      \r
      // \u4ECE\u76F8\u673A\u548C\u9F20\u6807\u4F4D\u7F6E\u66F4\u65B0\u5C04\u7EBF\r
      raycaster.value.setFromCamera(pointer.value, camera.value);\r
      \r
      // \u83B7\u53D6\u4EA4\u53C9\u7ED3\u679C\r
      let objects = interactiveObjects.value.length > 0 ? interactiveObjects.value : scene.value ? [scene.value] : [];\r
      intersections.value = raycaster.value.intersectObjects(objects, props.recursive);\r
      \r
      // \u5904\u7406\u4EA4\u53C9\u4E8B\u4EF6\r
      handleIntersections();\r
    };\r
    \r
    // \u8282\u6D41\u66F4\u65B0\u51FD\u6570\r
    const throttledUpdate = props.throttleMs > 0 ? throttle(update, props.throttleMs) : update;\r
    \r
    // \u5904\u7406\u4EA4\u53C9\u4E8B\u4EF6\r
    const handleIntersections = () => {\r
      // \u83B7\u53D6\u5F53\u524D\u4EA4\u53C9\u7684\u5BF9\u8C61\r
      const intersectedObjects = intersections.value.map(intersection => intersection.object);\r
      \r
      // \u67E5\u627E\u65B0\u4EA4\u53C9\u7684\u5BF9\u8C61\r
      const newIntersectedObjects = intersectedObjects.filter(\r
        object => !previousIntersectedObjects.value.includes(object)\r
      );\r
      \r
      // \u67E5\u627E\u4E0D\u518D\u4EA4\u53C9\u7684\u5BF9\u8C61\r
      const noLongerIntersectedObjects = previousIntersectedObjects.value.filter(\r
        object => !intersectedObjects.includes(object)\r
      );\r
      \r
      // \u89E6\u53D1\u5F00\u59CB\u4EA4\u53C9\u4E8B\u4EF6\r
      if (newIntersectedObjects.length > 0) {\r
        emit('intersectstart', {\r
          objects: newIntersectedObjects,\r
          intersections: intersections.value.filter(\r
            intersection => newIntersectedObjects.includes(intersection.object)\r
          )\r
        });\r
      }\r
      \r
      // \u89E6\u53D1\u7ED3\u675F\u4EA4\u53C9\u4E8B\u4EF6\r
      if (noLongerIntersectedObjects.length > 0) {\r
        emit('intersectend', {\r
          objects: noLongerIntersectedObjects\r
        });\r
      }\r
      \r
      // \u89E6\u53D1\u4EA4\u53C9\u4E8B\u4EF6\r
      if (intersections.value.length > 0) {\r
        emit('intersect', {\r
          intersections: intersections.value\r
        });\r
      }\r
      \r
      // \u66F4\u65B0\u4E0A\u4E00\u6B21\u4EA4\u53C9\u7684\u5BF9\u8C61\r
      previousIntersectedObjects.value = [...intersectedObjects];\r
    };\r
    \r
    // \u5904\u7406\u9F20\u6807\u4E8B\u4EF6\r
    const handlePointerEvent = (event) => {\r
      if (!renderer.value || !props.enabled) return;\r
      \r
      // \u8BA1\u7B97\u5F52\u4E00\u5316\u7684\u8BBE\u5907\u5750\u6807\r
      const canvas = renderer.value.domElement;\r
      const rect = canvas.getBoundingClientRect();\r
      const x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;\r
      const y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;\r
      \r
      // \u66F4\u65B0\u9F20\u6807\u4F4D\u7F6E\r
      pointer.value.set(x, y);\r
      \r
      // \u66F4\u65B0\u5C04\u7EBF\u6295\u5C04\u5668\r
      throttledUpdate();\r
      \r
      // \u5982\u679C\u6709\u4EA4\u53C9\u7ED3\u679C\uFF0C\u89E6\u53D1\u4E8B\u4EF6\r
      if (intersections.value.length > 0) {\r
        emit(event.type, {\r
          event,\r
          intersections: intersections.value\r
        });\r
      }\r
    };\r
    \r
    // \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
    watch(() => props.enabled, (enabled) => {\r
      if (enabled) {\r
        // \u6DFB\u52A0\u4E8B\u4EF6\u76D1\u542C\r
        if (renderer.value) {\r
          const canvas = renderer.value.domElement;\r
          canvas.addEventListener('click', handlePointerEvent);\r
          canvas.addEventListener('dblclick', handlePointerEvent);\r
          canvas.addEventListener('contextmenu', handlePointerEvent);\r
          canvas.addEventListener('pointerdown', handlePointerEvent);\r
          canvas.addEventListener('pointerup', handlePointerEvent);\r
          canvas.addEventListener('pointermove', handlePointerEvent);\r
          canvas.addEventListener('pointerenter', handlePointerEvent);\r
          canvas.addEventListener('pointerleave', handlePointerEvent);\r
          canvas.addEventListener('wheel', handlePointerEvent);\r
        }\r
      } else {\r
        // \u79FB\u9664\u4E8B\u4EF6\u76D1\u542C\r
        if (renderer.value) {\r
          const canvas = renderer.value.domElement;\r
          canvas.removeEventListener('click', handlePointerEvent);\r
          canvas.removeEventListener('dblclick', handlePointerEvent);\r
          canvas.removeEventListener('contextmenu', handlePointerEvent);\r
          canvas.removeEventListener('pointerdown', handlePointerEvent);\r
          canvas.removeEventListener('pointerup', handlePointerEvent);\r
          canvas.removeEventListener('pointermove', handlePointerEvent);\r
          canvas.removeEventListener('pointerenter', handlePointerEvent);\r
          canvas.removeEventListener('pointerleave', handlePointerEvent);\r
          canvas.removeEventListener('wheel', handlePointerEvent);\r
        }\r
      }\r
    });\r
    \r
    // \u7EC4\u4EF6\u6302\u8F7D\u548C\u5378\u8F7D\r
    onMounted(() => {\r
      // \u63D0\u4F9B\u5C04\u7EBF\u6295\u5C04\u5668\u4E0A\u4E0B\u6587\r
      provide(RAYCASTER_INJECTION_KEY, {\r
        raycaster: raycaster.value,\r
        intersections: intersections.value,\r
        pointer: pointer.value,\r
        addInteractiveObject,\r
        removeInteractiveObject\r
      });\r
      \r
      // \u6DFB\u52A0\u4E8B\u4EF6\u76D1\u542C\r
      if (props.enabled && renderer.value) {\r
        const canvas = renderer.value.domElement;\r
        canvas.addEventListener('click', handlePointerEvent);\r
        canvas.addEventListener('dblclick', handlePointerEvent);\r
        canvas.addEventListener('contextmenu', handlePointerEvent);\r
        canvas.addEventListener('pointerdown', handlePointerEvent);\r
        canvas.addEventListener('pointerup', handlePointerEvent);\r
        canvas.addEventListener('pointermove', handlePointerEvent);\r
        canvas.addEventListener('pointerenter', handlePointerEvent);\r
        canvas.addEventListener('pointerleave', handlePointerEvent);\r
        canvas.addEventListener('wheel', handlePointerEvent);\r
      }\r
      \r
      // \u6DFB\u52A0\u5E27\u66F4\u65B0\r
      useFrame(throttledUpdate);\r
    });\r
    \r
    onBeforeUnmount(() => {\r
      // \u79FB\u9664\u4E8B\u4EF6\u76D1\u542C\r
      if (renderer.value) {\r
        const canvas = renderer.value.domElement;\r
        canvas.removeEventListener('click', handlePointerEvent);\r
        canvas.removeEventListener('dblclick', handlePointerEvent);\r
        canvas.removeEventListener('contextmenu', handlePointerEvent);\r
        canvas.removeEventListener('pointerdown', handlePointerEvent);\r
        canvas.removeEventListener('pointerup', handlePointerEvent);\r
        canvas.removeEventListener('pointermove', handlePointerEvent);\r
        canvas.removeEventListener('pointerenter', handlePointerEvent);\r
        canvas.removeEventListener('pointerleave', handlePointerEvent);\r
        canvas.removeEventListener('wheel', handlePointerEvent);\r
      }\r
      \r
      // \u6E05\u7406\u5F15\u7528\r
      interactiveObjects.value = [];\r
      previousIntersectedObjects.value = [];\r
      intersections.value = [];\r
    });\r
    \r
    return {\r
      raycaster,\r
      pointer,\r
      intersections,\r
      interactiveObjects,\r
      addInteractiveObject,\r
      removeInteractiveObject,\r
      update,\r
      throttledUpdate\r
    };\r
  }\r
};\r
</script>\r
\r
<template>\r
  <div class="three-raycaster">\r
    <slot \r
      :raycaster="raycaster"\r
      :pointer="pointer"\r
      :intersections="intersections"\r
      :interactive-objects="interactiveObjects"\r
      :add-interactive-object="addInteractiveObject"\r
      :remove-interactive-object="removeInteractiveObject"\r
    ></slot>\r
  </div>\r
</template>\r
\r
<style scoped>\r
.three-raycaster {\r
  display: contents;\r
}\r
</style> `;var U=`<script setup lang="ts">\r
import { ref, watch, onMounted, onBeforeUnmount, inject } from 'vue';\r
import { Object3D, Material, Color, Vector3 } from 'three';\r
import { injectThreeParent } from '../../composables';\r
import { RAYCASTER_INJECTION_KEY } from './ThreeRaycaster.vue';\r
import { InteractiveOptions } from '../../types';\r
import { findMaterials } from '../../utils';\r
\r
const props = defineProps<{\r
  enabled?: boolean;\r
  cursor?: string;\r
  hoverColor?: string;\r
  activeColor?: string;\r
  hoverScale?: number;\r
  activeScale?: number;\r
  hoverOpacity?: number;\r
  activeOpacity?: number;\r
}>();\r
\r
const emit = defineEmits<{\r
  click: [event: any];\r
  hover: [event: any];\r
  pointerdown: [event: any];\r
  pointerup: [event: any];\r
  pointerenter: [event: any];\r
  pointerleave: [event: any];\r
}>();\r
\r
// \u83B7\u53D6\u7236\u5BF9\u8C61\u548C\u5C04\u7EBF\u4EA4\u4E92\u7CFB\u7EDF\r
const parent = injectThreeParent();\r
const raycaster = inject(RAYCASTER_INJECTION_KEY);\r
\r
// \u72B6\u6001\r
const isHovered = ref(false);\r
const isActive = ref(false);\r
const originalCursor = ref('');\r
const originalColors = ref<Map<Material, Color>>(new Map());\r
const originalScale = ref<Vector3 | null>(null);\r
const originalOpacities = ref<Map<Material, number>>(new Map());\r
const materials = ref<Material[]>([]);\r
\r
// \u5904\u7406\u60AC\u505C\u4E8B\u4EF6\r
const handlePointerEnter = (event: any) => {\r
  if (!props.enabled) return;\r
  \r
  isHovered.value = true;\r
  \r
  // \u66F4\u6539\u9F20\u6807\u6837\u5F0F\r
  if (props.cursor && typeof document !== 'undefined') {\r
    originalCursor.value = document.body.style.cursor;\r
    document.body.style.cursor = props.cursor;\r
  }\r
  \r
  // \u5E94\u7528\u60AC\u505C\u6548\u679C\r
  applyHoverEffect();\r
  \r
  emit('pointerenter', event);\r
};\r
\r
// \u5904\u7406\u79BB\u5F00\u4E8B\u4EF6\r
const handlePointerLeave = (event: any) => {\r
  if (!props.enabled) return;\r
  \r
  isHovered.value = false;\r
  \r
  // \u6062\u590D\u9F20\u6807\u6837\u5F0F\r
  if (props.cursor && typeof document !== 'undefined') {\r
    document.body.style.cursor = originalCursor.value;\r
  }\r
  \r
  // \u6062\u590D\u539F\u59CB\u6548\u679C\r
  if (!isActive.value) {\r
    resetEffects();\r
  }\r
  \r
  emit('pointerleave', event);\r
};\r
\r
// \u5904\u7406\u70B9\u51FB\u4E8B\u4EF6\r
const handleClick = (event: any) => {\r
  if (!props.enabled) return;\r
  \r
  emit('click', event);\r
};\r
\r
// \u5904\u7406\u6309\u4E0B\u4E8B\u4EF6\r
const handlePointerDown = (event: any) => {\r
  if (!props.enabled) return;\r
  \r
  isActive.value = true;\r
  \r
  // \u5E94\u7528\u6FC0\u6D3B\u6548\u679C\r
  applyActiveEffect();\r
  \r
  emit('pointerdown', event);\r
};\r
\r
// \u5904\u7406\u91CA\u653E\u4E8B\u4EF6\r
const handlePointerUp = (event: any) => {\r
  if (!props.enabled) return;\r
  \r
  isActive.value = false;\r
  \r
  // \u5982\u679C\u4ECD\u7136\u60AC\u505C\uFF0C\u5E94\u7528\u60AC\u505C\u6548\u679C\uFF0C\u5426\u5219\u91CD\u7F6E\r
  if (isHovered.value) {\r
    applyHoverEffect();\r
  } else {\r
    resetEffects();\r
  }\r
  \r
  emit('pointerup', event);\r
};\r
\r
// \u521D\u59CB\u5316\u6750\u8D28\r
const initMaterials = () => {\r
  if (!parent.value) return;\r
  \r
  // \u67E5\u627E\u5BF9\u8C61\u7684\u6240\u6709\u6750\u8D28\r
  materials.value = findMaterials(parent.value);\r
  \r
  // \u4FDD\u5B58\u539F\u59CB\u989C\u8272\u548C\u4E0D\u900F\u660E\u5EA6\r
  materials.value.forEach(material => {\r
    if (material.color) {\r
      originalColors.value.set(material, material.color.clone());\r
    }\r
    if ('opacity' in material) {\r
      originalOpacities.value.set(material, material.opacity);\r
    }\r
  });\r
  \r
  // \u4FDD\u5B58\u539F\u59CB\u7F29\u653E\r
  if (parent.value.scale) {\r
    originalScale.value = parent.value.scale.clone();\r
  }\r
};\r
\r
// \u5E94\u7528\u60AC\u505C\u6548\u679C\r
const applyHoverEffect = () => {\r
  if (!parent.value) return;\r
  \r
  // \u5E94\u7528\u60AC\u505C\u989C\u8272\r
  if (props.hoverColor && materials.value.length > 0) {\r
    materials.value.forEach(material => {\r
      if (material.color) {\r
        material.color.set(props.hoverColor!);\r
      }\r
    });\r
  }\r
  \r
  // \u5E94\u7528\u60AC\u505C\u7F29\u653E\r
  if (props.hoverScale !== undefined && props.hoverScale !== 1 && originalScale.value) {\r
    parent.value.scale.set(\r
      originalScale.value.x * props.hoverScale,\r
      originalScale.value.y * props.hoverScale,\r
      originalScale.value.z * props.hoverScale\r
    );\r
  }\r
  \r
  // \u5E94\u7528\u60AC\u505C\u900F\u660E\u5EA6\r
  if (props.hoverOpacity !== undefined && props.hoverOpacity !== 1) {\r
    materials.value.forEach(material => {\r
      if ('opacity' in material) {\r
        material.opacity = props.hoverOpacity!;\r
        if (props.hoverOpacity! < 1 && 'transparent' in material) {\r
          material.transparent = true;\r
        }\r
      }\r
    });\r
  }\r
};\r
\r
// \u5E94\u7528\u6FC0\u6D3B\u6548\u679C\r
const applyActiveEffect = () => {\r
  if (!parent.value) return;\r
  \r
  // \u5E94\u7528\u6FC0\u6D3B\u989C\u8272\r
  if (props.activeColor && materials.value.length > 0) {\r
    materials.value.forEach(material => {\r
      if (material.color) {\r
        material.color.set(props.activeColor!);\r
      }\r
    });\r
  }\r
  \r
  // \u5E94\u7528\u6FC0\u6D3B\u7F29\u653E\r
  if (props.activeScale !== undefined && props.activeScale !== 1 && originalScale.value) {\r
    parent.value.scale.set(\r
      originalScale.value.x * props.activeScale,\r
      originalScale.value.y * props.activeScale,\r
      originalScale.value.z * props.activeScale\r
    );\r
  }\r
  \r
  // \u5E94\u7528\u6FC0\u6D3B\u900F\u660E\u5EA6\r
  if (props.activeOpacity !== undefined && props.activeOpacity !== 1) {\r
    materials.value.forEach(material => {\r
      if ('opacity' in material) {\r
        material.opacity = props.activeOpacity!;\r
        if (props.activeOpacity! < 1 && 'transparent' in material) {\r
          material.transparent = true;\r
        }\r
      }\r
    });\r
  }\r
};\r
\r
// \u91CD\u7F6E\u6548\u679C\r
const resetEffects = () => {\r
  if (!parent.value) return;\r
  \r
  // \u91CD\u7F6E\u989C\u8272\r
  materials.value.forEach(material => {\r
    if (material.color) {\r
      const originalColor = originalColors.value.get(material);\r
      if (originalColor) {\r
        material.color.copy(originalColor);\r
      }\r
    }\r
  });\r
  \r
  // \u91CD\u7F6E\u7F29\u653E\r
  if (originalScale.value && parent.value.scale) {\r
    parent.value.scale.copy(originalScale.value);\r
  }\r
  \r
  // \u91CD\u7F6E\u900F\u660E\u5EA6\r
  materials.value.forEach(material => {\r
    if ('opacity' in material) {\r
      const originalOpacity = originalOpacities.value.get(material);\r
      if (originalOpacity !== undefined) {\r
        material.opacity = originalOpacity;\r
        if (originalOpacity >= 1 && 'transparent' in material) {\r
          material.transparent = false;\r
        }\r
      }\r
    }\r
  });\r
};\r
\r
// \u7EC4\u4EF6\u6302\u8F7D\u548C\u5378\u8F7D\r
onMounted(() => {\r
  if (parent.value && raycaster) {\r
    // \u521D\u59CB\u5316\u6750\u8D28\r
    initMaterials();\r
    \r
    // \u6CE8\u518C\u4E3A\u4EA4\u4E92\u5BF9\u8C61\r
    raycaster.addInteractiveObject(parent.value);\r
    \r
    // \u6DFB\u52A0\u4E8B\u4EF6\u76D1\u542C\r
    parent.value.addEventListener('click', handleClick);\r
    parent.value.addEventListener('pointerenter', handlePointerEnter);\r
    parent.value.addEventListener('pointerleave', handlePointerLeave);\r
    parent.value.addEventListener('pointerdown', handlePointerDown);\r
    parent.value.addEventListener('pointerup', handlePointerUp);\r
  }\r
});\r
\r
onBeforeUnmount(() => {\r
  if (parent.value && raycaster) {\r
    // \u79FB\u9664\u4EA4\u4E92\u5BF9\u8C61\r
    raycaster.removeInteractiveObject(parent.value);\r
    \r
    // \u79FB\u9664\u4E8B\u4EF6\u76D1\u542C\r
    parent.value.removeEventListener('click', handleClick);\r
    parent.value.removeEventListener('pointerenter', handlePointerEnter);\r
    parent.value.removeEventListener('pointerleave', handlePointerLeave);\r
    parent.value.removeEventListener('pointerdown', handlePointerDown);\r
    parent.value.removeEventListener('pointerup', handlePointerUp);\r
    \r
    // \u91CD\u7F6E\u6548\u679C\r
    resetEffects();\r
    \r
    // \u91CD\u7F6E\u9F20\u6807\u6837\u5F0F\r
    if (props.cursor && typeof document !== 'undefined') {\r
      document.body.style.cursor = originalCursor.value;\r
    }\r
  }\r
});\r
\r
// \u76D1\u542C\u5C5E\u6027\u53D8\u5316\r
watch(() => props.enabled, (enabled) => {\r
  if (!enabled) {\r
    // \u5982\u679C\u7981\u7528\uFF0C\u91CD\u7F6E\u6548\u679C\r
    resetEffects();\r
    \r
    // \u91CD\u7F6E\u9F20\u6807\u6837\u5F0F\r
    if (props.cursor && typeof document !== 'undefined' && isHovered.value) {\r
      document.body.style.cursor = originalCursor.value;\r
    }\r
    \r
    isHovered.value = false;\r
    isActive.value = false;\r
  }\r
});\r
\r
// \u76D1\u542C\u7236\u5BF9\u8C61\u53D8\u5316\r
watch(() => parent.value, (newParent) => {\r
  if (newParent) {\r
    initMaterials();\r
  }\r
});\r
\r
// \u66B4\u9732\u7EC4\u4EF6\u5185\u90E8\u72B6\u6001\r
defineExpose({\r
  isHovered,\r
  isActive,\r
  materials\r
});\r
</script>\r
\r
<template>\r
  <div>\r
    <slot :is-hovered="isHovered" :is-active="isActive"></slot>\r
  </div>\r
</template> `;import{Vector3 as k,Quaternion as V,Euler as W,Color as ve,Box3 as be,Sphere as he}from"three";var Ze=async()=>{if(!navigator.gpu)return!1;try{return!!await navigator.gpu.requestAdapter()}catch(e){return console.error("WebGPU support check failed:",e),!1}},et=e=>{e.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&Y(t.material)}),e.parent&&e.parent.remove(e)},Y=e=>{if(Array.isArray(e)){e.forEach(Y);return}Object.keys(e).forEach(t=>{let o=e[t];o&&o.isTexture&&o.dispose()}),e.dispose()},tt=(e,t)=>{let o=null;return(...a)=>{o!==null&&clearTimeout(o),o=window.setTimeout(()=>{e(...a)},t)}},ot=(e,t)=>{let o=0;return(...a)=>{let p=Date.now();p-o>=t&&(o=p,e(...a))}},G=class{pool=[];createFn;resetFn;maxSize;constructor(t,o,a=0,p=100){this.createFn=t,this.resetFn=o,this.maxSize=p;for(let u=0;u<a;u++)this.pool.push(this.createFn())}get(){return this.pool.length>0?this.pool.pop():this.createFn()}release(t){this.pool.length<this.maxSize&&(this.resetFn(t),this.pool.push(t))}clear(){this.pool=[]}size(){return this.pool.length}},rt=()=>"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{let t=Math.random()*16|0;return(e==="x"?t:t&3|8).toString(16)}),nt=()=>typeof Worker<"u",at=()=>typeof WebAssembly=="object"&&typeof WebAssembly.compile=="function"&&typeof WebAssembly.instantiate=="function",st=()=>typeof SharedArrayBuffer<"u",it=()=>{let e=navigator.hardwareConcurrency||1,t=navigator.deviceMemory||4;return e>=8&&t>=8?"high":e>=4&&t>=4?"medium":"low"},lt=e=>{switch(e){case"high":return{shadows:!0,shadowMapSize:2048,antialias:!0,physicallyCorrectLights:!0,maxLights:8,particleCount:1e4,textureSize:2048,geometryDetail:"high",postProcessing:!0};case"medium":return{shadows:!0,shadowMapSize:1024,antialias:!0,physicallyCorrectLights:!1,maxLights:4,particleCount:5e3,textureSize:1024,geometryDetail:"medium",postProcessing:!0};case"low":default:return{shadows:!1,shadowMapSize:512,antialias:!1,physicallyCorrectLights:!1,maxLights:2,particleCount:1e3,textureSize:512,geometryDetail:"low",postProcessing:!1}}},pt=e=>{let t=(e>>16&255)/255,o=(e>>8&255)/255,a=(e&255)/255;return[t,o,a]},ct=e=>{let t=Math.round(e[0]*255),o=Math.round(e[1]*255),a=Math.round(e[2]*255);return(t<<16)+(o<<8)+a},ut=(e,t,o)=>e+(t-e)*o,dt=(e,t,o)=>Math.max(t,Math.min(o,e)),mt=e=>e*(180/Math.PI),ft=e=>e*(Math.PI/180);function vt(e){return e?new k(e[0],e[1],e[2]):new k}function bt(e){return e?new V(e[0],e[1],e[2],e[3]):new V}function ht(e){return e?new W(e[0],e[1],e[2]):new W}function gt(e){return new ve(e)}function ge(e){return new be().setFromObject(e)}function yt(e){let t=ge(e),o=new he;return t.getBoundingSphere(o),o}import{ref as n,inject as T,computed as ye,readonly as i,onMounted as Ee,onBeforeUnmount as we,provide as Te}from"vue";import*as b from"three";var wt=Symbol("three-render-context"),Tt=Symbol("three-camera-context"),xt=Symbol("three-scene-context"),Ct=Symbol("three-scene-symbol");var St=Symbol("three-geometry-context"),Rt=Symbol("three-geometry-symbol");var Ot=Symbol("three-material-context"),Pt=Symbol("three-material-symbol");var Mt=Symbol("three-mesh-context"),At=Symbol("three-mesh-symbol");var jt=Symbol("three-post-processing-context"),E=Symbol("three-canvas-context");var r={BLOOM:"bloom",DEPTH_OF_FIELD:"depthOfField",SSAO:"ssao",MOTION_BLUR:"motionBlur",OUTLINE:"outline",GLITCH:"glitch",NOISE:"noise",VIGNETTE:"vignette",TONE_MAPPING:"toneMapping",COLOR_CORRECTION:"colorCorrection",SSAA:"ssaa",FXAA:"fxaa",SMAA:"smaa",GOD_RAYS:"godRays",BOKEH:"bokeh",FILM:"film",HDR:"hdr",LUT:"lut",PIXELATE:"pixelate",CHROMATIC_ABERRATION:"chromaticAberration",SELECTIVE_BLOOM:"selectiveBloom",LENS_DISTORTION:"lensDistortion"},Bt=[r.SSAO,r.MOTION_BLUR,r.DEPTH_OF_FIELD,r.BLOOM,r.GOD_RAYS,r.HDR,r.LUT,r.COLOR_CORRECTION,r.CHROMATIC_ABERRATION,r.LENS_DISTORTION,r.NOISE,r.FILM,r.GLITCH,r.PIXELATE,r.VIGNETTE,r.OUTLINE,r.TONE_MAPPING,r.FXAA,r.SMAA,r.SSAA];function Ft(e,t){return Te(e.symbol,t),t}function _t(e){return T(e,null)}function Dt(e){return{parentApi:T(e.symbol,null)}}function K(){let e=T(E);if(!e)return console.error("useThree() \u5FC5\u987B\u5728 ThreeCanvas \u7EC4\u4EF6\u5185\u90E8\u4F7F\u7528"),{engine:n(null),renderer:n(null),scene:n(null),camera:n(null),gl:n(null),size:i(n({width:0,height:0})),viewport:i(n({width:0,height:0,factor:1})),clock:i(n(new b.Clock)),pointer:i(n({x:0,y:0})),raycaster:i(n(new b.Raycaster)),ready:n(!1)};let t=e.engine,o=n(null),a=n(null),p=n(null),u=n(null),c=n({width:0,height:0}),d=ye(()=>{let s=o.value?.getPixelRatio?.()||1;return{width:c.value.width,height:c.value.height,factor:s}}),g=n(new b.Clock),l=n({x:0,y:0}),m=n(new b.Raycaster),y=n(!1),f=s=>{if(!e.containerRef.value)return;let v=e.containerRef.value.getBoundingClientRect(),h,w;"touches"in s?(h=s.touches[0].clientX,w=s.touches[0].clientY):(h=s.clientX,w=s.clientY),l.value.x=(h-v.left)/v.width*2-1,l.value.y=-((w-v.top)/v.height)*2+1},X=async()=>{if(t.value)try{if(o.value=await t.value.getRenderer?.(),a.value=await t.value.getScene?.(),p.value=await t.value.getCamera?.(),u.value=o.value?.getContext?.(),e.containerRef.value){let s=e.containerRef.value.getBoundingClientRect();c.value={width:s.width,height:s.height}}g.value.start(),y.value=!0,e.containerRef.value&&(e.containerRef.value.addEventListener("mousemove",f),e.containerRef.value.addEventListener("touchmove",f))}catch(s){console.error("\u521D\u59CB\u5316 three \u5BF9\u8C61\u5931\u8D25:",s)}},q=(s=[])=>{if(!p.value||!a.value||!m.value)return[];m.value.setFromCamera(l.value,p.value);let v=s.length>0?s:a.value.children.filter(h=>h.visible);return m.value.intersectObjects(v,!0)};return Ee(()=>{t.value&&(X(),t.value.on?.("resize",s=>{c.value=s}))}),we(()=>{e.containerRef.value&&(e.containerRef.value.removeEventListener("mousemove",f),e.containerRef.value.removeEventListener("touchmove",f)),g.value.stop()}),{engine:t,renderer:i(o),scene:i(a),camera:i(p),gl:i(u),size:i(c),viewport:i(d),clock:i(g),pointer:i(l),raycaster:i(m),ready:i(y),raycast:q}}import{inject as xe,onMounted as Ce,onBeforeUnmount as Se,shallowRef as Re}from"vue";function Vt(e,t=0){let o=xe(E);if(!o){console.error("useFrame() \u5FC5\u987B\u5728 ThreeCanvas \u7EC4\u4EF6\u5185\u90E8\u4F7F\u7528");return}let{clock:a,scene:p,camera:u}=K(),c=Re(e),d=null;return Ce(()=>{if(!o.engine?.value)return;let l=o.engine.value,m=y=>{if(!a.value)return;let f=a.value.getDelta();c.value({clock:a.value,scene:p.value,camera:u.value,time:y},f)};l.beforeRender?d=l.beforeRender.subscribe(m,t):console.warn("\u5F15\u64CE\u4E0D\u652F\u6301 beforeRender \u4E8B\u4EF6\u8BA2\u9605")}),Se(()=>{if(!o.engine?.value||d===null)return;let l=o.engine.value;l.beforeRender&&l.beforeRender.unsubscribe(d),d=null}),l=>{c.value=l}}var Oe={install(e){e.component("ThreeCanvas",x),e.component("ThreeScene",C),e.component("ThreeCamera",S),e.component("ThreeMesh",R),e.component("ThreeObject",O),e.component("ThreeResourceManager",P),e.component("ThreeWebGPURenderer",M),e.component("ThreePhysicsWorld",A),e.component("ThreeRigidBody",j),e.component("ThreeBoxCollider",B),e.component("ThreeSphereCollider",I),e.component("ThreeConstraint",L),e.component("ThreePostProcessing",N),e.component("ThreeBloomEffect",F),e.component("ThreeFXAAEffect",_),e.component("ThreeDepthOfFieldEffect",D),e.component("ThreeStats",H),e.component("ThreeRaycaster",z),e.component("ThreeInteractive",U)}};export{G as ObjectPool,Oe as ThreeRenderPlugin,ht as arrayToEuler,bt as arrayToQuaternion,vt as arrayToVector3,dt as clamp,ge as computeBoundingBox,yt as computeBoundingSphere,tt as debounce,ft as degreesToRadians,Y as disposeMaterial,et as disposeObject,rt as generateUUID,it as getDevicePerformanceLevel,lt as getRenderQualitySettings,pt as hexToRgb,_t as injectThreeParent,st as isSharedArrayBufferSupported,at as isWebAssemblySupported,Ze as isWebGPUSupported,nt as isWebWorkerSupported,ut as lerp,mt as radiansToDegrees,ct as rgbToHex,ot as throttle,gt as toColor,Vt as useFrame,Dt as useParent,Ft as useProvideThreeAPI,K as useThree};
//# sourceMappingURL=three-render.esm.js.map
