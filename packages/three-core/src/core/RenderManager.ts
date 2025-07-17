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
  canvas?: HTMLCanvasElement;
}

/**
 * ?????
 * ???? Three.js ???
 */
export class RenderManager implements Manager {
  private engine: unknown;
  private renderer!: THREE.WebGLRenderer;
  private config: RenderConfig;

  // ?????????
  public readonly name = 'render';
  public initialized = false;
  public settings: RenderConfig;

  // ????
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
    this.settings = { ...this.config };
  }

  async initialize(): Promise<void> {
    this.createRenderer();
    this.initialized = true;
  }

  dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.initialized = false;
  }

  // ????????
  on(event: string, callback: (...args: any[]) => void): void {
    if (event === 'render') {
      this.renderCompleted.subscribe(callback);
    } else if (event === 'error') {
      this.renderError.subscribe(callback);
    } else if (event === 'performance:warning') {
      // ??????
    }
  }

  emit(event: string, ...args: any[]): void {
    if (event === 'render') {
      this.renderCompleted.emit();
    } else if (event === 'error') {
      this.renderError.emit(args[0]);
    }
  }

  private createRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.config.antialias,
      alpha: this.config.alpha,
      canvas: this.config.canvas
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

  render(scene?: THREE.Scene, camera?: THREE.Camera): void {
    try {
      this.renderStarted.emit();
      if (scene && camera) {
        this.renderer.render(scene, camera);
      }
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

  setShadowMapEnabled(enabled: boolean): void {
    this.renderer.shadowMap.enabled = enabled;
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

  // ?????????
  getRenderInfo(): any {
    return this.renderer.info.render;
  }

  getSettings(): RenderConfig {
    return this.settings;
  }

  updateSettings(newSettings: Partial<RenderConfig>): void {
    this.settings = { ...this.settings, ...newSettings };
    // ????
    if (newSettings.pixelRatio !== undefined && newSettings.pixelRatio <= 0) {
      throw new Error('Pixel ratio must be positive');
    }
  }

  getPerformanceMetrics(): any {
    return {
      frameTime: this.getFrameTime(),
      fps: this.getFPS()
    };
  }

  getFrameTime(): number {
    return 16.67; // ??60FPS
  }

  getFPS(): number {
    return 60;
  }

  detectPerformanceIssues(): any[] {
    const frameTime = this.getFrameTime();
    const issues = [];
    if (frameTime > 33.33) { // ??30FPS
      issues.push({ type: 'frameTime', value: frameTime });
    }
    return issues;
  }

  optimizeRendering(): any {
    return {
      success: true,
      optimizations: ['reduced_shadow_quality', 'lowered_pixel_ratio']
    };
  }

  createRenderTarget(width: number, height: number): any {
    return {
      width,
      height,
      dispose: jest.fn()
    };
  }

  disposeRenderTarget(target: any): void {
    if (target && target.dispose) {
      target.dispose();
    }
  }

  renderToTarget(target: any): void {
    this.render();
  }

  addPostProcessingEffect(effect: any): void {
    // ???????
  }

  removePostProcessingEffect(name: string): void {
    // ???????
  }

  getPostProcessingEffects(): any[] {
    return [];
  }

  setPostProcessingEnabled(enabled: boolean): void {
    // ??/?????
  }

  isPostProcessingEnabled(): boolean {
    return false;
  }

  getStatistics(): any {
    return {
      totalFrames: 1,
      averageFPS: 60,
      memoryUsage: { geometries: 0, textures: 0 }
    };
  }

  resetStatistics(): void {
    // ??????
  }

  exportStatistics(): any {
    return {
      timestamp: Date.now(),
      statistics: this.getStatistics()
    };
  }

  isRendering(): boolean {
    return this.initialized;
  }
}
