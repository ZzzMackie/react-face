/**
 * 编辑器配置服务
 * 负责管理编辑器的配置信息
 * 遵循单一职责原则 (SRP)
 */
export interface EditorConfig {
  canvas: {
    defaultSize: { width: number; height: number };
    backgroundColor: string;
  };
  model: {
    enableDraco: boolean;
    dracoPath: string;
    autoPlay: boolean;
    defaultScale: number;
  };
  ui: {
    theme: 'light' | 'dark';
    language: 'zh' | 'en';
  };
  performance: {
    maxHistory: number;
    debounceMs: number;
  };
}

export class EditorConfigService {
  private static readonly DEFAULT_CONFIG: EditorConfig = {
    canvas: {
      defaultSize: { width: 800, height: 600 },
      backgroundColor: '#ffffff'
    },
    model: {
      enableDraco: true,
      dracoPath: '/draco/gltf/',
      autoPlay: true,
      defaultScale: 1
    },
    ui: {
      theme: 'light',
      language: 'zh'
    },
    performance: {
      maxHistory: 50,
      debounceMs: 200
    }
  };

  private static config: EditorConfig = { ...this.DEFAULT_CONFIG };

  /**
   * 获取当前配置
   * @returns 当前配置
   */
  static getConfig(): EditorConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   * @param newConfig 新配置
   */
  static updateConfig(newConfig: Partial<EditorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 重置配置为默认值
   */
  static resetConfig(): void {
    this.config = { ...this.DEFAULT_CONFIG };
  }

  /**
   * 获取画布配置
   * @returns 画布配置
   */
  static getCanvasConfig() {
    return this.config.canvas;
  }

  /**
   * 获取模型配置
   * @returns 模型配置
   */
  static getModelConfig() {
    return this.config.model;
  }

  /**
   * 获取UI配置
   * @returns UI配置
   */
  static getUIConfig() {
    return this.config.ui;
  }

  /**
   * 获取性能配置
   * @returns 性能配置
   */
  static getPerformanceConfig() {
    return this.config.performance;
  }
}