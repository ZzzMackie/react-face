import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import EventEmitter from 'events';
import Config from './Config';
const config = new Config();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
export class Renderer extends EventEmitter {
  constructor(options, threeEngine) {
    super();
    this.threeEngine = threeEngine;
    this.renderer = null;
    const clock = new THREE.Clock();
    this.clock = clock;
    this.options = options;
    this.initRenderer(options);
    this.initRendererOptions();
    this.onClickSelectModel();
  }
  initRenderer(options) {
    let canvas = options?.canvas;
    this.renderer = new THREE.WebGLRenderer({
      antialias: options?.antialias || true, //抗锯齿
      autoClear: options?.autoClear || true,
      canvas: options?.canvas || undefined
    }); // 渲染器实例
    if (!canvas) {
      canvas = this.renderer.domElement;
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //高清分辨率
    this.renderer.setClearColor(
      new THREE.Color(config.getKey('project/renderer/ClearColor/backgroundColor')),
      config.getKey('project/renderer/ClearColor/backgroundOpacity')
    ); //背景颜色

    // this.renderer.sortObjects = false; //关闭自动渲染排序
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.threeEngine.camera__three.updateAspect(canvas.clientWidth / canvas.clientHeight);
    // 场景 PMREM 生成器
    this.PMREMGenerator = new THREE.PMREMGenerator(this.renderer);
    this.PMREMGenerator.compileEquirectangularShader();
  }
  // 重置渲染器
  resetRenderer(options) {
    let renderer = this.renderer;
    let canvas = options?.canvas || renderer.domElement;
    options.canvas = canvas;
    renderer.setAnimationLoop(null);
    renderer.dispose();
    this.PMREMGenerator.dispose();
    this.renderer = null;
    this.initRenderer(options);
    this.updateRenderer();
  }
  // 初始化渲染项
  initRendererOptions() {
    this.setShadowMap({
      shadows: this.options?.shadows?.enabled || config.getKey('project/renderer/shadows'),
      shadowsType: this.options?.shadowType || config.getKey('project/renderer/shadowType')
    });
    this.setToneMappingExposure({
      toneMapping: this.options?.toneMapping || config.getKey('project/renderer/toneMapping'),
      toneMappingExposure: this.options?.toneMappingExposure || config.getKey('project/renderer/toneMappingExposure')
    });
  }
  // 设置渲染尺寸
  setSize(width, height) {
    this.renderer.setSize(width, height);
  }
  // 渲染器渲染
  render() {
    if (!this.renderer) return;
    this.renderer.autoClear = false;
    if (this.threeEngine.composer__three.composer) {
      this.threeEngine.composer__three.render();
    } else {
      this.renderer.render(this.threeEngine.scene__three, this.threeEngine.camera__three.viewportCamera);
    }
    this.threeEngine.sceneHelpers__three.renderHelper();
    this.threeEngine.sceneHelpers__three.renderGrid();
    this.renderer.xr.isPresenting !== true && this.threeEngine?.viewHelper__three?.render?.(this.renderer);
    this.renderer.autoClear = true;
    this.emit('cameraPositionUpdated', this.threeEngine.camera__three.viewportCamera.position);
  }
  // 更新渲染
  updateRenderer() {
    this.renderer.setAnimationLoop(() => {
      this.threeEngine?.viewHelper__three?.animating === true &&
        this.threeEngine?.viewHelper__three.update(this.clock.getDelta());
      this.updateRenderer();
    });
    this.threeEngine.control__three.orbitControllers &&
      this.threeEngine.control__three.orbitControllers.update(this.clock.getDelta());
    this.render();
    TWEEN.update();
  }

  // 设置场景曝光度
  setToneMappingExposure({
    toneMapping = this.options?.toneMapping || config.getKey('project/renderer/toneMapping'),
    toneMappingExposure
  }) {
    //设置曝光度
    toneMapping !== undefined && (this.renderer.toneMapping = toneMapping);
    toneMappingExposure !== undefined && (this.renderer.toneMappingExposure = toneMappingExposure); // 曝光系数
  }
  // 设置阴影映射
  setShadowMap({ shadows, shadowType }) {
    shadows !== undefined && (this.renderer.shadowMap.enabled = shadows); // 是否开启阴影
    shadowType !== undefined && (this.renderer.shadowMap.type = shadowType); // 阴影渲染类型
    this.renderer.shadowMap.needsUpdate = true;
  }

  // 设置vr
  setXR(enabled) {
    enabled !== undefined && (this.renderer.xr.enabled = enabled); // vr类型
  }

  // 设置渲染器是否在渲染每一帧之前自动清除其输出
  setAutoClear(autoClear) {
    autoClear !== undefined && (this.renderer.autoClear = autoClear);
  }

  getMousePosition(dom, x, y) {
    const rect = dom.getBoundingClientRect();
    return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
  }

  getIntersects(raycaster) {
    const objects = [];

    this.threeEngine.scene__three.traverseVisible(function (child) {
      objects.push(child);
    });

    this.threeEngine.sceneHelpers__three.sceneHelpers.traverseVisible(function (child) {
      if (child.name === 'picker') objects.push(child);
    });
    //.intersectObjects([mesh1, mesh2, mesh3])对参数中的网格模型对象进行射线交叉计算
    // 未选中对象返回空数组[],选中一个对象，数组1个元素，选中两个对象，数组两个元素
    return raycaster.intersectObjects(objects, false);
  }

  getPointerIntersects(point) {
    mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
    //.setFromCamera()计算射线投射器`Raycaster`的射线属性.ray
    // 形象点说就是在点击位置创建一条射线，射线穿过的模型代表选中
    raycaster.setFromCamera(mouse, this.threeEngine.camera__three.viewportCamera);

    return this.getIntersects(raycaster);
  }

  // 点击渲染区域选中模型
  onClickSelectModel() {
    const canvasDom = this.renderer.domElement;
    const onDoubleClickPosition = new THREE.Vector2();
    canvasDom.addEventListener('dblclick', event => {
      const array = this.getMousePosition(canvasDom, event.clientX, event.clientY);
      onDoubleClickPosition.fromArray(array);

      const intersects = this.getPointerIntersects(onDoubleClickPosition);

      // intersects.length大于0说明，说明选中了模型
      if (intersects.length > 0) {
        const intersectMesh = intersects[0];
        // 辅助线选中
        if (intersectMesh.object.userData.object !== undefined) {
          // helper
          // 将辅助线选中的对应object注入到变换控制器中
          intersectMesh?.object?.uuid &&
            this.threeEngine.attachTransformControls(intersectMesh?.object.userData.object);
        } else {
          // 模型则直接注入
          intersectMesh?.object?.uuid && this.threeEngine.attachTransformControls(intersectMesh?.object);
        }
        this.emit('intersectObjectSelected', intersectMesh);
      }
    });
  }
}
