<script>
import { ref, onMounted, onBeforeUnmount, watch, provide, inject } from 'vue';
import { CANVAS_INJECTION_KEY, SCENE_INJECTION_KEY, PHYSICS_WORLD_INJECTION_KEY } from '../../constants';

export default {
  props: {
    gravity: {
      type: Array,
      default: () => [0, -9.8, 0]
    },
    enabled: {
      type: Boolean,
      default: true
    },
    debug: {
      type: Boolean,
      default: false
    },
    timeStep: {
      type: Number,
      default: 1 / 60
    },
    maxSubSteps: {
      type: Number,
      default: 10
    },
    solver: {
      type: String,
      default: 'split',
      validator: (value) => ['split', 'sequential', 'iterative'].includes(value)
    }
  },
  emits: ['ready', 'update', 'beforeStep', 'afterStep'],
  setup(props, { emit, slots }) {
    // 获取画布上下文
    const canvasContext = inject(CANVAS_INJECTION_KEY, null);
    
    // 获取场景上下文
    const sceneContext = inject(SCENE_INJECTION_KEY, null);
    
    // 物理世界引用
    const world = ref(null);
    
    // 物理对象列表
    const bodies = ref([]);
    
    // 调试渲染器
    const debugRenderer = ref(null);
    
    // 添加物理对象
    const addBody = (body) => {
      if (!body || !world.value) return;
      
      world.value.addBody(body);
      bodies.value.push(body);
      
      return body;
    };
    
    // 移除物理对象
    const removeBody = (body) => {
      if (!body || !world.value) return;
      
      world.value.removeBody(body);
      
      const index = bodies.value.indexOf(body);
      if (index !== -1) {
        bodies.value.splice(index, 1);
      }
    };
    
    // 更新物理世界
    const updatePhysicsWorld = () => {
      if (!world.value) return;
      
      // 更新重力
      if (Array.isArray(props.gravity) && props.gravity.length >= 3) {
        world.value.gravity.set(props.gravity[0], props.gravity[1], props.gravity[2]);
      }
      
      // 更新调试渲染器
      if (props.debug && !debugRenderer.value && canvasContext && canvasContext.engine.value && sceneContext) {
        createDebugRenderer();
      } else if (!props.debug && debugRenderer.value) {
        disposeDebugRenderer();
      }
      
      // 触发更新事件
      emit('update', { world: world.value, bodies: bodies.value });
    };
    
    // 创建调试渲染器
    const createDebugRenderer = async () => {
      if (!canvasContext || !canvasContext.engine.value || !sceneContext || !world.value) return;
      
      try {
        // 动态导入 CannonDebugRenderer
        const { default: CannonDebugRenderer } = await import('../../utils/CannonDebugRenderer');
        
        // 创建调试渲染器
        debugRenderer.value = new CannonDebugRenderer(
          sceneContext.scene.value,
          world.value,
          canvasContext.engine.value.constructor.THREE
        );
      } catch (error) {
        console.error('Failed to create debug renderer:', error);
      }
    };
    
    // 释放调试渲染器
    const disposeDebugRenderer = () => {
      if (!debugRenderer.value) return;
      
      if (debugRenderer.value.dispose) {
        debugRenderer.value.dispose();
      }
      
      debugRenderer.value = null;
    };
    
    // 物理步进
    const step = (deltaTime) => {
      if (!world.value || !props.enabled) return;
      
      // 触发步进前事件
      emit('beforeStep', { world: world.value, deltaTime });
      
      // 物理步进
      world.value.step(props.timeStep, deltaTime, props.maxSubSteps);
      
      // 更新调试渲染器
      if (debugRenderer.value) {
        debugRenderer.value.update();
      }
      
      // 触发步进后事件
      emit('afterStep', { world: world.value, deltaTime });
    };
    
    // 创建物理世界
    const createPhysicsWorld = async () => {
      if (!canvasContext || !canvasContext.engine.value) return;
      
      try {
        // 动态导入 cannon-es
        const CANNON = await import('cannon-es');
        
        // 创建物理世界
        world.value = new CANNON.World();
        
        // 设置重力
        if (Array.isArray(props.gravity) && props.gravity.length >= 3) {
          world.value.gravity.set(props.gravity[0], props.gravity[1], props.gravity[2]);
        }
        
        // 设置求解器
        if (props.solver === 'split') {
          world.value.solver = new CANNON.SplitSolver(new CANNON.GSSolver());
        } else if (props.solver === 'iterative') {
          world.value.solver = new CANNON.GSSolver();
        }
        
        // 创建调试渲染器
        if (props.debug) {
          await createDebugRenderer();
        }
        
        // 添加到渲染循环
        const originalUpdate = canvasContext.engine.value.update;
        canvasContext.engine.value.update = (deltaTime) => {
          // 调用原始更新
          originalUpdate(deltaTime);
          
          // 物理步进
          step(deltaTime);
        };
        
        // 提供物理世界上下文
        provide(PHYSICS_WORLD_INJECTION_KEY, {
          world,
          bodies,
          addBody,
          removeBody
        });
        
        // 触发就绪事件
        emit('ready', { world: world.value });
      } catch (error) {
        console.error('Failed to create physics world:', error);
      }
    };
    
    // 监听属性变化
    watch(() => props.gravity, updatePhysicsWorld, { deep: true });
    watch(() => props.debug, updatePhysicsWorld);
    watch(() => props.enabled, (enabled) => {
      // 触发更新事件
      emit('update', { world: world.value, bodies: bodies.value, enabled });
    });
    
    // 组件挂载和卸载
    onMounted(async () => {
      // 创建物理世界
      await createPhysicsWorld();
    });
    
    onBeforeUnmount(() => {
      if (canvasContext && canvasContext.engine.value) {
        // 恢复原始更新函数
        const originalUpdate = canvasContext.engine.value._originalUpdate;
        if (originalUpdate) {
          canvasContext.engine.value.update = originalUpdate;
        }
      }
      
      // 释放调试渲染器
      disposeDebugRenderer();
      
      // 清空物理对象
      if (world.value) {
        bodies.value.forEach(body => {
          world.value.removeBody(body);
        });
        
        bodies.value = [];
        world.value = null;
      }
    });
    
    return {
      world,
      bodies,
      addBody,
      removeBody,
      step
    };
  }
};
</script>

<template>
  <div class="three-physics-world">
    <slot></slot>
  </div>
</template>

<style scoped>
.three-physics-world {
  display: none;
}
</style> 