import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface ConfigStorage {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
}

export interface ConfigManagerConfig {
  storage?: ConfigStorage;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

/**
 * 配置管理�?
 * 负责管理应用程序的配置信�?
 */
export class ConfigManager implements Manager {
  private config: Map<string, unknown> = new Map();
  private storage: ConfigStorage;
  private autoSaveTimer: number | null = null;
  private readonly autoSave: boolean;
  private readonly autoSaveInterval: number;

  // 信号系统
  public readonly configChanged = createSignal<{ key: string; value: unknown } | null>(null);
  public readonly configLoaded = createSignal<Map<string, unknown> | null>(null);
  public readonly configSaved = createSignal<void>(undefined);

  constructor(engine: unknown, config: ConfigManagerConfig = {}) {
    this.storage = config.storage || this.createDefaultStorage();
    this.autoSave = config.autoSave ?? true;
    this.autoSaveInterval = config.autoSaveInterval ?? 5000;
  }

  async initialize(): Promise<void> {
    this.loadConfig();
    if (this.autoSave) {
      this.startAutoSave();
    }
  }

  dispose(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    this.saveConfig();
  }

  private createDefaultStorage(): ConfigStorage {
    return {
      get: (key: string) => {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : undefined;
      },
      set: (key: string, value: unknown) => {
        localStorage.setItem(key, JSON.stringify(value));
      },
      has: (key: string) => localStorage.hasOwnProperty(key),
      delete: (key: string) => localStorage.removeItem(key),
      clear: () => localStorage.clear()
    };
  }

  set(key: string, value: unknown): void {
    this.config.set(key, value);
    this.configChanged.emit({ key, value });
  }

  get<T = unknown>(key: string, defaultValue?: T): T {
    return (this.config.get(key) as T) ?? defaultValue;
  }

  has(key: string): boolean {
    return this.config.has(key);
  }

  delete(key: string): void {
    if (this.config.has(key)) {
      this.config.delete(key);
      this.configChanged.emit({ key, value: undefined });
    }
  }

  clear(): void {
    this.config.clear();
    this.configChanged.emit(null);
  }

  getAll(): Map<string, unknown> {
    return new Map(this.config);
  }

  loadConfig(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        const value = this.storage.get(key);
        if (value !== undefined) {
          this.config.set(key, value);
        }
      });
      this.configLoaded.emit(new Map(this.config));
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  saveConfig(): void {
    try {
      this.config.forEach((value, key) => {
        this.storage.set(key, value);
      });
      this.configSaved.emit();
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  private startAutoSave(): void {
    this.autoSaveTimer = window.setInterval(() => {
      this.saveConfig();
    }, this.autoSaveInterval);
  }

  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  getString(key: string, defaultValue = ''): string {
    return this.get(key, defaultValue);
  }

  getNumber(key: string, defaultValue = 0): number {
    return this.get(key, defaultValue);
  }

  getBoolean(key: string, defaultValue = false): boolean {
    return this.get(key, defaultValue);
  }

  getObject<T = Record<string, unknown>>(key: string, defaultValue: T): T {
    return this.get(key, defaultValue);
  }

  getArray<T = unknown[]>(key: string, defaultValue: T): T {
    return this.get(key, defaultValue);
  }
}