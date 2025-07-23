<template>
  <div class="three-mesh-phong-material"></div>
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
    specular: {
      type: [Number, String],
      default: 0x111111
    },
    shininess: {
      type: Number,
      default: 30
    },
    emissive: {
      type: [Number, String],
      default: 0x000000
    },
    map: {
      type: [String, Object],
      default: null
    },
    normalMap: {
      type: [String, Object],
      default: null
    },
    bumpMap: {
      type: [String, Object],
      default: null
    },
    bumpScale: {
      type: Number,
      default: 1
    },
    specularMap: {
      type: [String, Object],
      default: null
    },
    displacementMap: {
      type: [String, Object],
      default: null
    },
    displacementScale: {
      type: Number,
      default: 1
    },
    emissiveMap: {
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
    wireframe: {
      type: Boolean,
      default: false
    },
    flatShading: {
      type: Boolean,
      default: false
    },
    visible: {
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
          specular: new THREE.Color(props.specular),
          shininess: props.shininess,
          emissive: new THREE.Color(props.emissive),
          transparent: props.transparent,
          opacity: props.opacity,
          wireframe: props.wireframe,
          flatShading: props.flatShading,
          visible: props.visible,
          bumpScale: props.bumpScale,
          displacementScale: props.displacementScale
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
        const textureProps = ['map', 'normalMap', 'bumpMap', 'specularMap', 'displacementMap', 'emissiveMap'];
        for (const prop of textureProps) {
          if (props[prop]) {
            if (typeof props[prop] === 'string') {
              config[prop] = await loadTexture(props[prop]);
            } else {
              config[prop] = props[prop];
            }
          }
        }
        
        // 创建材质
        material.value = new THREE.MeshPhongMaterial(config);
        
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
    
    watch(() => props.specular, (newValue) => {
      if (material.value) {
        material.value.specular.set(newValue);
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.shininess, (newValue) => {
      if (material.value) {
        material.value.shininess = newValue;
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.emissive, (newValue) => {
      if (material.value) {
        material.value.emissive.set(newValue);
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
    
    watch(() => props.flatShading, (newValue) => {
      if (material.value) {
        material.value.flatShading = newValue;
        material.value.needsUpdate = true;
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.visible, (newValue) => {
      if (material.value) {
        material.value.visible = newValue;
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.bumpScale, (newValue) => {
      if (material.value) {
        material.value.bumpScale = newValue;
        emit('update', { material: material.value });
      }
    });
    
    watch(() => props.displacementScale, (newValue) => {
      if (material.value) {
        material.value.displacementScale = newValue;
        emit('update', { material: material.value });
      }
    });
    
    // 纹理属性变化时重新创建材质
    const textureProps = ['map', 'normalMap', 'bumpMap', 'specularMap', 'displacementMap', 'emissiveMap'];
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
.three-mesh-phong-material {
  display: none;
}
</style> 