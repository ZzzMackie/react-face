import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface InstanceConfig {
  id: string;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  count: number;
  positions?: THREE.Vector3[];
  rotations?: THREE.Euler[];
  scales?: THREE.Vector3[];
  colors?: THREE.Color[];
  matrix?: THREE.Matrix4[];
}

export interface InstanceGroup {
  id: string;
  mesh: THREE.InstancedMesh;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  count: number;
  maxCount: number;
  instances: Map<string, InstanceInfo>;
  matrix: THREE.Matrix4;
  color: THREE.Color;
}

export interface InstanceInfo {
  id: string;
  index: number;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  color: THREE.Color;
  visible: boolean;
  matrix: THREE.Matrix4;
}

export interface InstanceStats {
  totalGroups: number;
  totalInstances: number;
  totalTriangles: number;
  memoryUsage: number;
  performanceGain: number;
}

export interface InstanceManagerConfig {
  enabled?: boolean;
  maxInstancesPerGroup?: number;
  autoOptimize?: boolean;
  enableFrustumCulling?: boolean;
  enableLOD?: boolean;
  logToConsole?: boolean;
}

export class InstanceManager implements Manager {
  // Add test expected properties
  public readonly name = 'InstanceManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: any;
  private config: InstanceManagerConfig;
  private instanceGroups: Map<string, InstanceGroup> = new Map();
  private instanceCounter: number = 0;
  private isOptimizing: boolean = false;

  // 信号
  public readonly instanceGroupCreated = createSignal<InstanceGroup | null>(null);
  public readonly instanceGroupRemoved = createSignal<string | null>(null);
  public readonly instanceAdded = createSignal<InstanceInfo | null>(null);
  public readonly instanceRemoved = createSignal<string | null>(null);
  public readonly instanceUpdated = createSignal<InstanceInfo | null>(null);
  public readonly optimizationStarted = createSignal<void>(undefined);
  public readonly optimizationCompleted = createSignal<InstanceStats | null>(null);

  constructor(engine: any, config: InstanceManagerConfig = {}) {
    this.engine = engine;
    this.config = {
      enabled: true,
      maxInstancesPerGroup: 1000,
      autoOptimize: true,
      enableFrustumCulling: true,
      enableLOD: true,
      logToConsole: false,
      ...config
    };
  }

  async initialize(): Promise<void> {
    console.log('🎯 InstanceManager initialized');
  this.initialized = true;}

  dispose(): void {
    this.removeAllInstanceGroups();
    this.instanceGroups.clear();
    // Signal不需要手动dispose，会自动清理
  this.initialized = false;}

  // 创建实例组
  createInstanceGroup(
    id: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    maxCount: number = this.config.maxInstancesPerGroup!
  ): InstanceGroup {
    if (this.instanceGroups.has(id)) {
      throw new Error(`Instance group with id '${id}' already exists`);
    }

    const mesh = new THREE.InstancedMesh(geometry, material, maxCount);
    if ('frustumCulled' in mesh) {
      mesh.frustumCulled = this.config.enableFrustumCulling ?? true;
    }

    const group: InstanceGroup = {
      id,
      mesh,
      geometry,
      material,
      count: 0,
      maxCount,
      instances: new Map(),
      matrix: new THREE.Matrix4(),
      color: new THREE.Color()
    };

    this.instanceGroups.set(id, group);
    this.instanceGroupCreated.emit(group);

    if (this.config.logToConsole) {
      console.log('🎯 Created instance group:', id, 'max count:', maxCount);
    }

    return group;
  }

  // 添加实例
  addInstance(
    groupId: string,
    instanceId: string,
    position: THREE.Vector3 = new THREE.Vector3(),
    rotation: THREE.Euler = new THREE.Euler(),
    scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1),
    color: THREE.Color = new THREE.Color(0xffffff)
  ): InstanceInfo | null {
    const group = this.instanceGroups.get(groupId);
    if (!group) {
      console.error(`Instance group '${groupId}' not found`);
      return null;
    }

    if (group.count >= group.maxCount) {
      console.error(`Instance group '${groupId}' is full`);
      return null;
    }

    const instanceInfo: InstanceInfo = {
      id: instanceId,
      index: group.count,
      position: position.clone(),
      rotation: rotation.clone(),
      scale: scale.clone(),
      color: color.clone(),
      visible: true,
      matrix: new THREE.Matrix4()
    };

    // 计算变换矩阵
    this.updateInstanceMatrix(instanceInfo);

    // 设置实例矩阵
    group.mesh.setMatrixAt(instanceInfo.index, instanceInfo.matrix);

    // 设置实例颜色
    group.mesh.setColorAt(instanceInfo.index, instanceInfo.color);

    // 添加到组
    group.instances.set(instanceId, instanceInfo);
    group.count++;

    // 更新实例计数
    group.mesh.count = group.count;

    this.instanceAdded.emit(instanceInfo);

    if (this.config.logToConsole) {
      console.log('🎯 Added instance:', instanceId, 'to group:', groupId);
    }

    return instanceInfo;
  }

  // 移除实例
  removeInstance(groupId: string, instanceId: string): boolean {
    const group = this.instanceGroups.get(groupId);
    if (!group) {
      console.error(`Instance group '${groupId}' not found`);
      return false;
    }

    const instance = group.instances.get(instanceId);
    if (!instance) {
      console.error(`Instance '${instanceId}' not found in group '${groupId}'`);
      return false;
    }

    // 如果是最后一个实例，直接移除
    if (instance.index === group.count - 1) {
      group.instances.delete(instanceId);
      group.count--;
    } else {
      // 将最后一个实例移动到被删除的位置
      const lastInstance = Array.from(group.instances.values()).pop()!;
      lastInstance.index = instance.index;
      
      // 更新矩阵和颜色
      group.mesh.setMatrixAt(instance.index, lastInstance.matrix);
      group.mesh.setColorAt(instance.index, lastInstance.color);
      
      // 移除实例
      group.instances.delete(instanceId);
      group.count--;
    }

    // 更新实例计数
    group.mesh.count = group.count;

    this.instanceRemoved.emit(instanceId);

    if (this.config.logToConsole) {
      console.log('🎯 Removed instance:', instanceId, 'from group:', groupId);
    }

    return true;
  }

  // 更新实例
  updateInstance(
    groupId: string,
    instanceId: string,
    position?: THREE.Vector3,
    rotation?: THREE.Euler,
    scale?: THREE.Vector3,
    color?: THREE.Color
  ): boolean {
    const group = this.instanceGroups.get(groupId);
    if (!group) {
      console.error(`Instance group '${groupId}' not found`);
      return false;
    }

    const instance = group.instances.get(instanceId);
    if (!instance) {
      console.error(`Instance '${instanceId}' not found in group '${groupId}'`);
      return false;
    }

    // 更新属性
    if (position) instance.position.copy(position);
    if (rotation) instance.rotation.copy(rotation);
    if (scale) instance.scale.copy(scale);
    if (color) instance.color.copy(color);

    // 更新矩阵
    this.updateInstanceMatrix(instance);

    // 更新实例矩阵和颜色
    group.mesh.setMatrixAt(instance.index, instance.matrix);
    group.mesh.setColorAt(instance.index, instance.color);

    this.instanceUpdated.emit(instance);

    return true;
  }

  // 更新实例矩阵
  private updateInstanceMatrix(instance: InstanceInfo): void {
    instance.matrix.compose(
      instance.position,
      new THREE.Quaternion().setFromEuler(instance.rotation),
      instance.scale
    );
  }

  // 批量添加实例
  addInstances(
    groupId: string,
    instances: Array<{
      id: string;
      position: THREE.Vector3;
      rotation?: THREE.Euler;
      scale?: THREE.Vector3;
      color?: THREE.Color;
    }>
  ): InstanceInfo[] {
    const results: InstanceInfo[] = [];

    for (const instanceData of instances) {
      const instance = this.addInstance(
        groupId,
        instanceData.id,
        instanceData.position,
        instanceData.rotation,
        instanceData.scale,
        instanceData.color
      );

      if (instance) {
        results.push(instance);
      }
    }

    return results;
  }

  // 获取实例组
  getInstanceGroup(id: string): InstanceGroup | undefined {
    return this.instanceGroups.get(id);
  }

  // 获取实例
  getInstance(groupId: string, instanceId: string): InstanceInfo | undefined {
    const group = this.instanceGroups.get(groupId);
    return group?.instances.get(instanceId);
  }

  // 获取所有实例组
  getAllInstanceGroups(): InstanceGroup[] {
    return Array.from(this.instanceGroups.values());
  }

  // 获取实例组统计
  getInstanceGroupStats(groupId: string): {
    count: number;
    maxCount: number;
    memoryUsage: number;
    performanceGain: number;
  } | null {
    const group = this.instanceGroups.get(groupId);
    if (!group) return null;

    const memoryUsage = this.calculateMemoryUsage(group);
    const performanceGain = this.calculatePerformanceGain(group);

    return {
      count: group.count,
      maxCount: group.maxCount,
      memoryUsage,
      performanceGain
    };
  }

  // 计算内存使用
  private calculateMemoryUsage(group: InstanceGroup): number {
    const geometrySize = this.estimateGeometrySize(group.geometry);
    const materialSize = 1024; // 估算材质大小
    const instanceSize = group.count * 64; // 每个实例约64字节
    return geometrySize + materialSize + instanceSize;
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

  // 计算性能提升
  private calculatePerformanceGain(group: InstanceGroup): number {
    // 实例化渲染相比单独渲染的性能提升
    // 通常可以减少90%以上的渲染调用
    const theoreticalCalls = group.count;
    const actualCalls = 1; // 实例化渲染只需要一次调用
    return ((theoreticalCalls - actualCalls) / theoreticalCalls) * 100;
  }

  // 获取总体统计
  getStats(): InstanceStats {
    let totalGroups = this.instanceGroups.size;
    let totalInstances = 0;
    let totalTriangles = 0;
    let totalMemoryUsage = 0;
    let totalPerformanceGain = 0;

    for (const group of this.instanceGroups.values()) {
      totalInstances += group.count;
      
      if (group.geometry.index) {
        totalTriangles += group.geometry.index.count / 3 * group.count;
      }
      
      totalMemoryUsage += this.calculateMemoryUsage(group);
      totalPerformanceGain += this.calculatePerformanceGain(group);
    }

    const avgPerformanceGain = totalGroups > 0 ? totalPerformanceGain / totalGroups : 0;

    return {
      totalGroups,
      totalInstances,
      totalTriangles,
      memoryUsage: totalMemoryUsage,
      performanceGain: avgPerformanceGain
    };
  }

  // 优化实例组
  optimizeInstanceGroup(groupId: string): boolean {
    const group = this.instanceGroups.get(groupId);
    if (!group) return false;

    this.optimizationStarted.emit();

    // 重新排列实例以减少内存碎片
    const instances = Array.from(group.instances.values());
    instances.sort((a, b) => a.index - b.index);

    // 重新设置矩阵和颜色
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      instance.index = i;
      group.mesh.setMatrixAt(i, instance.matrix);
      group.mesh.setColorAt(i, instance.color);
    }

    // 更新计数
    group.count = instances.length;
    group.mesh.count = group.count;

    const stats = this.getStats();
    this.optimizationCompleted.emit(stats);

    if (this.config.logToConsole) {
      console.log('🎯 Optimized instance group:', groupId);
    }

    return true;
  }

  // 自动优化所有实例组
  autoOptimize(): void {
    if (this.isOptimizing) return;

    this.isOptimizing = true;
    this.optimizationStarted.emit();

    let optimizedCount = 0;
    for (const groupId of this.instanceGroups.keys()) {
      if (this.optimizeInstanceGroup(groupId)) {
        optimizedCount++;
      }
    }

    const stats = this.getStats();
    this.optimizationCompleted.emit(stats);

    this.isOptimizing = false;

    if (this.config.logToConsole) {
      console.log('🎯 Auto optimized', optimizedCount, 'instance groups');
    }
  }

  // 移除实例组
  removeInstanceGroup(id: string): boolean {
    const group = this.instanceGroups.get(id);
    if (!group) return false;

    // 清理资源
    group.mesh.dispose();
    group.geometry.dispose();
    group.material.dispose();

    this.instanceGroups.delete(id);
    this.instanceGroupRemoved.emit(id);

    if (this.config.logToConsole) {
      console.log('🎯 Removed instance group:', id);
    }

    return true;
  }

  // 移除所有实例组
  removeAllInstanceGroups(): void {
    for (const groupId of this.instanceGroups.keys()) {
      this.removeInstanceGroup(groupId);
    }
  }

  // 设置配置
  setConfig(config: Partial<InstanceManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 获取配置
  getConfig(): InstanceManagerConfig {
    return { ...this.config };
  }

  // 清理历史记录
  clearHistory(): void {
    // 清理信号历史（如果需要）
  }
}