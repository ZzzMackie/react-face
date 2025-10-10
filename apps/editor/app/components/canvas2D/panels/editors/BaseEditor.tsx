"use client";
import React from 'react';
import { MaterialLayer } from '../../../canvas3D/constant/MaterialData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransformEditor } from './TransformEditor';
import { StyleEditor } from './StyleEditor';
import { TextContentEditor } from './TextContentEditor';
import { ImageContentEditor } from './ImageContentEditor';
import { AdvancedEditor } from './AdvancedEditor';
import { PolygonPointsEditor } from './PolygonPointsEditor';
import { ImageStyleEditor } from './ImageStyleEditor';
import '../scrollbar.css';

export interface EditorTabConfig {
  id: string;
  label: string;
  component: React.ComponentType<{ 
    layer: MaterialLayer; 
    onUpdate: (updates: Partial<MaterialLayer>) => void;
    onDelete?: (layerId: string) => void;
    onCopy?: (layer: MaterialLayer) => void;
    onMoveUp?: (layerId: string) => void;
    onMoveDown?: (layerId: string) => void;
  }>;
}

export interface EditorConfig {
  tabs: readonly EditorTabConfig[];
  defaultTab?: string;
}

interface BaseEditorProps {
  layer: MaterialLayer;
  onUpdate: (updates: Partial<MaterialLayer>) => void;
  config: EditorConfig;
  onDelete?: (layerId: string) => void;
  onCopy?: (layer: MaterialLayer) => void;
  onMoveUp?: (layerId: string) => void;
  onMoveDown?: (layerId: string) => void;
}

export function BaseEditor({ layer, onUpdate, config, onDelete, onCopy, onMoveUp, onMoveDown }: BaseEditorProps) {
  const defaultTab = config.defaultTab || config.tabs[0]?.id || 'transform';

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="flex w-full bg-gray-100/80 p-1 rounded-lg overflow-x-auto custom-scrollbar">
        {config.tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id}
            value={tab.id} 
            className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {config.tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="space-y-5 mt-5 max-h-[calc(60vh-100px)] overflow-y-auto custom-scrollbar">
          <tab.component 
            layer={layer} 
            onUpdate={onUpdate}
            onDelete={onDelete}
            onCopy={onCopy}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

// 预定义的编辑器配置
export const EDITOR_CONFIGS = {
  rectangle: {
    tabs: [
      { id: 'transform', label: '变换', component: TransformEditor },
      { id: 'style', label: '样式', component: StyleEditor },
      { id: 'advanced', label: '高级', component: AdvancedEditor },
    ],
    defaultTab: 'transform'
  },
  
  circle: {
    tabs: [
      { id: 'transform', label: '变换', component: TransformEditor },
      { id: 'style', label: '样式', component: StyleEditor },
      { id: 'advanced', label: '高级', component: AdvancedEditor },
    ],
    defaultTab: 'transform'
  },
  
  polygon: {
    tabs: [
      { id: 'transform', label: '变换', component: TransformEditor },
      { id: 'style', label: '样式', component: StyleEditor },
      { id: 'points', label: '顶点', component: PolygonPointsEditor },
      { id: 'advanced', label: '高级', component: AdvancedEditor },
    ],
    defaultTab: 'transform'
  },
  
  image: {
    tabs: [
      { id: 'transform', label: '变换', component: TransformEditor },
      { id: 'image', label: '图片', component: ImageContentEditor },
      { id: 'style', label: '样式', component: ImageStyleEditor },
      { id: 'advanced', label: '高级', component: AdvancedEditor },
    ],
    defaultTab: 'transform'
  },
  
  text: {
    tabs: [
      { id: 'content', label: '内容', component: TextContentEditor },
      { id: 'transform', label: '变换', component: TransformEditor },
      { id: 'style', label: '样式', component: StyleEditor },
      { id: 'typography', label: '字体', component: TextContentEditor },
      { id: 'advanced', label: '高级', component: AdvancedEditor },
    ],
    defaultTab: 'content'
  }
} as const;