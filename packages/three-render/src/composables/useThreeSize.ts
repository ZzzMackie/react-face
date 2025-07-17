import { ref, onMounted, onUnmounted, Ref } from 'vue';

/**
 * 监听元素大小变化的组合式API
 * @param target 目标元素引用
 * @param options 配置选项
 * @returns 宽度和高度引用
 */
export function useThreeSize(
  target: Ref<HTMLElement | null>,
  options: {
    /**
     * 是否立即获取大小
     */
    immediate?: boolean;
    
    /**
     * 调整大小的防抖时间（毫秒）
     */
    debounce?: number;
  } = {}
) {
  const width = ref(0);
  const height = ref(0);
  
  let resizeObserver: ResizeObserver | null = null;
  let debounceTimer: number | null = null;
  
  // 更新大小
  const updateSize = () => {
    if (target.value) {
      const rect = target.value.getBoundingClientRect();
      width.value = rect.width;
      height.value = rect.height;
    }
  };
  
  // 防抖更新大小
  const debouncedUpdateSize = () => {
    if (debounceTimer !== null) {
      window.clearTimeout(debounceTimer);
    }
    
    debounceTimer = window.setTimeout(() => {
      updateSize();
      debounceTimer = null;
    }, options.debounce || 200);
  };
  
  onMounted(() => {
    // 如果设置了立即获取大小，则立即更新
    if (options.immediate !== false) {
      updateSize();
    }
    
    // 创建 ResizeObserver 监听大小变化
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (options.debounce) {
          debouncedUpdateSize();
        } else {
          updateSize();
        }
      });
      
      if (target.value) {
        resizeObserver.observe(target.value);
      }
    } else {
      // 回退到 window resize 事件
      window.addEventListener('resize', updateSize);
    }
  });
  
  onUnmounted(() => {
    // 清理 ResizeObserver
    if (resizeObserver) {
      if (target.value) {
        resizeObserver.unobserve(target.value);
      }
      resizeObserver.disconnect();
    } else {
      // 移除 window resize 事件
      window.removeEventListener('resize', updateSize);
    }
    
    // 清理防抖定时器
    if (debounceTimer !== null) {
      window.clearTimeout(debounceTimer);
    }
  });
  
  return {
    width,
    height,
    updateSize
  };
} 