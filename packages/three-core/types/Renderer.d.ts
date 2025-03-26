import * as THREE from 'three';
import EventEmitter from 'events';
import type { ThreeEngine } from '../main.d.ts';

export declare class Renderer extends EventEmitter {
  renderer: THREE.WebGLRenderer | null;
  clock: THREE.Clock;
  options: any;
  PMREMGenerator: THREE.PMREMGenerator | null;

  constructor(options: any, threeEngine: ThreeEngine);

  initRenderer(options: any): void;

  resetRenderer(options: any): void;

  initRendererOptions(): void;

  setSize(width: number, height: number): void;

  render(): void;

  updateRenderer(): void;

  setToneMappingExposure(options: { toneMapping?: THREE.ToneMapping, toneMappingExposure?: number }): void;

  setShadowMap(options: { shadows?: boolean, shadowType?: THREE.ShadowMapType }): void;

  setXR(enabled: boolean): void;

  setAutoClear(autoClear: boolean): void;

  getMousePosition(dom: HTMLElement, x: number, y: number): [number, number];

  getIntersects(raycaster: THREE.Raycaster): THREE.Intersection[];

  getPointerIntersects(point: { x: number, y: number }): THREE.Intersection[];

  onClickSelectModel(): void;
}
