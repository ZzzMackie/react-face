import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface TextureConfig {
  enableCompression?: boolean;
  enableMipmaps?: boolean;
  defaultFormat?: THREE.PixelFormat;
  defaultType?: THREE.TextureDataType;
}

export interface TextureInfo {
  id: string;
  texture: THREE.Texture;
  type: string;
  loaded: boolean;
  width: number;
  height: number;
}

/**
 * 纹理管理�?
 * 负责管理 Three.js 纹理
 */
export class TextureManager implements Manager {
  // Add test expected properties
  public readonly name = 'TextureManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private textures: Map<string, TextureInfo> = new Map();
  private loader: THREE.TextureLoader;
  private config: TextureConfig;

  // 信号系统
  public readonly textureLoaded = createSignal<TextureInfo | null>(null);
  public readonly textureError = createSignal<{ id: string; error: Error } | null>(null);
  public readonly textureRemoved = createSignal<string | null>(null);

  constructor(engine: unknown, config: TextureConfig = {}) {
    this.engine = engine;
    this.config = {
      enableCompression: true,
      enableMipmaps: true,
      defaultFormat: THREE.RGBAFormat,
      defaultType: THREE.UnsignedByteType,
      ...config
    };
    this.loader = new THREE.TextureLoader();
  }

  async initialize(): Promise<void> {
    // 初始化纹理系�?
  this.initialized = true;}

  dispose(): void {
    this.removeAllTextures();
  this.initialized = false;}

  async loadTexture(
    id: string,
    url: string,
    options?: {
      format?: THREE.PixelFormat;
      type?: THREE.TextureDataType;
      generateMipmaps?: boolean;
      flipY?: boolean;
      wrapS?: THREE.Wrapping;
      wrapT?: THREE.Wrapping;
      minFilter?: THREE.TextureFilter;
      magFilter?: THREE.TextureFilter;
    }
  ): Promise<THREE.Texture> {
    try {
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        this.loader.load(
          url,
          resolve,
          undefined,
          reject
        );
      });

      // 应用配置选项
      if (options) {
        if (options.format) texture.format = options.format;
        if (options.type) texture.type = options.type;
        if (options.generateMipmaps !== undefined) texture.generateMipmaps = options.generateMipmaps;
        if (options.flipY !== undefined) texture.flipY = options.flipY;
        if (options.wrapS) texture.wrapS = options.wrapS;
        if (options.wrapT) texture.wrapT = options.wrapT;
        if (options.minFilter) texture.minFilter = options.minFilter;
        if (options.magFilter && 'magFilter' in texture) {
          (texture as any).magFilter = options.magFilter;
        }
      }

      const textureInfo: TextureInfo = {
        id,
        texture,
        type: 'image',
        loaded: true,
        width: texture.image?.width || 0,
        height: texture.image?.height || 0
      };

      this.textures.set(id, textureInfo);
      this.textureLoaded.emit(textureInfo);

      return texture;
    } catch (error) {
      const errorInfo = { id, error: error as Error };
      this.textureError.emit(errorInfo);
      throw error;
    }
  }

  createDataTexture(
    id: string,
    data: ArrayBufferView,
    width: number,
    height: number,
    format: THREE.PixelFormat = THREE.RGBAFormat,
    type: THREE.TextureDataType = THREE.UnsignedByteType
  ): THREE.DataTexture {
    const texture = new THREE.DataTexture(data, width, height, format, type);
    texture.needsUpdate = true;

    const textureInfo: TextureInfo = {
      id,
      texture,
      type: 'data',
      loaded: true,
      width,
      height
    };

    this.textures.set(id, textureInfo);
    this.textureLoaded.emit(textureInfo);

    return texture;
  }

  createCanvasTexture(
    id: string,
    canvas: HTMLCanvasElement,
    format: THREE.PixelFormat = THREE.RGBAFormat,
    type: THREE.TextureDataType = THREE.UnsignedByteType
  ): THREE.CanvasTexture {
    const texture = new THREE.CanvasTexture(canvas);

    const textureInfo: TextureInfo = {
      id,
      texture,
      type: 'canvas',
      loaded: true,
      width: canvas.width,
      height: canvas.height
    };

    this.textures.set(id, textureInfo);
    this.textureLoaded.emit(textureInfo);

    return texture;
  }

  createVideoTexture(
    id: string,
    video: HTMLVideoElement,
    format: THREE.PixelFormat = THREE.RGBAFormat,
    type: THREE.TextureDataType = THREE.UnsignedByteType
  ): THREE.VideoTexture {
    const texture = new THREE.VideoTexture(video);

    const textureInfo: TextureInfo = {
      id,
      texture,
      type: 'video',
      loaded: true,
      width: video.videoWidth,
      height: video.videoHeight
    };

    this.textures.set(id, textureInfo);
    this.textureLoaded.emit(textureInfo);

    return texture;
  }

  getTexture(id: string): TextureInfo | undefined {
    return this.textures.get(id);
  }

  hasTexture(id: string): boolean {
    return this.textures.has(id);
  }

  removeTexture(id: string): void {
    const textureInfo = this.textures.get(id);
    if (textureInfo) {
      textureInfo.texture.dispose();
      this.textures.delete(id);
      this.textureRemoved.emit(id);
    }
  }

  updateTexture(id: string): void {
    const textureInfo = this.textures.get(id);
    if (textureInfo) {
      textureInfo.texture.needsUpdate = true;
    }
  }

  setTextureRepeat(id: string, x: number, y: number): void {
    const textureInfo = this.textures.get(id);
    if (textureInfo) {
      textureInfo.texture.repeat.set(x, y);
    }
  }

  setTextureOffset(id: string, x: number, y: number): void {
    const textureInfo = this.textures.get(id);
    if (textureInfo) {
      textureInfo.texture.offset.set(x, y);
    }
  }

  setTextureWrap(id: string, wrapS: THREE.Wrapping, wrapT: THREE.Wrapping): void {
    const textureInfo = this.textures.get(id);
    if (textureInfo) {
      textureInfo.texture.wrapS = wrapS;
      textureInfo.texture.wrapT = wrapT;
    }
  }

  setTextureFilter(id: string, minFilter: THREE.TextureFilter, magFilter: THREE.TextureFilter): void {
    const textureInfo = this.textures.get(id);
    if (textureInfo) {
      textureInfo.texture.minFilter = minFilter;
      if ('magFilter' in textureInfo.texture) {
        (textureInfo.texture as any).magFilter = magFilter;
      }
    }
  }

  getAllTextures(): TextureInfo[] {
    return Array.from(this.textures.values());
  }

  getTexturesByType(type: string): TextureInfo[] {
    return Array.from(this.textures.values()).filter(texture => texture.type === type);
  }

  getLoadedTextures(): TextureInfo[] {
    return Array.from(this.textures.values()).filter(texture => texture.loaded);
  }

  removeAllTextures(): void {
    this.textures.forEach(textureInfo => {
      textureInfo.texture.dispose();
    });
    this.textures.clear();
  }
}