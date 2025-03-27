import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import * as THREE from 'three';
import EventEmitter from 'events';
import { ThreeEngine } from '../main';
// 使用 type 定义类型别名
type ControlsConfig = OrbitControls | TransformControls;
declare class Control extends EventEmitter {
  threeEngine: ThreeEngine;
  originVector: THREE.Vector3;
  orbitControllers: OrbitControls | null;
  transformControls__three: TransformControls | null;
  config: OrbitControls | TransformControls;
  transformControls__visible: boolean;

  constructor(config: ControlsConfig, threeEngine: ThreeEngine);

  // 创建轨道控制器
  initOrbitControls(config?: ControlsConfig): Promise<void>;

  // 更新轨道控制器设置,config和three官网一致
  setOrbitControls(config?: ControlsConfig): Promise<void>;

  // 重置轨道控制器回原位（上一次调用saveState的状态）
  resetOrbitControls(): void;

  //切换模型自动旋转
  setAutoRotate(): void;

  // 变换控制器
  initTransformControls(mode?: 'translate' | 'rotate' | 'scale'): Promise<void>;

  // 设置变换控制器的模式（位移还是旋转）
  setTransformControlsMode(mode: 'translate' | 'rotate' | 'scale'): void;

  // 3d对象注入到变换控制器中
  attachTransformControls(uuid: string): void;

  // 从变换控制器中移除当前3D对象
  detachTransformControls(): void;
}
