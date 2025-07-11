import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface DatabaseConfig {
  enableLocalStorage?: boolean;
  enableIndexedDB?: boolean;
  enableSessionStorage?: boolean;
  maxStorageSize?: number;
}

export interface DatabaseInfo {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
  size: number;
}

/**
 * 数据库管理器
 * 负责管理本地数据存储
 */
export class DatabaseManager implements Manager {
  private engine: unknown;
  private storage: Map<string, DatabaseInfo> = new Map();
  private config: DatabaseConfig;

  // 信号系统
  public readonly dataSaved = createSignal<DatabaseInfo | null>(null);
  public readonly dataLoaded = createSignal<DatabaseInfo | null>(null);
  public readonly dataDeleted = createSignal<string | null>(null);

  constructor(engine: unknown, config: DatabaseConfig = {}) {
    this.engine = engine;
    this.config = {
      enableLocalStorage: true,
      enableIndexedDB: false,
      enableSessionStorage: false,
      maxStorageSize: 10 * 1024 * 1024, // 10MB
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化数据库系统
  }

  dispose(): void {
    this.clearAllData();
  }

  saveToLocalStorage(
    id: string,
    data: unknown,
    type: string = 'data'
  ): void {
    try {
      const serializedData = JSON.stringify(data);
      const size = new Blob([serializedData]).size;

      if (size > this.config.maxStorageSize!) {
        throw new Error('Data size exceeds maximum storage limit');
      }

      localStorage.setItem(id, serializedData);

      const databaseInfo: DatabaseInfo = {
        id,
        type,
        data,
        timestamp: Date.now(),
        size
      };

      this.storage.set(id, databaseInfo);
      this.dataSaved.emit(databaseInfo);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw error;
    }
  }

  loadFromLocalStorage(id: string): unknown {
    try {
      const serializedData = localStorage.getItem(id);
      if (!serializedData) {
        throw new Error('Data not found');
      }

      const data = JSON.parse(serializedData);
      const size = new Blob([serializedData]).size;

      const databaseInfo: DatabaseInfo = {
        id,
        type: 'data',
        data,
        timestamp: Date.now(),
        size
      };

      this.storage.set(id, databaseInfo);
      this.dataLoaded.emit(databaseInfo);

      return data;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      throw error;
    }
  }

  saveToSessionStorage(
    id: string,
    data: unknown,
    type: string = 'data'
  ): void {
    try {
      const serializedData = JSON.stringify(data);
      const size = new Blob([serializedData]).size;

      if (size > this.config.maxStorageSize!) {
        throw new Error('Data size exceeds maximum storage limit');
      }

      sessionStorage.setItem(id, serializedData);

      const databaseInfo: DatabaseInfo = {
        id,
        type,
        data,
        timestamp: Date.now(),
        size
      };

      this.storage.set(id, databaseInfo);
      this.dataSaved.emit(databaseInfo);
    } catch (error) {
      console.error('Failed to save to sessionStorage:', error);
      throw error;
    }
  }

  loadFromSessionStorage(id: string): unknown {
    try {
      const serializedData = sessionStorage.getItem(id);
      if (!serializedData) {
        throw new Error('Data not found');
      }

      const data = JSON.parse(serializedData);
      const size = new Blob([serializedData]).size;

      const databaseInfo: DatabaseInfo = {
        id,
        type: 'data',
        data,
        timestamp: Date.now(),
        size
      };

      this.storage.set(id, databaseInfo);
      this.dataLoaded.emit(databaseInfo);

      return data;
    } catch (error) {
      console.error('Failed to load from sessionStorage:', error);
      throw error;
    }
  }

  async saveToIndexedDB(
    id: string,
    data: unknown,
    type: string = 'data'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('ThreeCoreDB', 1);

        request.onerror = () => {
          reject(new Error('Failed to open IndexedDB'));
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['data'], 'readwrite');
          const store = transaction.objectStore('data');

          const serializedData = JSON.stringify(data);
          const size = new Blob([serializedData]).size;

          if (size > this.config.maxStorageSize!) {
            reject(new Error('Data size exceeds maximum storage limit'));
            return;
          }

          const request = store.put({
            id,
            data: serializedData,
            type,
            timestamp: Date.now(),
            size
          });

          request.onsuccess = () => {
            const databaseInfo: DatabaseInfo = {
              id,
              type,
              data,
              timestamp: Date.now(),
              size
            };

            this.storage.set(id, databaseInfo);
            this.dataSaved.emit(databaseInfo);
            resolve();
          };

          request.onerror = () => {
            reject(new Error('Failed to save to IndexedDB'));
          };
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('data')) {
            db.createObjectStore('data', { keyPath: 'id' });
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async loadFromIndexedDB(id: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('ThreeCoreDB', 1);

        request.onerror = () => {
          reject(new Error('Failed to open IndexedDB'));
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['data'], 'readonly');
          const store = transaction.objectStore('data');
          const request = store.get(id);

          request.onsuccess = () => {
            if (request.result) {
              const data = JSON.parse(request.result.data);
              const databaseInfo: DatabaseInfo = {
                id,
                type: request.result.type,
                data,
                timestamp: request.result.timestamp,
                size: request.result.size
              };

              this.storage.set(id, databaseInfo);
              this.dataLoaded.emit(databaseInfo);
              resolve(data);
            } else {
              reject(new Error('Data not found'));
            }
          };

          request.onerror = () => {
            reject(new Error('Failed to load from IndexedDB'));
          };
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteData(id: string, storageType: 'localStorage' | 'sessionStorage' | 'indexedDB' = 'localStorage'): void {
    try {
      if (storageType === 'localStorage') {
        localStorage.removeItem(id);
      } else if (storageType === 'sessionStorage') {
        sessionStorage.removeItem(id);
      } else if (storageType === 'indexedDB') {
        // IndexedDB 删除逻辑
        const request = indexedDB.open('ThreeCoreDB', 1);
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['data'], 'readwrite');
          const store = transaction.objectStore('data');
          store.delete(id);
        };
      }

      this.storage.delete(id);
      this.dataDeleted.emit(id);
    } catch (error) {
      console.error('Failed to delete data:', error);
      throw error;
    }
  }

  getData(id: string): DatabaseInfo | undefined {
    return this.storage.get(id);
  }

  hasData(id: string): boolean {
    return this.storage.has(id);
  }

  getAllData(): DatabaseInfo[] {
    return Array.from(this.storage.values());
  }

  getDataByType(type: string): DatabaseInfo[] {
    return Array.from(this.storage.values()).filter(data => data.type === type);
  }

  getStorageSize(): number {
    let totalSize = 0;
    this.storage.forEach(data => {
      totalSize += data.size;
    });
    return totalSize;
  }

  clearAllData(): void {
    this.storage.clear();
  }

  getStorageReport(): {
    totalItems: number;
    totalSize: number;
    dataByType: { [key: string]: number };
  } {
    const data = this.getAllData();
    const dataByType: { [key: string]: number } = {};
    let totalSize = 0;

    data.forEach(item => {
      dataByType[item.type] = (dataByType[item.type] || 0) + 1;
      totalSize += item.size;
    });

    return {
      totalItems: data.length,
      totalSize,
      dataByType
    };
  }
} 
