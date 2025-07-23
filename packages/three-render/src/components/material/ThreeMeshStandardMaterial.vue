<template>
  <div class="three-mesh-standard-material"></div>
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
    roughness: {
      type: Number,
      default: 0.5
    },
    metalness: {
      type: Number,
      default: 0.5
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
    flatShading: {
      type: Boolean,
      default: false
    },
    vertexColors: {
      type: Boolean,
      default: false
    },
    wireframe: {
      type: Boolean,
      default: false
    },
    emissive: {
      type: [Number, String],
      default: 0x000000
    },
    emissiveIntensity: {
      type: Number,
      default: 1
    },
    emissiveMap: {
      type: [String, Object],
      default: null
    },
    normalMap: {
      type: [String, Object],
      default: null
    },
    roughnessMap: {
      type: [String, Object],
      default: null
    },
    metalnessMap: {
      type: [String, Object],
      default: null
    },
    alphaMap: {
      type: [String, Object],
      default: null
    },
    aoMap: {
      type: [String, Object],
      default: null
    },
    aoMapIntensity: {
      type: Number,
      default: 1
    },
    bumpMap: {
      type: [String, Object],
      default: null
    },
    bumpScale: {
      type: Number,
      default: 1
    },
    displacementMap: {
      type: [String, Object],
      default: null
    },
    displacementScale: {
      type: Number,
      default: 1
    },
    envMap: {
      type: [String, Object],
      default: null
    },
    envMapIntensity: {
      type: Number,
      default: 1
    },
    alphaToCoverage: {
      type: Boolean,
      default: false
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
          roughness: props.roughness,
          metalness: props.metalness,
          transparent: props.transparent,
          opacity: props.opacity,
          flatShading: props.flatShading,
          vertexColors: props.vertexColors ? true : false,
          wireframe: props.wireframe,
          emissive: new THREE.Color(props.emissive),
          emissiveIntensity: props.emissiveIntensity,
          aoMapIntensity: props.aoMapIntensity,
          bumpScale: props.bumpScale,
          displacementScale: props.displacementScale,
          envMapIntensity: props.envMapIntensity,
          alphaToCoverage: props.alphaToCoverage
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
        
        if (props.emissiveMap) {
          if (typeof props.emissiveMap === 'string') {
            config.emissiveMap = await loadTexture(props.emissiveMap);
          } else {
            config.emissiveMap = props.emissiveMap;
          }
        }
        
        if (props.normalMap) {
          if (typeof props.normalMap === 'string') {
            config.normalMap = await loadTexture(props.normalMap);
          } else {
            config.normalMap = props.normalMap;
          }
        }
        
        if (props.roughnessMap) {
          if (typeof props.roughnessMap === 'string') {
            config.roughnessMap = await loadTexture(props.roughnessMap);
          } else {
            config.roughnessMap = props.roughnessMap;
          }
        }
        
        if (props.metalnessMap) {
          if (typeof props.metalnessMap === 'string') {
            config.metalnessMap = await loadTexture(props.metalnessMap);
          } else {
            config.metalnessMap = props.metalnessMap;
          }
        }
        
        if (props.alphaMap) {
          if (typeof props.alphaMap === 'string') {
            config.alphaMap = await loadTexture(props.alphaMap);
          } else {
            config.alphaMap = props.alphaMap;
          }
        }
        
        if (props.aoMap) {
          if (typeof props.aoMap === 'string') {
            config.aoMap = await loadTexture(props.aoMap);
          } else {
            config.aoMap = props.aoMap;
          }
        }
        
        if (props.bumpMap) {
          if (typeof props.bumpMap === 'string') {
            config.bumpMap = await loadTexture(props.bumpMap);
          } else {
            config.bumpMap = props.bumpMap;
          }
        }
        
        if (props.displacementMap) {
          if (typeof props.displacementMap === 'string') {
            config.displacementMap = await loadTexture(props.displacementMap);
          } else {
            config.displacementMap = props.displacementMap;
          }
        }
        
        if (props.envMap) {
          if (typeof props.envMap === 'string') {
            config.envMap = await loadTexture(props.envMap);
          } else {
            config.envMap = props.envMap;
          }
        }
        
        // 创建材质
        material.value = new THREE.MeshStandardMaterial(config);
        
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
    
    watch(() => props.roughness, (newValue) => {
      if (material.value) {
        material.value.roughness = newValue;
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.metalness, (newValue) => {
      if (material.value) {
        material.value.metalness = newValue;
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
    
    watch(() => props.flatShading, (newValue) => {
      if (material.value) {
        material.value.flatShading = newValue;
        material.value.needsUpdate = true;
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.wireframe, (newValue) => {
      if (material.value) {
        material.value.wireframe = newValue;
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.emissive, (newValue) => {
      if (material.value) {
        material.value.emissive.set(newValue);
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.emissiveIntensity, (newValue) => {
      if (material.value) {
        material.value.emissiveIntensity = newValue;
        emit('update', { material: material.value });
      }
    });
    
    // 纹理属性变化时重新创建材质
    const textureProps = ['map', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'alphaMap', 'aoMap', 'bumpMap', 'displacementMap', 'envMap'];
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
.three-mesh-standard-material {
  display: none;
}
</style> 