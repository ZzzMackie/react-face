import * as THREE from 'three';
import originMaterial from '../defaultData/originMaterial.js';
import { proxyOptions } from './proxy.js';
const rotationRepeatMap = ['normalMap', 'roughnessMap', 'metalnessMap', 'specularMap', 'specularColorMap'];
const rotationRepeatSingleMap = ['map', 'aoMap'];
const rotationRepeatKey = ['rotation', 'repeat', 'mapRotation', 'mapRepeat', 'aoMapRotation', 'aoMapRepeat'];
export class Material {
  constructor(threeEngine) {
    this.threeEngine = threeEngine;
    this.materialsRefCounter = new Map();
    this.materials = new Map();
    const colorMaps = ['map', 'emissiveMap', 'sheenColorMap', 'specularColorMap', 'envMap'];
    this.colorMaps = colorMaps;
    this.rotationRepeatMap = rotationRepeatMap;
    this.rotationRepeatSingleMap = rotationRepeatSingleMap;
    this.rotationRepeatKey = rotationRepeatKey;
    proxyOptions(this, this.threeEngine);
  }
  // 重置材质数据
  resetMaterialData(material, color = false) {
    for (const key of Object.keys(originMaterial)) {
      if (key.toLocaleLowerCase().includes('color') || key == 'emissive') {
        material[key] = color ? new THREE.Color(originMaterial[key]) : originMaterial[key];
      } else {
        material[key] = originMaterial[key];
      }
    }
  }

  // 根据id查找和子模型名称查找对应的材质
  findMeshMaterialByModelId({ uuid }) {
    let material = this.materials.get(uuid);
    return material;
  }

  // 删除销毁材质、纹理
  deleteMaterial({ uuid, deleteKeys = [], needDeleteImage = true }) {
    let targetMaterial = this.materials.get(uuid);
    deleteKeys.forEach(key => {
      if (targetMaterial[key]) {
        needDeleteImage && targetMaterial[key].uuid && this.imageTexture__three.deleteImage(targetMaterial[key].uuid);
        targetMaterial[key].dispose && targetMaterial[key].dispose();
      }
      targetMaterial[key] = null;
    });
    targetMaterial.needsUpdate = true;
  }
  // 设置材质关联贴图旋转重复属性
  setMaterialTextureMapRotationRepeat({ material, key, value, isSingle = false }) {
    if (isSingle) {
      for (const singleKey of this.rotationRepeatSingleMap) {
        if (key.includes(singleKey)) {
          if (material[singleKey]) {
            if (key.includes('Repeat')) {
              if (material[singleKey]['repeat'].set) {
                material[singleKey]['repeat'].set(value, value);
              }
            } else {
              // rotation 度数转弧度
              material[singleKey]['rotation'] = value * THREE.MathUtils.DEG2RAD;
            }
          }
        }
      }
    } else {
      for (const prop of rotationRepeatMap) {
        if (material[prop]) {
          if (material[prop][key].set) {
            material[prop][key].set(value, value);
          } else {
            // rotation 度数转弧度
            material[prop][key] = value * THREE.MathUtils.DEG2RAD;
          }
        }
      }
    }
  }
  // 设置材质纹理贴图
  async setMaterialTextureMap({ material, key, value, uuid, needsUpdateMap = true, needDeleteImage }) {
    if (value) {
      uuid && this.deleteMaterial({ uuid, deleteKeys: [key], needDeleteImage });
      if (needsUpdateMap) {
        const texture =
          key === 'envMap'
            ? await this.imageTexture__three.addRGBETextureImage(value)
            : await this.imageTexture__three.addTextureImage(value);
        this.colorMapsHandler(key, texture);
        if (key === 'map') {
          texture.anisotropy = this.renderer__three.renderer.capabilities.getMaxAnisotropy();
        }
        material[key] = texture;
      }
    }
  }
  // 设置材质数据
  async setMaterialValue({ material, key, value, uuid, needsUpdateMap = true, needDeleteImage }) {
    if (key.endsWith('Map') || key == 'map') {
      await this.setMaterialTextureMap({ material, key, value, uuid, needsUpdateMap, needDeleteImage });
    } else if (key.endsWith('Color') || key == 'color' || key == 'emissive') {
      material[key] = new THREE.Color(value);
    } else {
      switch (key) {
        case 'clearcoatNormalScale':
        case 'normalScale':
        case 'iridescenceThicknessRange':
          for (const prop of Object.keys(value)) {
            material[key] && (material[key][prop] = value[prop]);
          }
          break;
        case 'repeat':
        case 'rotation':
          this.setMaterialTextureMapRotationRepeat({ material, key, value });
          break;
        case 'aoMapRepeat':
        case 'aoMapRotation':
        case 'mapRepeat':
        case 'mapRotation':
          this.setMaterialTextureMapRotationRepeat({ material, key, value, isSingle: true });
          break;
        case 'type':
          break;
        default:
          material[key] !== undefined && (material[key] = value);
          break;
      }
    }
    material.needsUpdate = true;
  }

  // 更新材质数据 不需要删除旧图 替换图片只更换图片路径
  async updateMaterial({ uuid, key, value }) {
    const material = this.materials.get(uuid);
    if (material) {
      await this.setMaterialValue({ material, key, value, uuid, needDeleteImage: false });
    } else {
      console.error(`找不到该${uuid}的材质数据`);
    }
  }

  // 切换材质类型
  async changeMaterial({ uuid, originMaterial, newMaterialType }) {
    const newMaterial = new THREE[newMaterialType]();
    newMaterial.uuid = uuid;
    // 默认材质图片
    newMaterial.image = '/threeModel-editor/test.webp';
    const material = this.materials.get(uuid);
    if (material) {
      for (const key of Object.keys(originMaterial)) {
        newMaterial[key] !== undefined &&
          (await this.setMaterialValue({
            material: newMaterial,
            key,
            value: originMaterial[key],
            uuid,
            needsUpdateMap: newMaterial[key] !== undefined && originMaterial[key],
            needDeleteImage: false
          }));
      }
      material.needsUpdate = true;
      this.materials.delete(material.uuid);
      this.materials.set(material.uuid, newMaterial);
    } else {
      this.addMaterials(newMaterial);
    }
    this.updateMeshMaterial(uuid);
    return newMaterial;
  }
  // 处理贴图纹理颜色空间 与官网编辑器保持一致
  colorMapsHandler(key, texture) {
    if (texture !== null) {
      if (
        this.colorMaps.includes(key) &&
        texture.isDataTexture !== true &&
        texture.colorSpace !== THREE.SRGBColorSpace
      ) {
        texture.colorSpace = THREE.SRGBColorSpace;
      }
      if (key === 'envMap') {
        texture.mapping = THREE.EquirectangularReflectionMapping;
      }
    }
  }
  // 更新模型材质
  updateMeshMaterial(uuid) {
    const material = this.materials.get(uuid);
    this.scene__three.traverse(child => {
      if (child.type === 'Mesh') {
        if (Array.isArray(child.material)) {
          const index = child.material.find(_material => _material.uuid === uuid);
          if (index !== -1) {
            child.material[index] = material;
          }
        } else {
          if (child.material.uuid === uuid) {
            child.material = material;
          }
        }
      }
    });
  }
  addMaterials(materials) {
    let _material = materials;
    if (materials) {
      if (Array.isArray(materials)) {
        for (const material of materials) {
          if (this.materials.get(material.uuid)) {
            _material = this.materials.get(material.uuid);
          }
        }
      } else {
        if (this.materials.get(materials.uuid)) {
          _material = this.materials.get(materials.uuid);
        }
      }
      this.materials.set(_material.uuid, _material);
    }
  }

  addMaterial(material) {
    if (Array.isArray(material)) {
      for (var i = 0, l = material.length; i < l; i++) {
        this.addMaterialToRefCounter(material[i]);
      }
    } else {
      this.addMaterialToRefCounter(material);
    }
  }

  addMaterialToRefCounter(material) {
    var materialsRefCounter = this.materialsRefCounter;

    var count = materialsRefCounter.get(material);

    if (count === undefined) {
      materialsRefCounter.set(material, 1);
      this.addMaterials(material);
    } else {
      count++;
      materialsRefCounter.set(material, count);
    }
  }

  removeMaterial({ material, needDeleteImage }) {
    if (Array.isArray(material)) {
      for (var i = 0, l = material.length; i < l; i++) {
        this.removeMaterialFromRefCounter({ material: material[i], needDeleteImage });
      }
    } else {
      this.removeMaterialFromRefCounter({ material, needDeleteImage });
    }
  }

  removeMaterialFromRefCounter({ material, needDeleteImage }) {
    var materialsRefCounter = this.materialsRefCounter;

    var count = materialsRefCounter.get(material);
    count--;

    if (count === 0) {
      materialsRefCounter.delete(material);
      this.deleteMaterialProp({ uuid: material.uuid, needDeleteImage });
      material.dispose();
    } else {
      materialsRefCounter.set(material, count);
    }
  }
  // 删除材质贴图
  deleteMaterialProp({ uuid, needDeleteImage = true }) {
    const material = this.getMaterialById(uuid);
    if (material) {
      for (const key of Object.keys(material)) {
        if (key.endsWith('Map') || key == 'map') {
          if (material[key]) {
            this.deleteMaterial({ uuid, deleteKeys: [key], needDeleteImage });
          }
        }
      }
      this.materials.delete(uuid);
    }
  }

  getMaterialById(id) {
    return this.materials.get(id);
  }

  setMaterialName(material, name) {
    material.name = name;
  }
}
