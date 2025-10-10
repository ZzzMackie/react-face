"use client";
import React from 'react';
import { MaterialLayer } from '../../../canvas3D/constant/MaterialData';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TextContentEditorProps {
  layer: MaterialLayer;
  onUpdate: (updates: Partial<MaterialLayer>) => void;
}

export function TextContentEditor({ layer, onUpdate }: TextContentEditorProps) {
  const handleTextChange = (value: string) => {
    onUpdate({ text: value });
  };

  const handleFontSizeChange = (value: number) => {
    onUpdate({ fontSize: value });
  };

  const handleFontFamilyChange = (value: string) => {
    onUpdate({ fontFamily: value });
  };

  const handleFontWeightChange = (value: string) => {
    onUpdate({ fontWeight: value as any });
  };

  const handleFontStyleChange = (value: string) => {
    onUpdate({ fontStyle: value as any });
  };

  const handleTextAlignChange = (value: string) => {
    onUpdate({ textAlign: value as any });
  };

  const handleVerticalAlignChange = (value: string) => {
    onUpdate({ verticalAlign: value as any });
  };

  const handleLineHeightChange = (value: number) => {
    onUpdate({ lineHeight: value });
  };

  const handleLetterSpacingChange = (value: number) => {
    onUpdate({ letterSpacing: value });
  };

  return (
    <div className="space-y-5">
      {/* 文本内容 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label htmlFor="text-content" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          文本内容
        </Label>
        <textarea
          id="text-content"
          value={(layer as any).text || ''}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full min-h-[80px] px-3 py-2 text-sm border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          placeholder="输入文本内容..."
        />
      </div>

      {/* 字体大小 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label htmlFor="font-size" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          字体大小
        </Label>
        <Input
          id="font-size"
          type="number"
          value={(layer as any).fontSize || 16}
          onChange={(e) => handleFontSizeChange(Number(e.target.value))}
          className="h-8 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500/20 transition-colors"
          min="1"
        />
      </div>

      {/* 字体族 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          字体族
        </Label>
        <Select value={(layer as any).fontFamily || 'Arial'} onValueChange={handleFontFamilyChange}>
          <SelectTrigger className="h-8 bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 字体粗细 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          字体粗细
        </Label>
        <Select value={(layer as any).fontWeight || 'normal'} onValueChange={handleFontWeightChange}>
          <SelectTrigger className="h-8 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">正常</SelectItem>
            <SelectItem value="bold">粗体</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="200">200</SelectItem>
            <SelectItem value="300">300</SelectItem>
            <SelectItem value="400">400</SelectItem>
            <SelectItem value="500">500</SelectItem>
            <SelectItem value="600">600</SelectItem>
            <SelectItem value="700">700</SelectItem>
            <SelectItem value="800">800</SelectItem>
            <SelectItem value="900">900</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 字体样式 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
          字体样式
        </Label>
        <Select value={(layer as any).fontStyle || 'normal'} onValueChange={handleFontStyleChange}>
          <SelectTrigger className="h-8 bg-white border-gray-300 focus:border-pink-500 focus:ring-pink-500/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">正常</SelectItem>
            <SelectItem value="italic">斜体</SelectItem>
            <SelectItem value="oblique">倾斜</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 文本对齐 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          文本对齐
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-600 font-medium">水平对齐</Label>
            <Select value={(layer as any).textAlign || 'left'} onValueChange={handleTextAlignChange}>
              <SelectTrigger className="h-8 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">左对齐</SelectItem>
                <SelectItem value="center">居中</SelectItem>
                <SelectItem value="right">右对齐</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-600 font-medium">垂直对齐</Label>
            <Select value={(layer as any).verticalAlign || 'top'} onValueChange={handleVerticalAlignChange}>
              <SelectTrigger className="h-8 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">顶部</SelectItem>
                <SelectItem value="middle">居中</SelectItem>
                <SelectItem value="bottom">底部</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 行高和字母间距 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          间距设置
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="line-height" className="text-xs text-gray-600 font-medium">行高</Label>
            <Input
              id="line-height"
              type="number"
              value={(layer as any).lineHeight || 1.2}
              onChange={(e) => handleLineHeightChange(Number(e.target.value))}
              className="h-8 bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500/20 transition-colors"
              min="0"
              step="0.1"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="letter-spacing" className="text-xs text-gray-600 font-medium">字母间距</Label>
            <Input
              id="letter-spacing"
              type="number"
              value={(layer as any).letterSpacing || 0}
              onChange={(e) => handleLetterSpacingChange(Number(e.target.value))}
              className="h-8 bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500/20 transition-colors"
              step="0.1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}