import * as THREE from 'three';
import { ThreeEngine } from '../main';

export interface MaterialParams {
  material: THREE.Material;
  key: string;
  value: object | number | string | boolean;
  uuid?: string;
  needsUpdateMap?: boolean;
  needDeleteImage?: boolean;
}

export interface TextureMapParams {
  material: THREE.Material;
  key: string;
  value: string | THREE.Texture | CanvasDrawImage;
  uuid?: string;
  needsUpdateMap?: boolean;
  needDeleteImage?: boolean;
}

export interface TextureMapRotationRepeatParams {
  material: THREE.Material;
  key: string;
  value: number;
  isSingle?: boolean;
}

export interface ResetMaterialDataParams {
  material: THREE.Material;
  color?: boolean;
}

export interface FindMeshMaterialByModelIdParams {
  uuid: number;
}

export interface DeleteMaterialParams {
  uuid: number;
  deleteKeys?: string[];
  needDeleteImage?: boolean;
}

declare class Material {
  threeEngine: ThreeEngine;
  materialsRefCounter: Map<THREE.Material, number>;
  materials: Map<number, THREE.Material>;
  colorMaps: string[];
  rotationRepeatMap: string[];
  rotationRepeatSingleMap: string[];
  rotationRepeatKey: string[];

  constructor(threeEngine: ThreeEngine);

  resetMaterialData(params: ResetMaterialDataParams): void;

  findMeshMaterialByModelId(params: FindMeshMaterialByModelIdParams): THREE.Material | undefined;

  deleteMaterial(params: DeleteMaterialParams): void;

  setMaterialTextureMapRotationRepeat(params: TextureMapRotationRepeatParams): void;

  setMaterialTextureMap(params: TextureMapParams): Promise<void>;

  setMaterialValue(params: MaterialParams): Promise<void>;

  updateMaterial(uuid: number, key: string, value: any): Promise<void>;

  changeMaterial(uuid: number, originMaterial: any, newMaterialType: string): Promise<THREE.Material>;

  colorMapsHandler(key: string, texture: THREE.Texture): void;

  updateMeshMaterial(uuid: number): void;

  addMaterials(materials: THREE.Material | THREE.Material[]): void;

  addMaterial(material: THREE.Material | THREE.Material[]): void;

  addMaterialToRefCounter(material: THREE.Material): void;

  removeMaterial(material: THREE.Material | THREE.Material[], needDeleteImage?: boolean): void;

  removeMaterialFromRefCounter(material: THREE.Material, needDeleteImage?: boolean): void;

  deleteMaterialProp(uuid: number, needDeleteImage?: boolean): void;

  getMaterialById(id: number): THREE.Material | undefined;

  setMaterialName(material: THREE.Material, name: string): void;
}
