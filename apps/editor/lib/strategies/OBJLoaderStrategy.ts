/**
 * OBJ模型加载策略
 * 专门处理OBJ格式的模型加载
 * 遵循单一职责原则 (SRP)
 */
import { Group } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { ModelLoaderStrategy, LoadOptions, ModelLoadResult, ModelLoadError } from './ModelLoaderStrategy';

export class OBJLoaderStrategy implements ModelLoaderStrategy {
  private loader: OBJLoader;

  constructor() {
    this.loader = new OBJLoader();
  }

  canLoad(fileExtension: string): boolean {
    return fileExtension.toLowerCase() === 'obj';
  }

  getSupportedFormats(): string[] {
    return ['obj'];
  }

  async load(modelPath: string, options: LoadOptions): Promise<ModelLoadResult> {
    try {
      // 加载模型
      const obj = await new Promise<any>((resolve, reject) => {
        this.loader.load(
          modelPath,
          resolve,
          undefined,
          reject
        );
      });

      // 应用变换
      const group = this.applyTransforms(obj, options);

      return {
        group,
        animations: [],
        materials: [],
        metadata: {
          format: 'obj',
          objectCount: group.children.length
        }
      };
    } catch (error) {
      throw new ModelLoadError(
        `Failed to load OBJ model: ${modelPath}`,
        modelPath,
        'obj',
        error as Error
      );
    }
  }

  private applyTransforms(group: Group, options: LoadOptions): Group {
    if (options.scale !== undefined) {
      group.scale.setScalar(options.scale);
    }

    if (options.position) {
      group.position.set(...options.position);
    }

    if (options.rotation) {
      group.rotation.set(...options.rotation);
    }

    if (options.color) {
      group.traverse((child: any) => {
        if (child.material) {
          child.material.color.setHex(options.color!.replace('#', '0x'));
        }
      });
    }

    return group;
  }
}