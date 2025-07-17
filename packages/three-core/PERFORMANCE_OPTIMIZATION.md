# Three-Core 性能优化与错误处理

## 🧠 内存管理系统

### MemoryManager 功能特性

#### 核心功能
- **内存使用监控**: 实时监控几何体、纹理、材质、对象数量
- **内存泄漏检测**: 自动检测长时间未使用的资源
- **自动资源回收**: 根据配置自动清理未使用资源
- **内存警告系统**: 当内存使用超过阈值时发出警告

#### 配置选项
```typescript
interface MemoryConfig {
  enabled?: boolean;           // 是否启用内存监控
  checkInterval?: number;      // 检查间隔 (毫秒)
  maxMemoryUsage?: number;     // 最大内存使用量 (字节)
  maxIdleTime?: number;        // 最大空闲时间 (毫秒)
  autoCleanup?: boolean;       // 是否自动清理
  logToConsole?: boolean;      // 是否输出到控制台
}
```

#### 主要方法
```typescript
// 强制清理所有未使用资源
forceCleanup(): { cleaned: number; freed: number }

// 标记资源为使用中
markResourceAsUsed(type: string, id: string): void

// 标记资源为未使用
markResourceAsUnused(type: string, id: string): void

// 获取内存统计
getMemoryData(): MemoryInfo[]
getLatestMemory(): MemoryInfo | null
getLeakDetectorData(): LeakInfo[]
```

#### 信号系统
```typescript
memoryUpdated: Signal<MemoryInfo | null>      // 内存数据更新
leakDetected: Signal<LeakInfo[] | null>       // 检测到泄漏
memoryWarning: Signal<string>                  // 内存警告
cleanupStarted: Signal<void>                   // 清理开始
cleanupCompleted: Signal<{ cleaned: number; freed: number } | null>  // 清理完成
```

## 🔄 错误恢复系统

### RecoveryManager 功能特性

#### 核心功能
- **错误检测**: 自动检测各种类型的错误
- **恢复策略**: 支持重试、回退、重启、忽略等策略
- **系统稳定性监控**: 实时监控系统稳定性
- **错误统计**: 详细的错误统计和历史记录

#### 恢复策略
```typescript
interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'ignore' | 'restart';
  maxRetries?: number;        // 最大重试次数
  retryDelay?: number;        // 重试延迟
  fallbackAction?: string;    // 回退操作
}
```

#### 默认策略配置
- **渲染错误**: 重试策略，最多重试2次
- **加载错误**: 重试策略，最多重试3次
- **内存错误**: 回退策略，执行清理操作
- **管理器错误**: 重启策略，重启管理器

#### 主要方法
```typescript
// 处理错误
handleError(manager: string, operation: string, error: Error): void

// 检查系统稳定性
checkSystemStability(): boolean

// 获取错误统计
getErrorStats(): ErrorStats
getErrorHistory(): ErrorContext[]
getRecoveryHistory(): RecoveryResult[]
```

#### 信号系统
```typescript
errorOccurred: Signal<ErrorContext | null>     // 错误发生
recoveryAttempted: Signal<RecoveryResult | null>  // 恢复尝试
recoverySucceeded: Signal<string>               // 恢复成功
recoveryFailed: Signal<ErrorContext | null>    // 恢复失败
systemStabilized: Signal<void>                  // 系统稳定
```

## 📊 性能监控系统

### MonitorManager 功能特性

#### 监控指标
- **FPS监控**: 实时帧率监控
- **内存使用**: 几何体、纹理、三角形数量
- **渲染调用**: 渲染调用次数和类型
- **资源统计**: 对象、几何体、材质、纹理数量

#### 性能数据
```typescript
interface PerformanceData {
  fps: number;
  memory: {
    geometries: number;
    textures: number;
    triangles: number;
    calls: number;
  };
  render: {
    calls: number;
    triangles: number;
    points: number;
    lines: number;
  };
  timestamp: number;
}
```

#### 资源数据
```typescript
interface ResourceData {
  objects: number;
  geometries: number;
  materials: number;
  textures: number;
  lights: number;
  cameras: number;
}
```

#### 主要方法
```typescript
// 获取性能数据
getPerformanceData(): PerformanceData[]
getLatestPerformance(): PerformanceData | null

// 获取资源数据
getResourceData(): ResourceData[]
getLatestResources(): ResourceData | null

// 获取性能统计
getPerformanceStats(): PerformanceStats
```

#### 信号系统
```typescript
performanceUpdated: Signal<PerformanceData | null>  // 性能数据更新
resourceUpdated: Signal<ResourceData | null>        // 资源数据更新
memoryWarning: Signal<string>                       // 内存警告
performanceWarning: Signal<string>                  // 性能警告
```

## 🎯 使用示例

### 基础使用
```typescript
import { Engine } from '@react-face/three-core';

const engine = new Engine({
  enableManagers: [
    'scene', 'camera', 'renderer', 'objects',
    'monitor', 'memory', 'recovery'
  ]
});

// 获取管理器
const memoryManager = await engine.getMemory();
const recoveryManager = await engine.getRecovery();
const monitorManager = await engine.getMonitor();

// 设置内存监控
memoryManager.setConfig({
  enabled: true,
  checkInterval: 2000,
  maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  autoCleanup: true
});

// 监听错误
recoveryManager.errorOccurred.subscribe((error) => {
  console.error('错误发生:', error);
});

// 监听性能
monitorManager.performanceUpdated.subscribe((data) => {
  console.log('FPS:', data.fps);
});
```

### 高级使用
```typescript
// 创建内存压力测试
function createMemoryPressure() {
  for (let i = 0; i < 100; i++) {
    const geometry = geometries.createSphereGeometry(`sphere_${i}`, 0.5);
    const material = materials.createStandardMaterial(`material_${i}`);
    const mesh = objects.createMesh(`mesh_${i}`, geometry, material);
    
    // 标记为使用中
    memoryManager.markResourceAsUsed('geometry', geometry.uuid);
    memoryManager.markResourceAsUsed('material', material.uuid);
    memoryManager.markResourceAsUsed('object', mesh.uuid);
  }
}

// 强制清理
function forceCleanup() {
  const result = memoryManager.forceCleanup();
  console.log(`清理了 ${result.cleaned} 个资源，释放了 ${result.freed} 字节`);
}

// 检查系统稳定性
function checkStability() {
  const isStable = recoveryManager.checkSystemStability();
  console.log('系统稳定性:', isStable ? '稳定' : '不稳定');
}
```

## 🔧 最佳实践

### 内存管理
1. **定期清理**: 设置合理的自动清理间隔
2. **资源标记**: 及时标记资源的使用状态
3. **内存监控**: 监控内存使用趋势
4. **泄漏检测**: 定期检查内存泄漏

### 错误处理
1. **策略配置**: 根据错误类型配置合适的恢复策略
2. **监控稳定性**: 实时监控系统稳定性
3. **错误统计**: 收集和分析错误数据
4. **自动恢复**: 配置自动恢复机制

### 性能优化
1. **FPS监控**: 监控帧率变化
2. **资源统计**: 跟踪资源使用情况
3. **性能警告**: 设置合理的性能警告阈值
4. **优化建议**: 根据监控数据提供优化建议

## 📈 性能指标

### 内存使用指标
- **几何体数量**: 建议 < 1000
- **纹理数量**: 建议 < 500
- **材质数量**: 建议 < 1000
- **对象数量**: 建议 < 5000

### 渲染性能指标
- **FPS**: 建议 > 30
- **渲染调用**: 建议 < 1000
- **三角形数量**: 建议 < 100万

### 系统稳定性指标
- **错误率**: 建议 < 1%
- **恢复成功率**: 建议 > 95%
- **系统稳定时间**: 建议 > 99%

## 🚀 未来计划

### 性能优化
- [ ] LOD系统实现
- [ ] 视锥体剔除优化
- [ ] 实例化渲染优化
- [ ] 纹理压缩和缓存
- [ ] 几何体合并优化

### 错误处理增强
- [ ] 更详细的错误分类
- [ ] 错误报告系统
- [ ] 自动错误修复
- [ ] 故障转移机制

### 监控增强
- [ ] 实时性能分析
- [ ] 内存分析工具
- [ ] 着色器性能监控
- [ ] 网络性能监控 