import { proxyOptions } from './proxy.js';
export class Exporter {
  constructor(threeEngine) {
    this.threeEngine = threeEngine;
    this.Exporter = new Map();
    proxyOptions(this, this.threeEngine);
  }
  async exportModelFile({ type = 'GLTF', download }) {
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
    return result;
  }
  getAnimations() {
    const animations = [];

    this.threeEngine.scene__three.traverse(function (object) {
      animations.push(...object.animations);
    });

    return animations;
  }
  getOptimizedAnimations() {
    const animations = this.getAnimations();

    const optimizedAnimations = [];

    for (const animation of animations) {
      optimizedAnimations.push(animation.clone().optimize());
    }
    return optimizedAnimations;
  }
  saveString({ text, filename, blobType = 'text/plain', download = false, type = 'model/gltf+json' }) {
    if (download) {
      this.download(new Blob([text], { type: blobType }), filename);
    }
    let blob = new Blob([text], { type: blobType });
    let typeBlob = new Blob([text], { type });
    let file = new File([typeBlob], filename, {
      type
    });
    return {
      blob,
      blobUrl: URL.createObjectURL(blob),
      file
    };
  }
  download(blob, filename) {
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }

    link.href = URL.createObjectURL(blob);
    link.download = filename || 'data.json';
    link.dispatchEvent(new MouseEvent('click'));
  }
  async gltfParse(gltfExporter, download) {
    const scene = this.threeEngine.scene__three;

    const optimizedAnimations = this.getOptimizedAnimations();
    return new Promise(res => {
      gltfExporter?.parse(
        scene,
        result => {
          res(this.saveString({ text: JSON.stringify(result, null, 2), filename: 'scene.gltf', download }));
        },
        undefined,
        { animations: optimizedAnimations }
      );
    });
  }
  async usdzParse(usdzExporter, download) {
    const scene = this.threeEngine.scene__three;

    const text = await usdzExporter.parse(scene);

    return this.saveString({
      text,
      filename: 'model.usdz',
      download,
      blobType: 'application/octet-stream',
      type: 'model/usdz+zstd'
    });
  }
  async exportGLTF(download) {
    try {
      const gltfExporter = this.Exporter.get('GLTF');
      if (!gltfExporter) {
        const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
        const exporter = new GLTFExporter();
        this.Exporter.set('GLTF', exporter);
        return await this.gltfParse(exporter, download);
      } else {
        return await this.gltfParse(gltfExporter, download);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async exportUSDZ(download) {
    try {
      const usdzExporter = this.Exporter.get('USDZ');
      if (!usdzExporter) {
        const { USDZExporter } = await import('three/addons/exporters/USDZExporter.js');
        const exporter = new USDZExporter();
        this.Exporter.set('USDZ', exporter);
        return await this.usdzParse(exporter, download);
      } else {
        return await this.usdzParse(usdzExporter, download);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
