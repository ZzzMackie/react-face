import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import * as THREE from 'three';
import EventEmitter from 'events';
import { proxyOptions } from './Proxy.ts';
import type { ThreeEngine } from '../types/main';
import type { Camera } from '../types/Camera';
import type { Renderer } from '../types/Renderer';
import type { ControlsConfig, TransformControlsMode } from '../types/Controls';
import type { SceneHelpers } from '../types/SceneHelpers';
const originVector = new THREE.Vector3(0, 0, 0); // 原点数据

export class Control extends EventEmitter {
  threeEngine: ThreeEngine; // 请根据实际情况替换为具体类型
  orbitControllers: OrbitControls | null;
  transformControls__three: TransformControls | null;
  originVector: THREE.Vector3;
  config: object; // 请根据实际情况替换为具体类型
  transformControls__visible: boolean;
  camera__three!: Camera; // 请根据实际情况替换为具体类型
  renderer__three!: Renderer; // 请根据实际情况替换为具体类型
  sceneHelpers__three!: SceneHelpers; // 请根据实际情况替换为具体类型

  constructor(config: object, threeEngine: ThreeEngine) { // 请根据实际情况替换为具体类型
    super();
    this.threeEngine = threeEngine;
    this.orbitControllers = null;
    this.transformControls__three = null;
    this.originVector = originVector;
    this.config = config;
    // 初始化变换控制器后 默认不展示 变换控制器
    this.transformControls__visible = false;
    proxyOptions(this, this.threeEngine);
  }

  /*****
   *
   * 轨道控制器
   *
   *
   * *****/

  // 创建轨道控制器
  async initOrbitControls(config: ControlsConfig): Promise<void> { // 请根据实际情况替换为具体类型
    this.orbitControllers = new OrbitControls(
      this.camera__three.viewportCamera,
      this.renderer__three?.renderer?.domElement
    );
    this.orbitControllers.target.copy(originVector); //控制焦点,围绕远点
    this.setOrbitControls(config);
  }

  // 更新轨道控制器设置,config和three官网一致
  async setOrbitControls(config: ControlsConfig | null): Promise<void> { // 请根据实际情况替换为具体类型
    if (config) {
      for (const key in config) {
          if (this.orbitControllers && Object.prototype.hasOwnProperty.call(config, key) && Object.prototype.hasOwnProperty.call(this.orbitControllers, key)) {
              this.orbitControllers[key as keyof OrbitControls] = config[key as keyof OrbitControls];
          } else {
              console.warn(`Key "${key}" is not a valid property of OrbitControls.`);
          }
      }


    }
    if (this.orbitControllers) {
      await this.orbitControllers.saveState(); //储存控制器状态
    }
  }

  // 重置轨道控制器回原位（上一次调用saveState的状态）
  resetOrbitControls(): void {
    if (this.orbitControllers) {
      this.orbitControllers.reset();
    }
  }

  //切换模型自动旋转
  setAutoRotate(): void {
    if (this.orbitControllers) {
      this.orbitControllers.autoRotate = !this.orbitControllers.autoRotate;
    }
  }

  // 变换控制器
  async initTransformControls(mode: TransformControlsMode): Promise<TransformControls | null> {
    this.transformControls__three = new TransformControls(
      this.camera__three.viewportCamera,
      this.renderer__three?.renderer?.domElement
    );
    this.setTransformControlsMode(mode);
    //添加监听事件
    this.addTransformControlsEvent();
    if (this.transformControls__three) {
      this.transformControls__three.visible = this.transformControls__visible;
      this.transformControls__three.enabled = this.transformControls__visible;
      this.sceneHelpers__three.sceneHelpers.add(this.transformControls__three);
    }
    return this.transformControls__three;
  }

  // 监听变换控制器事件
  addTransformControlsEvent(): void {
    let objectPositionOnDown: THREE.Vector3 | null = null;
    let objectRotationOnDown: THREE.Euler | null = null;
    let objectScaleOnDown: THREE.Vector3 | null = null;
    if (this.transformControls__three) {
      this.transformControls__three.addEventListener('change', () => {
        const object = this.transformControls__three?.object;
        if (object) {
          this.sceneHelpers__three.box.setFromObject(object, true);

          const helper = this.sceneHelpers__three.helpers.get(object.id);

          if (helper && !helper?.isSkeletonHelper) {
            helper?.update?.();
          }
        }
        this.threeEngine.updateRenderer();
      });
      this.transformControls__three.addEventListener('mouseDown', () => {
        const object = this.transformControls__three?.object;

        if (object) {
          objectPositionOnDown = object.position.clone();
          objectRotationOnDown = object.rotation.clone();
          objectScaleOnDown = object.scale.clone();
          // 拖动的时候要禁用轨道控制器，停止拖动的时候要开启轨道控制器 e.value 用于判断是否正在拖动
          if (this.orbitControllers?.enabled) {
            this.orbitControllers.enabled = false;
          }
        }
      });
      this.transformControls__three.addEventListener('mouseUp', () => {
        const object = this.transformControls__three?.object;

        if (object) {
          switch (this.transformControls__three?.getMode()) {
            case 'translate':
              if (!objectPositionOnDown?.equals(object.position)) {
                const position = object.position.clone();
                object.position.copy(position);
                object.updateMatrixWorld(true);
                this.emit('transformControlsChange', 'translate', object);
              }

              break;

            case 'rotate':
              if (!objectRotationOnDown?.equals(object.rotation)) {
                const rotation = object.rotation.clone();
                object.rotation.copy(rotation);
                object.updateMatrixWorld(true);
                this.emit('transformControlsChange', 'rotation', object);
              }

              break;

            case 'scale':
              if (!objectScaleOnDown?.equals(object.scale)) {
                const scale = object.scale.clone();
                object.scale.copy(scale);
                object.updateMatrixWorld(true);
                this.emit('transformControlsChange', 'scale', object);
              }

              break;
          }
        }
        // 拖动结束  恢复轨道控制器
        if (this.orbitControllers && !this.orbitControllers?.enabled) {
          this.orbitControllers.enabled = true;
        }
      });
    }
  }

  // 设置变换控制器的模式（位移还是旋转）
  // mode (translate rotate)
  setTransformControlsMode(mode: TransformControlsMode): void {
    if (this.transformControls__three) {
      this.transformControls__three.setMode(mode);
    }
  }

  // 3d对象注入到变换控制器中
  attachTransformControls(uuid: string | THREE.Object3D | THREE.Light): void {
    const object3d = this.threeEngine.object3D__three.getObject3D(uuid);
    const light = this.threeEngine.light__three.getLight(uuid);
    if ((!uuid && !object3d && !light) || !this.transformControls__three) {
      return;
    }
    this.detachTransformControls();
    if (this.transformControls__three) {
      // 先检查 uuid 是否为字符串
      if (typeof uuid === 'string') {
        if (object3d) {
          this.transformControls__three.attach(object3d);
          return;
        }
        if (light) {
          this.transformControls__three.attach(light);
          return;
        }
      } else {
        this.transformControls__three.attach(uuid);
      }
    }
    // 显示隐藏变换控制器
    if (this.transformControls__three) {
      this.transformControls__three.visible = this.transformControls__visible;
    }
  }
  
  

  // 从变换控制器中移除当前3D对象
  detachTransformControls(): void {
    if (this.transformControls__three) {
      this.transformControls__three.detach();
    }
  }
}
