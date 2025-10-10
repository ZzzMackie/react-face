"use client"; 
import styles from '@/assets/moduleCss/canvas.module.css';
import { useEffect, useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useUndoRedoState } from '@/hooks/useGlobalUndoRedo';
import { useContainerResize } from '@/hooks/useContainerResize';
import { MaterialData, MaterialLayer, MaterialMesh, Knife } from '../canvas3D/constant/MaterialData';
import { LayerEditPanel } from './panels';
import LayerContextMenu from './panels/LayerContextMenu';
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import Konva from 'konva';
import { Layer, Stage, Transformer, Rect, Line } from 'react-konva';
import { RectangleLayer, CircleLayer, PolygonLayer, ImageLayer, TextLayer } from './layers';

// 常量配置
const TRANSFORMABLE_TYPES = ['rectangle', 'circle', 'polygon', 'image', 'text'] as const;
const TRANSFORMER_CONFIG = {
    boundBoxFunc: (oldBox: any, newBox: any) => {
        if (newBox.width < 5 || newBox.height < 5) {
            return oldBox;
        }
        return newBox;
    },
    keepRatio: false,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right'] as string[],
    rotateEnabled: true,
    borderEnabled: true,
    borderStroke: "#ff0000",
    borderStrokeWidth: 2,
    borderDash: [5, 5] as number[],
    anchorFill: "#ff0000",
    anchorStroke: "#ffffff",
    anchorStrokeWidth: 2,
    anchorSize: 8,
} as const;

interface KnifeRenderProps {
  materialData?: MaterialData;
  onCanvasUpdate?: (canvas: HTMLCanvasElement) => void;
  selectedLayerId?: string;
  onLayerSelect?: (layerId: string) => void;
}

export interface KnifeRenderRef {
  handleAddLayer: (layerType: string) => void;
}

// 默认数据 - 移到组件外部，避免每次渲染都重新创建
const defaultMaterialData: MaterialData = {
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
      locked: false,
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
};

const KnifeRender = forwardRef<KnifeRenderRef, KnifeRenderProps>(({ 
  materialData,
  onCanvasUpdate,
  selectedLayerId,
  onLayerSelect 
}, ref) => {
    const [isClient, setIsClient] = useState(false);
    const renderRef = useRef<HTMLDivElement>(null);
    const [renderSize, setRenderSize] = useState({width: 0, height: 0});
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
    const [contextMenuLayer, setContextMenuLayer] = useState<MaterialLayer | null>(null);
    const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const [isContextMenuActive, setIsContextMenuActive] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    // 内部管理选中状态
    const [internalSelectedLayerId, setInternalSelectedLayerId] = useState<string | undefined>(selectedLayerId);
    
    // 使用外部传入的selectedLayerId或内部状态
    const currentSelectedLayerId = selectedLayerId !== undefined ? selectedLayerId : internalSelectedLayerId;
    
    // 获取容器尺寸
    const { width, height } = useContainerResize(renderRef);

    const { state: knifeData, updateState } = useUndoRedoState<Knife | undefined>('current-knife-data');
    
    // 获取当前选中的图层
    const selectedLayer = useMemo(() => {
        if (!currentSelectedLayerId || !knifeData?.layers) return null;
        return knifeData.layers.find(layer => layer.id === currentSelectedLayerId) || null;
    }, [currentSelectedLayerId, knifeData?.layers]);

    
    // 处理图层选择
    const handleLayerSelect = useCallback((layerId: string) => {
        if (onLayerSelect) {
            onLayerSelect(layerId);
        } else {
            setInternalSelectedLayerId(layerId);
        }
    }, [onLayerSelect]);

    // 处理Stage点击（点击空白区域）
    const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        // 如果点击的是Stage本身（不是子元素），则清除选择
        if (e.target === e.target.getStage()) {
            if (onLayerSelect) {
                onLayerSelect('');
            } else {
                setInternalSelectedLayerId(undefined);
            }
        }
    }, [onLayerSelect]);
    
    // 处理图层更新
    const handleLayerUpdate = useCallback((layerId: string, updates: Partial<MaterialLayer>) => {
        if (!knifeData?.layers) return;
        
        const newLayers = knifeData.layers.map(layer => 
            layer.id === layerId ? { ...layer, ...updates } : layer
        );
        
        updateState({ ...knifeData, layers: newLayers } as Knife, 'update-layer');
    }, [knifeData, updateState]);

    // 处理图层删除
    const handleLayerDelete = useCallback((layerId: string) => {
        if (!knifeData?.layers) return;
        
        const newLayers = knifeData.layers.filter(layer => layer.id !== layerId);
        
        // 如果删除的是当前选中的图层，清除选择
        if (currentSelectedLayerId === layerId) {
            if (onLayerSelect) {
                onLayerSelect('');
            } else {
                setInternalSelectedLayerId(undefined);
            }
        }
        
        updateState({ ...knifeData, layers: newLayers } as Knife, 'delete-layer');
    }, [knifeData, updateState, currentSelectedLayerId, onLayerSelect]);

    // 处理图层复制
    const handleLayerCopy = useCallback((layer: MaterialLayer) => {
        if (!knifeData?.layers) return;
        
        const timestamp = Date.now();
        const newLayer = {
            ...layer,
            id: `${layer.id}-clone-${timestamp}`,
            name: `${layer.name} 副本`,
            position: { 
                x: (layer.position?.x || 0) + 20, 
                y: (layer.position?.y || 0) + 20 
            },
            zIndex: knifeData.layers.length,
            locked: false // 复制的图层默认不锁定
        };
        
        const newLayers = [...knifeData.layers, newLayer];
        updateState({ ...knifeData, layers: newLayers } as Knife, 'copy-layer');
    }, [knifeData, updateState]);

    // 处理图层上移
    const handleLayerMoveUp = useCallback((layerId: string) => {
        if (!knifeData?.layers) return;
        
        const newLayers = [...knifeData.layers];
        const index = newLayers.findIndex(layer => layer.id === layerId);
        
        if (index > 0) {
            [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
            // 更新 zIndex
            newLayers.forEach((layer, i) => {
                layer.zIndex = i;
            });
            updateState({ ...knifeData, layers: newLayers } as Knife, 'move-layer');
        }
    }, [knifeData, updateState]);

    // 处理图层下移
    const handleLayerMoveDown = useCallback((layerId: string) => {
        if (!knifeData?.layers) return;
        
        const newLayers = [...knifeData.layers];
        const index = newLayers.findIndex(layer => layer.id === layerId);
        
        if (index < newLayers.length - 1) {
            [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
            // 更新 zIndex
            newLayers.forEach((layer, i) => {
                layer.zIndex = i;
            });
            updateState({ ...knifeData, layers: newLayers } as Knife, 'move-layer');
        }
    }, [knifeData, updateState]);

    // 处理添加图层
    const handleAddLayer = useCallback((layerType: string) => {
        console.log('KnifeRender handleAddLayer called with:', layerType);
        console.log('knifeData:', knifeData);
        if (!knifeData) {
            console.log('No knifeData available');
            return;
        }
        
        const newLayer = {
            id: `layer-${Date.now()}`,
            name: `新${layerType === 'rectangle' ? '矩形' : layerType === 'circle' ? '圆形' : layerType === 'text' ? '文字' : layerType === 'image' ? '图片' : '多边形'}`,
            type: layerType as any,
            position: { x: 100, y: 100 },
            size: { 
                width: layerType === 'circle' ? 80 : 120, 
                height: layerType === 'circle' ? 80 : 80 
            },
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            zIndex: knifeData.layers.length,
            color: '#3b82f6',
            strokeColor: '#1e40af',
            strokeWidth: 2,
            ...(layerType === 'text' && { 
                text: '新文字', 
                fontSize: 16, 
                fontFamily: 'Arial',
                fontWeight: 'normal',
                fontStyle: 'normal',
                color: '#000000',
                textAlign: 'left',
                verticalAlign: 'top',
                lineHeight: 1.2,
                letterSpacing: 0
            }),
            ...(layerType === 'image' && { 
                imageUrl: '',
                fit: 'cover'
            }),
            ...(layerType === 'polygon' && { 
                points: [
                    { x: 0, y: 0 },
                    { x: 50, y: 0 },
                    { x: 25, y: 50 }
                ]
            })
        } as any;
        
        const newLayers = [...knifeData.layers, newLayer];
        console.log('Adding new layer:', newLayer);
        console.log('New layers array:', newLayers);
        updateState({ ...knifeData, layers: newLayers } as Knife, 'add-layer');
    }, [knifeData, updateState]);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        handleAddLayer
    }), [handleAddLayer]);
    
    // 处理关闭面板
    const handleClosePanel = useCallback(() => {
        if (onLayerSelect) {
            onLayerSelect('');
        } else {
            setInternalSelectedLayerId(undefined);
        }
    }, [onLayerSelect]);

    // 使用useMemo优化默认数据的选择
    const initialData = useMemo(() => {
      return materialData || defaultMaterialData;
    }, [materialData]);

    useEffect(() => {
        if (stageRef.current && width > 0 && height > 0) {
            stageRef.current.width(width);
            stageRef.current.height(height);
            stageRef.current.batchDraw();
        }
    }, [width, height]);

    // 预加载图片 - 使用useMemo优化
    const imageLayers = useMemo(() => {
        return knifeData?.layers?.filter(layer => layer.type === 'image') || [];
    }, [knifeData?.layers]);

    // 图片加载逻辑
    useEffect(() => {
        if (imageLayers.length === 0) return;
        
        const newLoadedImages = new Map(loadedImages);
        let hasNewImages = false;
        
        imageLayers.forEach(layer => {
            if (layer.type === 'image' && layer.imageUrl && !newLoadedImages.has(layer.imageUrl)) {
                hasNewImages = true;
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
        
        if (hasNewImages) {
            setLoadedImages(newLoadedImages);
        }
    }, [imageLayers, loadedImages]);

    // 使用useCallback处理Canvas更新
    const handleCanvasUpdate = useCallback((canvas: HTMLCanvasElement) => {
        if (onCanvasUpdate) {
            onCanvasUpdate(canvas);
        }
    }, [onCanvasUpdate]);

    // 当Canvas更新时，通知父组件和3D纹理更新
    const notifyCanvasUpdate = useCallback(() => {
        if (stageRef.current && knifeData) {
            const canvas = stageRef.current.toCanvas();
            handleCanvasUpdate(canvas);
            
            // 触发自定义事件，通知3D纹理更新
            window.dispatchEvent(new CustomEvent('knife-content-updated', {
                detail: { 
                    canvas, 
                    timestamp: Date.now(),
                    reason: 'canvas-updated'
                }
            }));
        }
    }, [knifeData, handleCanvasUpdate]);

    // 监听刀版数据变化，触发纹理更新事件
    useEffect(() => {
        if (!knifeData) return;
        
        // 延迟触发，确保Konva已经完成渲染
        const timer = setTimeout(() => {
            notifyCanvasUpdate();
        }, 100);
        
        return () => clearTimeout(timer);
    }, [knifeData, notifyCanvasUpdate]); // 监听layers变化和notifyCanvasUpdate

    // 检查图层类型是否支持Transformer
    const isLayerTransformable = useCallback((layerId: string) => {
        if (!knifeData) return false;
        const layer = knifeData.layers.find(l => l.id === layerId);
        if (!layer) return false;
        
        return TRANSFORMABLE_TYPES.includes(layer.type as any);
    }, [knifeData]);

    // 处理图层选择，更新Transformer
    useEffect(() => {
        if (!transformerRef.current) {
            return;
        }

        if (!currentSelectedLayerId) {
            transformerRef.current.nodes([]);
            transformerRef.current.visible(false);
            transformerRef.current.getLayer()?.batchDraw();
            return;
        }

        // 检查选中的图层是否支持Transformer
        if (!isLayerTransformable(currentSelectedLayerId)) {
            transformerRef.current.nodes([]);
            transformerRef.current.visible(false);
            transformerRef.current.getLayer()?.batchDraw();
            return;
        }

        // 延迟查找节点，确保DOM已更新
        const timer = setTimeout(() => {
            if (!transformerRef.current || !stageRef.current) {
                return;
            }
            
            // 查找选中的图层节点
            const selectedNode = stageRef.current.findOne(`#${currentSelectedLayerId}`);
            
            if (selectedNode) {
                transformerRef.current.nodes([selectedNode]);
                transformerRef.current.visible(true);
                transformerRef.current.getLayer()?.batchDraw();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [currentSelectedLayerId, isLayerTransformable]);

    // 处理Transformer变化
    const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>) => {
        if (!knifeData) return;
        
        const node = e.target;
        const layerId = node.id();
        const layer = knifeData.layers.find(l => l.id === layerId);
        
        if (!layer) return;

        // 获取变换后的属性
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const rotation = node.rotation();
        const x = node.x();
        const y = node.y();

        // 重置缩放，因为我们已经应用了变换
        node.scaleX(1);
        node.scaleY(1);

        // 更新图层数据
        const newLayers = knifeData.layers.map(l => {
            if (l.id === layerId) {
                return {
                    ...l,
                    position: { x, y },
                    rotation: rotation,
                    size: {
                        width: l.size.width * scaleX,
                        height: l.size.height * scaleY
                    }
                };
            }
            return l;
        });

        updateState({ ...knifeData, layers: newLayers } as Knife, `变换${layer.name}`);
        
        // 变换结束后立即触发canvas更新通知
        setTimeout(() => {
            notifyCanvasUpdate();
        }, 50);
    }, [knifeData, updateState, notifyCanvasUpdate]);

    // 通用事件处理器
    const createLayerEventHandlers = useCallback((layer: MaterialLayer) => {
        const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
            // 如果右键菜单激活，不触发图层选择
            if (isContextMenuActive) {
                return;
            }
            handleLayerSelect(layer.id);
            e.cancelBubble = true;
        };

        const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
            if (!knifeData) return;
            const newLayers = knifeData.layers.map(l => 
                l.id === layer.id 
                    ? { ...l, position: { x: e.target.x(), y: e.target.y() } }
                    : l
            );
            updateState({ ...knifeData, layers: newLayers } as Knife, `移动${layer.name}`);
            
            // 拖拽结束后立即触发canvas更新通知
            setTimeout(() => {
                notifyCanvasUpdate();
            }, 50);
        };

        return { handleClick, handleDragEnd };
    }, [knifeData, updateState, notifyCanvasUpdate, handleLayerSelect, isContextMenuActive]);


    // 通用样式计算
    const getLayerStyles = useCallback((layer: MaterialLayer) => {
        const isSelected = currentSelectedLayerId === layer.id;
        const isTextLayer = layer.type === 'text';
        const baseStrokeColor = isTextLayer ? undefined : (layer as any).strokeColor;
        const baseStrokeWidth = isTextLayer ? undefined : (layer as any).strokeWidth;
        
        return {
            isSelected,
            strokeColor: isSelected ? '#ff0000' : baseStrokeColor,
            strokeWidth: isSelected ? (isTextLayer ? 2 : baseStrokeWidth + 2) : baseStrokeWidth,
        };
    }, [currentSelectedLayerId]);

    // 渲染不同类型的图层
    const renderLayer = useCallback((layer: MaterialLayer) => {
        if (!knifeData || !layer.visible) return null;
        
        const { strokeColor, strokeWidth } = getLayerStyles(layer);
        const { handleClick, handleDragEnd } = createLayerEventHandlers(layer);

        const commonEventProps = {
            onClick: handleClick,
            onTap: handleClick,
            onDragEnd: handleDragEnd,
            onTransformEnd: handleTransformEnd,
        };

        switch (layer.type) {
            case 'rectangle':
                return (
                    <RectangleLayer
                        layer={layer}
                        strokeColor={strokeColor}
                        strokeWidth={strokeWidth}
                        {...commonEventProps}
                    />
                );

            case 'circle':
                return (
                    <CircleLayer
                        layer={layer}
                        strokeColor={strokeColor}
                        strokeWidth={strokeWidth}
                        {...commonEventProps}
                    />
                );

            case 'polygon':
                return (
                    <PolygonLayer
                        layer={layer}
                        strokeColor={strokeColor}
                        strokeWidth={strokeWidth}
                        {...commonEventProps}
                    />
                );

            case 'image':
                const imageElement = loadedImages.get(layer.imageUrl);
                return (
                    <ImageLayer
                        layer={layer}
                        strokeColor={strokeColor}
                        strokeWidth={strokeWidth}
                        imageElement={imageElement}
                        {...commonEventProps}
                    />
                );

            case 'text':
                return (
                    <TextLayer
                        layer={layer}
                        {...commonEventProps}
                    />
                );

            default:
                return null;
        }
    }, [knifeData, getLayerStyles, createLayerEventHandlers, handleTransformEnd, loadedImages]);


    return (
        <div ref={renderRef} className={`aspect-square max-h-[100%] w-[max-content] bg-white ${styles.canvas2d_min_height}`}>
            <div className="p-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">
                        {knifeData?.name || '刀版'} - 2D刀版
                    </h3>
                    <div className="text-xs text-gray-500">
                        选中: {currentSelectedLayerId || '无'} | 图层: {knifeData?.layers.length || 0}
                    </div>
                </div>
            </div>
            
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <Stage 
                        id="knife-render-canvas" 
                        ref={stageRef} 
                        className={styles.canvas_container} 
                        width={renderSize.width} 
                        height={renderSize.height}
                        onClick={(e) => {
                            // 如果点击的是Stage本身，清除菜单
                            if (e.target === e.target.getStage()) {
                                setContextMenuLayer(null);
                                setContextMenuPosition(null);
                                setIsContextMenuActive(false);
                            }
                            handleStageClick(e);
                        }}
                        onContextMenu={(e) => {
                            e.evt.preventDefault();
                            e.evt.stopPropagation();
                            
                            // 标记右键菜单激活
                            setIsContextMenuActive(true);
                            
                            // 延迟重置状态，确保右键菜单完全处理
                            setTimeout(() => {
                                setIsContextMenuActive(false);
                            }, 100);
                            
                            // 获取鼠标位置
                            const container = stageRef.current?.container();
                            if (!container) return;
                            
                            const rect = container.getBoundingClientRect();
                            const x = e.evt.clientX - rect.left;
                            const y = e.evt.clientY - rect.top;
                            
                            // 如果点击的是Stage本身，清除菜单
                            if (e.target === e.target.getStage()) {
                                setContextMenuLayer(null);
                                setContextMenuPosition(null);
                                setIsContextMenuActive(false);
                                return;
                            }
                            
                            // 查找点击的图层
                            const layerId = e.target.id();
                            if (layerId && knifeData?.layers) {
                                const layer = knifeData.layers.find(l => l.id === layerId);
                                if (layer) {
                                    setContextMenuLayer(layer);
                                    setContextMenuPosition({ x, y });
                                }
                            }
                        }}
                    >
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
                        
                        {/* 刀版轮廓线 */}
                        {knifeData?.outline && knifeData.outline.visible && (
                            <Line
                                key={knifeData.id}
                                draggable
                                points={knifeData.outline.points.flatMap(p => [p.x, p.y])}
                                stroke={knifeData.outline.strokeColor || '#000000'}
                                strokeWidth={knifeData.outline.strokeWidth || 2}
                                closed={true}
                                fill="transparent"
                                dash={[10, 5]}
                            />
                        )}
                        
                        {/* 图层 - 按zIndex排序 */}
                        {knifeData?.layers
                            .sort((a, b) => a.zIndex - b.zIndex)
                            .map(renderLayer)}
                        
                        {/* Transformer */}
                        <Transformer
                            ref={transformerRef}
                            {...TRANSFORMER_CONFIG}
                            visible={true}
                        />
                    </Layer>
                    </Stage>
                </ContextMenuTrigger>
                {contextMenuLayer && contextMenuPosition && (
                    <LayerContextMenu
                        layer={contextMenuLayer}
                        position={contextMenuPosition}
                        onUpdate={(updates) => handleLayerUpdate(contextMenuLayer.id, updates)}
                        onDelete={handleLayerDelete}
                        onCopy={handleLayerCopy}
                        onMoveUp={handleLayerMoveUp}
                        onMoveDown={handleLayerMoveDown}
                    />
                )}
            </ContextMenu>
            
            {/* 图层编辑面板 */}
            <LayerEditPanel
                selectedLayer={selectedLayer}
                onLayerUpdate={handleLayerUpdate}
                onClose={handleClosePanel}
                onDelete={handleLayerDelete}
                onCopy={handleLayerCopy}
                onMoveUp={handleLayerMoveUp}
                onMoveDown={handleLayerMoveDown}
            />

        </div>
    );
});

export default KnifeRender;