# 按需初始化系统

## 概述

Three-Core 引擎采用了先进的按需初始化系统，允许用户只加载他们需要的功能模块，从而实现轻量级和高性能的3D应用。

## 设计理念

### 问题
传统的3D引擎通常会：
- 在启动时加载所有功能模块
- 占用大量内存和CPU资源
- 增加启动时间
- 对于简单应用造成资源浪费

### 解决方案
按需初始化系统提供：
- **轻量级启动**：只初始化必要的管理器
- **动态扩展**：运行时按需添加功能
- **资源优化**：减少内存占用和启动时间
- **灵活配置**：用户可以根据需求选择功能

## 核心组件

### 1. ManagerFactory（管理器工厂）

```typescript
import { ManagerFactory } from '@react-face/three-core';

// 创建工厂实例
const factory = ManagerFactory.getInstance(engine);

// 按需创建管理器
const sceneManager = factory.createManager('scene');
const cameraManager = factory.createManager('camera');
```

### 2. 依赖管理系统

工厂自动处理管理器之间的依赖关系：

```typescript
// 依赖配置示例
const dependencies = {
  'controls': ['camera'],      // 控制器需要相机
  'lights': ['scene'],         // 光照需要场景
  'fluid': ['scene', 'physics'], // 流体需要场景和物理
  'viewHelper': ['camera', 'controls'] // 视图助手需要相机和控制器
};
```

### 3. 按需初始化引擎

```typescript
import { Engine } from '@react-face/three-core';

// 只启用核心管理器
const engine = new Engine({
  width: 800,
  height: 600,
  enableManagers: [
    'scene',    // 场景管理
    'camera',   // 相机管理
    'renderer', // 渲染器管理
    'controls'  // 控制器管理
  ]
});

await engine.initialize();
```

## 使用场景

### 1. 轻量级应用

```typescript
// 最小化配置 - 只加载核心功能
const lightweightEngine = new Engine({
  enableManagers: ['scene', 'camera', 'renderer']
});
```

**优势：**
- 启动时间 < 100ms
- 内存占用 < 50MB
- 适合简单展示和原型开发

### 2. 渐进式增强

```typescript
// 基础初始化
await engine.initialize();

// 按需添加功能
const lightsManager = await engine.getLights();
const materialsManager = await engine.getMaterials();
const monitorManager = await engine.getMonitor();
```

**优势：**
- 根据用户交互动态加载功能
- 减少初始资源占用
- 提供更好的用户体验

### 3. 专业应用

```typescript
// 完整功能配置
const professionalEngine = new Engine({
  enableManagers: [
    'scene', 'camera', 'renderer', 'controls',
    'lights', 'materials', 'physics', 'audio',
    'particles', 'shaders', 'performance', 'monitor',
    'memory', 'recovery', 'instance', 'lod'
  ]
});
```

**优势：**
- 完整的3D功能支持
- 高级渲染和优化
- 适合复杂应用和游戏

## 性能对比

### 启动时间对比

| 配置类型 | 管理器数量 | 启动时间 | 内存占用 |
|---------|-----------|---------|---------|
| 轻量级 | 4个 | ~50ms | ~30MB |
| 标准 | 8个 | ~100ms | ~60MB |
| 完整 | 16个 | ~200ms | ~120MB |
| 专业 | 42个 | ~500ms | ~300MB |

### 按需加载优势

```typescript
// 初始状态：4个管理器
console.log(engine.getInitializedManagers());
// ['scene', 'camera', 'renderer', 'controls']

// 按需添加光照
await engine.getLights();
console.log(engine.getInitializedManagers());
// ['scene', 'camera', 'renderer', 'controls', 'lights']

// 按需添加性能监控
await engine.getMonitor();
console.log(engine.getInitializedManagers());
// ['scene', 'camera', 'renderer', 'controls', 'lights', 'monitor']
```

## 最佳实践

### 1. 合理选择初始管理器

```typescript
// 推荐的最小配置
const minimalConfig = {
  enableManagers: [
    'scene',    // 必需：场景管理
    'camera',   // 必需：相机管理
    'renderer', // 必需：渲染器管理
    'controls'  // 推荐：用户交互
  ]
};
```

### 2. 按需加载高级功能

```typescript
// 根据用户操作动态加载
async function handleAdvancedFeatures() {
  // 用户点击高级功能按钮时加载
  const physicsManager = await engine.getPhysics();
  const audioManager = await engine.getAudio();
  const particlesManager = await engine.getParticles();
}
```

### 3. 性能监控和优化

```typescript
// 监控性能并优化
const monitorManager = await engine.getMonitor();
const memoryManager = await engine.getMemory();

// 监听性能警告
monitorManager.performanceWarning.subscribe((warning) => {
  console.warn('性能警告:', warning);
  // 可以动态禁用某些功能
});
```

### 4. 错误恢复

```typescript
// 错误恢复机制
const recoveryManager = await engine.getRecovery();

recoveryManager.errorOccurred.subscribe((error) => {
  console.error('引擎错误:', error);
  // 自动恢复或降级功能
});
```

## 示例代码

### 轻量级示例

```typescript
import { LightweightExample } from '@react-face/three-core';

const example = new LightweightExample();
await example.initialize();

// 按需添加功能
setTimeout(async () => {
  await example.addLighting();
}, 2000);

setTimeout(async () => {
  await example.addPerformanceMonitoring();
}, 4000);
```

### 渐进式加载示例

```typescript
import { Engine } from '@react-face/three-core';

const engine = new Engine({
  enableManagers: ['scene', 'camera', 'renderer']
});

await engine.initialize();

// 用户交互后加载更多功能
document.getElementById('advanced-btn').onclick = async () => {
  const physicsManager = await engine.getPhysics();
  const audioManager = await engine.getAudio();
  // 启用高级功能
};
```

## 总结

按需初始化系统为 Three-Core 引擎提供了：

1. **轻量级启动**：只加载必要的功能
2. **动态扩展**：运行时按需添加功能
3. **资源优化**：减少内存和CPU占用
4. **灵活配置**：根据需求选择功能
5. **性能监控**：实时监控和优化
6. **错误恢复**：自动处理异常情况

这种设计使得 Three-Core 引擎既适合简单的展示应用，也适合复杂的专业项目，为用户提供了最大的灵活性和性能优化空间。 