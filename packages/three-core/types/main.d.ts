import EventEmitter from 'events';
import * as THREE from 'three';
import type { ControlsConfig, TransformControlsMode, Controls } from './types/Controls.d.ts';
import type { GeometryTransform } from './types/Geometry.d.ts';
import type { CameraPosition, CameraData } from './types/Camera.d.ts';
import type { LightParam, LightConfig } from './types/Light.d.ts';
import type {
  UpdateMaterialParams,
  ChangeMaterialParams,
  DeleteMaterialParams,
  UUID
} from './types/Material.d.ts';
import type {
  EnvironmentOptions,
  SetEnvironmentOptions,
  Background,
  SetBackgroundOptions,
  UpdateEnvironmentTextureMappingOptions,
  UpdateMaterialsEnvMapIntensityOptions,
  UpdateBackgroundPropOptions
} from './types/SceneHDR.d.ts';
import type {
  RendererOptions,
  ToneMappingExposureParam,
  ShadowMapParam
} from './types/Renderer.d.ts';
import type {
  Object3DParams,
  Object3DMesh,
  Object3DMeshTransform,
  ObjectGroupParams,
  Object3DChangeMeshParams,
  AddObject3DParams
} from './types/Object3D.d.ts';
import type { LoadFilesOptions } from './types/FileLoader.d.ts';

interface ThreeEngineParams {
  renderOptions: THREE.WebGLRenderer;
  cameraConfig?: THREE.Camera
}
export declare class ThreeEngine extends EventEmitter {
  config: ThreeEngineParams;
  geometry__three: Geometry | null;
  control__three: Control | null;
  material__three: Material | null;
  light__three: Light | null;
  sceneHDR__three: SceneHDR | null;
  imageTexture__three: ImageTexture | null;
  sceneHelpers__three: SceneHelpers | null;
  loader__three: Loader | null;
  object3D__three: Object3D | null;
  camera__three: CustomCamera | null;
  scene__three: THREE.Scene | null;
  renderer__three: Renderer | null;
  viewHelper__three: ViewHelper | null;
  indexDB__three: IndexDb | null;
  composer__three: Composer | null;
  exporter__three: Exporter | null;

  static generateUUID(): string;
  static getTHREE(): typeof THREE;

  constructor(config: ThreeEngineParams);

  initInstance(): void;

  initApp(config: ThreeEngineParams): void;

  initComposer(): void;

  initViewHelper(containerDom: HTMLElement, viewHelperDom: HTMLElement): void;

  setViewHelperVisible(value: boolean): void;

  /*************************** 控制器相关 ************************/

  initOrbitControls(config: ControlsConfig): Promise<void>;

  initTransformControls(mode?: TransformControlsMode): Promise<Controls>;

  attachTransformControls(uuid: UUID): void;

  setTransformControlsMode(mode: string): void;

  setOrbitControls(config: ControlsConfig | null): Promise<void>;

  resetOrbitControls(): void;

  setAutoRotate(): void;

  /*************************** 控制器 End ************************/

  /*************************** 模型相关 ************************/

  loadFiles(data?: LoadFilesOptions): Promise<void>;

  addObjectGroup({ object, data }: ObjectGroupParams): Promise<void>;

  addModelObject({ data, parent, index }: Object3DParams): Promise<void>;

  changeObjectMesh(data: Object3DChangeMeshParams): Promise<void>;

  loadMeshObject({ data, parent, index }: Object3DParams): Promise<void>;

  addObject(param: AddObject3DParams): void;

  removeObject3D(uuid: UUID): void;

  setModelMeshProps(uuid: UUID, data: Object3DMesh): void;

  toggleModelVisible(uuid: UUID): void;

  setModelGeometryTransform({ uuid, position, type }: GeometryTransform): void;

  setModelMeshTransform({ uuid, position, type }: Object3DMeshTransform): void;

  /******************* 模型相关 End ***************/

  /******************* 渲染器相关 ***************/

  initRenderer(config: RendererOptions): void;

  resetRenderer(options: THREE.WebGLRendererParameters): void;

  updateAnimateRenderer(): void;

  updateRenderer(): void;

  setToneMappingExposure({ toneMapping, toneMappingExposure }: ToneMappingExposureParam): void;

  setShadowMap({ shadows, shadowType }: ShadowMapParam): void;

  setAutoClear(autoClear: boolean): void;

  resizeRendererAndCamera(width: number, height: number): void;

  /******************* 渲染器相关 End ***************/

  /******************* 相机相关 ***************/

  initCamera(config: RendererOptions): void;

  changeCamera(cameraType: string | number): void;

  toAnimateCamera(data: CameraPosition): void;

  cameraObjectChange(data: CameraData): void;

  cameraAnimateReset(cameraData: CameraPosition): void;

  screenshot(
    w?: number,
    h?: number,
    type?: string,
    transparentBackground?: boolean,
    encoderOptions?: number
  ): Promise<any>;

  /******************* 相机相关 End ***************/

  /******************* 灯光相关 ***************/

  addLight({ lightClass, lightConfig }: LightParam): Promise<any>;

  updateLight(config: LightConfig): void;

  deleteLight(lightId: string): void;

  /******************* 灯光相关 End ***************/

  /******************* 辅助线相关 ***************/

  showHelper(show: boolean, type: string): void;

  showGrid(show: boolean): void;

  /******************* 辅助线相关 End ***************/

  /******************* 场景相关 ***************/

  initSceneHDR(environmentOptions: EnvironmentOptions): Promise<void>;

  toggleSceneHDRBackground({ show }: { show: boolean }): void;

  clearHDR(): void;

  setEnvironment(setEnvironmentOptions: SetEnvironmentOptions): Promise<void>;

  updateEnvironmentProp(environment: EnvironmentOptions): void;

  setBackground(background: SetBackgroundOptions): void;

  initBackground(background: Background): void;

  updateBackgroundProp(background?: UpdateBackgroundPropOptions): void;

  updateEnvironmentTextureMapping({ mapping }: UpdateEnvironmentTextureMappingOptions): void;

  updateMaterialsEnvMapIntensity({ envMapIntensity }: UpdateMaterialsEnvMapIntensityOptions): void;

  /******************* 场景相关 End ***************/

  /******************* 材质相关 ***************/

  updateMaterial({ uuid, key, value }: UpdateMaterialParams): Promise<void>;

  changeMaterial({ uuid, originMaterial, newMaterialType }: ChangeMaterialParams): void;

  deleteMaterial(params: DeleteMaterialParams): void;

  /******************* 材质相关 End ***************/

  generateUUID(): string;

  addImageData(uuid: UUID, url: string): Promise<void>;

  renderToCanvas(file: string | File, domElement: HTMLCanvasElement): void;

  exportModelFile(data: object): Promise<void>;
}

export declare const ThreeColor: typeof THREE.Color;
