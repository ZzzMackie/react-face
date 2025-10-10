/**
 * 模型加载策略接口
 * 遵循依赖倒置原则 (DIP) - 依赖抽象而不是具体实现
 */
import { Group } from 'three';

export interface LoadOptions {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  enableDraco?: boolean;
  dracoPath?: string;
  autoPlay?: boolean;
  color?: string;
  canvasTexture?: HTMLCanvasElement;
  materialType?: 'standard' | 'basic' | 'phong' | 'lambert';
}

export interface ModelLoadResult {
  group: Group;
  animations?: any[];
  materials?: any[];
  metadata?: any;
}

/**
 * 模型加载策略接口
 * 定义模型加载的统一接口
 */
export interface ModelLoaderStrategy {
  /**
   * 检查是否支持该文件格式
   * @param fileExtension 文件扩展名
   * @returns 是否支持
   */
  canLoad(fileExtension: string): boolean;
  
  /**
   * 加载模型
   * @param modelPath 模型路径
   * @param options 加载选项
   * @returns 加载结果
   */
  load(modelPath: string, options: LoadOptions): Promise<ModelLoadResult>;
  
  /**
   * 获取支持的格式列表
   * @returns 支持的格式列表
   */
  getSupportedFormats(): string[];
}

/**
 * 模型加载错误类
 */
export class ModelLoadError extends Error {
  constructor(
    message: string,
    public readonly modelPath: string,
    public readonly fileExtension: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ModelLoadError';
  }
}