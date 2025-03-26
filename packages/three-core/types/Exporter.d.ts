import { AnimationClip } from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
import { ThreeEngine } from '../main';
declare class Exporter {
  threeEngine: ThreeEngine;
  Exporter: Map<string, GLTFExporter | USDZExporter>;

  constructor(threeEngine: ThreeEngine);

  exportModelFile(params?: { type?: 'GLTF' | 'USDZ'; download?: boolean; }): Promise<void>;

  getAnimations(): Array<AnimationClip>;

  getOptimizedAnimations(): Array<AnimationClip>;

  saveString(params: { text: string; filename: string; blobType?: string; download?: boolean; type?: string; }): { blob: Blob; blobUrl: string; file: File; };

  download(blob: Blob, filename?: string): void;

  gltfParse(gltfExporter: GLTFExporter, download: boolean): Promise<{ blob: Blob; blobUrl: string; file: File; }>;

  usdzParse(usdzExporter: USDZExporter, download: boolean): Promise<{ blob: Blob; blobUrl: string; file: File; }>;

  exportGLTF(download: boolean): Promise<void>;

  exportUSDZ(download: boolean): Promise<void>;
}
