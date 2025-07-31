import { useCallback, useEffect, useState } from "react";

// 自定义 Hook：监听容器尺寸变化
export function useContainerResize(containerRef:React.RefObject<HTMLDivElement | null>, debounceTime = 100) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    
    const updateDimensions = useCallback(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    }, [containerRef]);
  
    // 使用 ResizeObserver 监听尺寸变化
    useEffect(() => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      updateDimensions();
      
      let resizeObserver;
      
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          updateDimensions();
        });
        resizeObserver.observe(container);
      } else {
        // 备用方案：MutationObserver（当 ResizeObserver 不可用时）
        const mutationObserver = new MutationObserver(() => {
          updateDimensions();
        });
        mutationObserver.observe(container, {
          attributes: true,
          attributeFilter: ['style', 'class'],
          childList: true,
          subtree: true
        });
        
        window.addEventListener('resize', updateDimensions);
        
        return () => {
          mutationObserver.disconnect();
          window.removeEventListener('resize', updateDimensions);
        };
      }
      
      return () => {
        if (resizeObserver) {
          resizeObserver.unobserve(container);
        }
      };
    }, [containerRef, updateDimensions]);
  
    return dimensions;
  }