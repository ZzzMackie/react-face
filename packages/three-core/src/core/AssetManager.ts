import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface AssetConfig {
  basePath?: string;
  autoLoad?: boolean;
  cacheSize?: number;
}

export interface AssetInfo {
  id: string;
  type: 'texture' | 'model' | 'audio' | 'video';
  url: string;
  asset: THREE.Texture | THREE.Group | HTMLAudioElement | HTMLVideoElement;
  loaded: boolean;
  error?: Error;
}

/**
 * 资源管理�?
 * 负责管理 Three.js 资源加载
 */
export class AssetManager implements Manager {
  private engine: unknown;
  private assets: Map<string, AssetInfo> = new Map();
  private loaders: Map<string, unknown> = new Map();
  private config: AssetConfig;

  // 信号系统
  public readonly assetLoaded = createSignal<AssetInfo | null>(null);
  public readonly assetError = createSignal<{ id: string; error: Error } | null>(null);
  public readonly loadingProgress = createSignal<{ loaded: number; total: number }>({ loaded: 0, total: 0 });

  constructor(engine: unknown, config: AssetConfig = {}) {
    this.engine = engine;
    this.config = {
      basePath: '',
      autoLoad: true,
      cacheSize: 100,
      ...config
    };
  }

  async initialize(): Promise<void> {
    this.setupLoaders();
  }

  dispose(): void {
    this.clearCache();
    this.assets.clear();
    this.loaders.clear();
  }

  private setupLoaders(): void {
    const textureLoader = new THREE.TextureLoader();
    const gltfLoader = new THREE.GLTFLoader();
    const audioLoader = new THREE.AudioLoader();

    this.loaders.set('texture', textureLoader);
    this.loaders.set('gltf', gltfLoader);
    this.loaders.set('audio', audioLoader);
  }

  async loadTexture(id: string, url: string): Promise<THREE.Texture> {
    const loader = this.loaders.get('texture') as THREE.TextureLoader;
    const fullUrl = this.config.basePath + url;

    try {
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(
          fullUrl,
          resolve,
          undefined,
          reject
        );
      });

      const assetInfo: AssetInfo = {
        id,
        type: 'texture',
        url: fullUrl,
        asset: texture,
        loaded: true
      };

      this.assets.set(id, assetInfo);
      this.assetLoaded.emit(assetInfo);
      this.updateProgress();

      return texture;
    } catch (error) {
      const errorInfo = { id, error: error as Error };
      this.assetError.emit(errorInfo);
      throw error;
    }
  }

  async loadModel(id: string, url: string): Promise<THREE.Group> {
    const loader = this.loaders.get('gltf') as THREE.GLTFLoader;
    const fullUrl = this.config.basePath + url;

    try {
      const result = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
        loader.load(
          fullUrl,
          resolve,
          undefined,
          reject
        );
      });

      const assetInfo: AssetInfo = {
        id,
        type: 'model',
        url: fullUrl,
        asset: result.scene,
        loaded: true
      };

      this.assets.set(id, assetInfo);
      this.assetLoaded.emit(assetInfo);
      this.updateProgress();

      return result.scene;
    } catch (error) {
      const errorInfo = { id, error: error as Error };
      this.assetError.emit(errorInfo);
      throw error;
    }
  }

  getAsset(id: string): AssetInfo | undefined {
    return this.assets.get(id);
  }

  hasAsset(id: string): boolean {
    return this.assets.has(id);
  }

  removeAsset(id: string): void {
    const asset = this.assets.get(id);
    if (asset) {
      if (asset.asset instanceof THREE.Texture) {
        asset.asset.dispose();
      }
      this.assets.delete(id);
    }
  }

  clearCache(): void {
    this.assets.forEach(asset => {
      if (asset.asset instanceof THREE.Texture) {
        asset.asset.dispose();
      }
    });
    this.assets.clear();
  }

  private updateProgress(): void {
    const total = this.assets.size;
    const loaded = Array.from(this.assets.values()).filter(asset => asset.loaded).length;
    this.loadingProgress.emit({ loaded, total });
  }

  getAssetsByType(type: AssetInfo['type']): AssetInfo[] {
    return Array.from(this.assets.values()).filter(asset => asset.type === type);
  }

  getLoadingAssets(): AssetInfo[] {
    return Array.from(this.assets.values()).filter(asset => !asset.loaded);
  }
}
