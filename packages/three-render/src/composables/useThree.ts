import { ref, inject, computed, readonly, onMounted, onBeforeUnmount, provide } from 'vue';
import * as THREE from 'three';
import { CANVAS_CONTEXT_KEY } from '../constants';

/**
 * 父组件向子组件提供API的钩子
 * @param keys - 符号键对象
 * @param api - 提供给子组件的API对象
 */
export function useProvideThreeAPI(keys: { symbol: Symbol; context: Symbol }, api: any) {
  // 提供API给子组件
  provide(keys.symbol, api);
  return api;
}

/**
 * 子组件注入父组件提供的API的钩子
 * @param symbol - 符号
 * @returns 父组件提供的API
 */
export function injectThreeParent(symbol: Symbol) {
  return inject(symbol, null);
}

/**
 * 使用父组件的钩子，主要用于几何体、材质等组件
 * @param keys - 符号键对象
 * @returns 父组件API和状态
 */
export function useParent(keys: { symbol: Symbol; context: Symbol }) {
  // 注入父组件API
  const parentApi = inject(keys.symbol, null);
  
  return {
    parentApi
  };
}

/**
 * useThree 组合式函数
 * 提供对 three-core 引擎和渲染器的访问
 */
export function useThree() {
  // 获取画布上下文
  const context = inject(CANVAS_CONTEXT_KEY);

  if (!context) {
    console.error('useThree() 必须在 ThreeCanvas 组件内部使用');
    
    // 返回空值，防止运行时错误
    return {
      engine: ref(null),
      renderer: ref(null),
      scene: ref(null),
      camera: ref(null),
      gl: ref(null),
      size: readonly(ref({ width: 0, height: 0 })),
      viewport: readonly(ref({ width: 0, height: 0, factor: 1 })),
      clock: readonly(ref(new THREE.Clock())),
      pointer: readonly(ref({ x: 0, y: 0 })),
      raycaster: readonly(ref(new THREE.Raycaster())),
      ready: ref(false)
    };
  }

  // 引擎引用
  const engine = context.engine;
  
  // 渲染器引用
  const renderer = ref<any>(null);
  
  // 场景引用
  const scene = ref<any>(null);
  
  // 相机引用
  const camera = ref<any>(null);
  
  // WebGL 上下文
  const gl = ref<any>(null);
  
  // 画布尺寸
  const size = ref({
    width: 0,
    height: 0,
  });
  
  // 视口尺寸（考虑设备像素比）
  const viewport = computed(() => {
    const factor = (renderer.value?.getPixelRatio?.() || 1);
    return {
      width: size.value.width,
      height: size.value.height,
      factor
    };
  });
  
  // 时钟对象
  const clock = ref(new THREE.Clock());
  
  // 鼠标/触摸位置（归一化）
  const pointer = ref({
    x: 0,
    y: 0
  });
  
  // 射线投射器
  const raycaster = ref(new THREE.Raycaster());
  
  // 是否已准备好
  const ready = ref(false);
  
  // 更新指针位置
  const updatePointer = (event: MouseEvent | TouchEvent) => {
    if (!context.containerRef.value) return;
    
    const rect = context.containerRef.value.getBoundingClientRect();
    let clientX, clientY;
    
    // 处理触摸和鼠标事件
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    // 归一化坐标 (-1 到 +1)
    pointer.value.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.value.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  };
  
  // 初始化函数
  const initialize = async () => {
    if (!engine.value) return;
    
    try {
      // 获取渲染器
      renderer.value = await engine.value.getRenderer?.();
      
      // 获取场景
      scene.value = await engine.value.getScene?.();
      
      // 获取相机
      camera.value = await engine.value.getCamera?.();
      
      // 获取 WebGL 上下文
      gl.value = renderer.value?.getContext?.();
      
      // 获取尺寸
      if (context.containerRef.value) {
        const rect = context.containerRef.value.getBoundingClientRect();
        size.value = {
          width: rect.width,
          height: rect.height
        };
      }
      
      // 初始化时钟
      clock.value.start();
      
      // 标记为已准备好
      ready.value = true;
      
      // 添加指针事件监听
      if (context.containerRef.value) {
        context.containerRef.value.addEventListener('mousemove', updatePointer);
        context.containerRef.value.addEventListener('touchmove', updatePointer);
      }
    } catch (error) {
      console.error('初始化 three 对象失败:', error);
    }
  };
  
  // 执行射线投射
  const raycast = (objects: THREE.Object3D[] = []) => {
    if (!camera.value || !scene.value || !raycaster.value) return [];
    
    // 更新射线投射器
    raycaster.value.setFromCamera(pointer.value, camera.value);
    
    // 如果没有指定对象，使用场景中的所有可见对象
    const targetObjects = objects.length > 0 ? 
      objects : 
      scene.value.children.filter((obj: any) => obj.visible);
    
    // 执行射线投射
    return raycaster.value.intersectObjects(targetObjects, true);
  };
  
  // 生命周期钩子
  onMounted(() => {
    if (engine.value) {
      initialize();
      
      // 监听窗口大小变化
      engine.value.on?.('resize', (newSize: { width: number, height: number }) => {
        size.value = newSize;
      });
    }
  });
  
  onBeforeUnmount(() => {
    // 移除事件监听
    if (context.containerRef.value) {
      context.containerRef.value.removeEventListener('mousemove', updatePointer);
      context.containerRef.value.removeEventListener('touchmove', updatePointer);
    }
    
    // 停止时钟
    clock.value.stop();
  });
  
  // 返回对象
  return {
    // 核心对象
    engine,
    renderer: readonly(renderer),
    scene: readonly(scene),
    camera: readonly(camera),
    gl: readonly(gl),
    
    // 尺寸和视口
    size: readonly(size),
    viewport: readonly(viewport),
    
    // 实用工具
    clock: readonly(clock),
    pointer: readonly(pointer),
    raycaster: readonly(raycaster),
    
    // 状态
    ready: readonly(ready),
    
    // 方法
    raycast
  };
} 