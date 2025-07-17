# 分包优化指南

## 概述

Three-Core 引擎提供了多种分包选项，让用户可以根据需求选择合适的功能集，实现真正的代码分割和按需加载。

## 分包策略

### 1. 轻量级包 (Lightweight)
**包大小**: ~90KB  
**包含**: 核心功能
```typescript
import { Engine } from '@react-face/three-core/lightweight';

const engine = new Engine({
  enableManagers: ['scene', 'camera', 'renderer', 'controls']
});
```

**适用场景**:
- 简单展示应用
- 原型开发
- 移动端应用
- 对包大小要求严格的场景

### 2. 标准包 (Standard)
**包大小**: ~300KB  
**包含**: 核心 + 渲染功能
```typescript
import { Engine } from '@react-face/three-core/standard';

const engine = new Engine({
  enableManagers: [
    'scene', 'camera', 'renderer', 'controls',
    'lights', 'materials', 'textures', 'geometries'
  ]
});
```

**适用场景**:
- 大多数Web应用
- 静态3D展示
- 中等复杂度项目

### 3. 完整包 (Full)
**包大小**: ~600KB  
**包含**: 标准 + 动画、物理、音频
```typescript
import { Engine } from '@react-face/three-core/full';

const engine = new Engine({
  enableManagers: [
    'scene', 'camera', 'renderer', 'controls',
    'lights', 'materials', 'textures', 'geometries',
    'animations', 'physics', 'audio', 'particles'
  ]
});
```

**适用场景**:
- 交互式3D应用
- 游戏开发
- 复杂可视化项目

### 4. 专业包 (Professional)
**包大小**: ~1.2MB  
**包含**: 所有功能
```typescript
import { Engine } from '@react-face/three-core/professional';

const engine = new Engine({
  enableManagers: [
    'scene', 'camera', 'renderer', 'controls',
    'lights', 'materials', 'textures', 'geometries',
    'animations', 'physics', 'audio', 'particles',
    'performance', 'monitor', 'memory', 'recovery',
    'instance', 'lod', 'rayTracing', 'volumetric'
  ]
});
```

**适用场景**:
- 专业3D应用
- 高性能要求项目
- 复杂渲染效果

## 动态导入

### 按需加载管理器
```typescript
import { ManagerRegistry } from '@react-face/three-core';

const registry = ManagerRegistry.getInstance();

// 动态加载特定管理器
const monitorModule = await registry.loadManagerModule('monitor');
const monitorManager = new monitorModule.default(engine);

// 或者使用便捷方法
const monitorManager = await registry.createManager('monitor', engine);
```

### 渐进式加载
```typescript
import { Engine } from '@react-face/three-core/lightweight';

const engine = new Engine({
  enableManagers: ['scene', 'camera', 'renderer']
});

// 基础功能
await engine.initialize();

// 用户交互后加载更多功能
document.getElementById('advanced-btn').onclick = async () => {
  const registry = ManagerRegistry.getInstance();
  
  // 动态加载高级功能
  const physicsManager = await registry.createManager('physics', engine);
  const audioManager = await registry.createManager('audio', engine);
  
  // 启用高级功能
  console.log('高级功能已加载');
};
```

## 包大小对比

| 包类型 | 大小 | 管理器数量 | 启动时间 | 适用场景 |
|--------|------|------------|----------|----------|
| 轻量级 | ~90KB | 4个 | <50ms | 简单展示 |
| 标准 | ~300KB | 8个 | <100ms | 一般应用 |
| 完整 | ~600KB | 16个 | <200ms | 复杂应用 |
| 专业 | ~1.2MB | 42个 | <500ms | 专业项目 |

## 性能优化建议

### 1. 选择合适的包
```typescript
// 简单展示 - 使用轻量级包
import { Engine } from '@react-face/three-core/lightweight';

// 一般应用 - 使用标准包
import { Engine } from '@react-face/three-core/standard';

// 复杂应用 - 使用完整包
import { Engine } from '@react-face/three-core/full';

// 专业项目 - 使用专业包
import { Engine } from '@react-face/three-core/professional';
```

### 2. 动态加载策略
```typescript
// 初始只加载核心功能
const engine = new Engine({
  enableManagers: ['scene', 'camera', 'renderer']
});

// 根据用户行为动态加载
const loadAdvancedFeatures = async () => {
  const registry = ManagerRegistry.getInstance();
  
  // 加载性能监控
  if (needsPerformanceMonitoring) {
    await registry.createManager('monitor', engine);
  }
  
  // 加载物理引擎
  if (needsPhysics) {
    await registry.createManager('physics', engine);
  }
  
  // 加载音频系统
  if (needsAudio) {
    await registry.createManager('audio', engine);
  }
};
```

### 3. 条件加载
```typescript
// 根据设备性能选择功能
const loadOptimizedFeatures = async () => {
  const devicePerformance = getDevicePerformance();
  const registry = ManagerRegistry.getInstance();
  
  if (devicePerformance === 'high') {
    // 高性能设备 - 加载所有功能
    await registry.createManager('rayTracing', engine);
    await registry.createManager('volumetric', engine);
  } else if (devicePerformance === 'medium') {
    // 中等性能设备 - 加载部分功能
    await registry.createManager('instance', engine);
    await registry.createManager('lod', engine);
  } else {
    // 低性能设备 - 只加载核心功能
    console.log('使用基础功能');
  }
};
```

## 构建配置

### Rollup 配置
```javascript
// rollup.config.js
export default defineConfig([
  // 轻量级包
  {
    input: 'src/lightweight.ts',
    output: { file: 'dist/lightweight.js', format: 'esm' }
  },
  // 标准包
  {
    input: 'src/standard.ts',
    output: { file: 'dist/standard.js', format: 'esm' }
  },
  // 完整包
  {
    input: 'src/full.ts',
    output: { file: 'dist/full.js', format: 'esm' }
  },
  // 专业包
  {
    input: 'src/professional.ts',
    output: { file: 'dist/professional.js', format: 'esm' }
  }
]);
```

### Webpack 配置
```javascript
// webpack.config.js
module.exports = {
  entry: {
    lightweight: './src/lightweight.ts',
    standard: './src/standard.ts',
    full: './src/full.ts',
    professional: './src/professional.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }
};
```

## 最佳实践

### 1. 选择合适的入口点
```typescript
// 根据项目需求选择
const getEngineEntry = (projectType: string) => {
  switch (projectType) {
    case 'simple':
      return '@react-face/three-core/lightweight';
    case 'standard':
      return '@react-face/three-core/standard';
    case 'complex':
      return '@react-face/three-core/full';
    case 'professional':
      return '@react-face/three-core/professional';
    default:
      return '@react-face/three-core/lightweight';
  }
};
```

### 2. 监控包大小
```typescript
import { ManagerRegistry } from '@react-face/three-core';

const registry = ManagerRegistry.getInstance();
const managerTypes = ['scene', 'camera', 'renderer', 'controls'];
const bundleSize = registry.calculateBundleSize(managerTypes);

console.log(`当前配置包大小: ${bundleSize}KB`);
```

### 3. 推荐配置
```typescript
// 获取推荐配置
const recommendations = registry.getRecommendedConfigs();
console.log('推荐配置:', recommendations);

// 使用推荐配置
const standardConfig = recommendations.find(r => r.name === '标准');
const engine = new Engine({
  enableManagers: standardConfig.managers
});
```

## 总结

Three-Core 的分包系统提供了：

1. **多种包选项**: 从90KB到1.2MB的不同大小
2. **动态加载**: 运行时按需加载管理器
3. **性能优化**: 根据设备性能选择功能
4. **灵活配置**: 支持自定义管理器组合
5. **渐进式增强**: 根据用户交互动态加载功能

这种设计让开发者可以根据项目需求选择最合适的包，既保证了功能完整性，又优化了加载性能！ 