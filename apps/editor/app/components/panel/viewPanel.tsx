"use client";
import { useState, useEffect, useRef } from "react";
import styles from '@/assets/moduleCss/panel.module.css';
import RenderThree from "../canvas3D/renderThree";
import { useUndoRedoState } from "@/hooks/useGlobalUndoRedo";

export default function ViewPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [shouldRenderCanvas, setShouldRenderCanvas] = useState(false);
    const hasInitialized = useRef(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const {state: currentCanvas} = useUndoRedoState('currentCanvas')
    // 只在第一次展开时，初始化Canvas渲染
    useEffect(() => {
        if (isOpen && !hasInitialized.current) {
            hasInitialized.current = true;
            // 延迟一点时间确保DOM已经更新
            const timer = setTimeout(() => {
                setShouldRenderCanvas(true);
            }, 300);
            
            console.log(currentCanvas)
            canvasRef.current = document.getElementById(currentCanvas?.canvasId as string)?.querySelector('canvas') as HTMLCanvasElement
            console.log(canvasRef.current)
            return () => clearTimeout(timer);
        }
    }, [isOpen]);
    return (
        <div 
            className={`${styles.panel_container} ${
                isOpen ? styles.panel_container_expanded : styles.panel_container_collapsed
            }`}
        >
            {/* 圆形按钮 */}
            <div 
                className={`${styles.panel_round} ${
                    isOpen ? styles.panel_round_expanded : styles.panel_round_collapsed
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="w-full h-full flex items-center justify-center text-white text-center leading-6">
                    3D
                </div>
            </div>
            
            {/* 展开的面板内容 */}
            <div 
                className={`${styles.panel_content} ${
                    isOpen ? styles.panel_content_expanded : styles.panel_content_collapsed
                }`}
            >
                <div className={
                    ` p-6 h-full overflow-hidden`
                }>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">3D Panel</h2>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* 面板内容 - 只在初始化后渲染，避免重复加载 */}
                    <div className="space-y-4">
                        {shouldRenderCanvas && (
                            <div className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                                <RenderThree canvasTexture={canvasRef.current} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}