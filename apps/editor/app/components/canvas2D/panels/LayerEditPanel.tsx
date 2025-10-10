"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MaterialLayer } from '../../canvas3D/constant/MaterialData';
import { RectangleEditor } from './editors/RectangleEditor';
import { CircleEditor } from './editors/CircleEditor';
import { PolygonEditor } from './editors/PolygonEditor';
import { ImageEditor } from './editors/ImageEditor';
import { TextEditor } from './editors/TextEditor';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';
import './scrollbar.css';

interface LayerEditPanelProps {
  selectedLayer: MaterialLayer | null;
  onLayerUpdate: (layerId: string, updates: Partial<MaterialLayer>) => void;
  onClose: () => void;
  onDelete?: (layerId: string) => void;
  onCopy?: (layer: MaterialLayer) => void;
  onMoveUp?: (layerId: string) => void;
  onMoveDown?: (layerId: string) => void;
}

export default function LayerEditPanel({ 
  selectedLayer, 
  onLayerUpdate, 
  onClose,
  onDelete,
  onCopy,
  onMoveUp,
  onMoveDown
}: LayerEditPanelProps) {
  const [position, setPosition] = useState({ x: 300, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const transformRef = useRef<HTMLDivElement>(null);


  // 拖拽处理 - 使用 transform 优化性能
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      // 计算鼠标相对于面板当前位置的偏移量
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && transformRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // 使用 transform 进行拖拽
      transformRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && transformRef.current) {
      // 拖拽结束时，更新 position state
      const transform = transformRef.current.style.transform;
      const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
      if (match) {
        const newX = parseFloat(match[1]);
        const newY = parseFloat(match[2]);
        setPosition({ x: newX, y: newY });
        // 保持 transform，不要重置
        // transformRef.current.style.transform = '';
      }
    }
    setIsDragging(false);
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 渲染对应的编辑器
  const renderEditor = () => {
    if (!selectedLayer) return null;

    const commonProps = {
      layer: selectedLayer,
      onUpdate: (updates: Partial<MaterialLayer>) => onLayerUpdate(selectedLayer.id, updates),
      onDelete: (layerId: string) => {
        onDelete?.(layerId);
        onClose();
      },
      onCopy: onCopy,
      onMoveUp: onMoveUp,
      onMoveDown: onMoveDown
    };

    switch (selectedLayer.type) {
      case 'rectangle':
        return <RectangleEditor {...commonProps} />;
      case 'circle':
        return <CircleEditor {...commonProps} />;
      case 'polygon':
        return <PolygonEditor {...commonProps} />;
      case 'image':
        return <ImageEditor {...commonProps} />;
      case 'text':
        return <TextEditor {...commonProps} />;
      default:
        return (
          <div className="p-4 text-muted-foreground text-center">
            暂不支持此类型的图层编辑
          </div>
        );
    }
  };

  if (!selectedLayer) return null;

  return (
    <div
      ref={transformRef}
      className="fixed bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-xl shadow-2xl z-50 w-80 max-h-[80vh] overflow-hidden"
      style={{
        top: 0,
        left: 0,
        cursor: isDragging ? 'grabbing' : 'default',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        willChange: 'transform',
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 标题栏 - 可拖拽区域 */}
      <div className="drag-handle flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200/60 rounded-t-xl cursor-grab hover:from-gray-100 hover:to-gray-200/80 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <GripVertical className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">
              图层编辑器
            </span>
            <span className="text-xs text-gray-500 truncate max-w-[180px]">
              {selectedLayer.name}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors duration-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 编辑器内容 */}
      <div className="max-h-[calc(80vh-70px)] overflow-y-auto bg-white/50 custom-scrollbar">
        <div className="p-4 max-h-full overflow-y-auto custom-scrollbar">
          {renderEditor()}
        </div>
      </div>
    </div>
  );
}