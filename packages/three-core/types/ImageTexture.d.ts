import { Texture } from 'three';
import { ThreeEngine } from '../main';
interface ImagesListMapValueOptions {
  url?: string;
  blob?: string;
  uuid: string;
}
export class ImageTexture {
  threeEngine: ThreeEngine; 
  images: Map<string, Texture>; 
  imagesList: Map<string, ImagesListMapValueOptions>; 
  config: any; 
  constructor(config?: any, threeEngine?: ThreeEngine);

  initImagesList(config: any): void;

  // 新增场景纹理贴图
  addRGBETextureImage(uuid: string): Promise<Texture | null>;

  // 新增普通纹理贴图
  addTextureImage(uuid: string): Promise<Texture | null>;

  // 添加贴图数据
  addImageData(uuid: string, url: string | { file: File; url: string; } | { includes: (value: string) => boolean; }): Promise<void>;

  // 添加贴图纹理数据
  addImage(image: Texture): void;

  getImageData(uuid: string): ImagesListMapValueOptions; // 你可以在这里替换成具体的类型

  // 获取纹理贴图数据
  getImage(uuid: string): Texture | null;

  // 删除贴图数据
  deleteImage(uuid: string): void;

  getCanvasImage(uuid: string): Promise<string | null>;

  // canvas渲染图片 可传入uuid 或者 文件
  renderToCanvas(uuid: string, domElement: HTMLCanvasElement): Promise<void>;

  // canvas渲染图片 可传入uuid 或者 文件
  renderMaterialToCanvas({ uuid, domElement }: { uuid: string; domElement: HTMLCanvasElement; }): Promise<void>; // 你可以在这里替换成具体的类型
}

// 定义外部依赖的类型
declare function renderToCanvas(texture: Texture): HTMLCanvasElement;
