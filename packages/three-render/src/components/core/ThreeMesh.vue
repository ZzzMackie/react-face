<script>
import { ref, onMounted, onBeforeUnmount, watch, provide, inject } from 'vue';
import { CANVAS_INJECTION_KEY, PARENT_INJECTION_KEY } from '../../constants';

export default {
  props: {
    position: {
      type: Array,
      default: () => [0, 0, 0]
    },
    rotation: {
      type: Array,
      default: () => [0, 0, 0]
    },
    scale: {
      type: Array,
      default: () => [1, 1, 1]
    },
    visible: {
      type: Boolean,
      default: true
    },
    castShadow: {
      type: Boolean,
      default: false
    },
    receiveShadow: {
      type: Boolean,
      default: false
    },
    userData: {
      type: Object,
      default: () => ({})
    },
    name: {
      type: String,
      default: ''
    },
    matrixAutoUpdate: {
      type: Boolean,
      default: true
    },
    renderOrder: {
      type: Number,
      default: 0
    },
    frustumCulled: {
      type: Boolean,
      default: true
    },
    interactive: {
      type: Boolean,
      default: false
    }
  },
  emits: ['ready', 'click', 'pointerenter', 'pointerleave', 'update'],
  setup(props, { emit }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取父对象
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 网格引用
    const mesh = ref(null);
    const geometry = ref(null);
    const material = ref(null);
    
    // 创建网格
    const createMesh = async () => {
      if (!canvasContext || !canvasContext.engine.value) return;
      
      try {
        // 获取对象管理器
        const objectManager = await canvasContext.engine.value.getOrCreateManager('object3d');
        
        // 创建网格
        mesh.value = objectManager.createMesh();
        
        // 设置网格属性
        updateMesh();
        
        // 如果有父对象，添加到父对象
        if (parentContext && parentContext.object) {
          parentContext.object.add(mesh.value);
        }
        
        // 如果启用了交互，添加到射线投射器
        if (props.interactive) {
          const raycasterManager = await canvasContext.engine.value.getOrCreateManager('raycaster');
          if (raycasterManager) {
            raycasterManager.addObject(mesh.value);
            
            // 添加事件监听器
            mesh.value.userData.onPointerClick = (event) => {
              emit('click', { event, mesh: mesh.value });
            };
            
            mesh.value.userData.onPointerEnter = (event) => {
              emit('pointerenter', { event, mesh: mesh.value });
            };
            
            mesh.value.userData.onPointerLeave = (event) => {
              emit('pointerleave', { event, mesh: mesh.value });
            };
          }
        }
        
        // 提供父对象上下文
        provide(PARENT_INJECTION_KEY, {
          object: mesh.value
        });
        
        // 触发就绪事件
        emit('ready', { mesh: mesh.value });
      } catch (error) {
        console.error('Failed to create mesh:', error);
      }
    };
    
    // 更新网格属性
    const updateMesh = () => {
      if (!mesh.value) return;
      
      // 更新位置
      if (props.position && props.position.length === 3) {
        mesh.value.position.set(
          props.position[0],
          props.position[1],
          props.position[2]
        );
      }
      
      // 更新旋转
      if (props.rotation && props.rotation.length === 3) {
        mesh.value.rotation.set(
          props.rotation[0],
          props.rotation[1],
          props.rotation[2]
        );
      }
      
      // 更新缩放
      if (props.scale && props.scale.length === 3) {
        mesh.value.scale.set(
          props.scale[0],
          props.scale[1],
          props.scale[2]
        );
      }
      
      // 更新其他属性
      mesh.value.visible = props.visible;
      mesh.value.castShadow = props.castShadow;
      mesh.value.receiveShadow = props.receiveShadow;
      mesh.value.matrixAutoUpdate = props.matrixAutoUpdate;
      mesh.value.renderOrder = props.renderOrder;
      mesh.value.frustumCulled = props.frustumCulled;
      
      // 更新用户数据
      Object.assign(mesh.value.userData, props.userData);
      
      // 如果设置了名称，更新名称
      if (props.name) {
        mesh.value.name = props.name;
      }
      
      // 触发更新事件
      emit('update', { mesh: mesh.value });
    };
    
    // 更新几何体和材质
    const updateGeometryAndMaterial = () => {
      if (!mesh.value) return;
      
      // 获取子组件提供的几何体
      const geometrySlot = document.querySelector('.three-mesh .geometry-slot');
      if (geometrySlot && geometrySlot.__vue__) {
        geometry.value = geometrySlot.__vue__.geometry;
      }
      
      // 获取子组件提供的材质
      const materialSlot = document.querySelector('.three-mesh .material-slot');
      if (materialSlot && materialSlot.__vue__) {
        material.value = materialSlot.__vue__.material;
      }
      
      // 更新网格的几何体和材质
      if (geometry.value) {
        mesh.value.geometry = geometry.value;
      }
      
      if (material.value) {
        mesh.value.material = material.value;
      }
    };
    
    // 监听属性变化
    watch(() => props.position, updateMesh, { deep: true });
    watch(() => props.rotation, updateMesh, { deep: true });
    watch(() => props.scale, updateMesh, { deep: true });
    watch(() => props.visible, (newValue) => {
      if (mesh.value) {
        mesh.value.visible = newValue;
        emit('update', { mesh: mesh.value });
      }
    });
    watch(() => props.castShadow, (newValue) => {
      if (mesh.value) {
        mesh.value.castShadow = newValue;
        emit('update', { mesh: mesh.value });
      }
    });
    watch(() => props.receiveShadow, (newValue) => {
      if (mesh.value) {
        mesh.value.receiveShadow = newValue;
        emit('update', { mesh: mesh.value });
      }
    });
    watch(() => props.userData, (newValue) => {
      if (mesh.value) {
        Object.assign(mesh.value.userData, newValue);
        emit('update', { mesh: mesh.value });
      }
    }, { deep: true });
    watch(() => props.name, (newValue) => {
      if (mesh.value) {
        mesh.value.name = newValue;
        emit('update', { mesh: mesh.value });
      }
    });
    watch(() => props.matrixAutoUpdate, (newValue) => {
      if (mesh.value) {
        mesh.value.matrixAutoUpdate = newValue;
        emit('update', { mesh: mesh.value });
      }
    });
    watch(() => props.renderOrder, (newValue) => {
      if (mesh.value) {
        mesh.value.renderOrder = newValue;
        emit('update', { mesh: mesh.value });
      }
    });
    watch(() => props.frustumCulled, (newValue) => {
      if (mesh.value) {
        mesh.value.frustumCulled = newValue;
        emit('update', { mesh: mesh.value });
      }
    });
    watch(() => props.interactive, async (newValue) => {
      if (mesh.value && canvasContext && canvasContext.engine.value) {
        const raycasterManager = await canvasContext.engine.value.getOrCreateManager('raycaster');
        if (raycasterManager) {
          if (newValue) {
            raycasterManager.addObject(mesh.value);
          } else {
            raycasterManager.removeObject(mesh.value);
          }
          emit('update', { mesh: mesh.value });
        }
      }
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      createMesh();
    });
    
    onBeforeUnmount(() => {
      if (mesh.value) {
        // 如果启用了交互，从射线投射器中移除
        if (props.interactive && canvasContext && canvasContext.engine.value) {
          const raycasterManager = canvasContext.engine.value.getManager('raycaster');
          if (raycasterManager) {
            raycasterManager.removeObject(mesh.value);
          }
        }
        
        // 如果有父对象，从父对象中移除
        if (parentContext && parentContext.object) {
          parentContext.object.remove(mesh.value);
        }
        
        // 释放资源
        if (mesh.value.geometry) {
          mesh.value.geometry.dispose();
        }
        
        if (mesh.value.material) {
          if (Array.isArray(mesh.value.material)) {
            mesh.value.material.forEach((m) => m.dispose());
          } else {
            mesh.value.material.dispose();
          }
        }
        
        mesh.value = null;
      }
    });
    
    return {
      mesh,
      geometry,
      material
    };
  }
};
</script>

<template>
  <div class="three-mesh">
    <slot></slot>
    <div class="geometry-slot">
      <slot name="geometry"></slot>
    </div>
    <div class="material-slot">
      <slot name="material"></slot>
    </div>
  </div>
</template>

<style scoped>
.three-mesh {
  display: contents;
}

.geometry-slot, .material-slot {
  display: none;
}
</style> 