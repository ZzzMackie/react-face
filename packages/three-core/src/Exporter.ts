import { proxyOptions } from './Proxy.ts';
import { AnimationClip } from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
import type { ThreeEngine } from '../types/main';
import type { ExportModelFileParams, SaveStringParams, SaveStringParamsReturn } from '../types/Exporter.d.ts';
export class Exporter {
  threeEngine: ThreeEngine;
  Exporter: Map<string, GLTFExporter | USDZExporter>;
  constructor(threeEngine: ThreeEngine) {
    this.threeEngine = threeEngine;
    this.Exporter = new Map();
    proxyOptions(this, this.threeEngine);
  }
  async exportModelFile({ type = 'GLTF', download = false }: ExportModelFileParams): Promise<SaveStringParamsReturn | void> {
    let result = null;
    switch (type) {
      case 'GLTF':
        result = await this.exportGLTF(download);
        break;
      case 'USDZ':
        result = await this.exportUSDZ(download);
        break;

      default:
        break;
    }
    if (!result) {
      result = Promise.reject('导出失败');
    }
    return result;
  }
  getAnimations(): Array<AnimationClip> {
    const animations: AnimationClip[] = [];
     // 空值检查
    if (this.threeEngine.scene__three !== null) {
      this.threeEngine.scene__three.traverse(function (object) {
        animations.push(...object.animations);
      });
    } else {
      console.error('场景对象为null，无法遍历获取动画');
      // 或者根据需要提供默认行为
    }

    return animations;
  }
  getOptimizedAnimations(): Array<AnimationClip> {
    const animations = this.getAnimations();

    const optimizedAnimations = [];

    for (const animation of animations) {
      optimizedAnimations.push(animation.clone().optimize());
    }
    return optimizedAnimations;
  }
  saveString({ text, filename, blobType = 'text/plain', download = false, type = 'model/gltf+json' }: SaveStringParams): SaveStringParamsReturn {
    if (download) {
      this.download(new Blob([text], { type: blobType }), filename);
    }
    const blob = new Blob([text], { type: blobType });
    const typeBlob = new Blob([text], { type });
    const file = new File([typeBlob], filename, {
      type
    });
    return {
      blob,
      blobUrl: URL.createObjectURL(blob),
      file
    };
  }
  download(blob: Blob, filename: string) {
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }

    link.href = URL.createObjectURL(blob);
    link.download = filename || 'data.json';
    link.dispatchEvent(new MouseEvent('click'));
  }
  async gltfParse(gltfExporter: GLTFExporter, download: boolean): Promise<SaveStringParamsReturn> {
    const scene = this.threeEngine.scene__three;

    const optimizedAnimations = this.getOptimizedAnimations();
    return new Promise(res => {
      if (scene) {
        gltfExporter?.parse(
          scene,
          result => {
            res(this.saveString({ text: JSON.stringify(result, null, 2), filename: 'scene.gltf', download }));
          },
          () => {},
          { animations: optimizedAnimations }
        );
      }
    });
  }
  async usdzParse(usdzExporter: USDZExporter, download: boolean): Promise<SaveStringParamsReturn> {
    const scene = this.threeEngine.scene__three;
    if (!scene) {
      console.error('场景对象为null，无法导出');
      return Promise.reject('场景对象为null，无法导出');
    }
    const text = await usdzExporter.parse(scene, () => {}, () => {});

    return this.saveString({
      text,
      filename: 'model.usdz',
      download,
      blobType: 'application/octet-stream',
      type: 'model/usdz+zstd'
    });
  }
  async exportGLTF(download: boolean): Promise<SaveStringParamsReturn | void> {
    try {
      const gltfExporter = this.Exporter.get('GLTF');
      if (!gltfExporter) {
        const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
        const exporter = new GLTFExporter();
        this.Exporter.set('GLTF', exporter);
        return await this.gltfParse(exporter, download);
      } else {
        return await this.gltfParse(gltfExporter as GLTFExporter, download);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async exportUSDZ(download: boolean): Promise<SaveStringParamsReturn | void> {
    try {
      const usdzExporter = this.Exporter.get('USDZ');
      if (!usdzExporter) {
        const { USDZExporter } = await import('three/addons/exporters/USDZExporter.js');
        const exporter = new USDZExporter();
        this.Exporter.set('USDZ', exporter);
        return await this.usdzParse(exporter, download);
      } else {
        return await this.usdzParse(usdzExporter as USDZExporter, download);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
