"use client";
import React, { useState } from 'react';
import { MaterialLayer } from '../../canvas3D/constant/MaterialData';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import { 
  Copy, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  RotateCw,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  Hexagon
} from 'lucide-react';

interface LayerContextMenuProps {
  children?: React.ReactNode;
  layer: MaterialLayer;
  position?: { x: number; y: number };
  onUpdate: (updates: Partial<MaterialLayer>) => void;
  onDelete: (layerId: string) => void;
  onCopy: (layer: MaterialLayer) => void;
  onMoveUp: (layerId: string) => void;
  onMoveDown: (layerId: string) => void;
}

export default function LayerContextMenu({
  children,
  layer,
  position,
  onUpdate,
  onDelete,
  onCopy,
  onMoveUp,
  onMoveDown
}: LayerContextMenuProps) {
  const [isLocked, setIsLocked] = useState(layer.locked || false);
  const [isVisible, setIsVisible] = useState(layer.visible !== false);

  // 获取图层类型图标
  const getLayerTypeIcon = () => {
    switch (layer.type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'rectangle':
        return <Square className="h-4 w-4" />;
      case 'circle':
        return <Circle className="h-4 w-4" />;
      case 'polygon':
        return <Hexagon className="h-4 w-4" />;
      default:
        return <Square className="h-4 w-4" />;
    }
  };

  // 处理锁定切换
  const handleLockToggle = () => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    onUpdate({ locked: newLocked });
  };

  // 处理可见性切换
  const handleVisibilityToggle = () => {
    const newVisible = !isVisible;
    setIsVisible(newVisible);
    onUpdate({ visible: newVisible });
  };

  // 处理预设比例
  const handlePresetRatio = (widthRatio: number, heightRatio: number) => {
    const currentWidth = layer.size.width;
    const currentHeight = layer.size.height;
    
    // 计算新的尺寸，保持当前较大的维度
    const currentRatio = currentWidth / currentHeight;
    const targetRatio = widthRatio / heightRatio;
    
    let newWidth = currentWidth;
    let newHeight = currentHeight;
    
    if (currentRatio > targetRatio) {
      // 当前更宽，以宽度为准
      newHeight = currentWidth / targetRatio;
    } else {
      // 当前更高，以高度为准
      newWidth = currentHeight * targetRatio;
    }
    
    onUpdate({ 
      size: { 
        width: Math.round(newWidth), 
        height: Math.round(newHeight) 
      } 
    });
  };

  // 处理旋转
  const handleRotate = (angle: number) => {
    onUpdate({ rotation: angle });
  };

  // 如果没有children，直接返回ContextMenuContent
  if (!children) {
    return (
      <ContextMenuContent 
        className="w-48"
        style={position ? {
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 50
        } : undefined}
      >
        {/* 图层信息 */}
        <ContextMenuLabel className="flex items-center gap-2">
          {getLayerTypeIcon()}
          <span className="truncate">{layer.name || `图层 ${layer.id}`}</span>
        </ContextMenuLabel>
        <div className="text-xs text-muted-foreground px-2 py-1">
          {layer.type} • {Math.round(layer.size.width)}×{Math.round(layer.size.height)}
        </div>
        
        <ContextMenuSeparator />

        {/* 图层操作 */}
        <ContextMenuItem onClick={() => onCopy(layer)}>
          <Copy className="h-4 w-4" />
          复制图层
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onMoveUp(layer.id)}>
          <ArrowUp className="h-4 w-4" />
          上移一层
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onMoveDown(layer.id)}>
          <ArrowDown className="h-4 w-4" />
          下移一层
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onDelete(layer.id)}
          variant="destructive"
        >
          <Trash2 className="h-4 w-4" />
          删除图层
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* 图层属性 */}
        <ContextMenuItem onClick={handleLockToggle}>
          {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          {isLocked ? '解锁' : '锁定'}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleVisibilityToggle}>
          {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {isVisible ? '隐藏' : '显示'}
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* 预设比例子菜单 */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Square className="h-4 w-4" />
            预设比例
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => handlePresetRatio(1, 1)}>
              1:1 正方形
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handlePresetRatio(16, 9)}>
              16:9 宽屏
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handlePresetRatio(4, 3)}>
              4:3 标准
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handlePresetRatio(3, 2)}>
              3:2 经典
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handlePresetRatio(5, 4)}>
              5:4 传统
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handlePresetRatio(21, 9)}>
              21:9 超宽屏
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* 快速旋转子菜单 */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <RotateCw className="h-4 w-4" />
            快速旋转
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => handleRotate(0)}>
              0°
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleRotate(90)}>
              90°
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleRotate(180)}>
              180°
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleRotate(270)}>
              270°
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    );
  }

  // 有children时，返回完整的ContextMenu包装
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {/* 图层信息 */}
        <ContextMenuLabel className="flex items-center gap-2">
          {getLayerTypeIcon()}
          <span className="truncate">{layer.name || `图层 ${layer.id}`}</span>
        </ContextMenuLabel>
        <div className="text-xs text-muted-foreground px-2 py-1">
          {layer.type} • {Math.round(layer.size.width)}×{Math.round(layer.size.height)}
        </div>
        
        <ContextMenuSeparator />

        {/* 图层操作 */}
        <ContextMenuItem onClick={() => onCopy(layer)}>
          <Copy className="h-4 w-4" />
          复制图层
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onMoveUp(layer.id)}>
          <ArrowUp className="h-4 w-4" />
          上移一层
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onMoveDown(layer.id)}>
          <ArrowDown className="h-4 w-4" />
          下移一层
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onDelete(layer.id)}
          variant="destructive"
        >
          <Trash2 className="h-4 w-4" />
          删除图层
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* 图层属性 */}
        <ContextMenuItem onClick={handleLockToggle}>
          {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          {isLocked ? '解锁' : '锁定'}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleVisibilityToggle}>
          {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {isVisible ? '隐藏' : '显示'}
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* 预设比例子菜单 */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Square className="h-4 w-4" />
            预设比例
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => handlePresetRatio(1, 1)}>
              1:1 正方形
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handlePresetRatio(16, 9)}>
              16:9 宽屏
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handlePresetRatio(4, 3)}>
              4:3 标准
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handlePresetRatio(3, 2)}>
              3:2 经典
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handlePresetRatio(5, 4)}>
              5:4 传统
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handlePresetRatio(21, 9)}>
              21:9 超宽屏
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* 快速旋转子菜单 */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <RotateCw className="h-4 w-4" />
            快速旋转
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => handleRotate(0)}>
              0°
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleRotate(90)}>
              90°
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleRotate(180)}>
              180°
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleRotate(270)}>
              270°
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}