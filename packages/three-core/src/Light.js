/* eslint-disable no-case-declarations */
import * as THREE from 'three';
import { proxyOptions } from './proxy.js';
export class Light {
  constructor(threeEngine) {
    this.threeEngine = threeEngine;
    this.lightMap = new Map();
    this.lightHelperMap = new Map(); // 存储场景的灯光辅助对象
    proxyOptions(this, this.threeEngine);
  }

  /*****
   *
   * 灯光
   *
   *
   * *****/

  // 创建灯光并添加进场景
  addLight({ lightClass, lightConfig }) {
    const color = 0xffffff;
    const intensity = lightConfig.intensity != undefined ? lightConfig.intensity : 1;
    const distance = 0;
    const angle = Math.PI * 0.1;
    const penumbra = 0;
    // 创建灯光
    const light_three =
      lightClass === 'SpotLight'
        ? new THREE[lightClass](color, intensity, distance, angle, penumbra)
        : new THREE[lightClass]();
    light_three.name = lightClass;
    if (lightClass === 'SpotLight') {
      light_three.target.name = 'SpotLight Target';
      light_three.position.set(5, 10, 7.5);
    }
    light_three.uuid = lightConfig.uuid;
    // 将灯光存入map中
    this.setLight(lightConfig.uuid, light_three);
    // 设置灯光数据
    this.updateLight(lightConfig);
    // 将灯光添加进场景
    this.scene__three.add(light_three);
    // 添加灯光辅助线
    this.sceneHelpers__three.addHelper(light_three);
    return light_three;
  }

  getLight(lightId) {
    return this.lightMap.get(lightId);
  }

  setLight(lightId, light_three) {
    // 将灯光存入map中
    this.lightMap.set(lightId, light_three);
  }

  // 更新灯光
  updateLight(config) {
    const light = this.getLight(config.uuid);
    for (let key in config) {
      let configValue = config[key];
      switch (key) {
        case 'rotation':
          let { x: rx = 0, y: ry = 0, z: rz = 0 } = configValue;
          light.rotation.set(THREE.MathUtils.degToRad(rx), THREE.MathUtils.degToRad(ry), THREE.MathUtils.degToRad(rz));
          break;
        case 'position':
        case 'scale':
          let { x = 0, y = 0, z = 0 } = configValue;
          light[key].set(x, y, z);
          break;

        case 'color':
          light[key] = new THREE.Color(configValue);
          break;
        case 'visible':
          this.sceneHelpers__three.updateLightHelperVisible(light.uuid, configValue);
          light[key] = configValue;
          break;
        case 'uuid':
          break;
        case 'intensity':
          requestAnimationFrame(() => {
            light[key] = configValue;
          });
          break;
        default:
          light[key] = configValue;
          break;
      }
    }
    this.sceneHelpers__three.updateHelper();
  }

  // 删除灯光
  deleteLight(lightId) {
    // 删除灯光
    const light = this.getLight(lightId);
    if (light) {
      this.sceneHelpers__three.removeHelper(light);
      this.scene__three.remove(light);
      light.dispose();
      this.lightMap.delete(lightId);
    }
  }
}
