"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import styles from '@/assets/moduleCss/panel.module.css';
import RenderThree from "../canvas3D/renderThree";
import { useUndoRedoState } from "@/hooks/useGlobalUndoRedo";
import { useEditorDataContext } from "../providers/EditorDataProvider";

export default function ViewPanel() {
    const [isOpen, setIsOpen] = useState(true);
    const [shouldRenderCanvas, setShouldRenderCanvas] = useState(false);
    const hasInitialized = useRef(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const initExecuted = useRef(false);
    
    // 获取编辑器数据
    const editorData = useEditorDataContext();
    
    const { state: currentCanvas } = useUndoRedoState('currentCanvas', {
        canvasId: '',
        canvas: null
    });

    // 获取canvas元素的回调函数，避免重复执行
    const updateCanvasRef = useCallback(() => {
        if (currentCanvas?.canvasId) {
            const container = document.getElementById(currentCanvas.canvasId);
            const canvas = container?.querySelector('canvas') as HTMLCanvasElement;
            if (canvas && canvas !== canvasRef.current) {
                canvasRef.current = canvas;
                console.log('Canvas引用已更新:', canvas);
            }
        }
    }, [currentCanvas?.canvasId]);

    // 只在组件挂载时，初始化Canvas渲染
    useEffect(() => {
        if (!initExecuted.current) {
            initExecuted.current = true;
            hasInitialized.current = true;
            // 延迟一点时间确保DOM已经更新
            setTimeout(() => {
                setShouldRenderCanvas(true);
            }, 300);
        }
    }, []); // 空依赖数组，只在组件挂载时执行一次

    // 更新canvas引用，但不触发重新渲染
    useEffect(() => {
        updateCanvasRef();
    }, [updateCanvasRef]);

    // 准备传递给RenderThree的数据
    const materialData = editorData.currentMaterial && editorData.currentModel ? {
        id: editorData.currentMaterial.id,
        name: editorData.currentMaterial.name,
        description: editorData.currentMaterial.description,
        meshes: [],
        layers: [],
        model: {
            id: editorData.currentModel.id,
            name: editorData.currentModel.name,
            modelPath: editorData.currentModel.modelPath,
            uuid: editorData.currentModel.uuid,
            scale: editorData.currentModel.scale,
            position: editorData.currentModel.position,
            rotation: editorData.currentModel.rotation,
            enableDraco: editorData.currentModel.enableDraco,
            dracoPath: editorData.currentModel.dracoPath,
            autoPlay: editorData.currentModel.autoPlay,
            color: editorData.currentModel.color,
            structure: editorData.currentModel.structure
        },
        canvasSize: { width: 800, height: 600 },
        backgroundColor: '#ffffff',
        createdAt: new Date(),
        updatedAt: new Date()
    } : undefined;

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
                                <RenderThree 
                                    materialData={materialData}
                                    canvasTexture={canvasRef.current} 
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}