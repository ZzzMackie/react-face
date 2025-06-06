declare global {
  interface Number {
    format(): string;
  }
}
Number.prototype.format = function () {
  return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};
/**
 * 提供渲染的底层能力封装, 这一层对接three.js真实的接口。
 *
 * */
import EventEmitter from 'events';
import * as THREE from 'three';
import { Camera as CustomCamera } from './src/Camera.ts';
import { Renderer } from './src/Renderer.ts';
import { Geometry } from './src/Geometry.ts';
import { Control } from './src/Controls.ts';
import { Material } from './src/Material.ts';
import { Light } from './src/Light.ts';
import { SceneHDR } from './src/SceneHDR.ts';
import { ImageTexture } from './src/ImageTexture.ts';
import { SceneHelpers } from './src/SceneHelpers.ts';
import { Object3D } from './src/Object3D.ts';
import { Loader } from './src/FileLoader.ts';
import { ViewHelper } from './src/ViewHelper.ts';
import { IndexDb } from './src/IndexDb.ts';
import { Composer } from './src/Composer.ts';
import { Exporter } from './src/Exporter.ts';
import type { ControlsConfig, TransformControlsMode } from './types/Controls.d.ts'
import type { GeometryTransform } from './types/Geometry.d.ts'
import type { CameraPosition, CameraData } from './types/Camera.d.ts'
import type { LightParam, LightConfig } from './types/Light.d.ts'
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
  UpdateBackgroundPropOptions } from './types/SceneHDR.d.ts'

import type { RendererOptions, ToneMappingExposureParam, ShadowMapParam } from './types/Renderer.d.ts'
import type { 
  Object3DParams, 
  Object3DMesh, 
  Object3DMeshTransform, 
  ObjectGroupParams, 
  Object3DChangeMeshParams,
  AddObject3DParams
 } from './types/Object3D.d.ts'

import type { ThreeEngineParams } from './types/main.d.ts'
import type { LoadFilesOptions } from './types/FileLoader.d.ts';
export class ThreeEngine extends EventEmitter {
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
  static generateUUID(): string {
    return THREE.MathUtils.generateUUID();
  }

  static getTHREE(): typeof THREE {
    return THREE;
  }

  getTHREE(): typeof THREE {
    return ThreeEngine.getTHREE();
  }
  constructor(config: ThreeEngineParams) {
    super();
    this.config = config;
    // 面片
    this.geometry__three = null;
    // 轨道控制器
    this.control__three = null;
    // 材质
    this.material__three = null;
    // 灯光
    this.light__three = null;
    // hdr
    this.sceneHDR__three = null;
    // 图片纹理贴图
    this.imageTexture__three = null;
    // 辅助线
    this.sceneHelpers__three = null;
    // 文件加载
    this.loader__three = null;
    // 模型
    this.object3D__three = null;
    // 相机
    this.camera__three = null;
    // 场景
    this.scene__three = null;
    // 渲染器
    this.renderer__three = null;
    // 视口辅助线
    this.viewHelper__three = null;
    // 模型数据库
    this.indexDB__three = null;
    // 效果合成器
    this.composer__three = null;
    // 导出
    this.exporter__three = null;
    this.initInstance();
  }

  initInstance() {
    // 面片
    this.geometry__three = new Geometry(this);
    // 轨道控制器
    this.control__three = new Control({}, this);
    // 材质
    this.material__three = new Material(this);
    // 灯光
    this.light__three = new Light(this);
    // hdr
    this.sceneHDR__three = new SceneHDR(this);
    // 图片纹理贴图
    this.imageTexture__three = new ImageTexture({}, this);
    // 辅助线
    this.sceneHelpers__three = new SceneHelpers(this);
    // 文件加载
    this.loader__three = new Loader(this);
    // 模型
    this.object3D__three = new Object3D(this);
    // 相机
    this.camera__three = null;
    // 场景
    this.scene__three = null;
    // 渲染器
    this.renderer__three = null;
    // 视口辅助线
    this.viewHelper__three = null;
    // 模型数据库
    this.indexDB__three = new IndexDb(this);
    // 效果合成器
    this.composer__three = new Composer(this);
    // 导出
    this.exporter__three = null;
  }

  // 初始化场景
  initApp(config: ThreeEngineParams) {
    try {
      this.initCamera(config);
      this.initRenderer(config);
      // 场景
      this.scene__three = new THREE.Scene();
      if(this.renderer__three && this.scene__three && this.camera__three) {
        this.scene__three.add(this.camera__three.camera);
        this.scene__three.add(this.camera__three.orthographicCamera);
        this.renderer__three?.renderer?.compileAsync?.(this.scene__three, this.camera__three.viewportCamera);
  
        // 渲染
        this.renderer__three?.render?.(this.scene__three, this.camera__three?.viewportCamera);
      } else {
        console.error('相机未正确初始化');
      }
      
      // 递归更新视图
      this.updateAnimateRenderer();
    } catch (error) {
      console.error(error);
    }
  }

  initComposer() {
    this?.composer__three?.initComposer?.();
  }

  // 初始化视口辅助线
  initViewHelper(containerDom: HTMLElement, viewHelperDom: HTMLElement) {
    if (this.camera__three) {
      this.viewHelper__three = new ViewHelper(this.camera__three.viewportCamera, containerDom, viewHelperDom);
    }
  }

  setViewHelperVisible(value: boolean) {
    this?.viewHelper__three?.setViewHelperVisible?.(value);
  }

  /*************************** 控制器相关 ************************/
  // 创建轨道控制器
  async initOrbitControls(config: ControlsConfig) {
    await this.control__three?.initOrbitControls?.({
      ...config
    });
  }

  // 变换控制器
  async initTransformControls(mode?: TransformControlsMode) {
    return await this.control__three?.initTransformControls?.(mode ?? 'translate');
  }

  attachTransformControls(uuid: UUID) {
    this.control__three?.attachTransformControls?.(uuid);
  }

  // 设置变换控制器模式
  // "translate"、"rotate" 和 "scale"
  setTransformControlsMode(mode: string) {
    if (!['translate', 'rotate', 'scale'].includes(mode)) return;
    this.control__three?.setTransformControlsMode?.(mode);
  }

  // 设置轨道控制器
  async setOrbitControls(config: ControlsConfig | null) {
    return await this.control__three?.setOrbitControls?.({
      ...config
    });
  }

  // 重置轨道控制器状态
  resetOrbitControls() {
    this.control__three?.resetOrbitControls?.();
  }

  //切换模型自动旋转
  setAutoRotate() {
    this.control__three?.setAutoRotate?.();
  }

  /*************************** 控制器 End ************************/

  /*************************** 模型相关 ************************/

  // 加载文件
  async loadFiles(data: LoadFilesOptions) {
    return await this.loader__three?.loadFiles(data);
  }

  // 添加模型组
  async addObjectGroup({ object, data }: ObjectGroupParams) {
    return await this.object3D__three?.addObjectGroup?.({ object, data });
  }

  // 添加模型场景对象 threeJs官方编辑器到出的场景json格式
  async addModelObject({ data, parent, index }: Object3DParams) {
    return await this.object3D__three?.addModelObject?.({ data, parent, index });
  }

  // 替换模型对象
  async changeObjectMesh(data: Object3DChangeMeshParams) {
    return await this.object3D__three?.changeObjectMesh(data);
  }

  // 添加模型 threeJs官 object3D格式
  async loadMeshObject({ data, parent, index }: Object3DParams) {
    return await this.object3D__three?.loadMeshObject({ data, parent, index });
  }

  // 添加对象
  addObject(param: AddObject3DParams) {
    this.object3D__three?.addObject(param);
  }

  // 移除3d对象
  removeObject3D(uuid: UUID) {
    this.object3D__three?.removeObject3D({ uuid });
  }

  // 修改模型数据
  setModelMeshProps(uuid: UUID, data: Object3DMesh) {
    this.object3D__three?.setModelMeshProps(uuid, data);
  }

  // 显示隐藏模型
  toggleModelVisible(uuid: UUID) {
    this.object3D__three?.toggleModelVisible(uuid);
  }

  // 设置模型面片变换 本质都是模型变换
  setModelGeometryTransform({ uuid, position, type }: GeometryTransform) {
    this.geometry__three?.setModelGeometryTransform({ uuid, position, type });
  }

  // 设置模型本身变换 本质都是模型变换
  setModelMeshTransform({ uuid, position, type }: Object3DMeshTransform) {
    this.object3D__three?.setModelMeshTransform({ uuid, position, type });
  }

  /******************* 模型相关 End ***************/

  /*******************  渲染器相关  ***************/
  // 初始化渲染实例
  initRenderer(config: RendererOptions) {
    const mergedRenderOptions = {
      ...this.config?.renderOptions,
      ...config?.renderOptions
  };
    this.renderer__three = new Renderer({ ...mergedRenderOptions }, this);
  }
  resetRenderer(options: THREE.WebGLRendererParameters) {
    this.renderer__three?.resetRenderer(options);
  }

  // 递归更新渲染视图
  updateAnimateRenderer() {
    this.renderer__three?.updateRenderer();
  }

  // 更新渲染视图
  updateRenderer() {
    // if (this.renderer__three) {

    //   this.renderer__three.renderer.needsUpdate = true;
    //   this.renderer__three.render?.();
    // }
  }

  // 设置场景曝光度
  setToneMappingExposure({ toneMapping, toneMappingExposure }: ToneMappingExposureParam) {
    this.renderer__three?.setToneMappingExposure({ toneMapping, toneMappingExposure });
  }

  // 设置阴影映射
  setShadowMap({ shadows, shadowType }: ShadowMapParam) {
    this.renderer__three?.setShadowMap({ shadows, shadowType });
  }
  // 设置渲染器是否在渲染每一帧之前自动清除其输出
  setAutoClear(autoClear: boolean) {
    this.renderer__three?.setAutoClear(autoClear);
  }

  // 渲染区域宽高和摄像机变化。
  resizeRendererAndCamera(width: number, height: number) {
    this.emit('resizeRendererBeforeUpdated', { width, height });
    //刷新场景宽高
    this.renderer__three?.setSize(width, height);
    //防止模型变形
    this.camera__three?.updateAspect?.(width / height);
    this.updateRenderer();
    this.emit('resizeRendererUpdated', { width, height });
  }

  /******************* 渲染器相关 End ***************/

  /*******************  相机相关  ******************/
  // 初始化相机
  initCamera(config: RendererOptions) {
    this.camera__three = new CustomCamera({ ...this.config.cameraConfig, ...config.cameraConfig }, this);
  }

  // 切换相机类型
  changeCamera(cameraType: string | number) {
    this.camera__three?.changeCamera?.(cameraType);
  }

  // 切换镜头
  toAnimateCamera(data: CameraPosition) {
    this.camera__three?.toAnimateCamera?.(data);
  }

  // 相机数据变更
  cameraObjectChange(data: CameraData) {
    this.camera__three?.cameraObjectChange?.(data);
  }

  // 相机重置
  cameraAnimateReset(cameraData: CameraPosition) {
    this.camera__three?.cameraAnimateReset?.(cameraData);
  }

  //截图
  screenshot(w = 600, h = 600, type = 'image/png', transparentBackground = false, encoderOptions = 1) {
    return this?.camera__three?.screenshot?.(w, h, type, transparentBackground, encoderOptions);
  }

  /******************* 相机相关 End *****************/

  /*******************  灯光相关  *******************/

  // 创建灯光并添加进场景
  addLight({ lightClass, lightConfig }: LightParam) {
    return this.light__three.addLight({
      lightClass,
      lightConfig
    });
  }
  // 更新灯光
  updateLight(config: LightConfig) {
    this.light__three?.updateLight(config);
  }
  // 删除灯光
  deleteLight(lightId: string) {
    this.light__three?.deleteLight(lightId);
  }

  /******************* 相机相关 End ******************/

  /*******************  辅助线相关  ******************/
  // 显示隐藏辅助线
  showHelper(show: boolean, type: string) {
    this.sceneHelpers__three?.showHelper(show, type);
  }

  // 显示隐藏网格
  showGrid(show: boolean) {
    this.sceneHelpers__three?.showGrid(show);
  }

  /******************* 辅助线相关 End ****************/

  /*******************  场景相关  ********************/
  // 初始化hdr环境
  async initSceneHDR(environmentOptions: EnvironmentOptions) {
    await this.sceneHDR__three?.initSceneHDR(environmentOptions);
  }

  // 展示hdr环境贴图
  toggleSceneHDRBackground({ show }: { show: boolean }) {
    this.sceneHDR__three?.toggleSceneHDRBackground({ show });
  }

  // 清空hdr
  clearHDR() {
    this.sceneHDR__three?.clearHDR();
  }

  // 设置dr环境
  async setEnvironment(setEnvironmentOptions: SetEnvironmentOptions) {
    this.sceneHDR__three?.setEnvironment(setEnvironmentOptions);
  }

  // 更新环境数据
  updateEnvironmentProp(environment: EnvironmentOptions) {
    this.sceneHDR__three?.updateEnvironmentProp(environment);
  }

  // 设置背景色
  setBackground(background: SetBackgroundOptions) {
    //设置背景色
    this.sceneHDR__three?.setBackground({
      background
    });
  }
  // 设置背景色
  initBackground(background: Background) {
    //设置背景色
    this.sceneHDR__three?.initBackground({
      background
    });
  }

  updateBackgroundProp(background: UpdateBackgroundPropOptions) {
    this.sceneHDR__three?.updateBackgroundProp(background);
  }

  // 更新环境映射类型
  updateEnvironmentTextureMapping({ mapping }: UpdateEnvironmentTextureMappingOptions) {
    this.sceneHDR__three?.updateEnvironmentTextureMapping({ mapping });
  }

  // 更新材质环境光强度
  updateMaterialsEnvMapIntensity({ envMapIntensity }: UpdateMaterialsEnvMapIntensityOptions) {
    this.sceneHDR__three?.updateMaterialsEnvMapIntensity({ envMapIntensity });
  }

  /******************* 场景相关 End ********************/

  /*******************  材质相关  **********************/
  // 更新材质数据
  async updateMaterial({ uuid, key, value }: UpdateMaterialParams) {
    await this.material__three?.updateMaterial({ uuid, key, value });
  }
  changeMaterial({ uuid, originMaterial, newMaterialType }: ChangeMaterialParams) {
    return this.material__three?.changeMaterial({ uuid, originMaterial, newMaterialType });
  }

  // 删除材质
  deleteMaterial({ uuid = '', deleteKeys = [] }: DeleteMaterialParams) {
    this.material__three?.deleteMaterial({ uuid, deleteKeys });
  }

  /******************* 材质相关 End ********************/

  // 生成UUID
  generateUUID() {
    return THREE.MathUtils.generateUUID();
  }
  // 添加贴图数据
  async addImageData(uuid: UUID, url: string) {
    await this.imageTexture__three?.addImageData(uuid, url);
  }

  renderToCanvas(file: string | File, domElement: HTMLCanvasElement) {
    this.imageTexture__three?.renderToCanvas(file, domElement);
  }

  async exportModelFile(data: object) {
    if (this.exporter__three) {
      return await this.exporter__three.exportModelFile(data);
    } else {
      this.exporter__three = new Exporter(this);
      return await this.exporter__three.exportModelFile(data);
    }
  }
}
export const ThreeColor = THREE.Color;
