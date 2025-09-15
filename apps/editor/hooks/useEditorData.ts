/**
 * 编辑器数据管理Hook
 * 负责管理编辑器的核心数据状态
 * 遵循单一职责原则 (SRP)
 */
import { useEffect, useCallback } from 'react';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useUndoRedoState } from '@/hooks/useGlobalUndoRedo';
import { Model, Material } from '@/app/components/canvas3D/constant/MaterialData';
import { EditorInitializationService } from '@/lib/services/EditorInitializationService';
import { EditorStateService } from '@/lib/services/EditorStateService';

export interface UseEditorDataReturn {
  // 数据状态
  models: Model[];
  materials: Material[];
  currentModel: Model | null;
  currentMaterial: Material | null;
  
  // 操作方法
  setModels: (models: Model[]) => void;
  setMaterials: (materials: Material[]) => void;
  setCurrentModel: (model: Model | null) => void;
  setCurrentMaterial: (material: Material | null) => void;
  
  // 状态信息
  isInitialized: boolean;
  error: string | null;
}

export function useEditorData(
  initialModels: Model[],
  initialMaterials: Material[]
): UseEditorDataReturn {
  // 全局状态管理 - 使用与原有组件兼容的键名
  const [models, setModels] = useGlobalState('model-list', initialModels);
  const [materials, setMaterials] = useGlobalState('material-list', initialMaterials);
  
  // 撤销重做状态管理 - 使用与原有组件兼容的键名
  const { state: currentModel, updateState: setCurrentModel } = useUndoRedoState<Model | null>(
    'current-model-data',
    initialModels[0] || null
  );
  
  const { state: currentMaterial, updateState: setCurrentMaterial } = useUndoRedoState<Material | null>(
    'current-material-data',
    initialMaterials.find(m => m.modelId === initialModels[0]?.id) || initialMaterials[0] || null
  );
  
  // 初始化状态
  const [isInitialized, setIsInitialized] = useGlobalState('editor-initialized', false);
  const [error, setError] = useGlobalState<string | null>('editor-error', null);
  
  // 初始化数据
  const initializeData = useCallback(() => {
    try {
      const result = EditorInitializationService.initializeEditorData({
        models: initialModels,
        materials: initialMaterials
      });
      
      if (!isInitialized) {
        setModels(initialModels);
        setMaterials(initialMaterials);
        setCurrentModel(result.defaultModel, '初始化默认模型', false);
        setCurrentMaterial(result.defaultMaterial, '初始化默认物料', false);
        setIsInitialized(true);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '初始化失败';
      setError(errorMessage);
    }
  }, [
    initialModels,
    initialMaterials,
    isInitialized,
    setModels,
    setMaterials,
    setCurrentModel,
    setCurrentMaterial,
    setIsInitialized,
    setError
  ]);
  
  // 验证状态更新
  const validateAndSetModels = useCallback((newModels: Model[]) => {
    if (EditorStateService.validateStateUpdate(
      EditorStateService.createInitialState(models, materials),
      { models: newModels }
    )) {
      setModels(newModels);
    } else {
      setError('模型数据验证失败');
    }
  }, [models, materials, setModels, setError]);
  
  const validateAndSetMaterials = useCallback((newMaterials: Material[]) => {
    if (EditorStateService.validateStateUpdate(
      EditorStateService.createInitialState(models, materials),
      { materials: newMaterials }
    )) {
      setMaterials(newMaterials);
    } else {
      setError('物料数据验证失败');
    }
  }, [models, materials, setMaterials, setError]);
  
  // 组件挂载时初始化
  useEffect(() => {
    initializeData();
  }, []); // 只在组件挂载时执行一次
  
  return {
    // 数据状态
    models,
    materials,
    currentModel: currentModel ?? null,
    currentMaterial: currentMaterial ?? null,
    
    // 操作方法
    setModels: validateAndSetModels,
    setMaterials: validateAndSetMaterials,
    setCurrentModel: (model) => setCurrentModel(model, '切换模型', true),
    setCurrentMaterial: (material) => setCurrentMaterial(material, '切换物料', true),
    
    // 状态信息
    isInitialized,
    error
  };
}