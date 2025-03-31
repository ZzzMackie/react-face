 
import * as THREE from 'three';
import { proxyOptions } from './Proxy.ts';
export class SceneHDR {
  constructor(threeEngine) {
    this.threeEngine = threeEngine;
    proxyOptions(this, this.threeEngine);
  }
  // 创建HDR
  async initSceneHDR(environment = {}) {
    const { texture: uuid, path, mapping = THREE.EquirectangularReflectionMapping } = environment;
    if (!uuid || !path) {
      return Promise.reject();
    }
    await this.imageTexture__three.addImageData(uuid, path);
    await this.setEnvironment({ texture: uuid, mapping });
    this.initEnvironment(environment);
  }
  initEnvironment({ environmentIntensity, environmentRotation, envMapIntensity }) {
    this.updateEnvironmentProp({
      environmentIntensity,
      environmentRotation
    });
    this.updateMaterialsEnvMapIntensity({ envMapIntensity });
  }

  // 展示hdr环境贴图
  toggleSceneHDRBackground({ show }) {
    show && this.scene__three.environment && (this.scene__three.background = this.scene__three.environment);
  }
  //更新材质环境反射值
  updateMaterialsEnvMapIntensity({ envMapIntensity }) {
    this.scene__three.traverse(function (child) {
      if (child.isMesh && child.material !== undefined) {
        if (Array.isArray(child.material)) {
          for (const _material of child.material) {
            _material.envMapIntensity = envMapIntensity;
            _material.needsUpdate = true;
          }
        } else {
          child.material.envMapIntensity = envMapIntensity;
          child.material.needsUpdate = true;
        }
      }
    });
  }
  updateEnvironmentProp(environment = {}) {
    for (const key of Object.keys(environment)) {
      switch (key) {
        case 'environmentIntensity':
          this.scene__three[key] = environment[key];
          break;
        case 'environmentRotation':
          if (environment[key]) {
            this.scene__three[key].set(
              environment[key]?.x * THREE.MathUtils.DEG2RAD,
              environment[key]?.y * THREE.MathUtils.DEG2RAD,
              environment[key]?.z * THREE.MathUtils.DEG2RAD
            );
          }
          break;
        default:
          break;
      }
    }
  }
  updateBackgroundProp(background = {}) {
    for (const key of Object.keys(background)) {
      switch (key) {
        case 'backgroundBlurriness':
        case 'backgroundIntensity':
          this.scene__three[key] = background[key];
          break;
        case 'backgroundRotation':
          if (background[key]) {
            this.scene__three[key].set(
              background[key]?.x * THREE.MathUtils.DEG2RAD,
              background[key]?.y * THREE.MathUtils.DEG2RAD,
              background[key]?.z * THREE.MathUtils.DEG2RAD
            );
          }
          break;
        default:
          break;
      }
    }
  }
  async setImage(data) {
    if (data.path) {
      await this.imageTexture__three.addImageData(data.texture, data.path);
    }
  }
  //设置环境
  async setEnvironment(environment) {
    await this.setImage(environment);
    this.clearHDR();
    let texture = await this.imageTexture__three.addRGBETextureImage(environment.texture);
    texture && environment.mapping && (texture.mapping = environment.mapping);
    this.threeEngine.scene__three.environment = texture; // 给场景添加环境光效果
    texture?.dispose?.();
    texture = null;
  }
  // 更新环境渲染纹理类型
  updateEnvironmentTextureMapping({ mapping }) {
    this.threeEngine.scene__three.environment.mapping = mapping;
  }
  // 清空背景
  clearBackground() {
    this.scene__three.background && this.scene__three.background?.dispose?.();
    this.scene__three.background && (this.scene__three.background = null);
  }
  // 清空hdr
  clearHDR() {
    this.scene__three.environment && this.scene__three.environment.dispose();
    this.scene__three.environment && (this.scene__three.environment = null);
  }
  // 设置背景
  async setBackground({ background }) {
    if (background) {
      this.clearBackground();
      switch (background.type) {
        case 'color':
          this.scene__three.background = new THREE.Color(parseInt(`0x${background.color.replace('#', '')}`));
          break;
        case 'texture':
          await this.setImage(background);
          let texture = null;
          if (background?.textureType === 'hdr') {
            texture = await this.imageTexture__three.addRGBETextureImage(background.texture);
            texture.mapping = THREE.EquirectangularReflectionMapping;
          } else {
            texture = await this.imageTexture__three.addTextureImage(background.texture);
            texture.colorSpace = THREE.SRGBColorSpace;
          }
          this.scene__three.background = texture;
          break;
        default:
          break;
      }
    }
    this.threeEngine.updateRenderer();
  }
  // 初始化背景
  async initBackground({ background }) {
    if (background) {
      this.clearBackground();
      switch (background.type) {
        case 'color':
          this.scene__three.background = new THREE.Color(parseInt(`0x${background.color.replace('#', '')}`));
          break;
        case 'texture':
          await this.setImage(background);
          let texture = null;
          if (background?.textureType === 'hdr') {
            texture = await this.imageTexture__three.addRGBETextureImage(background.texture);
            texture.mapping = THREE.EquirectangularReflectionMapping;
          } else {
            texture = await this.imageTexture__three.addTextureImage(background.texture);
            texture.colorSpace = THREE.SRGBColorSpace;
          }
          this.scene__three.background = texture;
          this.updateBackgroundProp(background);
          break;
        default:
          break;
      }
    }
    this.threeEngine.updateRenderer();
  }
}
