import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import * as THREE from 'three';
import EventEmitter from 'events';
import { proxyOptions } from './proxy.js';
const originVector = new THREE.Vector3(0, 0, 0); // 原点数据
export class Control extends EventEmitter {
  constructor(config, threeEngine) {
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
  async initOrbitControls(config) {
    this.orbitControllers = await new OrbitControls(
      this.camera__three.viewportCamera,
      this.renderer__three.renderer.domElement
    );
    this.orbitControllers.target.copy(originVector); //控制焦点,围绕远点
    this.setOrbitControls(config);
  }

  // 更新轨道控制器设置,config和three官网一致
  async setOrbitControls(config = {}) {
    for (let key in config) {
      this.orbitControllers[key] = config[key];
    }
    await this.orbitControllers.saveState(); //储存控制器状态
  }

  // 重置轨道控制器回原位（上一次调用saveState的状态）
  resetOrbitControls() {
    this.orbitControllers && this.orbitControllers.reset();
  }

  //切换模型自动旋转
  setAutoRotate() {
    this.orbitControllers.autoRotate = !this.orbitControllers.autoRotate;
  }

  // 变换控制器
  async initTransformControls(mode = 'translate') {
    this.transformControls__three = await new TransformControls(
      this.camera__three.viewportCamera,
      this.renderer__three.renderer.domElement
    );
    this.setTransformControlsMode(mode);
    //添加监听事件
    this.addTransformControlsEvent();
    this.transformControls__three.visible = this.transformControls__visible;
    this.transformControls__three.enabled = this.transformControls__visible;
    this.sceneHelpers__three.sceneHelpers.add(this.transformControls__three);
    return this.transformControls__three;
  }

  // 监听变换控制器事件
  addTransformControlsEvent() {
    let objectPositionOnDown = null;
    let objectRotationOnDown = null;
    let objectScaleOnDown = null;
    this.transformControls__three.addEventListener('change', () => {
      const object = this.transformControls__three.object;
      if (object !== undefined) {
        this.sceneHelpers__three.box.setFromObject(object, true);

        const helper = this.sceneHelpers__three.helpers.get(object.id);

        if (helper !== undefined && helper.isSkeletonHelper !== true) {
          helper.update && helper.update();
        }
      }
      this.threeEngine.updateRenderer();
    });
    this.transformControls__three.addEventListener('mouseDown', () => {
      const object = this.transformControls__three.object;

      objectPositionOnDown = object.position.clone();
      objectRotationOnDown = object.rotation.clone();
      objectScaleOnDown = object.scale.clone();
      // 拖动的时候要禁用轨道控制器，停止拖动的时候要开启轨道控制器 e.value 用于判断是否正在拖动
      this.orbitControllers?.enabled && (this.orbitControllers.enabled = false);
    });
    this.transformControls__three.addEventListener('mouseUp', () => {
      const object = this.transformControls__three.object;

      if (object !== undefined) {
        switch (this.transformControls__three.getMode()) {
          case 'translate':
            if (!objectPositionOnDown.equals(object.position)) {
              const position = object.position.clone();
              object.position.copy(position);
              object.updateMatrixWorld(true);
              this.emit('transformControlsChange', 'translate', object);
            }

            break;

          case 'rotate':
            if (!objectRotationOnDown.equals(object.rotation)) {
              const rotation = object.rotation.clone();
              object.rotation.copy(rotation);
              object.updateMatrixWorld(true);
              this.emit('transformControlsChange', 'rotation', object);
            }

            break;

          case 'scale':
            if (!objectScaleOnDown.equals(object.scale)) {
              const scale = object.scale.clone();
              object.scale.copy(scale);
              object.updateMatrixWorld(true);
              this.emit('transformControlsChange', 'scale', object);
            }

            break;
        }
      }
      // 拖动结束  恢复轨道控制器
      !this.orbitControllers.enabled && (this.orbitControllers.enabled = true);
    });
  }

  // 设置变换控制器的模式（位移还是旋转）
  // mode (translate rotate)
  setTransformControlsMode(mode) {
    this.transformControls__three.setMode(mode);
  }

  // 3d对象注入到变换控制器中
  attachTransformControls(uuid) {
    const object3d = this.threeEngine.object3D__three.getObject3D(uuid);
    const light = this.threeEngine.light__three.getLight(uuid);
    if ((!uuid?.isObject3D && !object3d && !light) || !this.transformControls__three) {
      return;
    }
    this.detachTransformControls();
    this.transformControls__three.attach(uuid?.isObject3D ? uuid : object3d || light);
    // 显示隐藏变换控制器
    this.transformControls__three.visible = this.transformControls__visible;
    // 开关变换控制器
    this.transformControls__three.enabled = this.transformControls__visible;
  }
  // 从变换控制器中移除当前3D对象
  detachTransformControls() {
    this.transformControls__three.detach();
  }
}
