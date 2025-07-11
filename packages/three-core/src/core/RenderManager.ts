import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface RenderConfig {
  antialias?: boolean;
  alpha?: boolean;
  shadowMap?: boolean;
  pixelRatio?: number;
  outputEncoding?: THREE.ColorSpace;
  toneMapping?: THREE.ToneMapping;
  toneMappingExposure?: number;
}

/**
 * 渲染管理�?
 * 负责管理 Three.js 渲染�?
 */
export class RenderManager implements Manager {
  private engine: unknown;
  private renderer: THREE.WebGLRenderer;
  private config: RenderConfig;

  // 信号系统
  public readonly rendererCreated = createSignal<THREE.WebGLRenderer | null>(null);
  public readonly renderStarted = createSignal<void>(undefined);
  public readonly renderCompleted = createSignal<void>(undefined);
  public readonly renderError = createSignal<Error | null>(null);

  constructor(engine: unknown, config: RenderConfig = {}) {
    this.engine = engine;
    this.config = {
      antialias: true,
      alpha: false,
      shadowMap: true,
      pixelRatio: window.devicePixelRatio,
      outputEncoding: THREE.SRGBColorSpace,
      toneMapping: THREE.ACESFilmicToneMapping,
      toneMappingExposure: 1.0,
      ...config
    };
  }

  async initialize(): Promise<void> {
    this.createRenderer();
  }

  dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private createRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.config.antialias,
      alpha: this.config.alpha
    });

    if (this.config.shadowMap) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.renderer.setPixelRatio(this.config.pixelRatio!);
    this.renderer.outputColorSpace = this.config.outputEncoding!;
    this.renderer.toneMapping = this.config.toneMapping!;
    this.renderer.toneMappingExposure = this.config.toneMappingExposure!;

    this.rendererCreated.emit(this.renderer);
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
  }

  setPixelRatio(pixelRatio: number): void {
    this.renderer.setPixelRatio(pixelRatio);
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    try {
      this.renderStarted.emit();
      this.renderer.render(scene, camera);
      this.renderCompleted.emit();
    } catch (error) {
      this.renderError.emit(error as Error);
    }
  }

  setClearColor(color: THREE.ColorRepresentation, alpha?: number): void {
    this.renderer.setClearColor(color, alpha);
  }

  setClearAlpha(alpha: number): void {
    this.renderer.setClearAlpha(alpha);
  }

  enableShadowMap(): void {
    this.renderer.shadowMap.enabled = true;
  }

  disableShadowMap(): void {
    this.renderer.shadowMap.enabled = false;
  }

  setShadowMapType(type: THREE.ShadowMapType): void {
    this.renderer.shadowMap.type = type;
  }

  setToneMapping(toneMapping: THREE.ToneMapping): void {
    this.renderer.toneMapping = toneMapping;
  }

  setToneMappingExposure(exposure: number): void {
    this.renderer.toneMappingExposure = exposure;
  }

  getSize(): { width: number; height: number } {
    return {
      width: this.renderer.domElement.width,
      height: this.renderer.domElement.height
    };
  }

  getDomElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
}
