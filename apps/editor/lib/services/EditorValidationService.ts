/**
 * 编辑器验证服务
 * 负责验证编辑器中的各种数据
 * 遵循单一职责原则 (SRP)
 */
import { Model, Material, MaterialData } from '@/app/components/canvas3D/constant/MaterialData';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class EditorValidationService {
  /**
   * 验证模型数据
   * @param model 模型数据
   * @returns 验证结果
   */
  static validateModel(model: Model): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 必需字段验证
    if (!model.id) {
      errors.push('模型ID不能为空');
    }

    if (!model.name) {
      errors.push('模型名称不能为空');
    }

    if (!model.modelPath) {
      errors.push('模型路径不能为空');
    }

    // 路径格式验证
    if (model.modelPath && !this.isValidPath(model.modelPath)) {
      errors.push('模型路径格式无效');
    }

    // UUID验证
    if (model.uuid && !this.isValidUUID(model.uuid)) {
      warnings.push('模型UUID格式可能无效');
    }

    // 数值范围验证
    if (model.scale <= 0) {
      errors.push('模型缩放比例必须大于0');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证物料数据
   * @param material 物料数据
   * @returns 验证结果
   */
  static validateMaterial(material: Material): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 必需字段验证
    if (!material.id) {
      errors.push('物料ID不能为空');
    }

    if (!material.name) {
      errors.push('物料名称不能为空');
    }

    if (!material.modelId) {
      errors.push('关联模型ID不能为空');
    }

    // 刀版验证
    if (material.knives && material.knives.length > 0) {
      material.knives.forEach((knife, index) => {
        const knifeValidation = this.validateKnife(knife);
        if (!knifeValidation.isValid) {
          errors.push(`刀版 ${index + 1}: ${knifeValidation.errors.join(', ')}`);
        }
        warnings.push(...knifeValidation.warnings.map(w => `刀版 ${index + 1}: ${w}`));
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证刀版数据
   * @param knife 刀版数据
   * @returns 验证结果
   */
  static validateKnife(knife: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!knife.id) {
      errors.push('刀版ID不能为空');
    }

    if (!knife.name) {
      errors.push('刀版名称不能为空');
    }

    if (!knife.meshId) {
      errors.push('关联Mesh ID不能为空');
    }

    // 画布尺寸验证
    if (knife.canvasSize) {
      if (knife.canvasSize.width <= 0 || knife.canvasSize.height <= 0) {
        errors.push('画布尺寸必须大于0');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证MaterialData数据
   * @param materialData MaterialData数据
   * @returns 验证结果
   */
  static validateMaterialData(materialData: MaterialData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 基础字段验证
    if (!materialData.id) {
      errors.push('MaterialData ID不能为空');
    }

    if (!materialData.name) {
      errors.push('MaterialData 名称不能为空');
    }

    // 模型验证
    if (materialData.model) {
      const modelValidation = this.validateModel(materialData.model as any);
      if (!modelValidation.isValid) {
        errors.push(`模型数据: ${modelValidation.errors.join(', ')}`);
      }
      warnings.push(...modelValidation.warnings.map(w => `模型数据: ${w}`));
    }

    // 画布尺寸验证
    if (materialData.canvasSize) {
      if (materialData.canvasSize.width <= 0 || materialData.canvasSize.height <= 0) {
        errors.push('画布尺寸必须大于0');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证路径格式
   * @param path 路径
   * @returns 是否有效
   */
  private static isValidPath(path: string): boolean {
    // 简单的路径格式验证
    return path.length > 0 && (path.startsWith('/') || path.startsWith('http'));
  }

  /**
   * 验证UUID格式
   * @param uuid UUID字符串
   * @returns 是否有效
   */
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}