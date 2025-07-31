"use client"; 
import styles from '@/assets/moduleCss/canvas.module.css';
import { Layer, Rect, Circle, Line, Text, Stage } from 'react-konva';
import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { useUndoRedoState } from '@/hooks/useGlobalUndoRedo';
import { useContainerResize } from '@/hooks/useContainerResize';
import { MaterialData, MaterialMesh } from '../canvas3D/constant/MaterialData';

interface KnifeRenderProps {
  materialData?: MaterialData;
  onCanvasUpdate?: (canvas: HTMLCanvasElement) => void;
  selectedMeshId?: string;
  onMeshSelect?: (meshId: string) => void;
}

export default function KnifeRender({ 
  materialData,
  onCanvasUpdate,
  selectedMeshId,
  onMeshSelect 
}: KnifeRenderProps) {
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
            createdAt: new Date(),
            updatedAt: new Date()
        } as MaterialData,
        { debounceMs: 200 }
    );

    // 当Canvas更新时，通知父组件
    useEffect(() => {
        if (stageRef.current && onCanvasUpdate) {
            const canvas = stageRef.current.toCanvas();
            onCanvasUpdate(canvas);
        }
    }, [knifeData, onCanvasUpdate]);

    // 渲染不同类型的Mesh
    const renderMesh = (mesh: MaterialMesh) => {
        const isSelected = selectedMeshId === mesh.id;
        const strokeColor = isSelected ? '#ff0000' : mesh.strokeColor;
        const strokeWidth = isSelected ? mesh.strokeWidth + 2 : mesh.strokeWidth;

        switch (mesh.type) {
            case 'rectangle':
                return (
                    <Rect
                        key={mesh.id}
                        x={mesh.position.x}
                        y={mesh.position.y}
                        width={mesh.size.width}
                        height={mesh.size.height}
                        rotation={mesh.rotation}
                        fill={mesh.color}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        draggable
                        onClick={() => onMeshSelect?.(mesh.id)}
                        onTap={() => onMeshSelect?.(mesh.id)}
                        onDragEnd={(e) => {
                            const newMeshes = knifeData.meshes.map(m => 
                                m.id === mesh.id 
                                    ? { ...m, position: { x: e.target.x(), y: e.target.y() } }
                                    : m
                            );
                            updateState({ ...knifeData, meshes: newMeshes }, `移动${mesh.name}`);
                        }}
                    />
                );

            case 'circle':
                return (
                    <Circle
                        key={mesh.id}
                        x={mesh.position.x}
                        y={mesh.position.y}
                        radius={mesh.radius || mesh.size.width / 2}
                        fill={mesh.color}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        draggable
                        onClick={() => onMeshSelect?.(mesh.id)}
                        onTap={() => onMeshSelect?.(mesh.id)}
                        onDragEnd={(e) => {
                            const newMeshes = knifeData.meshes.map(m => 
                                m.id === mesh.id 
                                    ? { ...m, position: { x: e.target.x(), y: e.target.y() } }
                                    : m
                            );
                            updateState({ ...knifeData, meshes: newMeshes }, `移动${mesh.name}`);
                        }}
                    />
                );

            case 'polygon':
                if (mesh.points) {
                    const flatPoints = mesh.points.flatMap(p => [p.x, p.y]);
                    return (
                        <Line
                            key={mesh.id}
                            points={flatPoints}
                            fill={mesh.color}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            closed
                            draggable
                            onClick={() => onMeshSelect?.(mesh.id)}
                            onTap={() => onMeshSelect?.(mesh.id)}
                            onDragEnd={(e) => {
                                const newMeshes = knifeData.meshes.map(m => 
                                    m.id === mesh.id 
                                        ? { ...m, position: { x: e.target.x(), y: e.target.y() } }
                                        : m
                                );
                                updateState({ ...knifeData, meshes: newMeshes }, `移动${mesh.name}`);
                            }}
                        />
                    );
                }
                return null;

            default:
                return null;
        }
    };

    // 渲染网格线
    const renderGrid = () => {
        const gridSize = 20;
        const lines = [];
        
        for (let i = 0; i <= knifeData.canvasSize.width; i += gridSize) {
            lines.push(
                <Line
                    key={`v-${i}`}
                    points={[i, 0, i, knifeData.canvasSize.height]}
                    stroke="#e0e0e0"
                    strokeWidth={0.5}
                />
            );
        }
        
        for (let i = 0; i <= knifeData.canvasSize.height; i += gridSize) {
            lines.push(
                <Line
                    key={`h-${i}`}
                    points={[0, i, knifeData.canvasSize.width, i]}
                    stroke="#e0e0e0"
                    strokeWidth={0.5}
                />
            );
        }
        
        return lines;
    };

    // 渲染标注信息
    const renderLabels = () => {
        return knifeData.meshes.map(mesh => (
            <Text
                key={`label-${mesh.id}`}
                x={mesh.position.x}
                y={mesh.position.y - 20}
                text={mesh.name}
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
    })
    console.log(stageRef.current?.container())
    useEffect(() => {
        if (stageRef.current) {
          updateCurrentCanvas({
            id: 'currentCanvas',
            name: '当前Canvas',
            description: '当前Canvas',
            canvasId: '#knife-render-canvas'
          })
        }
    }, [stageRef.current])
    return (
        <div ref={renderRef} className={`aspect-square max-h-[100%] w-[max-content] bg-white ${styles.canvas2d_min_height}`}>
            <div className="p-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">
                        {knifeData.name} - 2D刀版
                    </h3>
                    <div className="text-xs text-gray-500">
                        选中: {selectedMeshId || '无'} | 组件: {knifeData.meshes.length}
                    </div>
                </div>
            </div>
            
            <Stage id="knife-render-canvas" ref={stageRef} className={styles.canvas_container} width={renderSize.width} height={renderSize.height}>
                <Layer>
                    {/* 背景网格 */}
                    {renderGrid()}
                    
                    {/* 刀版划线 */}
                    {knifeData.meshes.map(renderMesh)}
                    
                    {/* 标注信息 */}
                    {renderLabels()}
                </Layer>
            </Stage>
        </div>
    )
}