import EventEmitter from 'events';
import * as THREE from 'three';
import { Geometry } from './types/Geometry';
import { Material } from './types/Material';
import { Control } from './types/Controls';
import { Light } from './types/Light';
import { SceneHDR } from './types/SceneHDR';
import { ImageTexture } from './types/ImageTexture';
import { SceneHelpers } from './types/SceneHelpers';
import { Loader } from './types/FileLoader';
import { Object3D } from './types/Object3D';
import { Camera } from './types/Camera.d.ts';
import { Renderer } from './types/Renderer';
import { ViewHelper } from './types/ViewHelper';
import { IndexDb } from './types/IndexDb';
import { Composer } from './types/Composer';
import { Exporter } from './types/Exporter';

declare class ThreeEngine extends EventEmitter {
  static generateUUID(): string;
  static getTHREE(): typeof THREE;
  getTHREE(): typeof THREE;

  geometry__three: Geometry | null;
  control__three: Control | null;
  material__three: Material | null;
  light__three: Light | null;
  sceneHDR__three: SceneHDR | null;
  imageTexture__three: ImageTexture | null;
  sceneHelpers__three: SceneHelpers | null;
  loader__three: Loader | null;
  object3D__three: Object3D | null;
  camera__three: Camera | null;
  scene__three: THREE.Scene | null;
  renderer__three: Renderer | null;
  viewHelper__three: ViewHelper | null;
  indexDB__three: IndexDb | null;
  composer__three: Composer | null;
  exporter__three: Exporter | null;
  config: any;

  constructor(config?: any);

  initInstance(): void;

  initApp(config?: any): void;

  initComposer(): void;

  initViewHelper(containerDom: HTMLElement, viewHelperDom: HTMLElement): void;

  setViewHelperVisible(value: boolean): void;

  initOrbitControls(config?: any): Promise<void>;

  initTransformControls(mode?: string): Promise<void>;

  attachTransformControls(uuid: string): void;

  setTransformControlsMode(mode: string): void;

  setOrbitControls(config?: any): Promise<void>;

  resetOrbitControls(): void;

  setAutoRotate(): void;

  loadFiles(data?: any): Promise<any>;

  addObjectGroup({ object, data }: { object: any, data: any }): Promise<any>;

  addModelObject({ data, parent, index }: { data: any, parent?: any, index?: number }): Promise<any>;

  changeObjectMesh(data: any): Promise<any>;

  loadMeshObject({ data, parent, index }: { data: any, parent?: any, index?: number }): Promise<any>;

  addObject({ data, parent, index }: { data: any, parent?: any, index?: number }): void;

  removeObject3D(uuid: string): void;

  setModelMeshProps(uuid: string, data: any): void;

  toggleModelVisible(uuid: string): void;

  setModelGeometryTransform({ uuid, position, type }: { uuid: string, position: { x: number, y: number, z: number }, type: string }): void;

  setModelMeshTransform({ uuid, position, type }: { uuid: string, position: { x: number, y: number, z: number }, type: string }): void;

  initRenderer(config: any): void;

  resetRenderer(options: any): void;

  updateAnimateRenderer(): void;

  updateRenderer(): void;

  setToneMappingExposure({ toneMapping, toneMappingExposure }: { toneMapping: any, toneMappingExposure: number }): void;

  setShadowMap({ shadows, shadowType }: { shadows: boolean, shadowType: string }): void;

  setAutoClear(autoClear: boolean): void;

  resizeRendererAndCamera(width: number, height: number): void;

  initCamera(config: any): void;

  changeCamera(cameraType: string | number): void;

  toAnimateCamera(data: { x: number, y: number, z: number }): void;

  cameraObjectChange(cameraData: { [key: string]: any }): void;

  cameraAnimateReset(cameraData: { x: number, y: number, z: number }): void;

  addImageData(uuid: string, url: string): Promise<void>;

  renderToCanvas(file: any, domElement: HTMLElement): void;

  exportModelFile(data: any): Promise<any>;
}

declare const ThreeColor: typeof THREE.Color;
declare const ThreeVector3: typeof THREE.Vector3;