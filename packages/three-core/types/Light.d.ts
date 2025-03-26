 
import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { ThreeEngine } from '../main';

declare class Light {
  threeEngine: ThreeEngine;
  lightMap: Map<string, THREE.Light>;
  lightHelperMap: Map<string, RectAreaLightHelper | THREE.PointLightHelper | THREE.DirectionalLightHelper | THREE.SpotLightHelper | THREE.HemisphereLightHelper>; // 存储场景的灯光辅助对象

  constructor(threeEngine: ThreeEngine);

  // 创建灯光并添加进场景
  addLight({ lightClass, lightConfig }: { lightClass: string, lightConfig: any }): THREE.Light;

  getLight(lightId: string): THREE.Light | undefined;

  setLight(lightId: string, light_three: THREE.Light): void;

  // 更新灯光
  updateLight(config: any): void;

  // 删除灯光
  deleteLight(lightId: string): void;
}