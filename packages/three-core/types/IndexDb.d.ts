import localforage from 'localforage';
import { ThreeEngine } from '../main';

declare module 'localforage';

interface StoreItem {
  blobUrl: string;
  blobData: Blob;
  originUrl: string;
  uuid: string;
}

export declare class IndexDb {
  threeEngine: ThreeEngine;
  modelStore: localforage;
  imageStore: localforage;

  constructor(threeEngine: ThreeEngine);

  static createStore(name: string): localforage | null;

  static setStoreItem(options: { uuid: string; path: string; _localStore: localforage }): Promise<void>;

  static getStoreItem(options: { uuid: string; path: string; _localStore: localforage; needAwaitFetch?: boolean }): Promise<StoreItem | null>;

  getStoreItem(options: { uuid: string; path: string; _localStore: localforage; needAwaitFetch?: boolean }): Promise<StoreItem | null>;

  setStoreItem(options: { uuid: string; path: string; _localStore: localforage }): Promise<void>;

  setModelStoreItem(uuid: string, modelPath: string): Promise<void>;

  getModelStoreItem(uuid: string, modelPath: string): Promise<StoreItem | null>;

  setImageStoreItem(uuid: string, path: string): Promise<void>;

  getImageStoreItem(uuid: string, path: string): Promise<StoreItem | null>;
}
