import * as THREE from 'three';
import EventEmitter from 'events';
import { proxyOptions } from './Proxy.ts';
import type { ThreeEngine } from '../main';
import type { Geometry } from '../types/Geometry';
import type { Material } from '../types/Material';
import type { Camera } from '../types/Camera';
import type { SceneHelpers } from '../types/SceneHelpers';
import type { Loader } from '../types/FileLoader';
import type { ImageTexture } from '../types/ImageTexture';
import type { IndexDb } from '../types/IndexDb';
import type { AddObject3DParams, ChangeObjectMeshParams, SwapObjectMeshParams, Object3DMeshMaterialsParams } from '../types/Object3D.js';

export class Object3D extends EventEmitter {
  threeEngine: ThreeEngine;
  texturePath: string;
  geometries: Map<string, THREE.BufferGeometry>;
  modelObjects: Map<string, THREE.Object3D>;

  constructor(threeEngine: ThreeEngine) {
    super();
    this.threeEngine = threeEngine;
    this.texturePath = '';
    this.geometries = new Map();
    this.modelObjects = new Map();
    proxyOptions(this, this.threeEngine);
  }

  // 加载模型材质列表
  loadMeshMaterials({ object, mesh, modelOriginData, materialPromise }: Object3DMeshMaterialsParams) {
    const modelMesh = object.children[mesh.originIndex];
    if (!modelMesh) {
      return;
    }
    modelMesh.geometry.attributes.uv2 = modelMesh.geometry.attributes.uv; // 设置第二组uv
    if (Array.isArray(mesh.material)) {
      for (let index = 0, l = mesh.material.length; index < l; index++) {
        const material = this.loadMeshMaterial({
          modelOriginData,
          materialUUid: mesh.material[index],
          materialPromise
        });
        this.setObjectMaterial(modelMesh, index, material);
      }
    } else {
      const material = this.loadMeshMaterial({ modelOriginData, materialUUid: mesh.material, materialPromise });
      this.setObjectMaterial(modelMesh, undefined, material);
    }
    this.setObjectProps(modelMesh, {
      uuid: mesh.uuid,
      transform: mesh.transform,
      name: mesh.name,
      renderOrder: mesh.renderOrder,
      visible: mesh.visible
    });
  }

  // 加载模型材质
  loadMeshMaterial({ modelOriginData, materialUUid, materialPromise }: { modelOriginData: any; materialUUid: string; materialPromise: Promise<any>[]; }) {
    const currentMaterial = modelOriginData.materials.find(material => material.uuid === materialUUid);
    const material = new THREE[currentMaterial.type]();
    for (const key of Object.keys(currentMaterial)) {
      if (this.isRotationRepeatMap(key) || this.material__three.rotationRepeatKey.includes(key)) {
        // 贴图缩放旋转纹理贴图先不加载 相关数据也先不设置
        continue;
      }
      materialPromise.push(
        this.material__three.setMaterialValue({
          material,
          key,
          value: currentMaterial[key]
        })
      );
    }
    return material;
  }

  // 加载模型组
  async loadObjectGroup(object: THREE.Group, modelOriginData: any) {
    const materialPromise: Promise<any>[] = [];
    for (const mesh of modelOriginData.group.children) {
      this.loadMeshMaterials({
        object,
        mesh,
        modelOriginData,
        materialPromise
      });
    }
    // 过滤模型数据没有的mesh  模型文件有的mesh 编辑器删除mesh后没有更改模型文件导致依然加载被删掉的mesh
    const objectNewMeshChildren = object.children.filter(mesh => {
      const idx = modelOriginData.group.children.findIndex(({ uuid }) => mesh.uuid === uuid);
      return idx !== -1;
    });
    object.children = objectNewMeshChildren;
    // 先把模型添加进场景
    this.addObject({ object });
    // 材质贴图 异步执行
    materialPromise.push(this.renderObjectMaterialMap({ object, modelOriginData }));
    // 所有贴图加载完毕
    await Promise.allSettled(materialPromise);
  }

  // 渲染材质纹理贴图
  async renderObjectMaterialMap({ object, modelOriginData }: { object: THREE.Group; modelOriginData: any; }) {
    object.traverse(async (child: THREE.Object3D) => {
      if (child.isMesh) {
        if (child.material !== undefined) {
          if (Array.isArray(child.material)) {
            for (const _material of child.material) {
              if (_material) {
                const materialData = modelOriginData.materials.find(material => material.uuid === _material.uuid);
                materialData && this.setObjectMaterialRotationRepeatMap({ material: _material, materialData });
              }
            }
          } else {
            const materialData = modelOriginData.materials.find(material => material.uuid === child.material.uuid);
            materialData && this.setObjectMaterialRotationRepeatMap({ material: child.material, materialData });
          }
        }
      }
    });
  }

  isRotationRepeatMap(key: string): boolean {
    return (
      this.material__three.rotationRepeatMap.includes(key) || this.material__three.rotationRepeatSingleMap.includes(key)
    );
  }

  // 设置材质纹理贴图
  async setObjectMaterialRotationRepeatMap({ material, materialData }: { material: THREE.Material; materialData: any; }) {
    const rotationRepeatPromise: Promise<any>[] = [];
    for (const key of Object.keys(materialData)) {
      if (this.isRotationRepeatMap(key) && materialData[key]) {
        rotationRepeatPromise.push(
          this.material__three.setMaterialTextureMap({
            material,
            key,
            value: materialData[key]
          })
        );
      }
    }
    // 贴图缩放、旋转属性需要联动指定的纹理 所以需要等待他们加载完成再设置
    await Promise.allSettled(rotationRepeatPromise);
    for (const key of this.material__three.rotationRepeatKey) {
      materialData[key] !== undefined &&
        this.material__three.setMaterialTextureMapRotationRepeat({
          material,
          key: key,
          value: materialData[key],
          isSingle: key.includes('map') || key.includes('Map')
        });
    }
    material.needsUpdate = true;
  }

  // 添加模型对象组
  async addObjectGroup({ object, data }: AddObject3DParams) {
    let model: THREE.Group | THREE.Mesh | null = null;
    if (object.isGroup) {
      model = object;
      model.name = !object.name ? 'Group' : object.name;
    } else if (object.isMesh) {
      const group = new THREE.Group();
      group.add(object);
      group.name = 'Group';
      model = group;
    }
    if (data) {
      // 存在模型数据则加载模型数据，不走默认数据
      await this.loadObjectGroup(model as THREE.Group, data);
      return;
    }
    model.traverse((child: THREE.Object3D) => {
      if (child.isMesh) {
        child.geometry.attributes.uv2 = child.geometry.attributes.uv; // 设置第二组uv
        this.generateNewMeshMaterial(child as THREE.Mesh);
      }
    });
    this.addObject({ object: model });
    const modelData = model.toJSON();
    for (const material of modelData.materials) {
      this.material__three.resetMaterialData(material);
      // FIXEME
      material.image = '/threeModel-editor/circle.png';
      material.rotation = 0;
      material.repeat = 1;
      material.mapRotation = 0;
      material.mapRepeat = 1;
      material.aoMapRotation = 0;
      material.aoMapRepeat = 1;
    }
    modelData.object.transform = {
      translate: {
        x: model.position.x,
        y: model.position.y,
        z: model.position.z
      },
      scale: {
        x: model.scale.x,
        y: model.scale.y,
        z: model.scale.z
      },
      rotation: {
        x: model.rotation.x,
        y: model.rotation.y,
        z: model.rotation.z
      }
    };
    modelData.object.children.forEach((mesh: any, index: number) => {
      if (mesh.type === 'Mesh' || mesh.type.endsWith('Mesh')) {
        mesh.visible = true;
        mesh.transform = {
          translate: {
            x: model?.children?.[index]?.position?.x,
            y: model?.children?.[index]?.position?.y,
            z: model?.children?.[index]?.position?.z
          },
          scale: {
            x: model?.children?.[index]?.scale?.x,
            y: model?.children?.[index]?.scale?.y,
            z: model?.children?.[index]?.scale?.z
          },
          rotation: {
            x: model?.children?.[index]?.rotation?.x,
            y: model?.children?.[index]?.rotation?.y,
            z: model?.children?.[index]?.rotation?.z
          }
        };
        mesh.originIndex = index;
      }
    });
    this.emit('addObjectGroupUpdated', modelData);
  }

  // 模型替换
  async changeObjectMesh({ file, meshUUid, swapIndex = 0 }: ChangeObjectMeshParams) {
    await this.loader__three.loadFiles({
      files: [file.file],
      filesMap: undefined,
      onSuccess: async ({ object }) => {
        await this.swapObjectMesh({ object, swapMeshUUid: meshUUid, swapIndex });
      }
    });
  }

  // 添加3d对象
  addObject({ object, parent, index }: AddObject3DParams) {
    const scopeGeometry = this.geometry__three;
    const scopeMaterial = this.material__three;
    const scopeCamera = this.camera__three;
    const scopeHelper = this.sceneHelpers__three;
    const scopeScene = this.scene__three;
    object.traverse((child: THREE.Object3D) => {
      if (child.geometry !== undefined) scopeGeometry.addGeometry(child.geometry);
      if (child.material !== undefined) scopeMaterial.addMaterial(child.material);

      scopeCamera.addCamera(child);
      scopeHelper.addHelper(child);
      if (!this.modelObjects.get(child.uuid)) {
        this.modelObjects.set(child.uuid, child);
      }
    });

    if (!parent) {
      scopeScene.add(object);
    } else {
      parent.children.splice(index, 0, object);
      object.parent = parent;
    }
  }

  // 替换模型
  async swapObjectMesh({ object, swapMeshUUid, swapIndex }: SwapObjectMeshParams) {
    const oldMesh = this.getObject3D(swapMeshUUid);
    if (!oldMesh) {
      if (object) {
        this.addObjectGroup({ object });
      }
      return;
    }
    let newMesh: THREE.Mesh | null = null;
    if (object.isGroup) {
      // 替换模型只能第一个mesh
      newMesh = object.children[swapIndex] as THREE.Mesh;
    } else if (object.isMesh) {
      newMesh = object;
    }
    this.setObjectProps(newMesh, {
      name: oldMesh.name,
      renderOrder: oldMesh.renderOrder,
      parent: oldMesh.parent,
      uuid: oldMesh.uuid
    });
    await this.swapObjectMeshMaterial({ oldMesh, newMesh: newMesh as THREE.Mesh });
    this.removeObject({ object: oldMesh, needDeleteImage: false });
    this.addObject({ object: newMesh as THREE.Mesh, parent: newMesh.parent, index: swapIndex });
    const newMeshData = newMesh.toJSON();
    newMeshData.object.transform = {
      translate: {
        x: newMesh?.position?.x,
        y: newMesh?.position?.y,
        z: newMesh?.position?.z
      },
      scale: {
        x: newMesh?.scale?.x,
        y: newMesh?.scale?.y,
        z: newMesh?.scale?.z
      },
      rotation: {
        x: newMesh?.rotation?.x,
        y: newMesh?.rotation?.y,
        z: newMesh?.rotation?.z
      }
    };
    newMeshData.object.originIndex = swapIndex;
    this.emit('swapObjectMeshUpdated', newMeshData);
  }

  // 获取模型对象材质
  getObjectMaterial(object: THREE.Mesh, slot?: number): THREE.Material | undefined {
    let material = object.material;

    if (Array.isArray(material) && slot !== undefined) {
      material = material[slot];
    }

    return material;
  }

  // 替换掉模型对象的材质
  setObjectMaterial(object: THREE.Mesh, slot: number | undefined, newMaterial: THREE.Material) {
    if (Array.isArray(object.material) && slot !== undefined) {
      object.material[slot] = newMaterial;
    } else {
      object.material = newMaterial;
    }
  }

  // 设置模型的旋转、位移、缩放
  setModelMeshTransform({ uuid, position, type = 'translate' }: { uuid: string; position: { x?: number; y?: number; z?: number; }; type?: string; }) {
    const modelObject = this.getObject3D(uuid) as THREE.Mesh;
    modelObject && this.setObject3DTransform(modelObject, position, type);
  }

  // 设置对象变换数据
  setObject3DTransform(object: THREE.Mesh, position: { x?: number; y?: number; z?: number; }, type: string) {
    const { x, y, z } = position;
    if (x !== undefined && y !== undefined && z !== undefined) {
      switch (type) {
        case 'translate':
          object?.position?.set(x, y, z);
          break;
        default:
          object?.[type]?.set(x, y, z);
          break;
      }
    }
  }

  // 获取3d对象
  getObject3D(uuid: string): THREE.Object3D | undefined {
    return this.modelObjects.get(uuid);
  }

  // 添加模型材质
  async generateNewMeshMaterial(modelMesh: THREE.Mesh) {
    if (Array.isArray(modelMesh.material)) {
      for (let index = 0, l = modelMesh.material.length; index < l; index++) {
        const material = new THREE.MeshPhysicalMaterial();
        this.material__three.resetMaterialData(material, true);
        material.needsUpdate = true;
        this.setObjectMaterial(modelMesh, index, material);
      }
    } else {
      const material = new THREE.MeshPhysicalMaterial();
      this.material__three.resetMaterialData(material, true);
      material.needsUpdate = true;
      this.setObjectMaterial(modelMesh, 0, material);
    }
  }

  // 替换模型材质
  async swapObjectMeshMaterial({ oldMesh, newMesh }: { oldMesh: THREE.Mesh; newMesh: THREE.Mesh; }) {
    const oldCloneMaterial = oldMesh.material.clone();
    const newMeshMaterial = new THREE[oldCloneMaterial.type]();

    for (const key of Object.keys(oldMesh.material)) {
      const value = oldCloneMaterial?.[key]?.clone ? oldMesh?.material?.[key]?.clone?.() : oldCloneMaterial[key];
      if (key.endsWith('Map') || key == 'map') {
        newMeshMaterial[key] = value;
        continue;
      } else {
        if (['type', 'uuid', '_listeners'].includes(key)) {
          continue;
        }
        if (key === 'envMapRotation') {
          newMeshMaterial[key] = oldCloneMaterial?.[key]?.clone();
          newMeshMaterial[key].set(
            oldMesh?.material?.[key][0],
            oldMesh?.material?.[key][1],
            oldMesh?.material?.[key][2],
            oldMesh?.material?.[key][3]
          );
          continue;
        }
        this.material__three.setMaterialValue({
          material: newMeshMaterial,
          key,
          value
        });
      }
    }
    newMeshMaterial.uuid = oldMesh.material.uuid;
    await this.setObjectMaterial(newMesh, undefined, newMeshMaterial);
    newMeshMaterial.needsUpdate = true;
  }

  // 移除3d对象
  removeObject3D({ uuid, needDeleteImage = false }: { uuid: string; needDeleteImage?: boolean; }) {
    this.getObject3D(uuid) && this.removeObject({ object: this.getObject3D(uuid) as THREE.Object3D, needDeleteImage });
  }

  // 移除对象
  removeObject({ object, needDeleteImage }: { object: THREE.Object3D; needDeleteImage?: boolean; }) {
    if (object.parent === null) return; // 避免删除相机或场景

    object.traverse((child: THREE.Object3D) => {
      this.camera__three.removeCamera(child);
      this.sceneHelpers__three.removeHelper(child);

      if (child.material !== undefined)
        this.material__three.removeMaterial({ material: child.material, needDeleteImage });
      if (child.geometry !== undefined) {
        this.geometry__three.removeGeometry(child.geometry);
        object.parent.remove(child.geometry);
      }
      // 模型集合删除该对象
      this.modelObjects.delete(child.uuid);
    });

    object.parent.remove(object);
  }

  // 命名3d对象
  nameObject(uuid: string, name: string) {
    const object = this.getObject3D(uuid) as THREE.Object3D;
    object.name = name;
  }

  // 移动3d对象
  moveObject(object: THREE.Object3D, parent?: THREE.Object3D, before?: THREE.Object3D) {
    if (parent === undefined) {
      parent = this.scene__three;
    }

    parent.add(object);

    // sort children array

    if (before !== undefined) {
      const index = parent.children.indexOf(before);
      parent.children.splice(index, 0, object);
      parent.children.pop();
    }
  }

  // 设置模型属性
  setModelMeshProps(uuid: string, data: { [key: string]: any }) {
    const object = this.getObject3D(uuid) as THREE.Mesh;
    if (!object || !data) return;
    this.setObjectProps(object, data);
  }

  // 设置对象属性
  setObjectProps(object: THREE.Object3D, data: { [key: string]: any }) {
    if (!object || !data) return;
    for (const key of Object.keys(data)) {
      if (key === 'transform') {
        for (const prop of Object.keys(data[key])) {
          this.setObject3DTransform(object as THREE.Mesh, data[key][prop], prop);
        }
      } else {
        object[key] = data[key];
      }
    }
  }
}
