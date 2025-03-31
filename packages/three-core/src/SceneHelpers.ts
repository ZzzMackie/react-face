import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
//辅助器
export class SceneHelpers {
  constructor(threeEngine) {
    this.threeEngine = threeEngine;
    this.lightHelperVisible = false;
    this.sceneHelpers = new THREE.Scene();
    this.helpers = new Map();
    // 帮助灯光等辅助线做双击选中的材质球
    this.geometry = new THREE.SphereGeometry(1, 4, 1);
    this.material = new THREE.MeshBasicMaterial({ color: 0xff7f00, visible: false });
    this.sceneHelpers.add(new THREE.HemisphereLight(0xff7f00, 0x888888, 2));
    const box = new THREE.Box3();
    this.box = box;
    // 选中模型盒
    const selectionBox = new THREE.Box3Helper(box);
    selectionBox.material.depthTest = false;
    selectionBox.material.transparent = true;
    selectionBox.visible = false;
    selectionBox.update && selectionBox.update();
    this.selectionBox = selectionBox;
    const grid = new THREE.Group();

    const grid1 = new THREE.GridHelper(50, 30, 0x888888);
    grid1.material.color.setHex(0x888888);
    grid1.material.vertexColors = false;
    grid.add(grid1);

    const grid2 = new THREE.GridHelper(50, 6, 0x222222);
    grid2.material.color.setHex(0x222222);
    grid2.material.vertexColors = false;
    grid.add(grid2);
    grid.visible = false;
    this.grid = grid;
    this.helpers.set(selectionBox.id, selectionBox);
    this.sceneHelpers.add(selectionBox);
    this.sceneHelpers.visible = false;
  }
  // 添加辅助线
  addHelper(object, helper) {
    if (helper == undefined) {
      if (object.isCamera) {
        helper = new THREE.CameraHelper(object);
      } else if (object.isPointLight) {
        helper = new THREE.PointLightHelper(object, 1, new THREE.Color('#ff7f00'));
      } else if (object.isDirectionalLight) {
        helper = new THREE.DirectionalLightHelper(object, 1, new THREE.Color('#ff7f00'));
      } else if (object.isSpotLight) {
        helper = new THREE.SpotLightHelper(object, new THREE.Color('#ff7f00'));
      } else if (object.isHemisphereLight) {
        helper = new THREE.HemisphereLightHelper(object, 1, new THREE.Color('#ff7f00'));
      } else if (object.isRectAreaLight) {
        helper = new RectAreaLightHelper(object, new THREE.Color('#ff7f00'));
      } else if (object.isSkinnedMesh) {
        helper = new THREE.SkeletonHelper(object.skeleton.bones[0]);
      } else if (object.isBone === true && object.parent && object.parent.isBone !== true) {
        helper = new THREE.SkeletonHelper(object);
      } else {
        // no helper for this object type
        return;
      }
      // 帮助辅助线做双击选中的模型
      const picker = new THREE.Mesh(this.geometry, this.material);
      picker.name = 'picker';
      picker.userData.object = object;
      helper.add(picker);
      if (helper.type.includes('LightHelper')) {
        helper.visible = this.lightHelperVisible;
      } else {
        helper.visible = false;
      }
      helper.update && helper.update();
    }
    this.sceneHelpers.add(helper);
    this.helpers.set(object.id, helper);
  }
  // 渲染辅助线
  renderHelper() {
    this.sceneHelpers.visible &&
      this.threeEngine.renderer__three.renderer.render(
        this.sceneHelpers,
        this.threeEngine.camera__three.viewportCamera
      );
  }
  // 渲染网格
  renderGrid() {
    this.grid.visible &&
      this.threeEngine.renderer__three.renderer.render(this.grid, this.threeEngine.camera__three.viewportCamera);
  }
  // 移除辅助线
  removeHelper(object) {
    const helper = this.helpers.get(object.id);

    if (helper) {
      helper.parent.remove(helper);

      this.helpers.delete(object.id);
    }
    if (object === this?.threeEngine?.control__three?.transformControls__three?.object) {
      this.threeEngine.control__three.detachTransformControls();
    }
  }
  // 更新灯光辅助线可见性
  updateLightHelperVisible(uuid, visible) {
    for (const helper of this.helpers.values()) {
      if (helper.type.includes('LightHelper')) {
        if (helper.light.uuid === uuid) {
          helper.visible = visible;
          helper.update && helper.update();
        }
      }
    }
  }
  // 辅助线更新
  updateHelper() {
    for (const helper of this.helpers.values()) {
      helper.update && helper.update();
    }
  }
  // 显示隐藏辅助线
  showHelper(show, type) {
    let showSceneHelpers = false;
    if (type.includes('LightHelper')) {
      this.lightHelperVisible = show;
    }
    for (const helper of this.helpers.values()) {
      if (type.includes(helper.type)) {
        // 灯光辅助线 开关需关联灯光是否可见
        if (helper.type.includes('LightHelper')) {
          this.lightHelperVisible = show && helper.light.visible;
          helper.visible = this.lightHelperVisible;
        } else {
          helper.visible = show;
        }
        helper.update && helper.update();
        show && (showSceneHelpers = true);
      } else {
        helper.visible && (showSceneHelpers = true);
      }
    }
    if (type.includes('transformControls')) {
      for (const child of this.sceneHelpers.children) {
        if (child.isTransformControls) {
          child.enabled = show;
          child.visible = show;
          child.update && child.update();
        }
      }
      this.threeEngine.control__three.transformControls__visible = show;
    }
    this.sceneHelpers.visible =
      this.threeEngine.control__three.transformControls__visible || showSceneHelpers || this.lightHelperVisible;
  }

  // 显示隐藏网格
  showGrid(show) {
    this.grid.visible = show;
  }
}
