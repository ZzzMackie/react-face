"use client";
import React from 'react';
import { MaterialLayer } from '../../../canvas3D/constant/MaterialData';
import { BaseEditor, EDITOR_CONFIGS } from './BaseEditor';

interface TextEditorProps {
  layer: MaterialLayer;
  onUpdate: (updates: Partial<MaterialLayer>) => void;
}

export function TextEditor({ layer, onUpdate }: TextEditorProps) {
  return (
    <BaseEditor 
      layer={layer} 
      onUpdate={onUpdate} 
      config={EDITOR_CONFIGS.text} 
    />
  );
}