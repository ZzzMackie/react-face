"use client";
import React from 'react';
import { MaterialLayer } from '../../../canvas3D/constant/MaterialData';
import { BaseEditor, EDITOR_CONFIGS } from './BaseEditor';

interface CircleEditorProps {
  layer: MaterialLayer;
  onUpdate: (updates: Partial<MaterialLayer>) => void;
}

export function CircleEditor({ layer, onUpdate }: CircleEditorProps) {
  return (
    <BaseEditor 
      layer={layer} 
      onUpdate={onUpdate} 
      config={EDITOR_CONFIGS.circle} 
    />
  );
}