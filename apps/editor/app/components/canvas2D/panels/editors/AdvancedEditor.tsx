"use client";
import React, { useState } from 'react';
import { MaterialLayer } from '../../../canvas3D/constant/MaterialData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Settings
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
  const [isLocked, setIsLocked] = useState(false);
  const [isVisible, setIsVisible] = useState(layer.visible);

  const handleLockToggle = (checked: boolean) => {
    setIsLocked(checked);
    onUpdate({ 
      // 这里可以添加锁定相关的属性
      // locked: checked 
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

  return (
    <div className="space-y-5">
      {/* 图层信息 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Settings className="h-4 w-4" />
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