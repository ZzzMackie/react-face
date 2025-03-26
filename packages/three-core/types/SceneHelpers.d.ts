import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { ThreeEngine } from '../main';
// 辅助器类型定义
export class SceneHelpers {
  threeEngine: ThreeEngine;
  lightHelperVisible: boolean;
  sceneHelpers: THREE.Scene;
  helpers: Map<number, THREE.Object3D>;
  geometry: THREE.SphereGeometry;
  material: THREE.MeshBasicMaterial;
  box: THREE.Box3;
  selectionBox: THREE.Box3Helper;
  grid: THREE.Group;

  constructor(threeEngine: ThreeEngine);

  addHelper(object: any, helper?: RectAreaLightHelper | THREE.CameraHelper | THREE.PointLightHelper | THREE.DirectionalLightHelper | THREE.SpotLightHelper | THREE.HemisphereLightHelper | THREE.SkeletonHelper): void;

  renderHelper(): void;

  renderGrid(): void;

  removeHelper(object: any): void;

  updateLightHelperVisible(uuid: string, visible: boolean): void;

  updateHelper(): void;

  showHelper(show: boolean, type: string): void;

  showGrid(show: boolean): void;
}
