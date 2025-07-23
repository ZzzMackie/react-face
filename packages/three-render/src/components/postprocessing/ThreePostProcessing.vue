<script>
import { ref, onMounted, onBeforeUnmount, watch, provide, inject } from 'vue';
import { CANVAS_INJECTION_KEY, SCENE_INJECTION_KEY, CAMERA_INJECTION_KEY, POSTPROCESSING_INJECTION_KEY } from '../../constants';

export default {
  props: {
    enabled: {
      type: Boolean,
      default: true
    }
  },
  emits: ['ready', 'update'],
  setup(props, { emit, slots }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取场景上下文
    const sceneContext = inject(SCENE_INJECTION_KEY, null);
    
    // 获取相机上下文
    const cameraContext = inject(CAMERA_INJECTION_KEY, null);
    
    // 后处理渲染器引用
    const composer = ref(null);
    
    // 效果列表
    const effects = ref([]);
    
    // 添加效果
    const addEffect = (effect) => {
      if (!effect) return;
      
      effects.value.push(effect);
      
      // 如果后处理渲染器已经创建，则更新效果链
      if (composer.value) {
        updateEffectComposer();
      }
    };
    
    // 移除效果
    const removeEffect = (effect) => {
      if (!effect) return;
      
      const index = effects.value.indexOf(effect);
      if (index !== -1) {
        effects.value.splice(index, 1);
        
        // 如果后处理渲染器已经创建，则更新效果链
        if (composer.value) {
          updateEffectComposer();
        }
      }
    };
    
    // 更新后处理渲染器
    const updateEffectComposer = async () => {
      if (!composer.value || !canvasContext || !canvasContext.engine.value) return;
      
      try {
        // 获取Three.js
        const THREE = canvasContext.engine.value.constructor.THREE;
        
        // 清除现有通道
        composer.value.passes = [];
        
        // 添加渲染通道
        const renderPass = new THREE.RenderPass(
          sceneContext.scene.value,
          cameraContext.camera.value
        );
        composer.value.addPass(renderPass);
        
        // 添加效果通道
        for (const effect of effects.value) {
          if (effect.pass) {
            composer.value.addPass(effect.pass);
          }
        }
        
        // 触发更新事件
        emit('update', { composer: composer.value, effects: effects.value });
      } catch (error) {
        console.error('Failed to update effect composer:', error);
      }
    };
    
    // 创建后处理渲染器
    const createEffectComposer = async () => {
      if (!canvasContext || !canvasContext.engine.value || !sceneContext || !cameraContext) return;
      
      try {
        // 动态导入后处理模块
        const THREE = canvasContext.engine.value.constructor.THREE;
        
        // 导入后处理模块
        const { EffectComposer, RenderPass, ShaderPass } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
        
        // 将后处理模块添加到THREE对象上，方便子组件使用
        THREE.EffectComposer = EffectComposer;
        THREE.RenderPass = RenderPass;
        THREE.ShaderPass = ShaderPass;
        
        // 创建后处理渲染器
        composer.value = new EffectComposer(canvasContext.engine.value.renderer);
        
        // 添加渲染通道
        const renderPass = new RenderPass(
          sceneContext.scene.value,
          cameraContext.camera.value
        );
        composer.value.addPass(renderPass);
        
        // 修改引擎的渲染循环
        const originalRender = canvasContext.engine.value.render;
        canvasContext.engine.value.render = () => {
          if (props.enabled && composer.value) {
            composer.value.render();
          } else {
            originalRender();
          }
        };
        
        // 触发就绪事件
        emit('ready', { composer: composer.value });
        
        // 如果有效果，更新效果链
        if (effects.value.length > 0) {
          updateEffectComposer();
        }
      } catch (error) {
        console.error('Failed to create effect composer:', error);
      }
    };
    
    // 监听属性变化
    watch(() => props.enabled, (newValue) => {
      // 触发更新事件
      emit('update', { composer: composer.value, effects: effects.value, enabled: newValue });
    });
    
    // 组件挂载和卸载
    onMounted(async () => {
      // 等待画布、场景和相机准备好
      if (!canvasContext || !canvasContext.engine.value || !sceneContext || !cameraContext) {
        console.error('Canvas, scene or camera context not found');
        return;
      }
      
      // 创建后处理渲染器
      await createEffectComposer();
      
      // 提供后处理上下文
      provide(POSTPROCESSING_INJECTION_KEY, {
        composer,
        effects,
        addEffect,
        removeEffect
      });
    });
    
    onBeforeUnmount(() => {
      if (composer.value && canvasContext && canvasContext.engine.value) {
        // 恢复原始渲染循环
        const originalRender = canvasContext.engine.value._originalRender;
        if (originalRender) {
          canvasContext.engine.value.render = originalRender;
        }
        
        // 释放资源
        composer.value.dispose();
        composer.value = null;
      }
      
      // 清空效果列表
      effects.value = [];
    });
    
    return {
      composer,
      effects,
      addEffect,
      removeEffect
    };
  }
};
</script>

<template>
  <div class="three-post-processing">
    <slot></slot>
  </div>
</template>

<style scoped>
.three-post-processing {
  display: none;
}
</style> 