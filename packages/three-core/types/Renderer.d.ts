import * as THREE from 'three';
import EventEmitter from 'events';
import type { ThreeEngine } from '../main.d.ts';

export interface RendererOptions {
  renderOptions?: THREE.WebGLRendererParameters;
  cameraConfig?: THREE.Camera
}

export interface ToneMappingExposureParam { 
  toneMapping?: THREE.ToneMapping, toneMappingExposure?: number
}

export interface ShadowMapParam {
  shadows?: boolean, shadowType?: THREE.ShadowMapType
}
export declare class Renderer extends EventEmitter {
  renderer: THREE.WebGLRenderer | null;
  clock: THREE.Clock;
  options: THREE.WebGLRendererParameters;
  PMREMGenerator: THREE.PMREMGenerator | null;

  constructor(options: THREE.WebGLRendererParameters, threeEngine: ThreeEngine);

  initRenderer(options: THREE.WebGLRendererParameters): void;

  resetRenderer(options: THREE.WebGLRendererParameters): void;

  initRendererOptions(): void;

  setSize(width: number, height: number): void;

  render(): void;

  updateRenderer(): void;

  setToneMappingExposure(options: ToneMappingExposureParam): void;

  setShadowMap(options: ShadowMapParam): void;

  setXR(enabled: boolean): void;

  setAutoClear(autoClear: boolean): void;

  getMousePosition(dom: HTMLElement, x: number, y: number): [number, number];

  getIntersects(raycaster: THREE.Raycaster): THREE.Intersection[];

  getPointerIntersects(point: { x: number, y: number }): THREE.Intersection[];

  onClickSelectModel(): void;
}
