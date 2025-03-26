/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { proxyOptions } from './Proxy.ts';
import type { CameraConfig, CameraData, CameraWithCustomProps } from '../types/camera';
import type { ThreeEngine } from '../main.d.ts';
import type { SceneHelpers } from '../types/SceneHelpers';
import { Control } from '../types/Controls';
import { Renderer } from '../types/Renderer';
import { SceneHDR } from '../types/SceneHDR';
import { ViewHelper } from '../types/ViewHelper';
export class Camera {
  threeEngine: ThreeEngine;
  camera: THREE.PerspectiveCamera;
  orthographicCamera: THREE.OrthographicCamera;
  cameras: Map<string, THREE.PerspectiveCamera | THREE.OrthographicCamera>;
  viewportCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  viewportShading: string;
  cameraList: { perspectiveCamera: string; orthographicCamera: string; };
  sceneHelpers__three!: SceneHelpers;
  control__three!: Control;
  camera__three!: Camera;
  renderer__three!: Renderer;
  scene__three!: THREE.Scene;
  sceneHDR__three!: SceneHDR;
  viewHelper__three!: ViewHelper;
  constructor(cameraConfig: CameraConfig, threeEngine: ThreeEngine) {
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
  changeCamera(cameraType: string | number) {
    this.sceneHelpers__three.removeHelper(this.viewportCamera);
    if (typeof cameraType === 'string' && (cameraType === 'perspectiveCamera' || cameraType === 'orthographicCamera')) {
      this.setViewportCamera(this.cameraList[cameraType]);
    } else {
      console.error('Invalid cameraType');
    }
    this.sceneHelpers__three.addHelper(this.viewportCamera);
    this.control__three.resetOrbitControls(); // 置位控制器目标位置
    this.threeEngine.updateRenderer(); // 重新渲染
  }
  updateAspect(aspect: any) {
    // 防止模型变形
    if (this.viewportCamera instanceof THREE.PerspectiveCamera) {
      this.viewportCamera.aspect = aspect;
      this.viewportCamera.updateProjectionMatrix();
    } else {
      console.warn('Attempted to update aspect on a non-PerspectiveCamera');
      // 如果是 OrthographicCamera，您可以在这里添加适当的逻辑
      // 例如，对于正交相机，您可能不需要更新 aspect，或者需要以不同的方式处理
    }
  }
  // 添加相机
  addCamera(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    if (camera.isCamera) {
       
      !this.cameras.get(camera.uuid) && this.cameras.set(camera.uuid, camera);
    }
  }
  // 移除相机
  removeCamera(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    this.cameras.get(camera.uuid) && this.cameras.delete(camera.uuid);
  }
  getCamera(uuid: string) {
    return this.cameras.get(uuid);
  }
  setViewportCamera(uuid: string) {
    const camera = this.getCamera(uuid);
    if (camera) {
      this.viewportCamera = camera;
    } else {
      console.error(`Camera with UUID ${uuid} not found.`);
      // 或者你可以选择设置一个默认的相机，或者抛出一个错误
      // this.viewportCamera = this.getDefaultCamera();
      // throw new Error(`Camera with UUID ${uuid} not found.`);
    }
  }
  setViewportShading(value: any) {
    this.viewportShading = value;
  }
  // 切换相机位置
  toAnimateCamera(data: { x: any; y: any; z: any; }) {
    //切换镜头
    const tween = new TWEEN.Tween({
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
  cameraAnimateReset(cameraData: { x: any; y: any; z: any; }) {
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
  cameraObjectChange(cameraData: CameraData) {
    // 重置相机
    this.control__three?.orbitControllers?.saveState?.(); //储存控制器状态
    this.control__three.resetOrbitControls(); // 置位控制器目标位置
    for (const key of Object.keys(cameraData)) {
      switch (key) {
        case 'position':
          if (cameraData[key] && this.viewportCamera[key]) {
            const x = cameraData?.[key]?.x ?? 0; // 如果 x 是 undefined，则使用默认值 0
            const y = cameraData?.[key]?.y ?? 0; // 如果 y 是 undefined，则使用默认值 0
            const z = cameraData?.[key]?.z ?? 0; // 如果 z 是 undefined，则使用默认值 0
            this.viewportCamera[key].set(x, y, z);
          } else {
            console.error('相机数据或视口相机未定义:', key);
          }
          break;
        case 'layers':
          break;
        case 'aspect':
          { const domElement = this.renderer__three?.renderer?.domElement;
          if (domElement) {
            this.camera__three?.updateAspect?.(
              domElement.clientWidth / domElement.clientHeight
            );
          } else {
            console.error('渲染器或其 DOM 元素未定义');
          }
          break; }
        default:
          if (key in cameraData) {
            (this.viewportCamera as CameraWithCustomProps)[key as keyof CameraData] = cameraData?.[key as keyof CameraData];
          } else {
            console.error(`属性 ${key} 在 cameraData 中不存在`);
          }
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
    // 检查 resizedContext 是否为 null
    if (!resizedContext) {
      console.error('resizedContext 未定义');
      return; // 或者提供一个默认的操作
  }
    resizedCanvas.height = h * scale;
    resizedCanvas.width = w * scale;
    // resizedContext.scale(scale, scale);
    resizedCanvas.style.height = `${h}px`;
    resizedCanvas.style.width = `${w}px`;
    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = w;
    smallCanvas.height = h;
    const smallCtx = smallCanvas.getContext('2d');
    
    if (!smallCtx) {
      console.error('无法获取 smallCanvas 的 2D 上下文');
      return; // 或者返回一个默认值，或者根据需求执行其他操作
    }

    // 检查 this.renderer__three?.renderer?.domElement 是否存在
    if (this.renderer__three?.renderer?.domElement) {
      resizedContext.drawImage(this.renderer__three.renderer.domElement, 0, 0, resizedCanvas.width, resizedCanvas.height);
    } else {
      console.error('renderer__three 或 renderer 没有定义');
      // 或者你可以在这里提供一个默认的图片资源，作为替代品进行绘制
      // resizedContext.drawImage(defaultImageSource, 0, 0, resizedCanvas.width, resizedCanvas.height);
    }
    smallCtx.drawImage(resizedCanvas, 0, 0, resizedCanvas.width, resizedCanvas.height, 0, 0, w, h);
    if (transparentBackground) {
      this.scene__three.background = background;
    }
    this.viewHelper__three.setViewHelperVisible(true);
    this.sceneHelpers__three.showGrid(gridVisible);
    return smallCanvas.toDataURL(type, encoderOptions);
  }
}
