"use client";
import React, { useState, useEffect, useRef } from 'react';
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
  Image as ImageIcon,
  Zap,
  Mountain,
  Eye,
  EyeOff
} from 'lucide-react';
import CropTool from './CropTool';

interface ImageStyleEditorProps {
  layer: MaterialLayer;
  onUpdate: (updates: Partial<MaterialLayer>) => void;
}

export function ImageStyleEditor({ layer, onUpdate }: ImageStyleEditorProps) {
  const imgLayer = layer as any;
  const [brightness, setBrightness] = useState(imgLayer.brightness ?? 100);
  const [contrast, setContrast] = useState(imgLayer.contrast ?? 100);
  const [saturation, setSaturation] = useState(imgLayer.saturation ?? 100);
  const [hue, setHue] = useState(imgLayer.hue ?? 0);
  const [blur, setBlur] = useState(imgLayer.blur ?? 0);
  const [opacity, setOpacity] = useState(layer.opacity * 100);
  const [flipHorizontal, setFlipHorizontal] = useState(imgLayer.flipHorizontal ?? false);
  const [flipVertical, setFlipVertical] = useState(imgLayer.flipVertical ?? false);
  const [sharpen, setSharpen] = useState(imgLayer.sharpen ?? 0);
  const [shadowBlur, setShadowBlur] = useState(imgLayer.shadowBlur ?? 0);
  const [shadowOffsetX, setShadowOffsetX] = useState(imgLayer.shadowOffsetX ?? 0);
  const [shadowOffsetY, setShadowOffsetY] = useState(imgLayer.shadowOffsetY ?? 0);
  const [shadowColor, setShadowColor] = useState(imgLayer.shadowColor ?? '#000000');
  const [emboss, setEmboss] = useState(imgLayer.emboss ?? 0);
  const [sepia, setSepia] = useState(imgLayer.sepia ?? 0);
  const [invert, setInvert] = useState(imgLayer.invert ?? false);
  const [grayscale, setGrayscale] = useState(imgLayer.grayscale ?? false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [showCropTool, setShowCropTool] = useState(false);

  const handleBrightnessChange = (value: number[]) => {
    const newValue = value[0];
    setBrightness(newValue);
    onUpdate({ brightness: newValue });
  };

  const handleContrastChange = (value: number[]) => {
    const newValue = value[0];
    setContrast(newValue);
    onUpdate({ contrast: newValue });
  };

  const handleSaturationChange = (value: number[]) => {
    const newValue = value[0];
    setSaturation(newValue);
    onUpdate({ saturation: newValue });
  };

  const handleHueChange = (value: number[]) => {
    const newValue = value[0];
    setHue(newValue);
    onUpdate({ hue: newValue });
  };

  const handleBlurChange = (value: number[]) => {
    const newValue = value[0];
    setBlur(newValue);
    onUpdate({ blur: newValue });
  };

  const handleOpacityChange = (value: number[]) => {
    const newOpacity = value[0] / 100;
    setOpacity(value[0]);
    onUpdate({ opacity: newOpacity });
  };

  const handleFlipHorizontal = () => {
    const newValue = !flipHorizontal;
    setFlipHorizontal(newValue);
    onUpdate({ flipHorizontal: newValue });
  };

  const handleFlipVertical = () => {
    const newValue = !flipVertical;
    setFlipVertical(newValue);
    onUpdate({ flipVertical: newValue });
  };

  const handleRotate = () => {
    const currentRotation = layer.rotation || 0;
    onUpdate({ rotation: currentRotation + 90 });
  };

  const handleCrop = () => {
    setShowCropTool(!showCropTool);
  };

  const handleApplyCrop = (crop: { x: number; y: number; width: number; height: number }) => {
    onUpdate({ crop });
    setShowCropTool(false);
  };

  // 新增滤镜处理函数
  const handleSharpenChange = (value: number[]) => {
    const newValue = value[0];
    setSharpen(newValue);
    onUpdate({ sharpen: newValue });
  };

  const handleShadowBlurChange = (value: number[]) => {
    const newValue = value[0];
    setShadowBlur(newValue);
    onUpdate({ shadowBlur: newValue });
  };

  const handleShadowOffsetXChange = (value: number[]) => {
    const newValue = value[0];
    setShadowOffsetX(newValue);
    onUpdate({ shadowOffsetX: newValue });
  };

  const handleShadowOffsetYChange = (value: number[]) => {
    const newValue = value[0];
    setShadowOffsetY(newValue);
    onUpdate({ shadowOffsetY: newValue });
  };

  const handleShadowColorChange = (value: string) => {
    setShadowColor(value);
    onUpdate({ shadowColor: value });
  };

  const handleEmbossChange = (value: number[]) => {
    const newValue = value[0];
    setEmboss(newValue);
    onUpdate({ emboss: newValue });
  };

  const handleSepiaChange = (value: number[]) => {
    const newValue = value[0];
    setSepia(newValue);
    onUpdate({ sepia: newValue });
  };

  const handleInvertToggle = () => {
    const newValue = !invert;
    setInvert(newValue);
    onUpdate({ invert: newValue });
  };

  const handleGrayscaleToggle = () => {
    const newValue = !grayscale;
    setGrayscale(newValue);
    onUpdate({ grayscale: newValue });
  };

  // 生成预览图片
  const generatePreview = () => {
    if (!imgLayer.imageUrl || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 120;
      canvas.height = 90;
      
      ctx.save();
      
      // 应用翻转
      if (flipHorizontal || flipVertical) {
        const scaleX = flipHorizontal ? -1 : 1;
        const scaleY = flipVertical ? -1 : 1;
        ctx.scale(scaleX, scaleY);
        ctx.translate(
          flipHorizontal ? -canvas.width : 0,
          flipVertical ? -canvas.height : 0
        );
      }

      // 绘制图片
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 应用滤镜
      const filterString = [
        `brightness(${brightness}%)`,
        `contrast(${contrast}%)`,
        `saturate(${saturation}%)`,
        `hue-rotate(${hue}deg)`,
        blur > 0 ? `blur(${blur}px)` : '',
        sepia > 0 ? `sepia(${sepia}%)` : '',
        invert ? 'invert(1)' : '',
        grayscale ? 'grayscale(1)' : '',
      ].filter(Boolean).join(' ');

      if (filterString) {
        ctx.filter = filterString;
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      ctx.restore();

      setPreviewImage(canvas.toDataURL());
    };
    img.src = imgLayer.imageUrl;
  };

  // 当样式参数变化时更新预览
  useEffect(() => {
    generatePreview();
  }, [brightness, contrast, saturation, hue, blur, flipHorizontal, flipVertical, sharpen, shadowBlur, shadowOffsetX, shadowOffsetY, shadowColor, emboss, sepia, invert, grayscale, imgLayer.imageUrl]);

  return (
    <div className="space-y-5">
      {/* 图片预览 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <ImageIcon className="h-4 w-4" />
          图片预览
        </div>
        <div className="w-full h-24 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
          {previewImage ? (
            <img 
              src={previewImage} 
              alt="预览" 
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-xs text-gray-500">图片预览</div>
          )}
        </div>
        <canvas 
          ref={previewCanvasRef} 
          className="hidden"
          style={{ display: 'none' }}
        />
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-600 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                锐化
              </Label>
              <span className="text-xs text-gray-500">{sharpen}%</span>
            </div>
            <Slider
              value={[sharpen]}
              onValueChange={handleSharpenChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-600 flex items-center gap-1">
                <Mountain className="h-3 w-3" />
                浮雕
              </Label>
              <span className="text-xs text-gray-500">{emboss}%</span>
            </div>
            <Slider
              value={[emboss]}
              onValueChange={handleEmbossChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-600">棕褐色</Label>
              <span className="text-xs text-gray-500">{sepia}%</span>
            </div>
            <Slider
              value={[sepia]}
              onValueChange={handleSepiaChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* 开关类滤镜 */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={invert ? "default" : "outline"}
              size="sm"
              onClick={handleInvertToggle}
              className="h-8 text-xs"
            >
              <EyeOff className="h-3 w-3 mr-1" />
              反色
            </Button>
            <Button
              variant={grayscale ? "default" : "outline"}
              size="sm"
              onClick={handleGrayscaleToggle}
              className="h-8 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              灰度
            </Button>
          </div>
        </div>
      </div>

      {/* 阴影效果 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Sun className="h-4 w-4" />
          阴影效果
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-600">阴影模糊</Label>
              <span className="text-xs text-gray-500">{shadowBlur}px</span>
            </div>
            <Slider
              value={[shadowBlur]}
              onValueChange={handleShadowBlurChange}
              max={50}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-gray-600">X偏移</Label>
                <span className="text-xs text-gray-500">{shadowOffsetX}px</span>
              </div>
              <Slider
                value={[shadowOffsetX]}
                onValueChange={handleShadowOffsetXChange}
                max={50}
                min={-50}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-gray-600">Y偏移</Label>
                <span className="text-xs text-gray-500">{shadowOffsetY}px</span>
              </div>
              <Slider
                value={[shadowOffsetY]}
                onValueChange={handleShadowOffsetYChange}
                max={50}
                min={-50}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-600 mb-2 block">阴影颜色</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={shadowColor}
                onChange={(e) => handleShadowColorChange(e.target.value)}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                type="text"
                value={shadowColor}
                onChange={(e) => handleShadowColorChange(e.target.value)}
                className="flex-1 h-8 text-xs"
                placeholder="#000000"
              />
            </div>
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
            variant={showCropTool ? "default" : "outline"}
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
            variant={flipHorizontal ? "default" : "outline"}
            size="sm"
            onClick={handleFlipHorizontal}
            className="h-8 text-xs"
          >
            <FlipHorizontal className="h-3 w-3 mr-1" />
            水平翻转
          </Button>
          <Button
            variant={flipVertical ? "default" : "outline"}
            size="sm"
            onClick={handleFlipVertical}
            className="h-8 text-xs"
          >
            <FlipVertical className="h-3 w-3 mr-1" />
            垂直翻转
          </Button>
        </div>
      </div>

      {/* 裁切工具 */}
      {showCropTool && (
        <div className="space-y-3 p-3 bg-blue-50/80 rounded-lg border border-blue-200/60">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
            <Crop className="h-4 w-4" />
            裁切工具
          </div>
          <div className="space-y-3">
            <div className="text-xs text-gray-600">
              在预览图上拖拽选择裁切区域
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // 重置裁切
                  onUpdate({ crop: undefined });
                  setShowCropTool(false);
                }}
                className="h-8 text-xs"
              >
                重置
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCropTool(false)}
                className="h-8 text-xs"
              >
                完成
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 预设滤镜 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Palette className="h-4 w-4" />
          预设滤镜
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: '原图', brightness: 100, contrast: 100, saturation: 100, hue: 0 },
            { name: '黑白', brightness: 100, contrast: 100, saturation: 0, hue: 0 },
            { name: '复古', brightness: 90, contrast: 120, saturation: 80, hue: 20 },
            { name: '鲜艳', brightness: 110, contrast: 110, saturation: 150, hue: 0 },
            { name: '柔和', brightness: 105, contrast: 90, saturation: 85, hue: 0 },
            { name: '冷色调', brightness: 100, contrast: 100, saturation: 100, hue: -30 }
          ].map((filter) => (
            <Button
              key={filter.name}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setBrightness(filter.brightness);
                setContrast(filter.contrast);
                setSaturation(filter.saturation);
                setHue(filter.hue);
                onUpdate({ 
                  brightness: filter.brightness,
                  contrast: filter.contrast,
                  saturation: filter.saturation,
                  hue: filter.hue
                });
              }}
            >
              {filter.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 裁切工具弹窗 */}
      {showCropTool && imgLayer.imageUrl && (
        <CropTool
          imageUrl={imgLayer.imageUrl}
          onCrop={handleApplyCrop}
          onClose={() => setShowCropTool(false)}
        />
      )}
    </div>
  );
}