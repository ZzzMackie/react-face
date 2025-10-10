/**
 * 编辑器状态管理服务
 * 负责管理编辑器的全局状态
 * 遵循单一职责原则 (SRP)
 */
import { Model, Material } from '@/app/components/canvas3D/constant/MaterialData';

export interface EditorState {
  models: Model[];
  materials: Material[];
  currentModel: Model | null;
  currentMaterial: Material | null;
  isLoading: boolean;
  error: string | null;
}

export interface EditorStateActions {
  setModels: (models: Model[]) => void;
  setMaterials: (materials: Material[]) => void;
  setCurrentModel: (model: Model | null) => void;
  setCurrentMaterial: (material: Material | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export class EditorStateService {
  private static readonly DEFAULT_STATE: EditorState = {
    models: [],
    materials: [],
    currentModel: null,
    currentMaterial: null,
    isLoading: false,
    error: null
  };
  
  /**
   * 创建初始状态
   * @param models 模型列表
   * @param materials 物料列表
   * @returns 初始状态
   */
  static createInitialState(models: Model[], materials: Material[]): EditorState {
    const defaultModel = models[0] || null;
    const defaultMaterial = materials.find(m => m.modelId === defaultModel?.id) || materials[0] || null;
    
    return {
      ...this.DEFAULT_STATE,
      models,
      materials,
      currentModel: defaultModel,
      currentMaterial: defaultMaterial
    };
  }
  
  /**
   * 验证状态更新
   * @param currentState 当前状态
   * @param newState 新状态
   * @returns 是否有效
   */
  static validateStateUpdate(currentState: EditorState, newState: Partial<EditorState>): boolean {
    // 检查物料是否关联到存在的模型
    if (newState.materials) {
      const modelIds = new Set(currentState.models.map(m => m.id));
      const invalidMaterials = newState.materials.filter(m => !modelIds.has(m.modelId));
      
      if (invalidMaterials.length > 0) {
        console.warn('状态更新包含无效的物料关联:', invalidMaterials.map(m => m.id));
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 获取状态摘要
   * @param state 状态
   * @returns 状态摘要
   */
  static getStateSummary(state: EditorState) {
    return {
      modelCount: state.models.length,
      materialCount: state.materials.length,
      hasCurrentModel: !!state.currentModel,
      hasCurrentMaterial: !!state.currentMaterial,
      isLoading: state.isLoading,
      hasError: !!state.error
    };
  }
}