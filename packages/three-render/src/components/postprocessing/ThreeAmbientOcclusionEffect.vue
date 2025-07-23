<template>
  <div class="three-ambient-occlusion-effect"></div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount, inject } from 'vue';
import { POSTPROCESSING_INJECTION_KEY } from '../../constants';

export default {
  props: {
    enabled: {
      type: Boolean,
      default: true
    },
    samples: {
      type: Number,
      default: 16
    },
    radius: {
      type: Number,
      default: 0.5
    },
    intensity: {
      type: Number,
      default: 1.0
    },
    bias: {
      type: Number,
      default: 0.5
    },
    scale: {
      type: Number,
      default: 1.0
    },
    blurRadius: {
      type: Number,
      default: 0
    },
    blurStdDev: {
      type: Number,
      default: 0.6
    },
    kernelSize: {
      type: Number,
      default: 8
    },
    minResolution: {
      type: Number,
      default: 0
    },
    color: {
      type: [Number, String],
      default: 0x000000
    },
    debug: {
      type: Boolean,
      default: false
    }
  },
  emits: ['ready', 'update'],
  setup(props, { emit }) {
    // 获取后处理上下文
    const postprocessingContext = inject(POSTPROCESSING_INJECTION_KEY, null);
    
    // 环境光遮蔽效果引用
    const aoEffect = ref(null);
    
    // 创建环境光遮蔽效果
    const createAmbientOcclusionEffect = async () => {
      if (!postprocessingContext || !postprocessingContext.composer.value) return;
      
      try {
        // 获取Three.js
        const THREE = postprocessingContext.engine.value.constructor.THREE;
        
        // 动态导入后处理模块
        const { SSAOPass } = await import('three/examples/jsm/postprocessing/SSAOPass.js');
        
        // 创建环境光遮蔽效果
        const composer = postprocessingContext.composer.value;
        const renderer = postprocessingContext.renderer.value;
        const scene = postprocessingContext.scene.value;
        const camera = postprocessingContext.camera.value;
        
        if (!composer || !renderer || !scene || !camera) return;
        
        // 获取画布尺寸
        const size = renderer.getSize(new THREE.Vector2());
        
        // 创建SSAO通道
        const ssaoPass = new SSAOPass(scene, camera, size.width, size.height);
        
        // 设置参数
        ssaoPass.kernelRadius = props.radius;
        ssaoPass.minDistance = props.bias;
        ssaoPass.maxDistance = props.scale;
        
        if (props.blurRadius > 0) {
          ssaoPass.output = SSAOPass.OUTPUT.Blur;
        } else {
          ssaoPass.output = SSAOPass.OUTPUT.Default;
        }
        
        // 设置启用状态
        ssaoPass.enabled = props.enabled;
        
        // 添加到后处理器
        composer.addPass(ssaoPass);
        
        // 保存引用
        aoEffect.value = ssaoPass;
        
        // 触发就绪事件
        emit('ready', { effect: aoEffect.value });
      } catch (error) {
        console.error('Failed to create ambient occlusion effect:', error);
      }
    };
    
    // 更新环境光遮蔽效果
    const updateAmbientOcclusionEffect = () => {
      if (!aoEffect.value) return;
      
      // 更新参数
      aoEffect.value.kernelRadius = props.radius;
      aoEffect.value.minDistance = props.bias;
      aoEffect.value.maxDistance = props.scale;
      
      // 更新输出模式
      if (props.blurRadius > 0) {
        aoEffect.value.output = aoEffect.value.constructor.OUTPUT.Blur;
      } else {
        aoEffect.value.output = aoEffect.value.constructor.OUTPUT.Default;
      }
      
      // 触发更新事件
      emit('update', { effect: aoEffect.value });
    };
    
    // 监听属性变化
    watch(() => props.enabled, (enabled) => {
      if (aoEffect.value) {
        aoEffect.value.enabled = enabled;
      }
    });
    
    watch(() => [props.radius, props.bias, props.scale, props.blurRadius], () => {
      updateAmbientOcclusionEffect();
    }, { deep: true });
    
    watch(() => props.debug, (debug) => {
      if (!aoEffect.value) return;
      
      // 切换输出模式
      if (debug) {
        aoEffect.value.output = aoEffect.value.constructor.OUTPUT.SSAO;
      } else {
        aoEffect.value.output = props.blurRadius > 0 ? aoEffect.value.constructor.OUTPUT.Blur : aoEffect.value.constructor.OUTPUT.Default;
      }
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      // 等待后处理器就绪
      if (postprocessingContext && postprocessingContext.composer.value) {
        createAmbientOcclusionEffect();
      } else {
        // 监听后处理器就绪事件
        const unwatch = watch(() => postprocessingContext && postprocessingContext.composer.value, (composer) => {
          if (composer) {
            createAmbientOcclusionEffect();
            unwatch();
          }
        });
      }
    });
    
    onBeforeUnmount(() => {
      // 移除环境光遮蔽效果
      if (aoEffect.value && postprocessingContext && postprocessingContext.composer.value) {
        postprocessingContext.composer.value.removePass(aoEffect.value);
        aoEffect.value = null;
      }
    });
    
    return {
      aoEffect
    };
  }
};
</script>

<style scoped>
.three-ambient-occlusion-effect {
  display: none;
}
</style> 