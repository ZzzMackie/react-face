import * as THREE from 'three';
import { ThreeEngine } from '../main';
import { SceneHelpers } from './SceneHelpers';
import { Control } from './Controls';

export interface CameraConfig { 
    fov?: number; 
    aspect?: number;
    near?: number;
    far?: number;
    position?: { 
      x: number, 
      y: number, 
      z: number 
    };
}
export interface CameraData {
    fov?: number,
    zoom?: number,
    near?: number,
    far?: number,
    focus?: number,
    aspect?: number,
    filmGauge?: number,
    filmOffset?: number,
    position?: {
        x?: number,
        y?: number,
        z?: number
    }
  }

type CustomCamera = THREE.PerspectiveCamera | THREE.OrthographicCamera;

export interface CameraWithCustomProps extends CustomCamera {
  [key: string]: any;
}
export declare class Camera {
  threeEngine: ThreeEngine;
  camera: THREE.PerspectiveCamera;
  orthographicCamera: THREE.OrthographicCamera;
  cameras: Map<string, THREE.Camera>;
  viewportCamera: THREE.PerspectiveCamera;
  viewportShading: string;
  cameraList: { perspectiveCamera: string, orthographicCamera: string };
  sceneHelpers__three: SceneHelpers;
  control__three: Control;

  constructor(cameraConfig: CameraConfig, threeEngine: ThreeEngine);

  changeCamera(cameraType: string | number): void;

  updateAspect(aspect: number): void;

  addCamera(camera: THREE.Camera): void;

  removeCamera(camera: THREE.Camera): void;

  getCamera(uuid: string): THREE.Camera | undefined;

  setViewportCamera(uuid: string): void;

  setViewportShading(value: string): void;

  toAnimateCamera(data: { x: number, y: number, z: number }): void;

  cameraAnimateReset(cameraData: { x: number, y: number, z: number }): void;

  cameraObjectChange(cameraData: CameraData): void;

  screenshot(w?: number, h?: number, type?: string, transparentBackground?: boolean, encoderOptions?: number): string;
}
