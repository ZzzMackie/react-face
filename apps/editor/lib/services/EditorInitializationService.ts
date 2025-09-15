/**
 * 编辑器初始化服务
 * 负责处理编辑器的初始化逻辑
 * 遵循单一职责原则 (SRP)
 */
import { Model, Material } from '@/app/components/canvas3D/constant/MaterialData';

export interface EditorInitializationOptions {
  models: Model[];
  materials: Material[];
}

export class EditorInitializationService {
  /**
   * 初始化编辑器数据
   * @param options 初始化选项
   * @returns 初始化结果
   */
  static initializeEditorData(options: EditorInitializationOptions) {
    const { models, materials } = options;
    
    // 验证数据完整性
    this.validateData(models, materials);
    
    // 设置默认值
    const defaultModel = models[0];
    const defaultMaterial = materials.find(m => m.modelId === defaultModel?.id) || materials[0];
    
    return {
      defaultModel,
      defaultMaterial,
      isInitialized: true,
      timestamp: new Date()
    };
  }
  
  /**
   * 验证数据完整性
   * @param models 模型列表
   * @param materials 物料列表
   */
  private static validateData(models: Model[], materials: Material[]) {
    if (!models || models.length === 0) {
      throw new Error('模型列表不能为空');
    }
    
    if (!materials || materials.length === 0) {
      throw new Error('物料列表不能为空');
    }
    
    // 检查物料是否都有对应的模型
    const modelIds = new Set(models.map(m => m.id));
    const invalidMaterials = materials.filter(m => !modelIds.has(m.modelId));
    
    if (invalidMaterials.length > 0) {
      console.warn('发现无效的物料关联:', invalidMaterials.map(m => m.id));
    }
  }
  
  /**
   * 获取默认配置
   * @returns 默认配置
   */
  static getDefaultConfig() {
    return {
      canvasSize: { width: 800, height: 600 },
      backgroundColor: '#ffffff',
      enableDraco: true,
      dracoPath: '/draco/gltf/',
      autoPlay: true
    };
  }
}