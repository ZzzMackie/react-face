"use client";
import React from 'react';
import { MaterialLayer } from '../../../canvas3D/constant/MaterialData';
import { BaseEditor, EDITOR_CONFIGS } from './BaseEditor';

interface ImageEditorProps {
  layer: MaterialLayer;
  onUpdate: (updates: Partial<MaterialLayer>) => void;
}

export function ImageEditor({ layer, onUpdate }: ImageEditorProps) {
  return (
    <BaseEditor 
      layer={layer} 
      onUpdate={onUpdate} 
      config={EDITOR_CONFIGS.image} 
    />
  );
}