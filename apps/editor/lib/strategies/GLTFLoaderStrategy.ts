/**
 * GLTF模型加载策略
 * 专门处理GLTF/GLB格式的模型加载
 * 遵循单一职责原则 (SRP)
 */
import { Group, LoadingManager } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { ModelLoaderStrategy, LoadOptions, ModelLoadResult, ModelLoadError } from './ModelLoaderStrategy';

export class GLTFLoaderStrategy implements ModelLoaderStrategy {
  private loader: GLTFLoader;
  private dracoLoader?: DRACOLoader;

  constructor() {
    this.loader = new GLTFLoader();
  }

  canLoad(fileExtension: string): boolean {
    return ['glb', 'gltf'].includes(fileExtension.toLowerCase());
  }

  getSupportedFormats(): string[] {
    return ['glb', 'gltf'];
  }

  async load(modelPath: string, options: LoadOptions): Promise<ModelLoadResult> {
    try {
      // 设置DRACO加载器
      if (options.enableDraco && options.dracoPath) {
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath(options.dracoPath);
        this.loader.setDRACOLoader(this.dracoLoader);
      }

      // 加载模型
      const gltf = await new Promise<any>((resolve, reject) => {
        this.loader.load(
          modelPath,
          resolve,
          undefined,
          reject
        );
      });

      // 应用变换
      const group = this.applyTransforms(gltf.scene, options);

      // 处理动画
      const animations = gltf.animations || [];

      // 处理材质
      const materials = this.extractMaterials(gltf.scene);

      return {
        group,
        animations,
        materials,
        metadata: {
          format: 'gltf',
          version: gltf.parser?.json?.asset?.version,
          generator: gltf.parser?.json?.asset?.generator
        }
      };
    } catch (error) {
      throw new ModelLoadError(
        `Failed to load GLTF model: ${modelPath}`,
        modelPath,
        'gltf',
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

  private extractMaterials(group: Group): any[] {
    const materials: any[] = [];
    
    group.traverse((child: any) => {
      if (child.material) {
        materials.push(child.material);
      }
    });

    return materials;
  }

  dispose(): void {
    if (this.dracoLoader) {
      this.dracoLoader.dispose();
    }
  }
}