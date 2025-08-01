"use client";
import { useState } from 'react';
import KnifeRender from '../components/canvas2D/knifeRender';
import LayerEditor from '../components/canvas2D/LayerEditor';
import { MaterialData, MaterialLayer, sampleMaterialData } from '../components/canvas3D/constant/MaterialData';
import { useUndoRedoState } from '@/hooks/useGlobalUndoRedo';

export default function KnifeEditor() {
  const [selectedLayerId, setSelectedLayerId] = useState<string | undefined>();
  const [canvasTexture, setCanvasTexture] = useState<HTMLCanvasElement | null>(null);

  // 使用全局状态管理刀版数据
  const { state: materialData, updateState } = useUndoRedoState(
    'knife-editor-data',
    sampleMaterialData[0], // 使用示例数据
    { debounceMs: 200 }
  );

  // 处理图层选择
  const handleLayerSelect = (layerId: string) => {
    setSelectedLayerId(layerId);
  };

  // 处理图层更新
  const handleLayerUpdate = (updatedLayer: MaterialLayer) => {
    const newLayers = materialData.layers.map(layer => 
      layer.id === updatedLayer.id ? updatedLayer : layer
    );
    updateState({ ...materialData, layers: newLayers }, `更新${updatedLayer.name}`);
  };

  // 处理图层添加
  const handleLayerAdd = (newLayer: MaterialLayer) => {
    const newLayers = [...materialData.layers, newLayer];
    updateState({ ...materialData, layers: newLayers }, `添加${newLayer.name}`);
  };

  // 处理图层删除
  const handleLayerDelete = (layerId: string) => {
    const layer = materialData.layers.find(l => l.id === layerId);
    const newLayers = materialData.layers.filter(l => l.id !== layerId);
    updateState({ ...materialData, layers: newLayers }, `删除${layer?.name || '图层'}`);
    
    // 如果删除的是当前选中的图层，清除选择
    if (selectedLayerId === layerId) {
      setSelectedLayerId(undefined);
    }
  };

  // 处理Canvas更新
  const handleCanvasUpdate = (canvas: HTMLCanvasElement) => {
    setCanvasTexture(canvas);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左侧：刀版渲染器 */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-2xl font-bold text-gray-800">刀版编辑器</h1>
          <p className="text-gray-600 mt-1">拖拽图层，实时预览3D效果</p>
        </div>
        
        <div className="flex-1 p-4">
          <KnifeRender
            materialData={materialData}
            onCanvasUpdate={handleCanvasUpdate}
            selectedLayerId={selectedLayerId}
            onLayerSelect={handleLayerSelect}
          />
        </div>
      </div>

      {/* 右侧：图层编辑器 */}
      <LayerEditor
        materialData={materialData}
        selectedLayerId={selectedLayerId}
        onLayerSelect={handleLayerSelect}
        onLayerUpdate={handleLayerUpdate}
        onLayerAdd={handleLayerAdd}
        onLayerDelete={handleLayerDelete}
      />
    </div>
  );
} 