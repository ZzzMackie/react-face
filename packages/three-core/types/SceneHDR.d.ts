 
import * as THREE from 'three';
import { ThreeEngine } from '../main';

export interface EnvironmentOptions {
  texture?: string;
  path?: string;
  mapping?: THREE.Mapping;
  environmentIntensity?: number;
  environmentRotation?: { x: number, y: number, z: number };
  envMapIntensity?: number;
}

export interface BackgroundOptions {
  backgroundBlurriness?: number;
  backgroundIntensity?: number;
  backgroundRotation?: { x: number, y: number, z: number };
}

export interface SetEnvironmentOptions {
  texture: string;
  mapping?: THREE.Mapping;
}

export interface UpdateBackgroundPropOptions {
  backgroundBlurriness?: number;
  backgroundIntensity?: number;
  backgroundRotation?: { x: number, y: number, z: number };
}

export interface UpdateEnvironmentTextureMappingOptions {
  mapping: THREE.Mapping;
}

export interface Background {
  type: 'color' | 'texture';
  color?: string;
  texture?: string;
  textureType?: 'hdr' | 'other';
}

export interface SetBackgroundOptions {
  background: Background;
}

export class SceneHDR {
  sceneHelpers: THREE.Scene;
  helpers: Map<number, THREE.Object3D>;
  geometry: THREE.SphereGeometry;
  material: THREE.MeshBasicMaterial;
  box: THREE.Box3;
  selectionBox: THREE.Box3Helper;
  grid: THREE.Group;

  constructor(threeEngine: ThreeEngine);

  initSceneHDR(environment?: EnvironmentOptions): Promise<void>;

  initEnvironment(options: EnvironmentOptions): void;

  toggleSceneHDRBackground(options: { show: boolean }): void;

  updateMaterialsEnvMapIntensity(options: { envMapIntensity: number }): void;

  updateEnvironmentProp(options: EnvironmentOptions): void;

  updateBackgroundProp(options: BackgroundOptions): void;

  setImage(data: { path?: string, texture?: string }): Promise<void>;

  setEnvironment(options: SetEnvironmentOptions): Promise<void>;

  updateEnvironmentTextureMapping(options: UpdateEnvironmentTextureMappingOptions): void;

  clearBackground(): void;

  clearHDR(): void;

  setBackground(options: SetBackgroundOptions): Promise<void>;

  initBackground(options: SetBackgroundOptions): Promise<void>;
}
