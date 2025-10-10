"use client";
import React from 'react';
import { MaterialLayer } from '../../../canvas3D/constant/MaterialData';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw } from 'lucide-react';

interface TransformEditorProps {
  layer: MaterialLayer;
  onUpdate: (updates: Partial<MaterialLayer>) => void;
}

// 预设角度
const PRESET_ANGLES = [
  { label: '0°', value: 0 },
  { label: '45°', value: 45 },
  { label: '90°', value: 90 },
  { label: '135°', value: 135 },
  { label: '180°', value: 180 },
  { label: '225°', value: 225 },
  { label: '270°', value: 270 },
  { label: '315°', value: 315 },
];

export function TransformEditor({ layer, onUpdate }: TransformEditorProps) {
  const handlePositionChange = (field: 'x' | 'y', value: number) => {
    onUpdate({
      position: {
        ...layer.position,
        [field]: value
      }
    });
  };

  const handleSizeChange = (field: 'width' | 'height', value: number) => {
    onUpdate({
      size: {
        ...layer.size,
        [field]: value
      }
    });
  };

  const handleRotationChange = (value: number) => {
    onUpdate({ rotation: value });
  };

  const handlePresetAngle = (angle: number) => {
    handleRotationChange(angle);
  };

  const handleRotateLeft = () => {
    const newAngle = (layer.rotation - 90) % 360;
    handleRotationChange(newAngle < 0 ? newAngle + 360 : newAngle);
  };

  const handleRotateRight = () => {
    const newAngle = (layer.rotation + 90) % 360;
    handleRotationChange(newAngle);
  };

  return (
    <div className="space-y-5">
      {/* 位置 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          位置
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="pos-x" className="text-xs text-gray-600 font-medium">X 坐标</Label>
            <Input
              id="pos-x"
              type="number"
              value={layer.position.x}
              onChange={(e) => handlePositionChange('x', Number(e.target.value))}
              className="h-8 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pos-y" className="text-xs text-gray-600 font-medium">Y 坐标</Label>
            <Input
              id="pos-y"
              type="number"
              value={layer.position.y}
              onChange={(e) => handlePositionChange('y', Number(e.target.value))}
              className="h-8 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 尺寸 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          尺寸
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="width" className="text-xs text-gray-600 font-medium">宽度</Label>
            <Input
              id="width"
              type="number"
              value={layer.size.width}
              onChange={(e) => handleSizeChange('width', Number(e.target.value))}
              className="h-8 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500/20 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="height" className="text-xs text-gray-600 font-medium">高度</Label>
            <Input
              id="height"
              type="number"
              value={layer.size.height}
              onChange={(e) => handleSizeChange('height', Number(e.target.value))}
              className="h-8 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 旋转 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label htmlFor="rotation" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          旋转角度
        </Label>
        
        {/* 手动输入 */}
        <div className="space-y-2">
          <Input
            id="rotation"
            type="number"
            value={layer.rotation}
            onChange={(e) => handleRotationChange(Number(e.target.value))}
            className="h-8 bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 transition-colors"
            min="-360"
            max="360"
            step="1"
            placeholder="输入角度"
          />
        </div>

        {/* 快速旋转按钮 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotateLeft}
            className="h-8 px-3 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            左转90°
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotateRight}
            className="h-8 px-3 text-xs"
          >
            <RotateCw className="h-3 w-3 mr-1" />
            右转90°
          </Button>
        </div>

        {/* 预设角度 */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-600 font-medium">预设角度</Label>
          <div className="grid grid-cols-4 gap-1">
            {PRESET_ANGLES.map((preset) => (
              <Button
                key={preset.value}
                variant={layer.rotation === preset.value ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetAngle(preset.value)}
                className="h-7 text-xs px-2"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}