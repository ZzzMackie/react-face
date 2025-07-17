import { inject, onMounted, onBeforeUnmount, shallowRef } from 'vue';
import { CANVAS_CONTEXT_KEY } from '../constants';
import { useThree } from './useThree';

/**
 * useFrame 组合式函数
 * 允许在每一帧渲染时执行回调函数
 * 
 * @param callback 每帧执行的回调函数
 * @param renderPriority 渲染优先级（数字越小优先级越高）
 */
export function useFrame(callback: (state: any, delta: number) => void, renderPriority = 0) {
  // 获取画布上下文
  const context = inject(CANVAS_CONTEXT_KEY);
  
  if (!context) {
    console.error('useFrame() 必须在 ThreeCanvas 组件内部使用');
    return;
  }
  
  // 获取 three 相关对象
  const { clock, scene, camera } = useThree();
  
  // 创建一个浅引用，避免不必要的更新
  const fn = shallowRef(callback);
  
  // 回调函数 ID
  let callbackId: number | null = null;
  
  // 注册帧回调
  onMounted(() => {
    if (!context.engine?.value) return;
    
    const engine = context.engine.value;
    
    // 创建回调函数
    const frameCallback = (time: number) => {
      if (!clock.value) return;
      
      // 获取时间差
      const delta = clock.value.getDelta();
      
      // 调用用户回调，传递状态对象和时间差
      fn.value({
        clock: clock.value,
        scene: scene.value,
        camera: camera.value,
        time
      }, delta);
    };
    
    // 注册回调
    if (engine.beforeRender) {
      callbackId = engine.beforeRender.subscribe(frameCallback, renderPriority);
    } else {
      console.warn('引擎不支持 beforeRender 事件订阅');
    }
  });
  
  // 取消注册帧回调
  onBeforeUnmount(() => {
    if (!context.engine?.value || callbackId === null) return;
    
    const engine = context.engine.value;
    
    // 取消注册回调
    if (engine.beforeRender) {
      engine.beforeRender.unsubscribe(callbackId);
    }
    
    // 清除回调 ID
    callbackId = null;
  });
  
  // 更新回调函数
  const setCallback = (newCallback: (state: any, delta: number) => void) => {
    fn.value = newCallback;
  };
  
  return setCallback;
} 