import * as THREE from 'three';
import { ThreeEngine } from '../main';

type ThreeObjectParams = THREE.Object3D

type Object3DMesh = THREE.Mesh | THREE.SkinnedMesh | THREE.Line | THREE.Points;

type UUID = string;

interface Object3DPosition {
  x?: number; y?: number; z?: number;
}
interface Object3DDataParams {
  geometries?: []; 
  materials?: []; 
  images?: []; 
  modelMesh?: []; 
  group?: [];
}

interface Object3DMeshTransform {
  uuid: UUID;
  position: Object3DPosition; 
  type?: 'translate' | 'scale' | 'rotation'
}
interface Object3DParams { 
  data: Object3DDataParams; 
  parent?: THREE.Object3D; 
  index?: number 
}

interface Object3DMeshMaterialsParams { 
  object: THREE.Object3D; 
  mesh: Object3DMesh; 
  modelOriginData: Object3DDataParams; 
  materialPromise: Promise[]
}
interface Object3DMeshMaterialParams { 
  modelOriginData: Object3DDataParams; 
  materialUUid: string; 
  materialPromise: Promise[] 
}

interface ObjectGroupParams {
  object: ThreeObjectParams; 
  data?: Object3DDataParams
}

interface Object3DRotationRepeatParams {
  material: THREE.Material; materialData: object
}

interface Object3DChangeMeshParams {
  file: string | File; 
  meshUUid: UUID; 
  swapIndex?: number
}
export class Object3D {
  threeEngine: ThreeEngine;
  texturePath: string;
  geometries: Map<number, THREE.BufferGeometry>;
  modelObjects: Map<string, ThreeObjectParams>;
  constructor(threeEngine: ThreeEngine);
  loadMeshMaterials(params: Object3DMeshMaterialsParams): void;
  loadMeshMaterial(params: Object3DMeshMaterialParams): THREE.Material;
  loadObjectGroup(object: ThreeObjectParams, modelOriginData: Object3DDataParams): Promise<void>;
  renderObjectMaterialMap(params: { object: ThreeObjectParams; modelOriginData: Object3DDataParams }): Promise<void>;
  isRotationRepeatMap(key: string): boolean;
  setObjectMaterialRotationRepeatMap(params: Object3DRotationRepeatParams): Promise<void>;
  addObjectGroup(params: ObjectGroupParams): Promise<void>;
  addModelObject(params: Object3DParams): Promise<void>;
  toggleModelVisible(uuid: string): void;
  loadMeshObject(params: Object3DParams): Promise<void>;
  swapObjectMeshMaterial(params: { oldMesh: THREE.Mesh; newMesh: THREE.Mesh }): Promise<void>;
  swapObjectMesh(params: { object: ThreeObjectParams; swapMeshUUid: UUID; swapIndex?: number }): Promise<void>;
  changeObjectMesh(params: Object3DChangeMeshParams): Promise<void>;
  addObject(params: { object: ThreeObjectParams; parent?: ThreeObjectParams; index?: number }): void;
  moveObject(object: ThreeObjectParams, parent?: ThreeObjectParams, before?: ThreeObjectParams): void;
  nameObject(uuid: UUID, name: string): void;
  removeObject3D(params: { uuid: UUID; needDeleteImage?: boolean }): void;
  removeObject(params: { object: ThreeObjectParams; needDeleteImage?: boolean }): void;
  setModelMeshProps(uuid: UUID, data: object): void;
  setObjectProps(object: ThreeObjectParams, data: object): void;
  getObjectMaterial(object: ThreeObjectParams, slot?: number): THREE.Material | undefined;
  generateNewMeshMaterial(modelMesh: THREE.Mesh): Promise<void>;
  setObjectMaterial(object: ThreeObjectParams, slot: number | undefined, newMaterial: THREE.Material): void;
  setModelMeshTransform(params: Object3DMeshTransform): void;
  setObject3DTransform(object: ThreeObjectParams, position: Object3DPosition, type: string): void;
  getObject3D(uuid: UUID): ThreeObjectParams | undefined;
}
