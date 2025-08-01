"use client";
import { useState, useEffect } from 'react';
import { Material, Knife, ModelMesh, Model, sampleMaterials, sampleModels } from '../components/canvas3D/constant/MaterialData';
import KnifeRender from '../components/canvas2D/knifeRender';
import LayerEditor from '../components/canvas2D/LayerEditor';
import { useUndoRedoState } from '@/hooks/useGlobalUndoRedo';
import { useGlobalState, useGlobalStateValue } from '@/hooks/useGlobalState';
import { getOrGenerateKnives, getModelMeshInfo } from '../utils/meshUtils';

export default function MaterialManager() {
  // 使用全局状态管理一些UI状态
  const [selectedMaterial, setSelectedMaterial] = useGlobalState<Material | null>('selected-material', sampleMaterials[0]);
  const [selectedModel, setSelectedModel] = useGlobalState<Model | null>('selected-model', null);
  const [selectedKnife, setSelectedKnife] = useGlobalState<Knife | null>('selected-knife', null);
  const [selectedLayerId, setSelectedLayerId] = useGlobalState<string | undefined>('selected-layer-id', undefined);
  const [canvasTexture, setCanvasTexture] = useGlobalState<HTMLCanvasElement | null>('canvas-texture', null);
  const [isLoadingKnives, setIsLoadingKnives] = useGlobalState<boolean>('loading-knives', false);
  
  // 使用本地状态管理一些临时状态
  const [localLoadingState, setLocalLoadingState] = useState(false);

  // 使用全局状态管理当前选中的刀版数据
  const { state: currentKnifeData, updateState } = useUndoRedoState(
    'current-knife-data',
    selectedKnife || null,
    { debounceMs: 200 }
  );

  // 根据选中的物料加载对应的模型
  useEffect(() => {
    if (selectedMaterial) {
      const model = sampleModels.find(m => m.id === selectedMaterial.modelId);
      setSelectedModel(model || null);
      
      // 如果物料有刀版数据，选择第一个
      if (selectedMaterial.knives.length > 0) {
        setSelectedKnife(selectedMaterial.knives[0]);
      } else {
        setSelectedKnife(null);
      }
    }
  }, [selectedMaterial]);

  // 当模型加载完成后，生成或获取刀版数据
  useEffect(() => {
    if (selectedMaterial && selectedModel) {
      setIsLoadingKnives(true);
      setLocalLoadingState(true);
      
      getOrGenerateKnives(selectedMaterial.id, selectedModel)
        .then(knives => {
          if (knives.length > 0) {
            // 更新物料的刀版数据
            const updatedMaterial = {
              ...selectedMaterial,
              knives: knives
            };
            setSelectedMaterial(updatedMaterial);
            setSelectedKnife(knives[0]);
          }
        })
        .catch(error => {
          console.error('加载刀版数据失败:', error);
        })
        .finally(() => {
          setIsLoadingKnives(false);
          setLocalLoadingState(false);
        });
    }
  }, [selectedMaterial?.id, selectedModel?.id]);

  // 处理物料选择
  const handleMaterialSelect = (material: Material) => {
    setSelectedMaterial(material);
    setSelectedLayerId(undefined);
  };

  // 处理刀版选择
  const handleKnifeSelect = (knife: Knife) => {
    setSelectedKnife(knife);
    setSelectedLayerId(undefined);
  };

  // 处理图层选择
  const handleLayerSelect = (layerId: string) => {
    setSelectedLayerId(layerId);
  };

  // 处理图层更新
  const handleLayerUpdate = (updatedLayer: any) => {
    if (!currentKnifeData) return;
    
    const newLayers = currentKnifeData.layers.map(layer => 
      layer.id === updatedLayer.id ? updatedLayer : layer
    );
    
    const updatedKnife = { ...currentKnifeData, layers: newLayers };
    updateState(updatedKnife, `更新${updatedLayer.name}`);
  };

  // 处理图层添加
  const handleLayerAdd = (newLayer: any) => {
    if (!currentKnifeData) return;
    
    const newLayers = [...currentKnifeData.layers, newLayer];
    const updatedKnife = { ...currentKnifeData, layers: newLayers };
    updateState(updatedKnife, `添加${newLayer.name}`);
  };

  // 处理图层删除
  const handleLayerDelete = (layerId: string) => {
    if (!currentKnifeData) return;
    
    const layer = currentKnifeData.layers.find(l => l.id === layerId);
    const newLayers = currentKnifeData.layers.filter(l => l.id !== layerId);
    const updatedKnife = { ...currentKnifeData, layers: newLayers };
    updateState(updatedKnife, `删除${layer?.name || '图层'}`);
    
    if (selectedLayerId === layerId) {
      setSelectedLayerId(undefined);
    }
  };

  // 处理Canvas更新
  const handleCanvasUpdate = (canvas: HTMLCanvasElement) => {
    setCanvasTexture(canvas);
  };

  // 获取模型中的所有Mesh信息
  const getModelMeshInfo = (model: Model | null): Array<{ id: string; name: string; type: string }> => {
    if (!model || !model.structure) {
      return [];
    }
    
    const meshes: Array<{ id: string; name: string; type: string }> = [];
    
    const traverseStructure = (children: any[]) => {
      children.forEach(child => {
        if (child.type === 'mesh') {
          meshes.push({
            id: child.id,
            name: child.name,
            type: child.type
          });
        } else if (child.type === 'group' && child.children) {
          traverseStructure(child.children);
        }
      });
    };
    
    if (model.structure.children) {
      traverseStructure(model.structure.children);
    }
    
    return meshes;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左侧面板 - 物料和模型信息 */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">物料管理</h2>
        </div>
        
        {/* 物料列表 */}
        <div className="p-4 border-b">
          <h3 className="text-md font-medium text-gray-700 mb-3">物料列表</h3>
          <div className="space-y-2">
            {sampleMaterials.map(material => (
              <div
                key={material.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedMaterial?.id === material.id
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => handleMaterialSelect(material)}
              >
                <div className="font-medium text-gray-800">{material.name}</div>
                <div className="text-sm text-gray-600">{material.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  模型: {sampleModels.find(m => m.id === material.modelId)?.name || '未知'}
                </div>
                <div className="text-xs text-gray-500">
                  刀版: {material.knives.length} 个
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 模型信息 */}
        {selectedModel && (
          <div className="p-4 border-b">
            <h3 className="text-md font-medium text-gray-700 mb-3">模型信息</h3>
            <div className="space-y-2 text-sm">
              <div><strong>名称:</strong> {selectedModel.name}</div>
              <div><strong>文件路径:</strong> {selectedModel.modelPath}</div>
              <div><strong>UUID:</strong> {selectedModel.uuid}</div>
              <div><strong>缩放:</strong> {selectedModel.scale}</div>
              <div><strong>位置:</strong> [{selectedModel.position.join(', ')}]</div>
              <div><strong>旋转:</strong> [{selectedModel.rotation.join(', ')}]</div>
            </div>
          </div>
        )}

        {/* Mesh列表 */}
        {selectedModel && (
          <div className="p-4 border-b">
            <h3 className="text-md font-medium text-gray-700 mb-3">Mesh列表</h3>
                         {isLoadingKnives || localLoadingState ? (
               <div className="text-sm text-gray-500">正在加载刀版数据...</div>
             ) : (
              <div className="space-y-2">
                {getModelMeshInfo(selectedModel).map(mesh => (
                  <div key={mesh.id} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{mesh.name}</div>
                    <div className="text-gray-600">ID: {mesh.id}</div>
                    <div className="text-gray-600">类型: {mesh.type}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 刀版列表 */}
        {selectedMaterial && selectedMaterial.knives.length > 0 && (
          <div className="p-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">刀版列表</h3>
            <div className="space-y-2">
              {selectedMaterial.knives.map(knife => (
                <div
                  key={knife.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedKnife?.id === knife.id
                      ? 'bg-green-100 border-green-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleKnifeSelect(knife)}
                >
                  <div className="font-medium text-gray-800">{knife.name}</div>
                  <div className="text-sm text-gray-600">{knife.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    关联Mesh: {knife.meshName}
                  </div>
                  <div className="text-xs text-gray-500">
                    图层: {knife.layers.length} 个
                  </div>
                  <div className="text-xs text-gray-500">
                    画布: {knife.canvasSize.width} × {knife.canvasSize.height}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 中间面板 - 2D刀版编辑器 */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-white m-4 rounded-lg shadow-lg overflow-hidden">
          {selectedKnife ? (
            <KnifeRender
              materialData={{
                id: selectedKnife.id,
                name: selectedKnife.name,
                description: selectedKnife.description,
                layers: selectedKnife.layers,
                model: selectedModel || {
                  id: 'default',
                  name: '默认模型',
                  modelPath: '',
                  uuid: 'default',
                  scale: 1,
                  position: [0, 0, 0],
                  rotation: [0, 0, 0]
                },
                canvasSize: selectedKnife.canvasSize,
                backgroundColor: selectedKnife.backgroundColor,
                meshes: [],
                createdAt: new Date(),
                updatedAt: new Date()
              }}
              onCanvasUpdate={handleCanvasUpdate}
              selectedLayerId={selectedLayerId}
              onLayerSelect={handleLayerSelect}
            />
          ) : (
                         <div className="flex items-center justify-center h-full text-gray-500">
               {isLoadingKnives || localLoadingState ? '正在加载刀版数据...' : '请选择一个刀版'}
             </div>
          )}
        </div>
      </div>

             {/* 右侧面板 - 图层编辑器 */}
       <div className="w-80 bg-white shadow-lg overflow-y-auto">
         {selectedKnife ? (
           <LayerEditor
             materialData={{
               id: selectedKnife.id,
               name: selectedKnife.name,
               description: selectedKnife.description,
               layers: selectedKnife.layers,
               model: selectedModel || {
                 id: 'default',
                 name: '默认模型',
                 modelPath: '',
                 uuid: 'default',
                 scale: 1,
                 position: [0, 0, 0],
                 rotation: [0, 0, 0]
               },
               canvasSize: selectedKnife.canvasSize,
               backgroundColor: selectedKnife.backgroundColor,
               meshes: [],
               createdAt: new Date(),
               updatedAt: new Date()
             }}
             selectedLayerId={selectedLayerId}
             onLayerSelect={handleLayerSelect}
             onLayerUpdate={handleLayerUpdate}
             onLayerAdd={handleLayerAdd}
             onLayerDelete={handleLayerDelete}
           />
         ) : (
           <div className="p-4 text-gray-500">
             请选择一个图层进行编辑
           </div>
         )}
       </div>
    </div>
  );
} 