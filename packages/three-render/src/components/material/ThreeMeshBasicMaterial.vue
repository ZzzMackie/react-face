<template>
  <div class="three-mesh-basic-material"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, inject } from 'vue';
import { CANVAS_INJECTION_KEY, PARENT_INJECTION_KEY } from '../../constants';

export default {
  props: {
    color: {
      type: [Number, String],
      default: 0xffffff
    },
    map: {
      type: [String, Object],
      default: null
    },
    transparent: {
      type: Boolean,
      default: false
    },
    opacity: {
      type: Number,
      default: 1
    },
    side: {
      type: String,
      default: 'front',
      validator: (value) => ['front', 'back', 'double'].includes(value)
    },
    vertexColors: {
      type: Boolean,
      default: false
    },
    wireframe: {
      type: Boolean,
      default: false
    },
    alphaMap: {
      type: [String, Object],
      default: null
    },
    alphaTest: {
      type: Number,
      default: 0
    },
    visible: {
      type: Boolean,
      default: true
    },
    depthTest: {
      type: Boolean,
      default: true
    },
    depthWrite: {
      type: Boolean,
      default: true
    },
    fog: {
      type: Boolean,
      default: true
    }
  },
  emits: ['ready', 'update'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 材质引用
    const material = ref(null);
    
    // 纹理缓存
    const textureCache = new Map();
    
    // 加载纹理
    const loadTexture = async (url) => {
      if (!canvasContext || !canvasContext.engine.value) return null;
      
      // 检查缓存
      if (textureCache.has(url)) {
        return textureCache.get(url);
      }
      
      try {
        // 获取资源管理器
        const resourceManager = await canvasContext.engine.value.getOrCreateManager('resource');
        
        // 加载纹理
        const texture = await resourceManager.loadTexture(url);
        
        // 缓存纹理
        textureCache.set(url, texture);
        
        return texture;
      } catch (error) {
        console.error(`Failed to load texture: ${url}`, error);
        return null;
      }
    };
    
    // 创建材质
    const createMaterial = async () => {
      if (!canvasContext || !canvasContext.engine.value) return;
      
      try {
        // 获取资源管理器
        const resourceManager = await canvasContext.engine.value.getOrCreateManager('resource');
        
        // 获取Three.js
        const THREE = canvasContext.engine.value.constructor.THREE;
        
        // 创建基本配置
        const config = {
          color: new THREE.Color(props.color),
          transparent: props.transparent,
          opacity: props.opacity,
          vertexColors: props.vertexColors ? true : false,
          wireframe: props.wireframe,
          alphaTest: props.alphaTest,
          visible: props.visible,
          depthTest: props.depthTest,
          depthWrite: props.depthWrite,
          fog: props.fog
        };
        
        // 设置面渲染模式
        if (props.side === 'front') {
          config.side = THREE.FrontSide;
        } else if (props.side === 'back') {
          config.side = THREE.BackSide;
        } else if (props.side === 'double') {
          config.side = THREE.DoubleSide;
        }
        
        // 加载纹理
        if (props.map) {
          if (typeof props.map === 'string') {
            config.map = await loadTexture(props.map);
          } else {
            config.map = props.map;
          }
        }
        
        if (props.alphaMap) {
          if (typeof props.alphaMap === 'string') {
            config.alphaMap = await loadTexture(props.alphaMap);
          } else {
            config.alphaMap = props.alphaMap;
          }
        }
        
        // 创建材质
        material.value = new THREE.MeshBasicMaterial(config);
        
        // 如果有父对象且是网格，设置其材质
        if (parentContext && parentContext.object && parentContext.object.type === 'Mesh') {
          parentContext.object.material = material.value;
        }
        
        // 触发就绪事件
        emit('ready', { material: material.value });
      } catch (error) {
        console.error('Failed to create material:', error);
      }
    };
    
    // 更新材质
    const updateMaterial = async () => {
      await createMaterial();
      emit('update', { material: material.value });
    };
    
    // 监听属性变化
    // 只监听基本属性，纹理属性变化时重新创建材质
    watch(() => props.color, (newValue) => {
      if (material.value) {
        material.value.color.set(newValue);
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.transparent, (newValue) => {
      if (material.value) {
        material.value.transparent = newValue;
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.opacity, (newValue) => {
      if (material.value) {
        material.value.opacity = newValue;
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.side, (newValue) => {
      if (material.value) {
        const THREE = canvasContext.engine.value.constructor.THREE;
        if (newValue === 'front') {
          material.value.side = THREE.FrontSide;
        } else if (newValue === 'back') {
          material.value.side = THREE.BackSide;
        } else if (newValue === 'double') {
          material.value.side = THREE.DoubleSide;
        }
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.wireframe, (newValue) => {
      if (material.value) {
        material.value.wireframe = newValue;
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.visible, (newValue) => {
      if (material.value) {
        material.value.visible = newValue;
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.depthTest, (newValue) => {
      if (material.value) {
        material.value.depthTest = newValue;
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.depthWrite, (newValue) => {
      if (material.value) {
        material.value.depthWrite = newValue;
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.fog, (newValue) => {
      if (material.value) {
        material.value.fog = newValue;
        emit('update', { material: material.value });
      }
    });
    
    // 纹理属性变化时重新创建材质
    const textureProps = ['map', 'alphaMap'];
    textureProps.forEach((prop) => {
      watch(() => props[prop], updateMaterial);
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      createMaterial();
    });
    
    onBeforeUnmount(() => {
      if (material.value) {
        // 如果有父对象且是网格，移除其材质
        if (parentContext && parentContext.object && parentContext.object.type === 'Mesh') {
          parentContext.object.material = null;
        }
        
        // 释放资源
        material.value.dispose();
        
        // 清除纹理缓存
        for (const texture of textureCache.values()) {
          texture.dispose();
        }
        textureCache.clear();
        
        material.value = null;
      }
    });
    
    return {
      material
    };
  }
};
</script>

<style scoped>
.three-mesh-basic-material {
  display: none;
}
</style> 