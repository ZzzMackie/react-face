/**
 * 模型加载器工厂
 * 负责创建和管理不同的模型加载策略
 * 遵循开闭原则 (OCP) - 对扩展开放，对修改封闭
 */
import { ModelLoaderStrategy, ModelLoadError } from './ModelLoaderStrategy';
import { GLTFLoaderStrategy } from './GLTFLoaderStrategy';
import { OBJLoaderStrategy } from './OBJLoaderStrategy';

export class ModelLoaderFactory {
  private static strategies: Map<string, ModelLoaderStrategy> = new Map();
  private static initialized = false;

  /**
   * 初始化所有支持的加载策略
   */
  private static initializeStrategies(): void {
    if (this.initialized) return;

    // 注册GLTF加载策略
    const gltfStrategy = new GLTFLoaderStrategy();
    gltfStrategy.getSupportedFormats().forEach(format => {
      this.strategies.set(format, gltfStrategy);
    });

    // 注册OBJ加载策略
    const objStrategy = new OBJLoaderStrategy();
    objStrategy.getSupportedFormats().forEach(format => {
      this.strategies.set(format, objStrategy);
    });

    this.initialized = true;
  }

  /**
   * 根据文件扩展名获取加载策略
   * @param fileExtension 文件扩展名
   * @returns 加载策略实例
   */
  static getLoader(fileExtension: string): ModelLoaderStrategy {
    this.initializeStrategies();

    const extension = fileExtension.toLowerCase();
    const strategy = this.strategies.get(extension);

    if (!strategy) {
      throw new ModelLoadError(
        `Unsupported file format: ${extension}`,
        '',
        extension
      );
    }

    return strategy;
  }

  /**
   * 注册新的加载策略
   * @param strategy 加载策略实例
   */
  static registerStrategy(strategy: ModelLoaderStrategy): void {
    this.initializeStrategies();

    strategy.getSupportedFormats().forEach(format => {
      this.strategies.set(format.toLowerCase(), strategy);
    });
  }

  /**
   * 获取所有支持的格式
   * @returns 支持的格式列表
   */
  static getSupportedFormats(): string[] {
    this.initializeStrategies();
    return Array.from(this.strategies.keys());
  }

  /**
   * 检查是否支持指定格式
   * @param fileExtension 文件扩展名
   * @returns 是否支持
   */
  static isSupported(fileExtension: string): boolean {
    this.initializeStrategies();
    return this.strategies.has(fileExtension.toLowerCase());
  }

  /**
   * 清理所有策略
   */
  static dispose(): void {
    this.strategies.forEach(strategy => {
      if ('dispose' in strategy && typeof strategy.dispose === 'function') {
        strategy.dispose();
      }
    });
    this.strategies.clear();
    this.initialized = false;
  }
}