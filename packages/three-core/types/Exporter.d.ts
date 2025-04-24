import { AnimationClip } from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
import { ThreeEngine } from '../main';

interface ExportModelFileParams {
  type?: 'GLTF' | 'USDZ';
  download?: boolean;
}

interface SaveStringParams {
  text: string | void | arrayBuffer;
  filename: string;
  blobType?: string;
  download?: boolean;
  type?: string;
}

interface SaveStringParamsReturn {
  blob: Blob;
  blobUrl: string;
  file: File;
}

declare class Exporter {
  threeEngine: ThreeEngine;
  Exporter: Map<string, GLTFExporter | USDZExporter>;

  constructor(threeEngine: ThreeEngine);

  exportModelFile(params?: ExportModelFileParams): Promise<void>;

  getAnimations(): Array<AnimationClip>;

  getOptimizedAnimations(): Array<AnimationClip>;

  saveString(params: SaveStringParams): SaveStringParamsReturn;

  download(blob: Blob, filename?: string): void;

  gltfParse(gltfExporter: GLTFExporter, download: boolean): Promise<SaveStringParamsReturn>;

  usdzParse(usdzExporter: USDZExporter, download: boolean): Promise<SaveStringParamsReturn>;

  exportGLTF(download: boolean): Promise<SaveStringParamsReturn | void>;

  exportUSDZ(download: boolean): Promise<SaveStringParamsReturn | void>;
}
