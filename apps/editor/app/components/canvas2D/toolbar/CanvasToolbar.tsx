"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Square, Circle, Type, Image, Triangle } from 'lucide-react';
import './toolbar.css';

interface ToolbarProps {
  onAddLayer: (layerType: string) => void;
}

interface ToolItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TOOL_ITEMS: ToolItem[] = [
  {
    id: 'rectangle',
    label: '矩形',
    icon: <Square className="h-4 w-4" />,
    description: '添加矩形图层'
  },
  {
    id: 'circle',
    label: '圆形',
    icon: <Circle className="h-4 w-4" />,
    description: '添加圆形图层'
  },
  {
    id: 'text',
    label: '文字',
    icon: <Type className="h-4 w-4" />,
    description: '添加文字图层'
  },
  {
    id: 'image',
    label: '图片',
    icon: <Image className="h-4 w-4" />,
    description: '添加图片图层'
  },
  {
    id: 'polygon',
    label: '多边形',
    icon: <Triangle className="h-4 w-4" />,
    description: '添加多边形图层'
  }
];

export default function CanvasToolbar({ onAddLayer }: ToolbarProps) {
  return (
    <div className=" z-40 bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-xl shadow-2xl p-2 custom-scrollbar">
      <div className="flex flex-col gap-2">
        {TOOL_ITEMS.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition-all duration-200 group"
            onClick={() => {
                console.log('Toolbar button clicked:', item.id);
                onAddLayer(item.id);
            }}
            title={item.description}
          >
            <div className="text-gray-600 group-hover:text-blue-600 transition-colors">
              {item.icon}
            </div>
            <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
              {item.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}