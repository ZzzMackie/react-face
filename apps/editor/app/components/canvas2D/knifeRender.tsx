"use client"; 
import styles from '@/assets/moduleCss/canvas.module.css';
import { Layer, Rect, Circle, Line, Text, Stage, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useUndoRedoState } from '@/hooks/useGlobalUndoRedo';
import { useContainerResize } from '@/hooks/useContainerResize';
import { MaterialData, MaterialLayer, MaterialMesh } from '../canvas3D/constant/MaterialData';

interface KnifeRenderProps {
  materialData?: MaterialData;
  onCanvasUpdate?: (canvas: HTMLCanvasElement) => void;
  selectedLayerId?: string;
  onLayerSelect?: (layerId: string) => void;
}

export default function KnifeRender({ 
  materialData,
  onCanvasUpdate,
  selectedLayerId,
  onLayerSelect 
}: KnifeRenderProps) {
    const renderRef = useRef<HTMLDivElement>(null);
    const [renderSize, setRenderSize] = useState({width: 0, height: 0});
    const stageRef = useRef<Konva.Stage>(null);
    const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
    
    // 获取容器尺寸
    const { width, height } = useContainerResize(renderRef);
    useEffect(() => {
        if (stageRef.current && width > 0 && height > 0) {
            stageRef.current.width(width);
            stageRef.current.height(height);
            stageRef.current.batchDraw();
        }
    }, [width, height]);

    // 使用useUndoRedoState管理刀版数据
    const { state: knifeData, updateState } = useUndoRedoState(
        'knife-material-data',
        materialData || {
            id: 'default',
            name: '默认刀版',
            description: '默认刀版数据',
            meshes: [
                {
                    id: 'mesh-001',
                    name: '测试矩形',
                    type: 'rectangle' as const,
                    position: { x: 100, y: 100 },
                    size: { width: 100, height: 100 },
                    rotation: 0,
                    color: '#ff0000',
                    strokeColor: '#cc0000',
                    strokeWidth: 2
                }
            ],
            layers: [
                {
                    id: 'layer-001',
                    name: '测试矩形',
                    type: 'rectangle' as const,
                    position: { x: 100, y: 100 },
                    size: { width: 100, height: 100 },
                    rotation: 0,
                    opacity: 1,
                    visible: true,
                    zIndex: 1,
                    color: '#ff0000',
                    strokeColor: '#cc0000',
                    strokeWidth: 2
                }
            ],
            model: {
                id: 'model-001',
                name: '默认模型',
                modelPath: '/exampleModel/XEP2DZRCDIT6W-3dSources.glb',
                uuid: 'uuid-001',
                scale: 1,
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                enableDraco: true,
                dracoPath: '/draco/gltf/',
                autoPlay: true
            },
            canvasSize: { width: 800, height: 600 },
            backgroundColor: '#ffffff',
            createdAt: new Date(),
            updatedAt: new Date()
        } as MaterialData,
        { debounceMs: 200 }
    );

    // 预加载图片
    useEffect(() => {
        if (knifeData?.layers) {
            const imageLayers = knifeData.layers.filter(layer => layer.type === 'image');
            const newLoadedImages = new Map(loadedImages);
            
            imageLayers.forEach(layer => {
                if (layer.type === 'image' && layer.imageUrl && !newLoadedImages.has(layer.imageUrl)) {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        newLoadedImages.set(layer.imageUrl, img);
                        setLoadedImages(new Map(newLoadedImages));
                    };
                    img.onerror = () => {
                        console.error('Failed to load image:', layer.imageUrl);
                    };
                    img.src = layer.imageUrl;
                }
            });
        }
    }, [knifeData?.layers]);

    // 使用useCallback处理Canvas更新
    const handleCanvasUpdate = useCallback((canvas: HTMLCanvasElement) => {
        if (onCanvasUpdate) {
            onCanvasUpdate(canvas);
        }
    }, [onCanvasUpdate]);

    // 当Canvas更新时，通知父组件
    useEffect(() => {
        if (stageRef.current && knifeData) {
            const canvas = stageRef.current.toCanvas();
            handleCanvasUpdate(canvas);
            
            // 触发自定义事件，通知3D纹理更新
            window.dispatchEvent(new CustomEvent('knife-content-updated', {
                detail: { canvas, timestamp: Date.now() }
            }));
        }
    }, [knifeData, handleCanvasUpdate]);

    // 监听刀版数据变化，触发纹理更新事件
    useEffect(() => {
        if (!knifeData) return;
        
        // 延迟触发，确保Konva已经完成渲染
        const timer = setTimeout(() => {
            if (stageRef.current) {
                window.dispatchEvent(new CustomEvent('knife-content-updated', {
                    detail: { 
                        canvas: stageRef.current.toCanvas(), 
                        timestamp: Date.now(),
                        reason: 'knife-data-changed'
                    }
                }));
            }
        }, 100);
        
        return () => clearTimeout(timer);
    }, [knifeData?.layers]); // 监听layers变化

    // 渲染不同类型的图层
    const renderLayer = (layer: MaterialLayer) => {
        if (!knifeData || !layer.visible) return null;
        
        const isSelected = selectedLayerId === layer.id;
        const strokeColor = isSelected ? '#ff0000' : layer.type !== 'text' ? (layer as any).strokeColor : undefined;
        const strokeWidth = isSelected ? (layer.type !== 'text' ? (layer as any).strokeWidth + 2 : 2) : layer.type !== 'text' ? (layer as any).strokeWidth : undefined;

        switch (layer.type) {
            case 'rectangle':
                return (
                    <Rect
                        key={layer.id}
                        x={layer.position.x}
                        y={layer.position.y}
                        width={layer.size.width}
                        height={layer.size.height}
                        rotation={layer.rotation}
                        fill={layer.color}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        opacity={layer.opacity}
                        draggable
                        onClick={() => onLayerSelect?.(layer.id)}
                        onTap={() => onLayerSelect?.(layer.id)}
                        onDragEnd={(e) => {
                            if (!knifeData) return;
                            const newLayers = knifeData.layers.map(l => 
                                l.id === layer.id 
                                    ? { ...l, position: { x: e.target.x(), y: e.target.y() } }
                                    : l
                            );
                            updateState({ ...knifeData, layers: newLayers } as MaterialData, `移动${layer.name}`);
                        }}
                    />
                );

            case 'circle':
                return (
                    <Circle
                        key={layer.id}
                        x={layer.position.x}
                        y={layer.position.y}
                        radius={layer.radius || layer.size.width / 2}
                        fill={layer.color}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        opacity={layer.opacity}
                        draggable
                        onClick={() => onLayerSelect?.(layer.id)}
                        onTap={() => onLayerSelect?.(layer.id)}
                        onDragEnd={(e) => {
                            if (!knifeData) return;
                            const newLayers = knifeData.layers.map(l => 
                                l.id === layer.id 
                                    ? { ...l, position: { x: e.target.x(), y: e.target.y() } }
                                    : l
                            );
                            updateState({ ...knifeData, layers: newLayers } as MaterialData, `移动${layer.name}`);
                        }}
                    />
                );

            case 'polygon':
                if (layer.points) {
                    const flatPoints = layer.points.flatMap(p => [p.x, p.y]);
                    return (
                        <Line
                            key={layer.id}
                            points={flatPoints}
                            fill={layer.color}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            opacity={layer.opacity}
                            closed
                            draggable
                            onClick={() => onLayerSelect?.(layer.id)}
                            onTap={() => onLayerSelect?.(layer.id)}
                            onDragEnd={(e) => {
                                if (!knifeData) return;
                                const newLayers = knifeData.layers.map(l => 
                                    l.id === layer.id 
                                        ? { ...l, position: { x: e.target.x(), y: e.target.y() } }
                                        : l
                                );
                                updateState({ ...knifeData, layers: newLayers } as MaterialData, `移动${layer.name}`);
                            }}
                        />
                    );
                }
                return null;

            case 'image':
                const imageElement = loadedImages.get(layer.imageUrl);
                if (!imageElement) {
                    return (
                        <Rect
                            key={layer.id}
                            x={layer.position.x}
                            y={layer.position.y}
                            width={layer.size.width}
                            height={layer.size.height}
                            fill="#cccccc"
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            opacity={layer.opacity}
                            onClick={() => onLayerSelect?.(layer.id)}
                        />
                    );
                }
                return (
                    <KonvaImage
                        key={layer.id}
                        x={layer.position.x}
                        y={layer.position.y}
                        width={layer.size.width}
                        height={layer.size.height}
                        image={imageElement}
                        opacity={layer.opacity}
                        draggable
                        onClick={() => onLayerSelect?.(layer.id)}
                        onTap={() => onLayerSelect?.(layer.id)}
                        onDragEnd={(e) => {
                            if (!knifeData) return;
                            const newLayers = knifeData.layers.map(l => 
                                l.id === layer.id 
                                    ? { ...l, position: { x: e.target.x(), y: e.target.y() } }
                                    : l
                            );
                            updateState({ ...knifeData, layers: newLayers } as MaterialData, `移动${layer.name}`);
                        }}
                    />
                );

            case 'text':
                return (
                    <Text
                        key={layer.id}
                        x={layer.position.x}
                        y={layer.position.y}
                        width={layer.size.width}
                        height={layer.size.height}
                        text={layer.text}
                        fontSize={layer.fontSize}
                        fontFamily={layer.fontFamily}
                        fontWeight={layer.fontWeight}
                        fontStyle={layer.fontStyle}
                        fill={layer.color}
                        stroke={layer.strokeColor}
                        strokeWidth={layer.strokeWidth}
                        align={layer.textAlign}
                        verticalAlign={layer.verticalAlign}
                        lineHeight={layer.lineHeight}
                        letterSpacing={layer.letterSpacing}
                        opacity={layer.opacity}
                        draggable
                        onClick={() => onLayerSelect?.(layer.id)}
                        onTap={() => onLayerSelect?.(layer.id)}
                        onDragEnd={(e) => {
                            if (!knifeData) return;
                            const newLayers = knifeData.layers.map(l => 
                                l.id === layer.id 
                                    ? { ...l, position: { x: e.target.x(), y: e.target.y() } }
                                    : l
                            );
                            updateState({ ...knifeData, layers: newLayers } as MaterialData, `移动${layer.name}`);
                        }}
                    />
                );

            default:
                return null;
        }
    };

    // 渲染标注信息
    const renderLabels = () => {
        if (!knifeData) return [];
        
        return knifeData.layers.map(layer => (
            <Text
                key={`label-${layer.id}`}
                x={layer.position.x}
                y={layer.position.y - 20}
                text={layer.name}
                fontSize={12}
                fill="#333"
                fontFamily="Arial"
            />
        ));
    };

    const {state: currentCanvas, updateState: updateCurrentCanvas} = useUndoRedoState('currentCanvas', {
      id: 'currentCanvas',
      name: '当前Canvas',
      description: '当前Canvas',
      canvasId: 'knife-render-canvas'
    });

    return (
        <div ref={renderRef} className={`aspect-square max-h-[100%] w-[max-content] bg-white ${styles.canvas2d_min_height}`}>
            <div className="p-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">
                        {knifeData?.name || '刀版'} - 2D刀版
                    </h3>
                    <div className="text-xs text-gray-500">
                        选中: {selectedLayerId || '无'} | 图层: {knifeData?.layers.length || 0}
                    </div>
                </div>
            </div>
            
            <Stage id="knife-render-canvas" ref={stageRef} className={styles.canvas_container} width={renderSize.width} height={renderSize.height}>
                <Layer>
                    {/* 背景 */}
                    {knifeData?.backgroundColor && (
                        <Rect
                            x={0}
                            y={0}
                            width={knifeData.canvasSize.width}
                            height={knifeData.canvasSize.height}
                            fill={knifeData.backgroundColor}
                        />
                    )}
                    
                    {/* 图层 - 按zIndex排序 */}
                    {knifeData?.layers
                        .sort((a, b) => a.zIndex - b.zIndex)
                        .map(renderLayer)}
                    
                    {/* 标注信息 */}
                    {renderLabels()}
                </Layer>
            </Stage>
        </div>
    )
}