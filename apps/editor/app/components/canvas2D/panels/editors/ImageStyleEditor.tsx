"use client";
import React, { useState } from 'react';
import { MaterialLayer } from '../../../canvas3D/constant/MaterialData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Crop, 
  Palette, 
  Sun, 
  Contrast, 
  Droplets, 
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Image as ImageIcon
} from 'lucide-react';

interface ImageStyleEditorProps {
  layer: MaterialLayer;
  onUpdate: (updates: Partial<MaterialLayer>) => void;
}

export function ImageStyleEditor({ layer, onUpdate }: ImageStyleEditorProps) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [opacity, setOpacity] = useState(layer.opacity * 100);

  const handleBrightnessChange = (value: number[]) => {
    setBrightness(value[0]);
    // 这里可以应用亮度滤镜
  };

  const handleContrastChange = (value: number[]) => {
    setContrast(value[0]);
    // 这里可以应用对比度滤镜
  };

  const handleSaturationChange = (value: number[]) => {
    setSaturation(value[0]);
    // 这里可以应用饱和度滤镜
  };

  const handleHueChange = (value: number[]) => {
    setHue(value[0]);
    // 这里可以应用色相滤镜
  };

  const handleBlurChange = (value: number[]) => {
    setBlur(value[0]);
    // 这里可以应用模糊滤镜
  };

  const handleOpacityChange = (value: number[]) => {
    const newOpacity = value[0] / 100;
    setOpacity(value[0]);
    onUpdate({ opacity: newOpacity });
  };

  const handleFlipHorizontal = () => {
    // 这里可以应用水平翻转
    console.log('水平翻转');
  };

  const handleFlipVertical = () => {
    // 这里可以应用垂直翻转
    console.log('垂直翻转');
  };

  const handleRotate = () => {
    const currentRotation = layer.rotation || 0;
    onUpdate({ rotation: currentRotation + 90 });
  };

  const handleCrop = () => {
    // 这里可以打开裁切工具
    console.log('打开裁切工具');
  };

  return (
    <div className="space-y-5">
      {/* 图片预览 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <ImageIcon className="h-4 w-4" />
          图片预览
        </div>
        <div className="w-full h-24 bg-gray-100 rounded border flex items-center justify-center">
          <div className="text-xs text-gray-500">图片预览</div>
        </div>
      </div>

      {/* 基础调整 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Palette className="h-4 w-4" />
          基础调整
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-600">亮度</Label>
              <span className="text-xs text-gray-500">{brightness}%</span>
            </div>
            <Slider
              value={[brightness]}
              onValueChange={handleBrightnessChange}
              max={200}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-600">对比度</Label>
              <span className="text-xs text-gray-500">{contrast}%</span>
            </div>
            <Slider
              value={[contrast]}
              onValueChange={handleContrastChange}
              max={200}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-600">饱和度</Label>
              <span className="text-xs text-gray-500">{saturation}%</span>
            </div>
            <Slider
              value={[saturation]}
              onValueChange={handleSaturationChange}
              max={200}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-600">色相</Label>
              <span className="text-xs text-gray-500">{hue}°</span>
            </div>
            <Slider
              value={[hue]}
              onValueChange={handleHueChange}
              max={360}
              min={-180}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-600">透明度</Label>
              <span className="text-xs text-gray-500">{opacity}%</span>
            </div>
            <Slider
              value={[opacity]}
              onValueChange={handleOpacityChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 滤镜效果 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Droplets className="h-4 w-4" />
          滤镜效果
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-600">模糊</Label>
              <span className="text-xs text-gray-500">{blur}px</span>
            </div>
            <Slider
              value={[blur]}
              onValueChange={handleBlurChange}
              max={20}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 图片操作 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Crop className="h-4 w-4" />
          图片操作
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCrop}
            className="h-8 text-xs"
          >
            <Crop className="h-3 w-3 mr-1" />
            裁切
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            className="h-8 text-xs"
          >
            <RotateCw className="h-3 w-3 mr-1" />
            旋转
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlipHorizontal}
            className="h-8 text-xs"
          >
            <FlipHorizontal className="h-3 w-3 mr-1" />
            水平翻转
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlipVertical}
            className="h-8 text-xs"
          >
            <FlipVertical className="h-3 w-3 mr-1" />
            垂直翻转
          </Button>
        </div>
      </div>

      {/* 预设滤镜 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Palette className="h-4 w-4" />
          预设滤镜
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['原图', '黑白', '复古', '鲜艳', '柔和', '冷色调'].map((filter) => (
            <Button
              key={filter}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => console.log(`应用滤镜: ${filter}`)}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}