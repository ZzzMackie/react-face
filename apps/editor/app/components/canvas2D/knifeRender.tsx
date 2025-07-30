"use client"; 
import styles from '../../assets/css/canvas.module.css';
import { Layer, Rect, Stage } from 'react-konva';
import Konva from 'konva';
import { useCallback, useEffect, useRef, useState  } from 'react';
// 自定义 Hook：监听容器尺寸变化
function useContainerResize(containerRef:React.RefObject<HTMLDivElement | null>, debounceTime = 100) {
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
export default function KnifeRender() {
    const renderRef = useRef<HTMLDivElement>(null);
    const [renderSize, setRenderSize] = useState({width: 0, height: 0});
    const stageRef = useRef<Konva.Stage>(null);
    
    // 获取容器尺寸
    const { width, height } = useContainerResize(renderRef);
    useEffect(() => {
        if (stageRef.current && width > 0 && height > 0) {
            stageRef.current.width(width);
            stageRef.current.height(height);
            stageRef.current.batchDraw();
          }
    }, [width, height]);
    return (
        <div ref={renderRef} className={`aspect-square max-h-[100%] w-[max-content] bg-white ${styles.canvas2d_min_height}`}>
            <Stage ref={stageRef} className={styles.canvas_container} width={renderSize.width} height={renderSize.height}>
                <Layer >
                    <Rect draggable x={0} y={0} width={100} height={100} fill="red" />
                </Layer>
            </Stage>
        </div>
    )
}