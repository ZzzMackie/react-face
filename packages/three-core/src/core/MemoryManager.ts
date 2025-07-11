import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface MemoryInfo {
  geometries: number;
  textures: number;
  materials: number;
  objects: number;
  totalMemory: number;
  timestamp: number;
}

export interface LeakInfo {
  type: 'geometry' | 'texture' | 'material' | 'object';
  id: string;
  size: number;
  lastUsed: number;
  potentialLeak: boolean;
}

export interface MemoryConfig {
  enabled?: boolean;
  checkInterval?: number;
  maxMemoryUsage?: number;
  maxIdleTime?: number;
  autoCleanup?: boolean;
  logToConsole?: boolean;
}

export class MemoryManager implements Manager {
  private engine: any;
  private config: MemoryConfig;
  private memoryHistory: MemoryInfo[] = [];
  private leakDetector: Map<string, LeakInfo> = new Map();
  private isMonitoring: boolean = false;
  private checkInterval: number = 5000; // 5秒检查一次

  // 信号
  public readonly memoryUpdated = createSignal<MemoryInfo | null>(null);
  public readonly leakDetected = createSignal<LeakInfo[] | null>(null);
  public readonly memoryWarning = createSignal<string>('');
  public readonly cleanupStarted = createSignal<void>(undefined);
  public readonly cleanupCompleted = createSignal<{ cleaned: number; freed: number } | null>(null);

  constructor(engine: any, config: MemoryConfig = {}) {
    this.engine = engine;
    this.config = {
      enabled: true,
      checkInterval: 5000,
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      maxIdleTime: 300000, // 5分钟
      autoCleanup: true,
      logToConsole: false,
      ...config
    };
  }

  async initialize(): Promise<void> {
    console.log('🧠 MemoryManager initialized');
    
    if (this.config.enabled) {
      this.startMonitoring();
    }
  }

  dispose(): void {
    this.stopMonitoring();
    this.memoryHistory = [];
    this.leakDetector.clear();
    // Signal不需要手动dispose，会自动清理
  }

  // 开始监控
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.checkInterval = this.config.checkInterval || 5000;

    const monitor = () => {
      if (!this.isMonitoring) return;

      this.checkMemoryUsage();
      this.detectLeaks();
      this.autoCleanup();

      setTimeout(monitor, this.checkInterval);
    };

    monitor();
  }

  // 停止监控
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  // 检查内存使用情况
  private checkMemoryUsage(): void {
    const renderer = this.engine.getManager('renderer')?.instance?.renderer;
    if (!renderer) return;

    const info = renderer.info;
    const memory = info.memory;

    const memoryInfo: MemoryInfo = {
      geometries: memory.geometries,
      textures: memory.textures,
      materials: memory.materials || 0,
      objects: this.getObjectCount(),
      totalMemory: this.calculateTotalMemory(memory),
      timestamp: Date.now()
    };

    this.memoryHistory.push(memoryInfo);
    
    // 限制历史记录数量
    if (this.memoryHistory.length > 100) {
      this.memoryHistory.shift();
    }

    this.memoryUpdated.emit(memoryInfo);

    // 检查内存警告
    if (memoryInfo.totalMemory > this.config.maxMemoryUsage!) {
      this.memoryWarning.emit(`内存使用过高: ${(memoryInfo.totalMemory / 1024 / 1024).toFixed(2)}MB`);
    }

    if (this.config.logToConsole) {
      console.log('🧠 Memory:', memoryInfo);
    }
  }

  // 检测内存泄漏
  private detectLeaks(): void {
    const leaks: LeakInfo[] = [];
    const now = Date.now();
    const maxIdleTime = this.config.maxIdleTime!;

    // 检查几何体泄漏
    const geometryManager = this.engine.getManager('geometries')?.instance;
    if (geometryManager) {
      const geometries = geometryManager.getAllGeometries();
      geometries.forEach((geometry: any) => {
        const lastUsed = geometry.userData?.lastUsed || 0;
        const idleTime = now - lastUsed;
        
        if (idleTime > maxIdleTime) {
          const leakInfo: LeakInfo = {
            type: 'geometry',
            id: geometry.uuid,
            size: this.estimateGeometrySize(geometry),
            lastUsed,
            potentialLeak: true
          };
          leaks.push(leakInfo);
          this.leakDetector.set(geometry.uuid, leakInfo);
        }
      });
    }

    // 检查纹理泄漏
    const textureManager = this.engine.getManager('textures')?.instance;
    if (textureManager) {
      const textures = textureManager.getAllTextures();
      textures.forEach((texture: any) => {
        const lastUsed = texture.userData?.lastUsed || 0;
        const idleTime = now - lastUsed;
        
        if (idleTime > maxIdleTime) {
          const leakInfo: LeakInfo = {
            type: 'texture',
            id: texture.uuid,
            size: this.estimateTextureSize(texture),
            lastUsed,
            potentialLeak: true
          };
          leaks.push(leakInfo);
          this.leakDetector.set(texture.uuid, leakInfo);
        }
      });
    }

    // 检查材质泄漏
    const materialManager = this.engine.getManager('materials')?.instance;
    if (materialManager) {
      const materials = materialManager.getAllMaterials();
      materials.forEach((material: any) => {
        const lastUsed = material.userData?.lastUsed || 0;
        const idleTime = now - lastUsed;
        
        if (idleTime > maxIdleTime) {
          const leakInfo: LeakInfo = {
            type: 'material',
            id: material.uuid,
            size: this.estimateMaterialSize(material),
            lastUsed,
            potentialLeak: true
          };
          leaks.push(leakInfo);
          this.leakDetector.set(material.uuid, leakInfo);
        }
      });
    }

    if (leaks.length > 0) {
      this.leakDetected.emit(leaks);
      
      if (this.config.logToConsole) {
        console.warn('⚠️ 检测到潜在内存泄漏:', leaks);
      }
    }
  }

  // 自动清理
  private autoCleanup(): void {
    if (!this.config.autoCleanup) return;

    const leaks = this.leakDetector.values();
    const now = Date.now();
    const maxIdleTime = this.config.maxIdleTime!;

    let cleaned = 0;
    let freed = 0;

    for (const leak of leaks) {
      const idleTime = now - leak.lastUsed;
      
      if (idleTime > maxIdleTime * 2) { // 超过2倍空闲时间才清理
        const success = this.cleanupResource(leak.type, leak.id);
        if (success) {
          cleaned++;
          freed += leak.size;
          this.leakDetector.delete(leak.id);
        }
      }
    }

    if (cleaned > 0) {
      this.cleanupCompleted.emit({ cleaned, freed });
      
      if (this.config.logToConsole) {
        console.log(`🧹 自动清理完成: 清理了 ${cleaned} 个资源，释放了 ${(freed / 1024).toFixed(2)}KB 内存`);
      }
    }
  }

  // 手动清理资源
  cleanupResource(type: string, id: string): boolean {
    try {
      switch (type) {
        case 'geometry':
          const geometryManager = this.engine.getManager('geometries')?.instance;
          if (geometryManager) {
            return geometryManager.removeGeometry(id);
          }
          break;

        case 'texture':
          const textureManager = this.engine.getManager('textures')?.instance;
          if (textureManager) {
            return textureManager.removeTexture(id);
          }
          break;

        case 'material':
          const materialManager = this.engine.getManager('materials')?.instance;
          if (materialManager) {
            return materialManager.removeMaterial(id);
          }
          break;

        case 'object':
          const objectManager = this.engine.getManager('objects')?.instance;
          if (objectManager) {
            return objectManager.removeObject(id);
          }
          break;
      }
    } catch (error) {
      console.error('清理资源失败:', error);
    }
    
    return false;
  }

  // 强制清理所有未使用的资源
  forceCleanup(): { cleaned: number; freed: number } {
    this.cleanupStarted.emit();

    let cleaned = 0;
    let freed = 0;

    // 清理几何体
    const geometryManager = this.engine.getManager('geometries')?.instance;
    if (geometryManager) {
      const geometries = geometryManager.getAllGeometries();
      geometries.forEach((geometry: any) => {
        if (!geometry.userData?.inUse) {
          const size = this.estimateGeometrySize(geometry);
          if (geometryManager.removeGeometry(geometry.uuid)) {
            cleaned++;
            freed += size;
          }
        }
      });
    }

    // 清理纹理
    const textureManager = this.engine.getManager('textures')?.instance;
    if (textureManager) {
      const textures = textureManager.getAllTextures();
      textures.forEach((texture: any) => {
        if (!texture.userData?.inUse) {
          const size = this.estimateTextureSize(texture);
          if (textureManager.removeTexture(texture.uuid)) {
            cleaned++;
            freed += size;
          }
        }
      });
    }

    // 清理材质
    const materialManager = this.engine.getManager('materials')?.instance;
    if (materialManager) {
      const materials = materialManager.getAllMaterials();
      materials.forEach((material: any) => {
        if (!material.userData?.inUse) {
          const size = this.estimateMaterialSize(material);
          if (materialManager.removeMaterial(material.uuid)) {
            cleaned++;
            freed += size;
          }
        }
      });
    }

    // 清理对象
    const objectManager = this.engine.getManager('objects')?.instance;
    if (objectManager) {
      const objects = objectManager.getAllObjects();
      objects.forEach((object: any) => {
        if (!object.userData?.inUse) {
          const size = this.estimateObjectSize(object);
          if (objectManager.removeObject(object.uuid)) {
            cleaned++;
            freed += size;
          }
        }
      });
    }

    this.cleanupCompleted.emit({ cleaned, freed });
    
    if (this.config.logToConsole) {
      console.log(`🧹 强制清理完成: 清理了 ${cleaned} 个资源，释放了 ${(freed / 1024).toFixed(2)}KB 内存`);
    }

    return { cleaned, freed };
  }

  // 估算几何体大小
  private estimateGeometrySize(geometry: THREE.BufferGeometry): number {
    let size = 0;
    
    if (geometry.attributes.position) {
      size += geometry.attributes.position.count * 3 * 4; // 3个float32
    }
    if (geometry.attributes.normal) {
      size += geometry.attributes.normal.count * 3 * 4;
    }
    if (geometry.attributes.uv) {
      size += geometry.attributes.uv.count * 2 * 4;
    }
    if (geometry.index) {
      size += geometry.index.count * 2; // uint16
    }
    
    return size;
  }

  // 估算纹理大小
  private estimateTextureSize(texture: THREE.Texture): number {
    if (!texture.image) return 0;
    
    const width = texture.image.width || 1;
    const height = texture.image.height || 1;
    const channels = 4; // RGBA
    
    return width * height * channels;
  }

  // 估算材质大小
  private estimateMaterialSize(material: THREE.Material): number {
    // 材质本身很小，主要是引用
    return 1024; // 1KB 估算
  }

  // 估算对象大小
  private estimateObjectSize(object: THREE.Object3D): number {
    // 对象本身很小，主要是引用
    return 512; // 0.5KB 估算
  }

  // 计算总内存使用
  private calculateTotalMemory(memory: any): number {
    let total = 0;
    
    // 几何体内存
    total += memory.geometries * 1024; // 每个几何体估算1KB
    
    // 纹理内存
    total += memory.textures * 1024 * 1024; // 每个纹理估算1MB
    
    return total;
  }

  // 获取对象数量
  private getObjectCount(): number {
    const objectManager = this.engine.getManager('objects')?.instance;
    return objectManager ? objectManager.getAllObjects().length : 0;
  }

  // 获取内存数据
  getMemoryData(): MemoryInfo[] {
    return [...this.memoryHistory];
  }

  // 获取最新内存信息
  getLatestMemory(): MemoryInfo | null {
    return this.memoryHistory[this.memoryHistory.length - 1] || null;
  }

  // 获取泄漏检测器数据
  getLeakDetectorData(): LeakInfo[] {
    return Array.from(this.leakDetector.values());
  }

  // 设置配置
  setConfig(config: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.checkInterval) {
      this.checkInterval = config.checkInterval;
    }
  }

  // 获取配置
  getConfig(): MemoryConfig {
    return { ...this.config };
  }

  // 标记资源为使用中
  markResourceAsUsed(type: string, id: string): void {
    const resource = this.getResource(type, id);
    if (resource) {
      resource.userData = resource.userData || {};
      resource.userData.lastUsed = Date.now();
      resource.userData.inUse = true;
    }
  }

  // 标记资源为未使用
  markResourceAsUnused(type: string, id: string): void {
    const resource = this.getResource(type, id);
    if (resource) {
      resource.userData = resource.userData || {};
      resource.userData.inUse = false;
    }
  }

  // 获取资源
  private getResource(type: string, id: string): any {
    switch (type) {
      case 'geometry':
        const geometryManager = this.engine.getManager('geometries')?.instance;
        return geometryManager?.getGeometry(id);
      case 'texture':
        const textureManager = this.engine.getManager('textures')?.instance;
        return textureManager?.getTexture(id);
      case 'material':
        const materialManager = this.engine.getManager('materials')?.instance;
        return materialManager?.getMaterial(id);
      case 'object':
        const objectManager = this.engine.getManager('objects')?.instance;
        return objectManager?.getObject(id);
      default:
        return null;
    }
  }
} 