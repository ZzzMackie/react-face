import { THREE_TextureLoader, THREE_RGBELoader } from './Loader.js';
import { fetchBlobUrl } from './LoaderUtils.js';
import * as THREE from 'three';
import { proxyOptions } from './proxy.js';
export class ImageTexture {
  constructor(config = {}, threeEngine) {
    this.threeEngine = threeEngine;
    this.images = new Map();
    this.imagesList = new Map();
    this.config = config;
    this.initImagesList(this.config);
    proxyOptions(this, this.threeEngine);
  }
  initImagesList(config) {
    if (config.images) {
      for (const imageItem of config.images) {
        this.addImageData(imageItem.uuid, imageItem.url);
      }
    }
  }
  // 新增场景纹理贴图
  async addRGBETextureImage(uuid) {
    try {
      const blob = await this.getCanvasImage(uuid);
      if (!blob) {
        return null;
      }
      const texture = await THREE_RGBELoader(blob, this.renderer__three.PMREMGenerator);
      texture.uuid = uuid;
      this.addImage(texture);
      return texture;
    } catch (error) {
      console.error(error, uuid);
    }
  }
  // 新增普通纹理贴图
  async addTextureImage(uuid) {
    try {
      const blob = await this.getCanvasImage(uuid);
      if (!blob) {
        return null;
      }
      const texture = await THREE_TextureLoader(blob).then(texture => {
        return texture;
      });
      texture.uuid = uuid;
      this.addImage(texture);
      return texture;
    } catch (error) {
      console.error(error, uuid);
    }
  }
  // 添加贴图数据
  async addImageData(uuid, url) {
    const image = this.getImageData(uuid);
    let blob = null;
    if (url.file) {
      blob = url.url;
    } else {
      if (url.includes && url.includes('blob:')) {
        blob = url;
      } else {
        const { blobData, originUrl } = await this.indexDB__three.getImageStoreItem(uuid, url);
        if (blobData) {
          blob = URL.createObjectURL(blobData);
        } else {
          blob = originUrl;
        }
      }
    }
    if (image) {
      image.url = url;
      image.blob = blob;
    } else {
      this.imagesList.set(uuid, { uuid, url, blob });
    }
  }
  // 添加贴图纹理数据
  addImage(image) {
    this.images.set(image.uuid, image);
  }
  getImageData(uuid) {
    return this.imagesList.get(uuid);
  }
  // 获取纹理贴图数据
  getImage(uuid) {
    return this.images.get(uuid);
  }
  // 删除贴图数据
  deleteImage(uuid) {
    const image = this.getImage(uuid);
    const imageData = this.getImageData(uuid);
    if (image) {
      this.images.delete(uuid);
      console.log('删除贴图纹理数据');
    }
    if (imageData) {
      this.imagesList.delete(uuid);
      console.log('删除贴图资源数据');
    }
  }
  async getCanvasImage(uuid) {
    const image = this.getImageData(uuid);
    let url = uuid;
    if (url.file && url.file instanceof File) {
      url = uuid.url || URL.createObjectURL(url.file);
    }
    if (image) {
      const { blob } = image;
      url = blob;
    } else {
      const { blobUrl } = await fetchBlobUrl(url);
      url = blobUrl;
    }
    return url;
  }

  // canvas渲染图片 可传入uuid 或者 文件
  async renderToCanvas(uuid, domElement) {
    try {
      if (!uuid) {
        return;
      }
      let url = await this.getCanvasImage(uuid);
      const hdrTexture = await THREE_RGBELoader(url);
      hdrTexture.isHDRTexture = true;
      const canvas = domElement;
      const context = canvas.getContext('2d');

      // Seems like context can be null if the canvas is not visible
      if (context) {
        // Always clear the context before set new texture, because new texture may has transparency
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (hdrTexture !== null) {
        const image = hdrTexture.image;

        if (image !== undefined && image !== null && image.width > 0) {
          canvas.title = hdrTexture.sourceFile;
          const scale = canvas.width / image.width;

          if (hdrTexture.isDataTexture || hdrTexture.isCompressedTexture) {
            const canvas2 = renderToCanvas(hdrTexture);
            context.drawImage(canvas2, 0, 10, image.width * scale, image.height * scale);
          } else {
            context.drawImage(image, 0, 0, image.width * scale, image.height * scale);
          }
        } else {
          canvas.title = hdrTexture.sourceFile + ' (error)';
        }
      } else {
        canvas.title = 'empty';
      }
    } catch (error) {
      console.error(error);
    }
  }
  // canvas渲染图片 可传入uuid 或者 文件
   
  async renderMaterialToCanvas({ uuid, domElement }) {
    try {
      if (!uuid) {
        return;
      }
      let url = await this.getCanvasImage(uuid);
      const texture = await THREE_TextureLoader(url);
      const canvas = domElement;
      const context = canvas.getContext('2d');

      // Seems like context can be null if the canvas is not visible
      if (context) {
        // Always clear the context before set new texture, because new texture may has transparency
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (texture !== null) {
        // const scale = canvas.width / image.width;

        const canvas2 = renderToCanvas(texture);
        context.drawImage(canvas2, 0, 10, canvas.width, canvas.height);
      } else {
        canvas.title = 'empty';
      }
    } catch (error) {
      console.error(error);
    }
  }
}
let renderer = null;
function renderToCanvas(texture) {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer();
  }

  const image = texture.image;

  renderer.setSize(image.width, image.height, false);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const quad = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(quad, material);
  scene.add(mesh);

  renderer.render(scene, camera);

  return renderer.domElement;
}
