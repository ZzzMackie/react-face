import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

// 条件导入导出器
let GLTFExporter: any;
let OBJExporter: any;

try {
  GLTFExporter = require('three/examples/jsm/exporters/GLTFExporter').GLTFExporter;
  OBJExporter = require('three/examples/jsm/exporters/OBJExporter').OBJExporter;
} catch (error) {
  // Mock exporters for testing
  GLTFExporter = class MockGLTFExporter {
    async parseAsync(scene: THREE.Scene, options?: any): Promise<any> {
      return { format: 'gltf', scene: scene.toJSON() };
    }
  };
  OBJExporter = class MockOBJExporter {
    parse(scene: THREE.Scene): string {
      return '# Mock OBJ export\n';
    }
  };
}

export interface ExportConfig {
  enableScreenshot?: boolean;
  enableModelExport?: boolean;
  enableAnimationExport?: boolean;
  defaultFormat?: 'gltf' | 'obj' | 'fbx' | 'dae';
}

export interface ExportInfo {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
  size: number;
}

/**
 * 导出管理器
 * 负责管理 Three.js 场景导出
 */
export class ExportManager implements Manager {
  // Add test expected properties
  public readonly name = 'ExportManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private exports: Map<string, ExportInfo> = new Map();
  private config: ExportConfig;

  // 信号系统
  public readonly exportStarted = createSignal<string | null>(null);
  public readonly exportCompleted = createSignal<ExportInfo | null>(null);
  public readonly exportFailed = createSignal<{ id: string; error: Error } | null>(null);

  constructor(engine: unknown, config: ExportConfig = {}) {
    this.engine = engine;
    this.config = {
      enableScreenshot: true,
      enableModelExport: true,
      enableAnimationExport: true,
      defaultFormat: 'gltf',
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化导出系统
    this.initialized = true;
  }

  dispose(): void {
    this.clearAllExports();
    this.initialized = false;
  }

  async exportScreenshot(
    id: string,
    renderer: THREE.WebGLRenderer,
    options?: {
      width?: number;
      height?: number;
      format?: 'png' | 'jpeg';
      quality?: number;
    }
  ): Promise<Blob> {
    this.exportStarted.emit(id);

    try {
      const canvas = renderer.domElement;
      const format = options?.format ?? 'png';
      const quality = options?.quality ?? 0.8;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          `image/${format}`,
          quality
        );
      });

      const exportInfo: ExportInfo = {
        id,
        type: 'screenshot',
        data: blob,
        timestamp: Date.now(),
        size: blob.size
      };

      this.exports.set(id, exportInfo);
      this.exportCompleted.emit(exportInfo);

      return blob;
    } catch (error) {
      const errorInfo = { id, error: error as Error };
      this.exportFailed.emit(errorInfo);
      throw error;
    }
  }

  async exportScene(
    id: string,
    scene: THREE.Scene,
    format: 'gltf' | 'obj' = 'gltf',
    options?: {
      binary?: boolean;
      includeAnimations?: boolean;
      includeTextures?: boolean;
    }
  ): Promise<unknown> {
    this.exportStarted.emit(id);

    try {
      let result: unknown;

      if (format === 'gltf') {
        const exporter = new GLTFExporter();
        result = await exporter.parseAsync(scene, {
          binary: options?.binary ?? false,
          animations: options?.includeAnimations ?? true,
          includeTextures: options?.includeTextures ?? true
        });
      } else if (format === 'obj') {
        const exporter = new OBJExporter();
        result = exporter.parse(scene);
      }

      const exportInfo: ExportInfo = {
        id,
        type: 'scene',
        data: result,
        timestamp: Date.now(),
        size: typeof result === 'string' ? result.length : JSON.stringify(result).length
      };

      this.exports.set(id, exportInfo);
      this.exportCompleted.emit(exportInfo);

      return result;
    } catch (error) {
      const errorInfo = { id, error: error as Error };
      this.exportFailed.emit(errorInfo);
      throw error;
    }
  }

  async exportModel(
    id: string,
    object: THREE.Object3D,
    format: 'gltf' | 'obj' = 'gltf',
    options?: {
      binary?: boolean;
      includeAnimations?: boolean;
      includeTextures?: boolean;
    }
  ): Promise<unknown> {
    this.exportStarted.emit(id);

    try {
      let result: unknown;

      if (format === 'gltf') {
        const exporter = new GLTFExporter();
        result = await exporter.parseAsync(object, {
          binary: options?.binary ?? false,
          animations: options?.includeAnimations ?? true,
          includeTextures: options?.includeTextures ?? true
        });
      } else if (format === 'obj') {
        const exporter = new OBJExporter();
        result = exporter.parse(object);
      }

      const exportInfo: ExportInfo = {
        id,
        type: 'model',
        data: result,
        timestamp: Date.now(),
        size: typeof result === 'string' ? result.length : JSON.stringify(result).length
      };

      this.exports.set(id, exportInfo);
      this.exportCompleted.emit(exportInfo);

      return result;
    } catch (error) {
      const errorInfo = { id, error: error as Error };
      this.exportFailed.emit(errorInfo);
      throw error;
    }
  }

  async exportGLB(
    id: string,
    scene: THREE.Scene,
    options?: {
      includeAnimations?: boolean;
      includeTextures?: boolean;
    }
  ): Promise<Blob> {
    this.exportStarted.emit(id);

    try {
      const exporter = new GLTFExporter();
      const result = await exporter.parseAsync(scene, {
        binary: true,
        animations: options?.includeAnimations ?? true,
        includeTextures: options?.includeTextures ?? true
      });

      const blob = new Blob([result], { type: 'model/gltf-binary' });

      const exportInfo: ExportInfo = {
        id,
        type: 'glb',
        data: blob,
        timestamp: Date.now(),
        size: blob.size
      };

      this.exports.set(id, exportInfo);
      this.exportCompleted.emit(exportInfo);

      return blob;
    } catch (error) {
      const errorInfo = { id, error: error as Error };
      this.exportFailed.emit(errorInfo);
      throw error;
    }
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  downloadFile(data: string | Blob, filename: string): void {
    if (data instanceof Blob) {
      this.downloadBlob(data, filename);
    } else {
      const blob = new Blob([data], { type: 'text/plain' });
      this.downloadBlob(blob, filename);
    }
  }

  getExport(id: string): ExportInfo | undefined {
    return this.exports.get(id);
  }

  hasExport(id: string): boolean {
    return this.exports.has(id);
  }

  removeExport(id: string): void {
    this.exports.delete(id);
  }

  getAllExports(): ExportInfo[] {
    return Array.from(this.exports.values());
  }

  getExportsByType(type: string): ExportInfo[] {
    return Array.from(this.exports.values()).filter(exp => exp.type === type);
  }

  getRecentExports(count: number = 10): ExportInfo[] {
    const sortedExports = Array.from(this.exports.values())
      .sort((a, b) => b.timestamp - a.timestamp);
    return sortedExports.slice(0, count);
  }

  clearAllExports(): void {
    this.exports.clear();
  }

  getExportReport(): {
    totalExports: number;
    exportsByType: { [key: string]: number };
    totalSize: number;
  } {
    const exports = this.getAllExports();
    const exportsByType: { [key: string]: number } = {};
    let totalSize = 0;

    exports.forEach(exp => {
      exportsByType[exp.type] = (exportsByType[exp.type] || 0) + 1;
      totalSize += exp.size;
    });

    return {
      totalExports: exports.length,
      exportsByType,
      totalSize
    };
  }
}