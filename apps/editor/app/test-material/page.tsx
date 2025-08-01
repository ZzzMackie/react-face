"use client";
import { useState, useEffect } from 'react';
import { Material, Model, sampleMaterials, sampleModels } from '../components/canvas3D/constant/MaterialData';
import { getOrGenerateKnives, getModelMeshInfo, hasValidModelStructure } from '../utils/meshUtils';
import { getAllCacheKeys, clearAllKnifeCache } from '../../utils/knifeCache';

export default function TestMaterial() {
  const [materials, setMaterials] = useState<Material[]>(sampleMaterials);
  const [models, setModels] = useState<Model[]>(sampleModels);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isLoadingKnives, setIsLoadingKnives] = useState(false);
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);

  // 加载缓存键
  useEffect(() => {
    getAllCacheKeys().then(keys => setCacheKeys(keys));
  }, []);

  // 处理物料选择
  const handleMaterialSelect = (material: Material) => {
    setSelectedMaterial(material);
    const model = models.find(m => m.id === material.modelId);
    setSelectedModel(model || null);
  };

  // 测试生成刀版数据
  const handleGenerateKnives = async () => {
    if (!selectedMaterial || !selectedModel) return;
    
    setIsLoadingKnives(true);
    try {
      const knives = await getOrGenerateKnives(selectedMaterial.id, selectedModel);
      
      // 更新物料数据
      const updatedMaterial = {
        ...selectedMaterial,
        knives: knives
      };
      
      setMaterials(prev => 
        prev.map(m => m.id === selectedMaterial.id ? updatedMaterial : m)
      );
      setSelectedMaterial(updatedMaterial);
      
      // 重新加载缓存键
      const newCacheKeys = await getAllCacheKeys();
      setCacheKeys(newCacheKeys);
      
      console.log(`为物料 ${selectedMaterial.name} 生成了 ${knives.length} 个刀版`);
    } catch (error) {
      console.error('生成刀版数据失败:', error);
    } finally {
      setIsLoadingKnives(false);
    }
  };

  // 清除所有缓存
  const handleClearCache = async () => {
    await clearAllKnifeCache();
    setCacheKeys([]);
    console.log('已清除所有缓存');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">物料数据结构测试</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：物料和模型信息 */}
          <div className="space-y-6">
            {/* 物料列表 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">物料列表</h2>
              <div className="space-y-3">
                {materials.map(material => (
                  <div
                    key={material.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedMaterial?.id === material.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleMaterialSelect(material)}
                  >
                    <h3 className="font-semibold text-gray-800">{material.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{material.description}</p>
                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                      <div>ID: {material.id}</div>
                      <div>模型ID: {material.modelId}</div>
                      <div>刀版数量: {material.knives.length}</div>
                      <div>标签: {material.tags?.join(', ') || '无'}</div>
                      <div>分类: {material.category || '未分类'}</div>
                      <div>创建时间: {material.createdAt.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 模型列表 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">模型列表</h2>
              <div className="space-y-3">
                {models.map(model => (
                  <div
                    key={model.id}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedModel?.id === model.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800">{model.name}</h3>
                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                      <div>ID: {model.id}</div>
                      <div>文件路径: {model.modelPath}</div>
                      <div>UUID: {model.uuid}</div>
                      <div>缩放: {model.scale}</div>
                      <div>位置: [{model.position.join(', ')}]</div>
                      <div>旋转: [{model.rotation.join(', ')}]</div>
                      <div>结构有效: {hasValidModelStructure(model) ? '是' : '否'}</div>
                      <div>Mesh数量: {getModelMeshInfo(model).length}</div>
                      <div>创建时间: {model.createdAt.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：详细信息和控制 */}
          <div className="space-y-6">
            {/* 选中物料详情 */}
            {selectedMaterial && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">选中物料详情</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-700">基本信息</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div>名称: {selectedMaterial.name}</div>
                      <div>描述: {selectedMaterial.description}</div>
                      <div>模型ID: {selectedMaterial.modelId}</div>
                      <div>刀版数量: {selectedMaterial.knives.length}</div>
                    </div>
                  </div>

                  {selectedModel && (
                    <div>
                      <h3 className="font-medium text-gray-700">关联模型</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div>名称: {selectedModel.name}</div>
                        <div>文件路径: {selectedModel.modelPath}</div>
                        <div>Mesh数量: {getModelMeshInfo(selectedModel).length}</div>
                      </div>
                    </div>
                  )}

                  {/* 刀版列表 */}
                  {selectedMaterial.knives.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700">刀版列表</h3>
                      <div className="mt-2 space-y-2">
                        {selectedMaterial.knives.map(knife => (
                          <div key={knife.id} className="p-3 bg-gray-50 rounded text-sm">
                            <div className="font-medium">{knife.name}</div>
                            <div className="text-gray-600">关联Mesh: {knife.meshName}</div>
                            <div className="text-gray-600">图层数量: {knife.layers.length}</div>
                            <div className="text-gray-600">画布尺寸: {knife.canvasSize.width} × {knife.canvasSize.height}</div>
                            <div className="text-gray-600">描边点: {knife.outline.points.length} 个</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="pt-4">
                    <button
                      onClick={handleGenerateKnives}
                      disabled={!selectedModel || isLoadingKnives}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoadingKnives ? '生成中...' : '生成刀版数据'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 缓存信息 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">缓存信息</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">缓存键数量: {cacheKeys.length}</span>
                  <button
                    onClick={handleClearCache}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    清除所有缓存
                  </button>
                </div>
                
                {cacheKeys.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">缓存键列表</h3>
                    <div className="space-y-1">
                      {cacheKeys.map(key => (
                        <div key={key} className="p-2 bg-gray-50 rounded text-xs font-mono">
                          {key}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 数据结构说明 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">数据结构说明</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <h3 className="font-medium text-gray-700">新的数据结构</h3>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li><strong>Model（模型）</strong>: 独立的3D模型数据，包含结构信息</li>
                    <li><strong>Material（物料）</strong>: 通过modelId关联Model，knives初始为空</li>
                    <li><strong>Knife（刀版）</strong>: 根据Model的Mesh信息动态生成</li>
                    <li><strong>缓存机制</strong>: 使用localforage缓存刀版数据</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">工作流程</h3>
                  <ol className="mt-2 space-y-1 list-decimal list-inside">
                    <li>选择物料 → 加载关联的模型</li>
                    <li>检查缓存 → 有则使用，无则生成</li>
                    <li>根据模型Mesh信息生成刀版数据</li>
                    <li>缓存生成的刀版数据</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 