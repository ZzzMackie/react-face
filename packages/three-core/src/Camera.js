import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { proxyOptions } from './proxy.js';

export class Camera {
  constructor(cameraConfig = {}, threeEngine) {
    this.threeEngine = threeEngine;
    const { fov, aspect, near, far } = cameraConfig;
    // 初始化相机 和 设置相机位置
    const {
      x: cameraX,
      y: cameraY,
      z: cameraZ
    } = cameraConfig.position || {
      x: 0,
      y: 0,
      z: 8
    };
    const _DEFAULT_CAMERA = new THREE.PerspectiveCamera(fov || 50, aspect || 1, near || 0.01, far || 1000);
    _DEFAULT_CAMERA.name = 'Camera';
    _DEFAULT_CAMERA.position.set(0, 0, 8);
    _DEFAULT_CAMERA.lookAt(new THREE.Vector3());
    const ORTHOGRAPHIC_CAMERA = new THREE.OrthographicCamera(-1.77, 1.77, -1, 1, near || 0.01, far || 1000);
    ORTHOGRAPHIC_CAMERA.position.set(0, 0, 8);
    ORTHOGRAPHIC_CAMERA.lookAt(new THREE.Vector3());
    this.camera = _DEFAULT_CAMERA.clone();
    this.orthographicCamera = ORTHOGRAPHIC_CAMERA.clone();
    this.camera.position.set(cameraX, cameraY, cameraZ);
    //看向中心
    this.camera.lookAt(0, 0, 0);

    this.cameras = new Map();

    this.viewportCamera = this.camera;
    this.viewportShading = 'default';
    this.addCamera(this.camera);
    this.addCamera(this.orthographicCamera);
    this.cameraList = {
      perspectiveCamera: this.camera.uuid,
      orthographicCamera: this.orthographicCamera.uuid
    };
    proxyOptions(this, this.threeEngine);
    this.sceneHelpers__three.addHelper(this.viewportCamera);
  }
  // 切换场景相机
  changeCamera(cameraType) {
    this.sceneHelpers__three.removeHelper(this.viewportCamera);
    this.setViewportCamera(this.cameraList[cameraType]);
    this.sceneHelpers__three.addHelper(this.viewportCamera);
    this.control__three.resetOrbitControls(); // 置位控制器目标位置
    this.threeEngine.updateRenderer(); // 重新渲染
  }
  updateAspect(aspect) {
    //防止模型变形
    this.viewportCamera.aspect = aspect;
    this.viewportCamera.updateProjectionMatrix();
  }
  // 添加相机
  addCamera(camera) {
    if (camera.isCamera) {
      !this.cameras.get(camera.uuid) && this.cameras.set(camera.uuid, camera);
    }
  }
  // 移除相机
  removeCamera(camera) {
    this.cameras.get(camera.uuid) && this.cameras.delete(camera.uuid);
  }
  getCamera(uuid) {
    return this.cameras.get(uuid);
  }
  setViewportCamera(uuid) {
    this.viewportCamera = this.getCamera(uuid);
  }
  setViewportShading(value) {
    this.viewportShading = value;
  }
  // 切换相机位置
  toAnimateCamera(data) {
    //切换镜头
    let tween = new TWEEN.Tween({
      x: this.viewportCamera.position.x, // 相机当前位置x
      y: this.viewportCamera.position.y, // 相机当前位置y
      z: this.viewportCamera.position.z // 相机当前位置z
    });
    tween.to(
      {
        x: data.x, // 新的相机位置x
        y: data.y, // 新的相机位置y
        z: data.z // 新的相机位置z
      },
      1000
    );
    tween.onUpdate(e => {
      this.viewportCamera.position.set(e.x, e.y, e.z);
    });
    tween.easing(TWEEN.Easing.Cubic.InOut);
    tween.start();
  }
  // 相机位置重置
  cameraAnimateReset(cameraData) {
    const { x: positionX, y: positionY, z: positionZ } = this.viewportCamera.position;
    const { x: initialX, y: initialY, z: initialZ } = cameraData;
    if (
      Math.abs(positionX - initialX) > 0.01 ||
      Math.abs(positionY - initialY) > 0.01 ||
      Math.abs(positionZ - initialZ) > 0.01
    ) {
      // 重置相机
      this.control__three.resetOrbitControls(); // 置位控制器目标位置
      this.toAnimateCamera(cameraData);
      this.threeEngine.updateRenderer(); // 重新渲染
    }
  }
  // 相机数据变更
  cameraObjectChange(cameraData) {
    // 重置相机
    this.control__three.orbitControllers.saveState(); //储存控制器状态
    this.control__three.resetOrbitControls(); // 置位控制器目标位置
    for (const key of Object.keys(cameraData)) {
      switch (key) {
        case 'position':
          this.viewportCamera[key].set(cameraData[key].x, cameraData[key].y, cameraData[key].z);
          break;
        case 'layers':
          break;
        case 'aspect':
          this.camera__three.updateAspect(
            this.renderer__three.renderer.domElement.clientWidth / this.renderer__three.renderer.domElement.clientHeight
          );
          break;
        default:
          this.viewportCamera[key] = cameraData[key];
          break;
      }
    }
    this.threeEngine.updateRenderer(); // 重新渲染
  }
  //截图，创建新的canvas来生成是为了防止原来的canvas样式形状问题，导致截图效果不理想。
  screenshot(w = 600, h = 600, type = 'image/png', transparentBackground = false, encoderOptions = 1) {
    const background = this.scene__three.background;
    const scale = window.devicePixelRatio;
    const gridVisible = this.sceneHelpers__three.grid.visible;
    if (transparentBackground) {
      // 透明背景处理
      this.sceneHDR__three.clearBackground();
    }
    this.viewHelper__three.setViewHelperVisible(false);
    this.sceneHelpers__three.showGrid(false);
    this.threeEngine.updateRenderer();
    const resizedCanvas = document.createElement('canvas');
    const resizedContext = resizedCanvas.getContext('2d');
    resizedCanvas.height = `${h * scale}`;
    resizedCanvas.width = `${w * scale}`;
    // resizedContext.scale(scale, scale);
    resizedCanvas.style.height = `${h}px`;
    resizedCanvas.style.width = `${w}px`;
    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = w;
    smallCanvas.height = h;
    const smallCtx = smallCanvas.getContext('2d');
    resizedContext.drawImage(this.renderer__three.renderer.domElement, 0, 0, resizedCanvas.width, resizedCanvas.height);
    smallCtx.drawImage(resizedCanvas, 0, 0, resizedCanvas.width, resizedCanvas.height, 0, 0, w, h);
    if (transparentBackground) {
      this.scene__three.background = background;
    }
    this.viewHelper__three.setViewHelperVisible(true);
    this.sceneHelpers__three.showGrid(gridVisible);
    return smallCanvas.toDataURL(type, encoderOptions);
  }
}
