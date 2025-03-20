import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import * as THREE from 'three';

export const rgbeLoader = new RGBELoader();

export const textureLoader = new THREE.TextureLoader();

export const THREE_TextureLoader = (path, _textureLoader = textureLoader) => {
  return new Promise((resolve, reject) => {
    _textureLoader.load(
      path,
      texture => {
        // 纹理包裹模式更改成重复包裹
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;
        resolve(texture);
      },
      () => {
        // num = Math.round((event.loaded / event.total) * 100);
      },
      err => {
        console.log(err);
        reject(err);
      }
    );
  });
};

// 加载HDR环境贴图
export const THREE_RGBELoader = (path, pmremGenerator) => {
  return new Promise((resolve, reject) => {
    rgbeLoader.load(
      path,
      texture => {
        if (pmremGenerator) {
          // texture = pmremGenerator.fromEquirectangular(texture).texture;
          // texture.needsUpdate = true;
          // //清理资源
          // pmremGenerator.dispose();
          // pmremGenerator = null;
        }
        resolve(texture);
      },
      () => {
        // num = Math.round((event.loaded / event.total) * 100);
      },
      err => {
        console.log(err);
        reject(err);
      }
    );
  });
};
