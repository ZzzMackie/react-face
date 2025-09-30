"use client";
import React from 'react';
import { MaterialLayer } from '../../../canvas3D/constant/MaterialData';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface StyleEditorProps {
  layer: MaterialLayer;
  onUpdate: (updates: Partial<MaterialLayer>) => void;
}

export function StyleEditor({ layer, onUpdate }: StyleEditorProps) {
  const handleOpacityChange = (value: number) => {
    onUpdate({ opacity: value });
  };

  const handleColorChange = (value: string) => {
    onUpdate({ color: value });
  };

  const handleStrokeColorChange = (value: string) => {
    onUpdate({ strokeColor: value });
  };

  const handleStrokeWidthChange = (value: number) => {
    onUpdate({ strokeWidth: value });
  };

  return (
    <div className="space-y-5">
      {/* 透明度 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          透明度
        </Label>
        <div className="space-y-2">
          <Slider
            value={[layer.opacity]}
            onValueChange={(value) => handleOpacityChange(value[0])}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
          />
          <div className="text-xs text-gray-600 text-center font-medium bg-white/60 px-2 py-1 rounded">
            {Math.round(layer.opacity * 100)}%
          </div>
        </div>
      </div>

      {/* 填充颜色 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label htmlFor="fill-color" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
          填充颜色
        </Label>
        <div className="flex items-center gap-3">
          <Input
            id="fill-color"
            type="color"
            value={layer.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="h-10 w-16 cursor-pointer border-gray-300 rounded-lg"
          />
          <Input
            type="text"
            value={layer.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="h-8 bg-white border-gray-300 focus:border-pink-500 focus:ring-pink-500/20 transition-colors"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* 描边颜色 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label htmlFor="stroke-color" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          描边颜色
        </Label>
        <div className="flex items-center gap-3">
          <Input
            id="stroke-color"
            type="color"
            value={layer.strokeColor}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
            className="h-10 w-16 cursor-pointer border-gray-300 rounded-lg"
          />
          <Input
            type="text"
            value={layer.strokeColor}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
            className="h-8 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 transition-colors"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* 描边宽度 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label htmlFor="stroke-width" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          描边宽度
        </Label>
        <Input
          id="stroke-width"
          type="number"
          value={layer.strokeWidth}
          onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
          className="h-8 bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500/20 transition-colors"
          min="0"
        />
      </div>
    </div>
  );
}