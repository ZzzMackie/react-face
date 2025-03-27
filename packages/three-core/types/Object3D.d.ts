import * as THREE from 'three';
import { ThreeEngine } from '../main';

type ThreeObjectParams = THREE.Object3D

type Object3DMesh = THREE.Mesh | THREE.SkinnedMesh | THREE.Line | THREE.Points;

type UUID = string;
interface Object3DDataParams {
  geometries?: []; 
  materials?: []; 
  images?: []; 
  modelMesh?: []; 
}

interface Object3DMeshTransform {
  uuid: UUID;
  position: { x?: number; y?: number; z?: number; }; 
  type?: 'translate' | 'scale' | 'rotation'
}
interface Object3DParams { 
  data: Object3DDataParams; 
  parent?: THREE.Object3D; 
  index?: number 
}
export class Object3D {
  threeEngine: ThreeEngine;
  texturePath: string;
  geometries: Map<number, THREE.BufferGeometry>;
  modelObjects: Map<string, THREE.Object3D>;
  constructor(threeEngine: ThreeEngine);
  loadMeshMaterials(params: { object: THREE.Object3D; mesh: any; modelOriginData: any; materialPromise: any[] }): void;
  loadMeshMaterial(params: { modelOriginData: any; materialUUid: string; materialPromise: any[] }): THREE.Material;
  loadObjectGroup(object: THREE.Object3D, modelOriginData: any): Promise<void>;
  renderObjectMaterialMap(params: { object: THREE.Object3D; modelOriginData: any }): Promise<void>;
  isRotationRepeatMap(key: string): boolean;
  setObjectMaterialRotationRepeatMap(params: { material: THREE.Material; materialData: any }): Promise<void>;
  addObjectGroup(params: { object: THREE.Object3D; data?: any }): Promise<void>;
  addModelObject(params: Object3DParams): Promise<void>;
  toggleModelVisible(uuid: string): void;
  loadMeshObject(params: Object3DParams): Promise<void>;
  swapObjectMeshMaterial(params: { oldMesh: THREE.Mesh; newMesh: THREE.Mesh }): Promise<void>;
  swapObjectMesh(params: { object: THREE.Object3D; swapMeshUUid: string; swapIndex?: number }): Promise<void>;
  changeObjectMesh(params: { file: any; meshUUid: string; swapIndex?: number }): Promise<void>;
  addObject(params: { object: THREE.Object3D; parent?: THREE.Object3D; index?: number }): void;
  moveObject(object: THREE.Object3D, parent?: THREE.Object3D, before?: THREE.Object3D): void;
  nameObject(uuid: string, name: string): void;
  removeObject3D(params: { uuid: string; needDeleteImage?: boolean }): void;
  removeObject(params: { object: THREE.Object3D; needDeleteImage?: boolean }): void;
  setModelMeshProps(uuid: string, data: any): void;
  setObjectProps(object: THREE.Object3D, data: any): void;
  getObjectMaterial(object: THREE.Object3D, slot?: number): THREE.Material | undefined;
  generateNewMeshMaterial(modelMesh: THREE.Mesh): Promise<void>;
  setObjectMaterial(object: THREE.Object3D, slot: number | undefined, newMaterial: THREE.Material): void;
  setModelMeshTransform(params: { uuid: string; position: { x: number; y: number; z: number }; type?: string }): void;
  setObject3DTransform(object: THREE.Object3D, position: { x: number; y: number; z: number }, type: string): void;
  getObject3D(uuid: string): THREE.Object3D | undefined;
}
