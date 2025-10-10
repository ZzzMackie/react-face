"use client";
import React from 'react';
import { MaterialLayer } from '../../../canvas3D/constant/MaterialData';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImageContentEditorProps {
  layer: MaterialLayer;
  onUpdate: (updates: Partial<MaterialLayer>) => void;
}

export function ImageContentEditor({ layer, onUpdate }: ImageContentEditorProps) {
  const handleImageUrlChange = (value: string) => {
    onUpdate({ imageUrl: value });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 创建本地 URL
      const url = URL.createObjectURL(file);
      handleImageUrlChange(url);
    }
  };

  return (
    <div className="space-y-5">
      {/* 图片 URL */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label htmlFor="image-url" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          图片 URL
        </Label>
        <Input
          id="image-url"
          type="url"
          value={(layer as any).imageUrl || ''}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          className="h-8 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
          placeholder="输入图片 URL"
        />
      </div>

      {/* 文件上传 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          上传图片
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="h-8 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500/20 transition-colors"
          />
          <Button size="sm" variant="outline" className="h-8">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 图片预览 */}
      {(layer as any).imageUrl && (
        <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            预览
          </Label>
          <div className="border border-gray-300 rounded-md p-2 bg-white/60">
            <img
              src={(layer as any).imageUrl}
              alt="预览"
              className="max-w-full max-h-32 object-contain mx-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}