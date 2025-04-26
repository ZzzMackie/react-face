/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ThreeEngine } from '../main';
type FileData = {
  blobUrl: string;
  blobData: Blob;
  originUrl: string;
  uuid: string;
}

type FilesMap = {[key: string]: File}

export interface FileLoaderResult {
  object: THREE.Object3D;
  data: any;
  file: File;
  extension: string;
  filename: string;
}

export type OnSuccessCallback = (result: FileLoaderResult) => Promise<void>;

export interface HandleJSONParams {
  scope: any;
  data: any;
  modelData: any;
  onSuccess: OnSuccessCallback;
  file: File;
  extension: string;
  filename: string;
}

export interface HandleZIPParams {
  scope: any;
  contents: ArrayBuffer;
  modelData: any;
  onSuccess: OnSuccessCallback;
  file: File;
  extension: string;
  filename: string;
}

export interface LoadFileOptions {
  file: File;
  manager?: THREE.LoadingManager;
  modelData?: any;
  onSuccess?: OnSuccessCallback;
}

export interface LoadFilesOptions {
  files: File[];
  filesMap?: Record<string, File>;
  modelData?: any;
  onSuccess?: OnSuccessCallback;
}

export interface GLTFLoaderWithDispose extends THREE.Loader {
  dracoLoader?: THREE.Loader;
  ktx2Loader?: THREE.Loader;
  dispose?: () => void;
  disposeAll?: () => void;
}

declare class Loader {
  threeEngine: ThreeEngine;
  texturePath: string;

  constructor(threeEngine: ThreeEngine);

  loadItemList(items: string | File[]): void;

  loadFiles(loadFilesOptions: LoadFilesOptions): Promise<PromiseSettledResult<void>[]>;

  loadFile(options: LoadFileOptions): Promise<FileLoaderResult>;

}

declare function createGLTFLoader(manager?: THREE.LoadingManager): Promise<GLTFLoader>;
