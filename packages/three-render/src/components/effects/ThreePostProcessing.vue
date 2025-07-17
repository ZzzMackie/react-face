<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, provide, watch } from 'vue';
import * as THREE from 'three';
import { CANVAS_CONTEXT_KEY, POST_PROCESSING_CONTEXT_KEY } from '../../constants';

const props = withDefaults(defineProps<{
  /**
   * 是否启用后处理
   */
  enabled?: boolean;

  /**
   * 渲染尺寸（相对于画布大小）
   * 值小于1会降低渲染分辨率，提高性能
   */
  renderScale?: number;

  /**
   * 是否使用物理正确的曝光控制
   */
  usePhysicalExposure?: boolean;

  /**
   * 曝光值
   */
  exposure?: number;

  /**
   * 是否在移动设备上降低质量
   */
  mobileOptimization?: boolean;

  /**
   * 后处理特效的顺序
   */
  effectsOrder?: string[];

  /**
   * 是否在渲染前清除颜色缓冲区
   */
  autoClear?: boolean;

  /**
   * 是否在渲染前清除深度缓冲区
   */
  autoClearDepth?: boolean;

  /**
   * 是否自动更新效果
   */
  autoUpdate?: boolean;

  /**
   * 着色器精度
   */
  precision?: 'highp' | 'mediump' | 'lowp';
}>(), {
  enabled: true,
  renderScale: 1,
  usePhysicalExposure: false,
  exposure: 1,
  mobileOptimization: true,
  effectsOrder: () => [],
  autoClear: true,
  autoClearDepth: true,
  autoUpdate: true,
  precision: 'highp'
});

const emit = defineEmits<{
  /**
   * 后处理初始化完成
   */
  (e: 'initialized', composer: any): void;

  /**
   * 后处理渲染前
   */
  (e: 'beforeRender'): void;

  /**
   * 后处理渲染后
   */
  (e: 'afterRender'): void;

  /**
   * 后处理错误
   */
  (e: 'error', error: Error): void;
}>();

// 获取 Canvas 上下文
const canvasContext = inject(CANVAS_CONTEXT_KEY);
if (!canvasContext) {
  console.error('ThreePostProcessing must be used within ThreeCanvas');
}

// 后处理实例
const composer = ref<any>(null);

// 效果列表
const effects = ref<any[]>([]);

// 是否为移动设备
const isMobile = ref(false);

// 检测是否为移动设备
onMounted(() => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
});

// 根据移动设备调整渲染比例
const actualRenderScale = () => {
  if (props.mobileOptimization && isMobile.value) {
    return Math.min(props.renderScale, 0.75); // 移动设备降低质量
  }
  return props.renderScale;
};

// 初始化后处理
async function initPostProcessing() {
  try {
    if (!canvasContext?.engine?.value) return;

    // 获取引擎
    const engine = canvasContext.engine.value;

    // 获取后处理管理器
    const composerManager = await engine.getOrCreateManager('composer');
    if (!composerManager) {
      throw new Error('后处理管理器初始化失败，请确保 ThreeCanvas 的 postProcessing 属性设置为 true');
    }

    // 获取后处理实例
    composer.value = composerManager.composer;
    if (!composer.value) {
      throw new Error('后处理实例初始化失败');
    }

    // 配置后处理
    composerManager.configure({
      renderScale: actualRenderScale(),
      usePhysicalExposure: props.usePhysicalExposure,
      exposure: props.exposure,
      autoClear: props.autoClear,
      autoClearDepth: props.autoClearDepth,
      autoUpdate: props.autoUpdate,
      precision: props.precision
    });

    // 添加渲染钩子
    engine.beforeRender.subscribe(() => {
      emit('beforeRender');
    });

    engine.afterRender.subscribe(() => {
      emit('afterRender');
    });

    // 发出初始化完成事件
    emit('initialized', composer.value);
  } catch (error) {
    console.error('后处理初始化失败:', error);
    emit('error', error instanceof Error ? error : new Error(String(error)));
  }
}

// 注册效果
function registerEffect(effect: any) {
  if (effect && !effects.value.includes(effect)) {
    effects.value.push(effect);
    updateEffectsOrder();
  }
}

// 注销效果
function unregisterEffect(effect: any) {
  const index = effects.value.indexOf(effect);
  if (index !== -1) {
    effects.value.splice(index, 1);
    updateEffectsOrder();
  }
}

// 更新效果顺序
function updateEffectsOrder() {
  if (!composer.value || !canvasContext?.engine?.value) return;

  try {
    const engine = canvasContext.engine.value;
    const composerManager = engine.getManager('composer');

    if (!composerManager) return;

    // 如果有自定义顺序，按照自定义顺序排列
    if (props.effectsOrder.length > 0) {
      const orderedEffects: any[] = [];

      // 按照指定顺序排列效果
      for (const effectName of props.effectsOrder) {
        const effect = effects.value.find((e) => e.name === effectName);
        if (effect) {
          orderedEffects.push(effect);
        }
      }

      // 添加未指定顺序的效果
      for (const effect of effects.value) {
        if (!orderedEffects.includes(effect)) {
          orderedEffects.push(effect);
        }
      }

      // 更新效果顺序
      composerManager.setEffects(orderedEffects);
    } else {
      // 直接使用当前效果列表
      composerManager.setEffects(effects.value);
    }
  } catch (error) {
    console.error('更新后处理效果顺序失败:', error);
  }
}

// 监听属性变化
watch(
  () => ({
    enabled: props.enabled,
    renderScale: props.renderScale,
    usePhysicalExposure: props.usePhysicalExposure,
    exposure: props.exposure,
    autoClear: props.autoClear,
    autoClearDepth: props.autoClearDepth,
    autoUpdate: props.autoUpdate,
    precision: props.precision
  }),
  () => {
    if (!composer.value || !canvasContext?.engine?.value) return;

    const engine = canvasContext.engine.value;
    const composerManager = engine.getManager('composer');
    if (!composerManager) return;

    // 更新配置
    composerManager.configure({
      renderScale: actualRenderScale(),
      usePhysicalExposure: props.usePhysicalExposure,
      exposure: props.exposure,
      autoClear: props.autoClear,
      autoClearDepth: props.autoClearDepth,
      autoUpdate: props.autoUpdate,
      precision: props.precision
    });
  },
  { deep: true }
);

// 监听效果顺序变化
watch(
  () => [...props.effectsOrder],
  () => {
    updateEffectsOrder();
  },
  { deep: true }
);

// 生命周期钩子
onMounted(async () => {
  await initPostProcessing();
});

onBeforeUnmount(() => {
  // 清理效果
  effects.value = [];
  updateEffectsOrder();
  composer.value = null;
});

// 提供上下文给子组件
provide(POST_PROCESSING_CONTEXT_KEY, {
  composer,
  registerEffect,
  unregisterEffect
});

// 暴露给父组件的属性和方法
defineExpose({
  composer,
  effects,
  registerEffect,
  unregisterEffect,
  updateEffectsOrder
});
</script> 