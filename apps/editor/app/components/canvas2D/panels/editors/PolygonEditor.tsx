"use client";
import React from 'react';
import { MaterialLayer } from '../../../canvas3D/constant/MaterialData';
import { BaseEditor, EDITOR_CONFIGS } from './BaseEditor';

interface PolygonEditorProps {
  layer: MaterialLayer;
  onUpdate: (updates: Partial<MaterialLayer>) => void;
  onDelete?: (layerId: string) => void;
  onCopy?: (layer: MaterialLayer) => void;
  onMoveUp?: (layerId: string) => void;
  onMoveDown?: (layerId: string) => void;
}

export function PolygonEditor({ 
  layer, 
  onUpdate, 
  onDelete, 
  onCopy, 
  onMoveUp, 
  onMoveDown 
}: PolygonEditorProps) {
  return (
    <BaseEditor 
      layer={layer} 
      onUpdate={onUpdate} 
      config={EDITOR_CONFIGS.polygon}
      onDelete={onDelete}
      onCopy={onCopy}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    />
  );
}