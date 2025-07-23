<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, inject } from 'vue';
import { POSTPROCESSING_INJECTION_KEY } from '../../constants';

export default {
  props: {
    enabled: {
      type: Boolean,
      default: true
    },
    focusDistance: {
      type: Number,
      default: 10.0
    },
    focalLength: {
      type: Number,
      default: 5.0
    },
    bokehScale: {
      type: Number,
      default: 2.0
    },
    height: {
      type: Number,
      default: 480
    },
    width: {
      type: Number,
      default: 0 // 0表示自动计算
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
    
    // 景深效果引用
    const depthOfFieldEffect = ref(null);
    
    // 调试网格
    const debugMesh = ref(null);
    
    // 创建景深效果
    const createDepthOfFieldEffect = async () => {
      if (!postprocessingContext || !postprocessingContext.composer.value) return;
      
      try {
        // 获取Three.js
        const THREE = postprocessingContext.engine.value.constructor.THREE;
        
        // 动态导入后处理模块
        const { EffectComposer, RenderPass, ShaderPass, BokehPass } = await Promise.all([
          import('three/examples/jsm/postprocessing/EffectComposer.js'),
          import('three/examples/jsm/postprocessing/RenderPass.js'),
          import('three/examples/jsm/postprocessing/ShaderPass.js'),
          import('three/examples/jsm/postprocessing/BokehPass.js')
        ]).then(modules => ({
          EffectComposer: modules[0].EffectComposer,
          RenderPass: modules[1].RenderPass,
          ShaderPass: modules[2].ShaderPass,
          BokehPass: modules[3].BokehPass
        }));
        
        // 创建景深效果
        const composer = postprocessingContext.composer.value;
        const renderer = postprocessingContext.renderer.value;
        const scene = postprocessingContext.scene.value;
        const camera = postprocessingContext.camera.value;
        
        if (!composer || !renderer || !scene || !camera) return;
        
        // 创建景深通道
        const bokehParams = {
          focus: props.focusDistance,
          aperture: 0.025,
          maxblur: props.bokehScale
        };

        const bokehPass = new BokehPass(scene, camera, bokehParams);

        // 设置启用状态
        bokehPass.enabled = props.enabled;
        
        // 添加到后处理器
        composer.addPass(bokehPass);
        
        // 保存引用
        depthOfFieldEffect.value = bokehPass;
        
        // 创建调试网格（如果需要）
        if (props.debug) {
          createDebugMesh(THREE, scene);
        }
        
        // 触发就绪事件
        emit('ready', { effect: depthOfFieldEffect.value });
      } catch (error) {
        console.error('Failed to create depth of field effect:', error);
      }
    };
    
    // 创建调试网格
    const createDebugMesh = (THREE, scene) => {
      // 创建一个平面几何体
      const geometry = new THREE.PlaneGeometry(1, 1);
      
      // 创建材质
      const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        side: THREE.DoubleSide
      });
      
      // 创建网格
      const mesh = new THREE.Mesh(geometry, material);
      
      // 设置位置
      mesh.position.set(0, 0, props.focusDistance);
      
      // 设置大小
      mesh.scale.set(0.5, 0.5, 0.5);
      
      // 添加到场景
      scene.add(mesh);
      
      // 保存引用
      debugMesh.value = mesh;
    };
    
    // 更新调试网格
    const updateDebugMesh = () => {
      if (!debugMesh.value) return;
      
      // 更新位置
      debugMesh.value.position.z = props.focusDistance;
    };
    
    // 更新景深效果
    const updateDepthOfFieldEffect = () => {
      if (!depthOfFieldEffect.value) return;
      
      // 更新焦距
      depthOfFieldEffect.value.uniforms.focus.value = props.focusDistance;
      
      // 更新焦距长度
      depthOfFieldEffect.value.uniforms.focalLength.value = props.focalLength;
      
      // 更新散景缩放
      depthOfFieldEffect.value.uniforms.maxblur.value = props.bokehScale;
      
      // 更新调试网格
      if (props.debug) {
        updateDebugMesh();
      }
      
      // 触发更新事件
      emit('update', { effect: depthOfFieldEffect.value });
    };
    
    // 监听属性变化
    watch(() => props.enabled, (enabled) => {
      if (depthOfFieldEffect.value) {
        depthOfFieldEffect.value.enabled = enabled;
      }
    });
    
    watch(() => props.focusDistance, () => {
      updateDepthOfFieldEffect();
    });
    
    watch(() => props.focalLength, () => {
      updateDepthOfFieldEffect();
    });
    
    watch(() => props.bokehScale, () => {
      updateDepthOfFieldEffect();
    });
    
    watch(() => props.debug, (debug) => {
      if (!postprocessingContext || !postprocessingContext.scene.value) return;
      
      if (debug && !debugMesh.value) {
        // 创建调试网格
        const THREE = postprocessingContext.engine.value.constructor.THREE;
        createDebugMesh(THREE, postprocessingContext.scene.value);
      } else if (!debug && debugMesh.value) {
        // 移除调试网格
        postprocessingContext.scene.value.remove(debugMesh.value);
        debugMesh.value = null;
      }
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      // 等待后处理器就绪
      if (postprocessingContext && postprocessingContext.composer.value) {
        createDepthOfFieldEffect();
      } else {
        // 监听后处理器就绪事件
        const unwatch = watch(() => postprocessingContext && postprocessingContext.composer.value, (composer) => {
          if (composer) {
            createDepthOfFieldEffect();
            unwatch();
          }
        });
      }
    });
    
    onBeforeUnmount(() => {
      // 移除调试网格
      if (debugMesh.value && postprocessingContext && postprocessingContext.scene.value) {
        postprocessingContext.scene.value.remove(debugMesh.value);
        debugMesh.value = null;
      }
      
      // 移除景深效果
      if (depthOfFieldEffect.value && postprocessingContext && postprocessingContext.composer.value) {
        postprocessingContext.composer.value.removePass(depthOfFieldEffect.value);
        depthOfFieldEffect.value = null;
      }
    });
    
    return {
      depthOfFieldEffect,
      debugMesh
    };
  }
};
</script>

<style scoped>
.three-depth-of-field-effect {
  display: none;
}
</style> 