<template>
  <div class="three-texture-loader"></div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount, inject } from 'vue';
import { RESOURCE_MANAGER_INJECTION_KEY } from './ThreeResourceManager.vue';

export default {
  props: {
    url: {
      type: String,
      required: true
    },
    id: {
      type: String,
      default: null
    },
    autoLoad: {
      type: Boolean,
      default: true
    },
    anisotropy: {
      type: Number,
      default: 1
    },
    wrapS: {
      type: [String, Number],
      default: 'ClampToEdgeWrapping'
    },
    wrapT: {
      type: [String, Number],
      default: 'ClampToEdgeWrapping'
    },
    magFilter: {
      type: [String, Number],
      default: 'LinearFilter'
    },
    minFilter: {
      type: [String, Number],
      default: 'LinearMipmapLinearFilter'
    },
    flipY: {
      type: Boolean,
      default: true
    },
    encoding: {
      type: [String, Number],
      default: null
    },
    generateMipmaps: {
      type: Boolean,
      default: true
    }
  },
  emits: ['ready', 'load', 'error', 'dispose'],
  setup(props, { emit }) {
    // 获取资源管理器
    const resourceManager = inject(RESOURCE_MANAGER_INJECTION_KEY, null);
    
    // 纹理引用
    const texture = ref(null);
    
    // 加载纹理
    const loadTexture = async () => {
      if (!resourceManager) {
        console.error('ResourceManager not found');
        return;
      }
      
      try {
        // 获取资源ID
        const id = props.id || props.url;
        
        // 加载纹理
        const loadedTexture = await resourceManager.loadTexture(props.url, id);
        
        // 应用纹理参数
        applyTextureSettings(loadedTexture);
        
        // 保存引用
        texture.value = loadedTexture;
        
        // 触发加载完成事件
        emit('load', { texture: texture.value, id });
      } catch (error) {
        console.error('Failed to load texture:', error);
        emit('error', { error, url: props.url });
      }
    };
    
    // 应用纹理设置
    const applyTextureSettings = (texture) => {
      if (!texture) return;
      
      // 获取THREE.js常量
      const THREE = resourceManager.loaders.texture.manager.constructor;
      
      // 设置各种纹理属性
      texture.anisotropy = props.anisotropy;
      texture.generateMipmaps = props.generateMipmaps;
      texture.flipY = props.flipY;
      
      // 设置包装模式
      if (typeof props.wrapS === 'string') {
        texture.wrapS = THREE[props.wrapS] || THREE.ClampToEdgeWrapping;
      } else {
        texture.wrapS = props.wrapS;
      }
      
      if (typeof props.wrapT === 'string') {
        texture.wrapT = THREE[props.wrapT] || THREE.ClampToEdgeWrapping;
      } else {
        texture.wrapT = props.wrapT;
      }
      
      // 设置过滤器
      if (typeof props.magFilter === 'string') {
        texture.magFilter = THREE[props.magFilter] || THREE.LinearFilter;
      } else {
        texture.magFilter = props.magFilter;
      }
      
      if (typeof props.minFilter === 'string') {
        texture.minFilter = THREE[props.minFilter] || THREE.LinearMipmapLinearFilter;
      } else {
        texture.minFilter = props.minFilter;
      }
      
      // 设置编码
      if (props.encoding && typeof props.encoding === 'string') {
        texture.encoding = THREE[props.encoding] || THREE.LinearEncoding;
      } else if (props.encoding !== null) {
        texture.encoding = props.encoding;
      }
      
      // 更新纹理
      texture.needsUpdate = true;
    };
    
    // 销毁纹理
    const disposeTexture = () => {
      if (!resourceManager || !texture.value) return;
      
      // 获取资源ID
      const id = props.id || props.url;
      
      // 移除资源
      resourceManager.removeResource(id);
      
      // 清空引用
      texture.value = null;
      
      // 触发销毁事件
      emit('dispose', { id });
    };
    
    // 监听URL变化
    watch(() => props.url, () => {
      if (props.autoLoad) {
        // 先处理旧的纹理
        disposeTexture();
        
        // 加载新的纹理
        loadTexture();
      }
    });
    
    // 监听设置变化
    watch(
      () => [
        props.anisotropy,
        props.wrapS,
        props.wrapT,
        props.magFilter,
        props.minFilter,
        props.flipY,
        props.encoding,
        props.generateMipmaps
      ],
      () => {
        if (texture.value) {
          applyTextureSettings(texture.value);
        }
      }
    );
    
    // 组件挂载和卸载
    onMounted(() => {
      // 等待资源管理器就绪
      if (!resourceManager) {
        console.error('ResourceManager not found');
        emit('error', { error: new Error('ResourceManager not found'), url: props.url });
        return;
      }
      
      // 当资源管理器就绪时触发
      emit('ready', { resourceManager });
      
      // 自动加载
      if (props.autoLoad) {
        loadTexture();
      }
    });
    
    onBeforeUnmount(() => {
      disposeTexture();
    });
    
    // 导出方法
    return {
      texture,
      loadTexture,
      disposeTexture
    };
  }
};
</script>

<style scoped>
.three-texture-loader {
  display: none;
}
</style> 