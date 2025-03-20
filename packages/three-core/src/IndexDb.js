import localforage from 'localforage';
import { fetchBlobUrl } from './LoaderUtils.js';
const modelStore = localforage.createInstance({ name: 'modelStore' });
const imageStore = localforage.createInstance({ name: 'imageStore' });
export class IndexDb {
  constructor(threeEngine) {
    this.threeEngine = threeEngine;
    this.modelStore = modelStore;
    this.imageStore = imageStore;
  }
  static createStore(name) {
    let store = null;
    if (name) {
      if (IndexDb[name]) return IndexDb[name];
      store = localforage.createInstance({ name });
      IndexDb[name] = store;
    }
    return store;
  }
  static async setStoreItem({ uuid, path, _localStore }) {
    const store = {};
    try {
      const response = await fetchBlobUrl(path);
      store['blobUrl'] = response.blobUrl;
      store['blobData'] = response.file;
      store['originUrl'] = path;
      store['uuid'] = uuid;
      return await _localStore.setItem(uuid, store);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        //异常处理
        if (navigator.storage && navigator.storage.estimate) {
          const quota = await navigator.storage.estimate();
          // quota.usage -> 已使用的字节数。
          // quota.quota -> 可用最大字节数。
          const percentageUsed = (quota.usage / quota.quota) * 100;
          console.log(`已使用${percentageUsed}%可用储存。`);
          const remaining = quota.quota - quota.usage;
          console.log(`最多可再写入${remaining}字节。`);
        }
        console.error('indexDB内存不足', error);
        return store;
      }
    }
  }
  static async getStoreItem({ uuid, path, _localStore, needAwaitFetch = false }) {
    let store = await _localStore.getItem(uuid);
    if (store?.originUrl !== path || !store) {
      if (needAwaitFetch) {
        store = await IndexDb.setStoreItem({ uuid, path, _localStore });
      } else {
        store = { originUrl: path, blobData: undefined, blobUrl: undefined, uuid };
        IndexDb.setStoreItem({ uuid, path, _localStore }).then(value => {
          store = value;
        });
      }
    }
    return store;
  }
  async getStoreItem({ uuid, path, _localStore, needAwaitFetch = false }) {
    return IndexDb.getStoreItem({ uuid, path, _localStore, needAwaitFetch });
  }
  async setStoreItem({ uuid, path, _localStore }) {
    return IndexDb.setStoreItem({ uuid, path, _localStore });
  }
  async setModelStoreItem(uuid, modelPath) {
    return await this.setStoreItem({ uuid, path: modelPath, _localStore: modelStore });
  }
  async getModelStoreItem(uuid, modelPath) {
    return await this.getStoreItem({ uuid, path: modelPath, _localStore: modelStore, needAwaitFetch: true });
  }
  async setImageStoreItem(uuid, path) {
    return await this.setStoreItem({ uuid, path, _localStore: imageStore });
  }
  async getImageStoreItem(uuid, path) {
    return await this.getStoreItem({ uuid, path, _localStore: imageStore, needAwaitFetch: true });
  }
}
