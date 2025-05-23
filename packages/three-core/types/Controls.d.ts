import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import * as THREE from 'three';
import EventEmitter from 'events';
import type { ThreeEngine } from './main';
type TransformControlsMode = 'translate' | 'rotate' |'scale';

type ControlsConfig = OrbitControlsConfig & OrbitControls;

type TransformControlsParams = TransformControls & OrbitControlsConfig;

type OrbitControlsConfig = {
  [key: string]: number | boolean | Vector3 | Object3D<Object3DEventMap> | HTMLElement | { LEFT: string; UP: string; RIGHT: string; BOTTOM: string; } | null;
};
declare class Control extends EventEmitter {
  threeEngine: ThreeEngine;
  originVector: THREE.Vector3;
  orbitControllers: OrbitControlsConfig | null;
  transformControls__three: TransformControlsParams | null;
  config: object;
  transformControls__visible: boolean;

  constructor(config: object, threeEngine: ThreeEngine);

  // 创建轨道控制器
  initOrbitControls(config?: OrbitControlsConfig): Promise<void>;

  // 更新轨道控制器设置,config和three官网一致
  setOrbitControls(config?: OrbitControlsConfig): Promise<void>;

  // 重置轨道控制器回原位（上一次调用saveState的状态）
  resetOrbitControls(): void;

  //切换模型自动旋转
  setAutoRotate(): void;

  // 变换控制器
  initTransformControls(mode?: TransformControlsMode): Promise<Control>;

  // 设置变换控制器的模式（位移还是旋转）
  setTransformControlsMode(mode: TransformControlsMode): void;

  // 3d对象注入到变换控制器中
  attachTransformControls(uuid: string): void;

  // 从变换控制器中移除当前3D对象
  detachTransformControls(): void;
}
