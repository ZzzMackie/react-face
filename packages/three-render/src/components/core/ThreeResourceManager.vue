<script>
import { ref, onMounted, onBeforeUnmount, provide, InjectionKey } from 'vue';
import {
  Texture,
  Material,
  BufferGeometry,
  Object3D,
  Scene
} from 'three';
import { useThree } from '../../composables/useThree';
import { disposeObject, disposeMaterial } from '../../utils';

// 资源管理器注入键
export const RESOURCE_MANAGER_INJECTION_KEY = Symbol('resource-manager');

export default {
  props: {
    autoDispose: {
      type: Boolean,
      default: false
    },
    disposeInterval: {
      type: Number,
      default: 60000
    },
    debug: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // 资源集合
    const textures = ref(new Map());
    const materials = ref(new Map());
    const geometries = ref(new Map());
    const objects = ref(new Map());

    // 获取Three.js核心对象
    const { scene } = useThree();

    // 注册纹理
    const registerTexture = (id, texture) => {
      textures.value.set(id, { resource: texture, lastUsed: Date.now() });
      if (props.debug) {
        console.log(`[ResourceManager] Registered texture: ${id}`);
      }
    };

    // 注销纹理
    const unregisterTexture = (id) => {
      const textureEntry = textures.value.get(id);
      if (textureEntry) {
        textureEntry.resource.dispose();
        textures.value.delete(id);
        if (props.debug) {
          console.log(`[ResourceManager] Unregistered texture: ${id}`);
        }
      }
    };

    // 获取纹理
    const getTexture = (id) => {
      const textureEntry = textures.value.get(id);
      if (textureEntry) {
        textureEntry.lastUsed = Date.now();
        return textureEntry.resource;
      }
      return undefined;
    };

    // 注册材质
    const registerMaterial = (id, material) => {
      materials.value.set(id, { resource: material, lastUsed: Date.now() });
      if (props.debug) {
        console.log(`[ResourceManager] Registered material: ${id}`);
      }
    };

    // 注销材质
    const unregisterMaterial = (id) => {
      const materialEntry = materials.value.get(id);
      if (materialEntry) {
        disposeMaterial(materialEntry.resource);
        materials.value.delete(id);
        if (props.debug) {
          console.log(`[ResourceManager] Unregistered material: ${id}`);
        }
      }
    };

    // 获取材质
    const getMaterial = (id) => {
      const materialEntry = materials.value.get(id);
      if (materialEntry) {
        materialEntry.lastUsed = Date.now();
        return materialEntry.resource;
      }
      return undefined;
    };

    // 注册几何体
    const registerGeometry = (id, geometry) => {
      geometries.value.set(id, { resource: geometry, lastUsed: Date.now() });
      if (props.debug) {
        console.log(`[ResourceManager] Registered geometry: ${id}`);
      }
    };

    // 注销几何体
    const unregisterGeometry = (id) => {
      const geometryEntry = geometries.value.get(id);
      if (geometryEntry) {
        geometryEntry.resource.dispose();
        geometries.value.delete(id);
        if (props.debug) {
          console.log(`[ResourceManager] Unregistered geometry: ${id}`);
        }
      }
    };

    // 获取几何体
    const getGeometry = (id) => {
      const geometryEntry = geometries.value.get(id);
      if (geometryEntry) {
        geometryEntry.lastUsed = Date.now();
        return geometryEntry.resource;
      }
      return undefined;
    };

    // 注册对象
    const registerObject = (id, object) => {
      objects.value.set(id, { resource: object, lastUsed: Date.now() });
      if (props.debug) {
        console.log(`[ResourceManager] Registered object: ${id}`);
      }
    };

    // 注销对象
    const unregisterObject = (id) => {
      const objectEntry = objects.value.get(id);
      if (objectEntry) {
        disposeObject(objectEntry.resource);
        objects.value.delete(id);
        if (props.debug) {
          console.log(`[ResourceManager] Unregistered object: ${id}`);
        }
      }
    };

    // 获取对象
    const getObject = (id) => {
      const objectEntry = objects.value.get(id);
      if (objectEntry) {
        objectEntry.lastUsed = Date.now();
        return objectEntry.resource;
      }
      return undefined;
    };

    // 处理未使用的资源
    const disposeUnused = (maxAge = 60000) => { // 默认60秒未使用则释放
      const now = Date.now();
      
      // 处理纹理
      textures.value.forEach((entry, id) => {
        if (now - entry.lastUsed > maxAge) {
          unregisterTexture(id);
        }
      });
      
      // 处理材质
      materials.value.forEach((entry, id) => {
        if (now - entry.lastUsed > maxAge) {
          unregisterMaterial(id);
        }
      });
      
      // 处理几何体
      geometries.value.forEach((entry, id) => {
        if (now - entry.lastUsed > maxAge) {
          unregisterGeometry(id);
        }
      });
      
      // 处理对象
      objects.value.forEach((entry, id) => {
        if (now - entry.lastUsed > maxAge) {
          unregisterObject(id);
        }
      });
      
      if (props.debug) {
        console.log(`[ResourceManager] Disposed unused resources. Remaining: textures=${textures.value.size}, materials=${materials.value.size}, geometries=${geometries.value.size}, objects=${objects.value.size}`);
      }
    };

    // 释放所有资源
    const disposeAll = () => {
      // 处理纹理
      textures.value.forEach((entry, id) => {
        unregisterTexture(id);
      });
      
      // 处理材质
      materials.value.forEach((entry, id) => {
        unregisterMaterial(id);
      });
      
      // 处理几何体
      geometries.value.forEach((entry, id) => {
        unregisterGeometry(id);
      });
      
      // 处理对象
      objects.value.forEach((entry, id) => {
        unregisterObject(id);
      });
      
      if (props.debug) {
        console.log('[ResourceManager] Disposed all resources');
      }
    };

    // 自动处理未使用的资源
    let disposeInterval = null;

    // 组件挂载和卸载
    onMounted(() => {
      if (props.autoDispose && props.disposeInterval) {
        disposeInterval = window.setInterval(() => {
          disposeUnused();
        }, props.disposeInterval);
      }
      
      // 提供资源管理器给子组件
      provide(RESOURCE_MANAGER_INJECTION_KEY, {
        registerTexture,
        unregisterTexture,
        getTexture,
        registerMaterial,
        unregisterMaterial,
        getMaterial,
        registerGeometry,
        unregisterGeometry,
        getGeometry,
        registerObject,
        unregisterObject,
        getObject,
        disposeUnused,
        disposeAll
      });
    });

    onBeforeUnmount(() => {
      // 清理定时器
      if (disposeInterval !== null) {
        clearInterval(disposeInterval);
      }
      
      // 释放所有资源
      disposeAll();
    });

    return {
      textures,
      materials,
      geometries,
      objects,
      registerTexture,
      unregisterTexture,
      getTexture,
      registerMaterial,
      unregisterMaterial,
      getMaterial,
      registerGeometry,
      unregisterGeometry,
      getGeometry,
      registerObject,
      unregisterObject,
      getObject,
      disposeUnused,
      disposeAll
    };
  }
};
</script>

<template>
  <div class="three-resource-manager">
    <slot 
      :textures="textures"
      :materials="materials"
      :geometries="geometries"
      :objects="objects"
      :register-texture="registerTexture"
      :unregister-texture="unregisterTexture"
      :get-texture="getTexture"
      :register-material="registerMaterial"
      :unregister-material="unregisterMaterial"
      :get-material="getMaterial"
      :register-geometry="registerGeometry"
      :unregister-geometry="unregisterGeometry"
      :get-geometry="getGeometry"
      :register-object="registerObject"
      :unregister-object="unregisterObject"
      :get-object="getObject"
      :dispose-unused="disposeUnused"
      :dispose-all="disposeAll"
    ></slot>
  </div>
</template>

<style scoped>
.three-resource-manager {
  display: contents;
}
</style> 