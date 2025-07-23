<template>
  <div class="three-instanced-mesh">
    <slot></slot>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, provide, inject } from 'vue';
import { PARENT_INJECTION_KEY, SCENE_INJECTION_KEY } from '../../constants';

export default {
  props: {
    count: {
      type: Number,
      default: 100
    },
    geometry: {
      type: Object,
      default: null
    },
    material: {
      type: Object,
      default: null
    },
    position: {
      type: Array,
      default: () => [0, 0, 0]
    },
    rotation: {
      type: Array,
      default: () => [0, 0, 0]
    },
    scale: {
      type: [Number, Array],
      default: 1
    },
    castShadow: {
      type: Boolean,
      default: false
    },
    receiveShadow: {
      type: Boolean,
      default: false
    },
    frustumCulled: {
      type: Boolean,
      default: true
    },
    renderOrder: {
      type: Number,
      default: 0
    },
    visible: {
      type: Boolean,
      default: true
    },
    matrix: {
      type: Array,
      default: null
    },
    color: {
      type: [String, Number],
      default: null
    },
    spread: {
      type: Number,
      default: 10
    },
    distribution: {
      type: String,
      default: 'random', // 'random', 'grid', 'circle', 'sphere'
      validator: (value) => ['random', 'grid', 'circle', 'sphere'].includes(value)
    },
    animated: {
      type: Boolean,
      default: false
    },
    animationSpeed: {
      type: Number,
      default: 0.1
    }
  },
  emits: ['ready', 'update'],
  setup(props, { emit, slots }) {
    // 获取父对象上下文
    const parentContext = inject(PARENT_INJECTION_KEY, null);
    
    // 获取场景上下文
    const sceneContext = inject(SCENE_INJECTION_KEY, null);
    
    // 实例化网格引用
    const instancedMesh = ref(null);
    
    // 几何体和材质引用
    const geometry = ref(null);
    const material = ref(null);
    
    // 实例矩阵
    const matrices = ref([]);
    
    // 动画数据
    const animationData = ref([]);
    
    // 创建实例化网格
    const createInstancedMesh = async () => {
      if (!parentContext || !parentContext.object) return;
      
      try {
        // 获取Three.js
        const THREE = parentContext.object.constructor;
        
        // 清理旧的实例
        disposeInstancedMesh();
        
        // 创建几何体
        if (props.geometry) {
          geometry.value = props.geometry;
        } else {
          // 默认使用盒子几何体
          geometry.value = new THREE.BoxGeometry(1, 1, 1);
        }
        
        // 创建材质
        if (props.material) {
          material.value = props.material;
        } else {
          // 默认使用标准材质
          material.value = new THREE.MeshStandardMaterial({
            color: props.color || 0xffffff,
            roughness: 0.7,
            metalness: 0.3
          });
        }
        
        // 创建实例化网格
        instancedMesh.value = new THREE.InstancedMesh(
          geometry.value,
          material.value,
          props.count
        );
        
        // 设置阴影
        instancedMesh.value.castShadow = props.castShadow;
        instancedMesh.value.receiveShadow = props.receiveShadow;
        
        // 设置其他属性
        instancedMesh.value.frustumCulled = props.frustumCulled;
        instancedMesh.value.renderOrder = props.renderOrder;
        instancedMesh.value.visible = props.visible;
        
        // 设置位置
        instancedMesh.value.position.set(
          props.position[0],
          props.position[1],
          props.position[2]
        );
        
        // 设置旋转
        instancedMesh.value.rotation.set(
          props.rotation[0],
          props.rotation[1],
          props.rotation[2]
        );
        
        // 设置缩放
        if (Array.isArray(props.scale)) {
          instancedMesh.value.scale.set(
            props.scale[0],
            props.scale[1],
            props.scale[2]
          );
        } else {
          instancedMesh.value.scale.set(
            props.scale,
            props.scale,
            props.scale
          );
        }
        
        // 初始化实例矩阵
        initInstanceMatrices();
        
        // 添加到父对象
        parentContext.object.add(instancedMesh.value);
        
        // 提供父对象上下文给子组件
        provide(PARENT_INJECTION_KEY, {
          object: instancedMesh.value
        });
        
        // 触发就绪事件
        emit('ready', { instancedMesh: instancedMesh.value });
      } catch (error) {
        console.error('Failed to create instanced mesh:', error);
      }
    };
    
    // 初始化实例矩阵
    const initInstanceMatrices = () => {
      if (!instancedMesh.value) return;
      
      const THREE = instancedMesh.value.constructor;
      
      // 创建临时变量
      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const rotation = new THREE.Euler();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3(1, 1, 1);
      
      // 清空矩阵数组
      matrices.value = [];
      animationData.value = [];
      
      // 根据分布类型生成实例位置
      for (let i = 0; i < props.count; i++) {
        // 根据分布类型计算位置
        switch (props.distribution) {
          case 'grid':
            // 计算网格尺寸
            const gridSize = Math.ceil(Math.pow(props.count, 1/3));
            const spacing = props.spread / gridSize;
            const offset = props.spread / 2 - spacing / 2;
            
            // 计算网格位置
            const x = (i % gridSize) * spacing - offset;
            const y = (Math.floor(i / gridSize) % gridSize) * spacing - offset;
            const z = Math.floor(i / (gridSize * gridSize)) * spacing - offset;
            
            position.set(x, y, z);
            break;
            
          case 'circle':
            // 计算圆形分布
            const angle = (i / props.count) * Math.PI * 2;
            const radius = props.spread / 2;
            
            position.set(
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius
            );
            break;
            
          case 'sphere':
            // 计算球形分布
            const phi = Math.acos(-1 + (2 * i) / props.count);
            const theta = Math.sqrt(props.count * Math.PI) * phi;
            
            position.set(
              Math.cos(theta) * Math.sin(phi) * props.spread / 2,
              Math.sin(theta) * Math.sin(phi) * props.spread / 2,
              Math.cos(phi) * props.spread / 2
            );
            break;
            
          case 'random':
          default:
            // 随机分布
            position.set(
              (Math.random() - 0.5) * props.spread,
              (Math.random() - 0.5) * props.spread,
              (Math.random() - 0.5) * props.spread
            );
            break;
        }
        
        // 随机旋转
        rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );
        quaternion.setFromEuler(rotation);
        
        // 随机缩放
        const s = 0.5 + Math.random();
        scale.set(s, s, s);
        
        // 创建矩阵
        matrix.compose(position, quaternion, scale);
        
        // 设置实例矩阵
        instancedMesh.value.setMatrixAt(i, matrix);
        
        // 保存矩阵副本
        matrices.value.push(matrix.clone());
        
        // 保存动画数据
        if (props.animated) {
          animationData.value.push({
            position: position.clone(),
            rotation: rotation.clone(),
            scale: scale.clone(),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.01,
              (Math.random() - 0.5) * 0.01,
              (Math.random() - 0.5) * 0.01
            ),
            rotationSpeed: new THREE.Vector3(
              (Math.random() - 0.5) * 0.01,
              (Math.random() - 0.5) * 0.01,
              (Math.random() - 0.5) * 0.01
            )
          });
        }
      }
      
      // 更新实例矩阵
      instancedMesh.value.instanceMatrix.needsUpdate = true;
      
      // 如果有自定义颜色，设置每个实例的颜色
      if (props.color && instancedMesh.value.instanceColor) {
        const color = new THREE.Color(props.color);
        for (let i = 0; i < props.count; i++) {
          instancedMesh.value.setColorAt(i, color);
        }
        instancedMesh.value.instanceColor.needsUpdate = true;
      }
    };
    
    // 更新实例矩阵
    const updateInstanceMatrices = (deltaTime) => {
      if (!instancedMesh.value || !props.animated || animationData.value.length === 0) return;
      
      const THREE = instancedMesh.value.constructor;
      const matrix = new THREE.Matrix4();
      const quaternion = new THREE.Quaternion();
      const speed = props.animationSpeed * deltaTime * 60;
      
      for (let i = 0; i < props.count; i++) {
        const data = animationData.value[i];
        
        // 更新位置
        data.position.x += data.velocity.x * speed;
        data.position.y += data.velocity.y * speed;
        data.position.z += data.velocity.z * speed;
        
        // 边界检查
        const limit = props.spread / 2;
        if (Math.abs(data.position.x) > limit) {
          data.velocity.x *= -1;
          data.position.x = Math.sign(data.position.x) * limit;
        }
        if (Math.abs(data.position.y) > limit) {
          data.velocity.y *= -1;
          data.position.y = Math.sign(data.position.y) * limit;
        }
        if (Math.abs(data.position.z) > limit) {
          data.velocity.z *= -1;
          data.position.z = Math.sign(data.position.z) * limit;
        }
        
        // 更新旋转
        data.rotation.x += data.rotationSpeed.x * speed;
        data.rotation.y += data.rotationSpeed.y * speed;
        data.rotation.z += data.rotationSpeed.z * speed;
        quaternion.setFromEuler(data.rotation);
        
        // 更新矩阵
        matrix.compose(data.position, quaternion, data.scale);
        instancedMesh.value.setMatrixAt(i, matrix);
      }
      
      // 更新实例矩阵
      instancedMesh.value.instanceMatrix.needsUpdate = true;
      
      // 触发更新事件
      emit('update', { instancedMesh: instancedMesh.value });
    };
    
    // 释放资源
    const disposeInstancedMesh = () => {
      if (!instancedMesh.value) return;
      
      // 从父对象移除
      if (parentContext && parentContext.object) {
        parentContext.object.remove(instancedMesh.value);
      }
      
      // 释放几何体和材质
      if (geometry.value && !props.geometry) {
        geometry.value.dispose();
      }
      
      if (material.value && !props.material) {
        material.value.dispose();
      }
      
      // 清空引用
      instancedMesh.value = null;
      geometry.value = null;
      material.value = null;
    };
    
    // 监听属性变化
    watch(() => props.count, () => {
      createInstancedMesh();
    });
    
    watch(() => props.geometry, () => {
      createInstancedMesh();
    });
    
    watch(() => props.material, () => {
      createInstancedMesh();
    });
    
    watch(() => props.position, (newPosition) => {
      if (instancedMesh.value) {
        instancedMesh.value.position.set(
          newPosition[0],
          newPosition[1],
          newPosition[2]
        );
      }
    }, { deep: true });
    
    watch(() => props.rotation, (newRotation) => {
      if (instancedMesh.value) {
        instancedMesh.value.rotation.set(
          newRotation[0],
          newRotation[1],
          newRotation[2]
        );
      }
    }, { deep: true });
    
    watch(() => props.scale, (newScale) => {
      if (instancedMesh.value) {
        if (Array.isArray(newScale)) {
          instancedMesh.value.scale.set(
            newScale[0],
            newScale[1],
            newScale[2]
          );
        } else {
          instancedMesh.value.scale.set(
            newScale,
            newScale,
            newScale
          );
        }
      }
    }, { deep: true });
    
    watch(() => props.castShadow, (newValue) => {
      if (instancedMesh.value) {
        instancedMesh.value.castShadow = newValue;
      }
    });
    
    watch(() => props.receiveShadow, (newValue) => {
      if (instancedMesh.value) {
        instancedMesh.value.receiveShadow = newValue;
      }
    });
    
    watch(() => props.visible, (newValue) => {
      if (instancedMesh.value) {
        instancedMesh.value.visible = newValue;
      }
    });
    
    watch(() => props.distribution, () => {
      if (instancedMesh.value) {
        initInstanceMatrices();
      }
    });
    
    watch(() => props.spread, () => {
      if (instancedMesh.value) {
        initInstanceMatrices();
      }
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      createInstancedMesh();
      
      // 如果启用动画，添加到渲染循环
      if (props.animated && sceneContext && sceneContext.scene) {
        // 获取引擎
        const engine = sceneContext.scene.value.parent;
        if (engine) {
          // 添加到更新循环
          engine.onBeforeRender((_, deltaTime) => {
            updateInstanceMatrices(deltaTime);
          });
        }
      }
    });
    
    onBeforeUnmount(() => {
      disposeInstancedMesh();
    });
    
    return {
      instancedMesh,
      geometry,
      material,
      matrices,
      animationData,
      updateInstanceMatrices
    };
  }
};
</script>

<style scoped>
.three-instanced-mesh {
  display: none;
}
</style> 