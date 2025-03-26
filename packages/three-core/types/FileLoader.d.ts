import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ThreeEngine } from '../main';
type FileData = {
  blobUrl: string;
  blobData: Blob;
  originUrl: string;
  uuid: string;
}

type LoadSuccessCallback = (args: { object: THREE.Object3D, data: any, file: File, extension: string, filename: string }) => Promise<void>;

interface LoadFileOptions {
  file: File;
  manager?: THREE.LoadingManager;
  modelData?: any;
  onSuccess?: LoadSuccessCallback;
}

interface LoadFilesOptions {
  files: File[];
  filesMap?: FilesMap;
  modelData?: any;
  onSuccess?: LoadSuccessCallback;
}

type FilesMap = {[key: string]: File}

declare class Loader {
  threeEngine: ThreeEngine;
  texturePath: string;

  constructor(threeEngine: ThreeEngine);

  loadItemList(items: string | File[]): void;

  loadFiles(loadFilesOptions: LoadFilesOptions): Promise<PromiseSettledResult<void>[]>;

  loadFile(options: LoadFileOptions): Promise<{ object: THREE.Object3D, data: any, file: File, extension: string, filename: string }>;

}

declare function createGLTFLoader(manager?: THREE.LoadingManager): Promise<GLTFLoader>;
