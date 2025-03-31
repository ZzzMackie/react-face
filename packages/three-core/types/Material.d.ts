/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three';
import { ThreeEngine } from '../main';

type UUID = string;
export interface MaterialParams {
  material: THREE.Material;
  key: string;
  value: object | number | string | boolean;
  uuid?: UUID;
  needsUpdateMap?: boolean;
  needDeleteImage?: boolean;
}

export interface TextureMapParams {
  material: THREE.Material;
  key: string;
  value: string | THREE.Texture | CanvasDrawImage;
  uuid?: UUID;
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
  uuid: UUID;
}

export interface DeleteMaterialParams {
  uuid: UUID;
  deleteKeys?: string[];
  needDeleteImage?: boolean;
}

interface UpdateMaterialParams {
  uuid: UUID, 
  key: string, 
  value: any
}

interface ChangeMaterialParams {
  uuid: UUID, 
  originMaterial: THREE.Material, 
  newMaterialType: string
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

  updateMaterial(params: UpdateMaterialParams): Promise<void>;

  changeMaterial(params: ChangeMaterialParams): Promise<THREE.Material>;

  colorMapsHandler(key: string, texture: THREE.Texture): void;

  updateMeshMaterial(uuid: UUID): void;

  addMaterials(materials: THREE.Material | THREE.Material[]): void;

  addMaterial(material: THREE.Material | THREE.Material[]): void;

  addMaterialToRefCounter(material: THREE.Material): void;

  removeMaterial(material: THREE.Material | THREE.Material[], needDeleteImage?: boolean): void;

  removeMaterialFromRefCounter(material: THREE.Material, needDeleteImage?: boolean): void;

  deleteMaterialProp(uuid: UUID, needDeleteImage?: boolean): void;

  getMaterialById(id: number): THREE.Material | undefined;

  setMaterialName(material: THREE.Material, name: string): void;
}
