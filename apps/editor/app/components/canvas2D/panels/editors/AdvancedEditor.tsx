"use client";
import React, { useState } from 'react';
import { MaterialLayer } from '../../../canvas3D/constant/MaterialData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Copy, 
  Trash2, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown,
  RotateCcw,
  Settings,
  Layers,
  Move,
  RotateCw,
  ZoomIn,
  Palette,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Hexagon
} from 'lucide-react';

interface AdvancedEditorProps {
  layer: MaterialLayer;
  onUpdate: (updates: Partial<MaterialLayer>) => void;
  onDelete?: (layerId: string) => void;
  onCopy?: (layer: MaterialLayer) => void;
  onMoveUp?: (layerId: string) => void;
  onMoveDown?: (layerId: string) => void;
}

export function AdvancedEditor({ 
  layer,
  onUpdate,
  onDelete,
  onCopy,
  onMoveUp,
  onMoveDown
}: AdvancedEditorProps) {
  const [isLocked, setIsLocked] = useState(layer.locked || false);
  const [isVisible, setIsVisible] = useState(layer.visible);

  const handleLockToggle = (checked: boolean) => {
    setIsLocked(checked);
    onUpdate({ 
      locked: checked 
    });
  };

  const handleVisibilityToggle = (checked: boolean) => {
    setIsVisible(checked);
    onUpdate({ visible: checked });
  };

  const handleResetTransform = () => {
    onUpdate({
      position: { x: 0, y: 0 },
      rotation: 0,
      size: { width: 100, height: 100 }
    });
  };

  // 获取图层类型图标
  const getLayerTypeIcon = () => {
    switch (layer.type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'text': return <Type className="h-4 w-4" />;
      case 'rectangle': return <Square className="h-4 w-4" />;
      case 'circle': return <Circle className="h-4 w-4" />;
      case 'polygon': return <Hexagon className="h-4 w-4" />;
      default: return <Layers className="h-4 w-4" />;
    }
  };

  // 处理位置变化
  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    onUpdate({
      position: {
        ...layer.position,
        [axis]: value
      }
    });
  };

  // 处理尺寸变化
  const handleSizeChange = (axis: 'width' | 'height', value: number) => {
    onUpdate({
      size: {
        ...layer.size,
        [axis]: value
      }
    });
  };

  // 处理预设比例
  const handlePresetRatio = (widthRatio: number, heightRatio: number) => {
    const currentWidth = layer.size.width;
    const currentHeight = layer.size.height;
    
    // 计算当前比例
    const currentRatio = currentWidth / currentHeight;
    const targetRatio = widthRatio / heightRatio;
    
    let newWidth = currentWidth;
    let newHeight = currentHeight;
    
    if (currentRatio > targetRatio) {
      // 当前更宽，以高度为准
      newHeight = currentHeight;
      newWidth = currentHeight * targetRatio;
    } else {
      // 当前更高，以宽度为准
      newWidth = currentWidth;
      newHeight = currentWidth / targetRatio;
    }
    
    onUpdate({
      size: {
        width: Math.round(newWidth),
        height: Math.round(newHeight)
      }
    });
  };

  // 处理旋转变化
  const handleRotationChange = (value: number[]) => {
    onUpdate({ rotation: value[0] });
  };


  // 处理层级变化
  const handleZIndexChange = (value: number[]) => {
    onUpdate({ zIndex: value[0] });
  };

  return (
    <div className="space-y-5">
      {/* 图层信息 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {getLayerTypeIcon()}
          图层信息
        </div>
        <div className="space-y-2">
          <div>
            <Label htmlFor="layer-name" className="text-xs text-gray-600">图层名称</Label>
            <Input
              id="layer-name"
              value={layer.name || ''}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="h-8 text-xs"
              placeholder="输入图层名称"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div>ID: {layer.id}</div>
            <div>类型: {layer.type}</div>
          </div>
        </div>
      </div>

      {/* 变换属性 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Move className="h-4 w-4" />
          变换属性
        </div>
        <div className="space-y-3">
          {/* 位置 */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">位置</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="position-x" className="text-xs text-gray-500">X</Label>
                <Input
                  id="position-x"
                  type="number"
                  value={Math.round(layer.position.x)}
                  onChange={(e) => handlePositionChange('x', Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="position-y" className="text-xs text-gray-500">Y</Label>
                <Input
                  id="position-y"
                  type="number"
                  value={Math.round(layer.position.y)}
                  onChange={(e) => handlePositionChange('y', Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* 尺寸 */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">尺寸</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="size-width" className="text-xs text-gray-500">宽度</Label>
                <Input
                  id="size-width"
                  type="number"
                  value={Math.round(layer.size.width)}
                  onChange={(e) => handleSizeChange('width', Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="size-height" className="text-xs text-gray-500">高度</Label>
                <Input
                  id="size-height"
                  type="number"
                  value={Math.round(layer.size.height)}
                  onChange={(e) => handleSizeChange('height', Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            
            {/* 预设比例 */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">预设比例</Label>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => handlePresetRatio(1, 1)}
                >
                  1:1
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => handlePresetRatio(16, 9)}
                >
                  16:9
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => handlePresetRatio(4, 3)}
                >
                  4:3
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => handlePresetRatio(3, 2)}
                >
                  3:2
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => handlePresetRatio(5, 4)}
                >
                  5:4
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => handlePresetRatio(21, 9)}
                >
                  21:9
                </Button>
              </div>
            </div>
          </div>

          {/* 旋转 */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">旋转: {Math.round(layer.rotation)}°</Label>
            <Slider
              value={[layer.rotation]}
              onValueChange={handleRotationChange}
              min={-180}
              max={180}
              step={1}
              className="w-full"
            />
          </div>


          {/* 层级 */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">层级: {layer.zIndex}</Label>
            <Slider
              value={[layer.zIndex]}
              onValueChange={handleZIndexChange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 图层控制 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Settings className="h-4 w-4" />
          图层控制
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isVisible ? <Eye className="h-4 w-4 text-gray-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
              <Label htmlFor="visibility" className="text-xs text-gray-600">可见性</Label>
            </div>
            <Switch
              id="visibility"
              checked={isVisible}
              onCheckedChange={handleVisibilityToggle}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLocked ? <Lock className="h-4 w-4 text-gray-600" /> : <Unlock className="h-4 w-4 text-gray-400" />}
              <Label htmlFor="lock" className="text-xs text-gray-600">锁定</Label>
            </div>
            <Switch
              id="lock"
              checked={isLocked}
              onCheckedChange={handleLockToggle}
            />
          </div>
        </div>
      </div>

      {/* 几何图形属性 */}
      {(layer.type === 'rectangle' || layer.type === 'circle' || layer.type === 'polygon') && (
        <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Palette className="h-4 w-4" />
            几何属性
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="fill-color" className="text-xs text-gray-600">填充颜色</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="fill-color"
                  type="color"
                  value={layer.color || '#000000'}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="h-8 w-16 p-1"
                />
                <Input
                  type="text"
                  value={layer.color || '#000000'}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="h-8 text-xs flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="stroke-color" className="text-xs text-gray-600">描边颜色</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="stroke-color"
                  type="color"
                  value={layer.strokeColor || '#000000'}
                  onChange={(e) => onUpdate({ strokeColor: e.target.value })}
                  className="h-8 w-16 p-1"
                />
                <Input
                  type="text"
                  value={layer.strokeColor || '#000000'}
                  onChange={(e) => onUpdate({ strokeColor: e.target.value })}
                  className="h-8 text-xs flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">描边宽度: {layer.strokeWidth || 0}px</Label>
              <Slider
                value={[layer.strokeWidth || 0]}
                onValueChange={(value) => onUpdate({ strokeWidth: value[0] })}
                min={0}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            {layer.type === 'circle' && layer.radius !== undefined && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">半径: {Math.round(layer.radius)}px</Label>
                <Slider
                  value={[layer.radius]}
                  onValueChange={(value) => onUpdate({ radius: value[0] })}
                  min={10}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 图片属性 */}
      {layer.type === 'image' && (
        <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <ImageIcon className="h-4 w-4" />
            图片属性
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="image-fit" className="text-xs text-gray-600">适应方式</Label>
              <select
                id="image-fit"
                title="选择图片适应方式"
                value={layer.fit || 'cover'}
                onChange={(e) => onUpdate({ fit: e.target.value as any })}
                className="h-8 text-xs w-full px-2 border border-gray-300 rounded-md"
              >
                <option value="cover">覆盖</option>
                <option value="contain">包含</option>
                <option value="fill">填充</option>
                <option value="none">无</option>
              </select>
            </div>

            {layer.borderRadius !== undefined && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">圆角: {layer.borderRadius}px</Label>
                <Slider
                  value={[layer.borderRadius]}
                  onValueChange={(value) => onUpdate({ borderRadius: value[0] })}
                  min={0}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
            )}

            {layer.borderWidth !== undefined && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">边框宽度: {layer.borderWidth}px</Label>
                <Slider
                  value={[layer.borderWidth]}
                  onValueChange={(value) => onUpdate({ borderWidth: value[0] })}
                  min={0}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            )}

            {layer.borderColor && (
              <div>
                <Label htmlFor="border-color" className="text-xs text-gray-600">边框颜色</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="border-color"
                    type="color"
                    value={layer.borderColor}
                    onChange={(e) => onUpdate({ borderColor: e.target.value })}
                    className="h-8 w-16 p-1"
                  />
                  <Input
                    type="text"
                    value={layer.borderColor}
                    onChange={(e) => onUpdate({ borderColor: e.target.value })}
                    className="h-8 text-xs flex-1"
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 图层操作 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Settings className="h-4 w-4" />
          图层操作
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopy?.(layer)}
            className="h-8 text-xs"
          >
            <Copy className="h-3 w-3 mr-1" />
            复制
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetTransform}
            className="h-8 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            重置
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMoveUp?.(layer.id)}
            className="h-8 text-xs"
          >
            <ArrowUp className="h-3 w-3 mr-1" />
            上移
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMoveDown?.(layer.id)}
            className="h-8 text-xs"
          >
            <ArrowDown className="h-3 w-3 mr-1" />
            下移
          </Button>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete?.(layer.id)}
          className="w-full h-8 text-xs"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          删除图层
        </Button>
      </div>
    </div>
  );
}