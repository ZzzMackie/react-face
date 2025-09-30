"use client";
import React, { useState } from 'react';
import { MaterialLayer } from '../../../canvas3D/constant/MaterialData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Minus, 
  Move, 
  RotateCw,
  Trash2,
  Edit3
} from 'lucide-react';

interface PolygonPointsEditorProps {
  layer: MaterialLayer;
  onUpdate: (updates: Partial<MaterialLayer>) => void;
}

export function PolygonPointsEditor({ layer, onUpdate }: PolygonPointsEditorProps) {
  const [editingPoint, setEditingPoint] = useState<number | null>(null);
  const [newPoint, setNewPoint] = useState({ x: 0, y: 0 });

  const points = (layer as any).points || [];

  const handleAddPoint = () => {
    const updatedPoints = [...points, newPoint];
    onUpdate({ points: updatedPoints });
    setNewPoint({ x: 0, y: 0 });
  };

  const handleDeletePoint = (index: number) => {
    if (points.length <= 3) return; // 至少保留3个点
    const updatedPoints = points.filter((_: any, i: number) => i !== index);
    onUpdate({ points: updatedPoints });
  };

  const handleUpdatePoint = (index: number, field: 'x' | 'y', value: number) => {
    const updatedPoints = points.map((point: any, i: number) => 
      i === index ? { ...point, [field]: value } : point
    );
    onUpdate({ points: updatedPoints });
  };

  const handleMovePoint = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const updatedPoints = [...points];
      [updatedPoints[index], updatedPoints[index - 1]] = [updatedPoints[index - 1], updatedPoints[index]];
      onUpdate({ points: updatedPoints });
    } else if (direction === 'down' && index < points.length - 1) {
      const updatedPoints = [...points];
      [updatedPoints[index], updatedPoints[index + 1]] = [updatedPoints[index + 1], updatedPoints[index]];
      onUpdate({ points: updatedPoints });
    }
  };

  const handleResetPoints = () => {
    const defaultPoints = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 25, y: 50 }
    ];
    onUpdate({ points: defaultPoints });
  };

  return (
    <div className="space-y-5">
      {/* 当前顶点列表 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Edit3 className="h-4 w-4" />
            顶点列表 ({points.length} 个点)
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetPoints}
            className="h-6 text-xs"
          >
            <RotateCw className="h-3 w-3 mr-1" />
            重置
          </Button>
        </div>
        
        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
          {points.map((point: any, index: number) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
              <div className="text-xs text-gray-500 w-6">#{index + 1}</div>
              
              <div className="flex-1 grid grid-cols-2 gap-1">
                <div>
                  <Label className="text-xs text-gray-600">X</Label>
                  <Input
                    type="number"
                    value={point.x}
                    onChange={(e) => handleUpdatePoint(index, 'x', Number(e.target.value))}
                    className="h-6 text-xs"
                    step="1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Y</Label>
                  <Input
                    type="number"
                    value={point.y}
                    onChange={(e) => handleUpdatePoint(index, 'y', Number(e.target.value))}
                    className="h-6 text-xs"
                    step="1"
                  />
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMovePoint(index, 'up')}
                  disabled={index === 0}
                  className="h-6 w-6 p-0"
                >
                  <Move className="h-3 w-3 rotate-[-90deg]" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMovePoint(index, 'down')}
                  disabled={index === points.length - 1}
                  className="h-6 w-6 p-0"
                >
                  <Move className="h-3 w-3 rotate-90" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePoint(index)}
                  disabled={points.length <= 3}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 添加新顶点 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Plus className="h-4 w-4" />
          添加新顶点
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-600">X 坐标</Label>
            <Input
              type="number"
              value={newPoint.x}
              onChange={(e) => setNewPoint({ ...newPoint, x: Number(e.target.value) })}
              className="h-8 text-xs"
              step="1"
              placeholder="X"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Y 坐标</Label>
            <Input
              type="number"
              value={newPoint.y}
              onChange={(e) => setNewPoint({ ...newPoint, y: Number(e.target.value) })}
              className="h-8 text-xs"
              step="1"
              placeholder="Y"
            />
          </div>
        </div>
        <Button
          onClick={handleAddPoint}
          className="w-full h-8 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          添加顶点
        </Button>
      </div>

      {/* 快捷操作 */}
      <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Move className="h-4 w-4" />
          快捷操作
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const centerX = points.reduce((sum: number, p: any) => sum + p.x, 0) / points.length;
              const centerY = points.reduce((sum: number, p: any) => sum + p.y, 0) / points.length;
              const updatedPoints = points.map((p: any) => ({
                x: p.x - centerX,
                y: p.y - centerY
              }));
              onUpdate({ points: updatedPoints });
            }}
            className="h-8 text-xs"
          >
            居中对齐
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const updatedPoints = points.map((p: any) => ({
                x: Math.round(p.x),
                y: Math.round(p.y)
              }));
              onUpdate({ points: updatedPoints });
            }}
            className="h-8 text-xs"
          >
            整数化
          </Button>
        </div>
      </div>
    </div>
  );
}