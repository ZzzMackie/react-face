# Three Core 测试文档

## 概述

Three Core 项目包含全面的测试套件，涵盖单元测试、集成测试和性能基准测试。

## 测试结构

```
tests/
├── setup.ts                 # 测试环境设置
├── core/                    # 核心模块测试
│   ├── Engine.test.ts      # 引擎测试
│   └── Signal.test.ts      # 信号系统测试
├── managers/                # 管理器测试
│   ├── ManagerFactory.test.ts
│   ├── DynamicManagerRegistry.test.ts
│   ├── PerformanceManager.test.ts
│   ├── MemoryManager.test.ts
│   ├── RenderManager.test.ts
│   ├── SceneManager.test.ts
│   ├── CameraManager.test.ts
│   └── LightManager.test.ts
├── integration/             # 集成测试
│   └── EngineIntegration.test.ts
├── performance/             # 性能测试
│   └── PerformanceBenchmarks.test.ts
└── utils/                   # 测试工具
    └── TestUtils.ts
```

## 运行测试

### 基本测试
```bash
npm test
```

### 监听模式
```bash
npm run test:watch
```

### 覆盖率测试
```bash
npm run test:coverage
```

### CI 测试
```bash
npm run test:ci
```

## 测试类型

### 1. 单元测试 (Unit Tests)

测试各个模块的独立功能：

- **Engine**: 引擎初始化、生命周期、管理器管理
- **ManagerFactory**: 管理器创建、依赖管理
- **DynamicManagerRegistry**: 动态加载、错误处理
- **PerformanceManager**: 性能监控、优化建议
- **MemoryManager**: 内存管理、泄漏检测
- **RenderManager**: 渲染功能、性能优化
- **SceneManager**: 场景管理、对象操作
- **CameraManager**: 相机控制、动画

### 2. 集成测试 (Integration Tests)

测试模块间的协作：

- **EngineIntegration**: 完整引擎生命周期
- **Manager Integration**: 管理器间通信
- **Event System**: 事件系统集成
- **Error Recovery**: 错误恢复机制

### 3. 性能基准测试 (Performance Benchmarks)

测试性能和稳定性：

- **初始化性能**: 引擎启动时间
- **渲染性能**: 帧率、内存使用
- **管理器性能**: 加载和更新效率
- **内存性能**: 内存泄漏检测
- **压力测试**: 长时间运行稳定性

## 测试工具

### TestUtils

提供常用的测试工具函数：

```typescript
import { TestUtils } from './utils/TestUtils';

// 创建测试引擎
const engine = TestUtils.createTestEngine();

// 测量执行时间
const { result, time } = TestUtils.measureExecutionTime(() => {
  // 测试代码
});

// 创建性能基准
const benchmark = TestUtils.createBenchmark('test', 1000);
benchmark.run(() => {
  // 基准测试代码
});
```

### 模拟环境

测试环境包含完整的浏览器 API 模拟：

- WebGL 上下文
- requestAnimationFrame
- ResizeObserver
- AudioContext
- localStorage
- fetch API

## 测试覆盖率

目标覆盖率：80%

- **分支覆盖率**: 80%
- **函数覆盖率**: 80%
- **行覆盖率**: 80%
- **语句覆盖率**: 80%

## 测试最佳实践

### 1. 测试结构

```typescript
describe('ComponentName', () => {
  let component: Component;
  let engine: Engine;

  beforeEach(() => {
    // 设置测试环境
    engine = TestUtils.createTestEngine();
    component = new Component(engine);
  });

  afterEach(() => {
    // 清理测试环境
    TestUtils.cleanupTestEngine(engine);
  });

  describe('Initialization', () => {
    test('should initialize correctly', () => {
      expect(component).toBeDefined();
      expect(component.initialized).toBe(true);
    });
  });

  describe('Functionality', () => {
    test('should perform expected behavior', () => {
      const result = component.doSomething();
      expect(result).toBe(expectedValue);
    });
  });
});
```

### 2. 异步测试

```typescript
test('should handle async operations', async () => {
  const result = await component.asyncOperation();
  expect(result).toBeDefined();
});
```

### 3. 错误测试

```typescript
test('should handle errors gracefully', () => {
  expect(() => component.throwError()).toThrow('Expected error');
});
```

### 4. 性能测试

```typescript
test('should perform within time limits', () => {
  const { time } = TestUtils.measureExecutionTime(() => {
    component.expensiveOperation();
  });
  
  expect(time).toBeLessThan(100); // 100ms 限制
});
```

## 持续集成

### GitHub Actions

测试在以下情况下自动运行：

- 每次提交
- Pull Request
- 发布标签

### 测试报告

- Jest HTML Reporter 生成详细报告
- 覆盖率报告上传到 Codecov
- 性能基准测试结果记录

## 故障排除

### 常见问题

1. **测试超时**
   - 增加 Jest 超时时间
   - 检查异步操作是否正确等待

2. **内存泄漏**
   - 确保在 afterEach 中清理资源
   - 使用 TestUtils.cleanupTestEngine

3. **模拟问题**
   - 检查 setup.ts 中的模拟设置
   - 确保所有依赖都正确模拟

### 调试技巧

```typescript
// 启用详细日志
console.log('Debug info:', component.state);

// 使用 Jest 快照
expect(component.render()).toMatchSnapshot();

// 检查调用次数
expect(mockFunction).toHaveBeenCalledTimes(3);
```

## 扩展测试

### 添加新测试

1. 在相应目录创建 `.test.ts` 文件
2. 导入必要的模块和工具
3. 编写测试用例
4. 运行测试确保通过

### 添加新管理器测试

```typescript
// managers/NewManager.test.ts
import { NewManager } from '../../src/core/NewManager';

describe('NewManager', () => {
  let manager: NewManager;
  let engine: Engine;

  beforeEach(() => {
    engine = TestUtils.createTestEngine();
    manager = engine.getManager('new') as NewManager;
  });

  afterEach(() => {
    TestUtils.cleanupTestEngine(engine);
  });

  test('should initialize correctly', () => {
    expect(manager).toBeDefined();
    expect(manager.name).toBe('new');
  });
});
```

## 性能监控

### 基准测试

定期运行性能基准测试：

```bash
npm run test:performance
```

### 性能回归检测

- 监控关键指标变化
- 设置性能阈值
- 自动报告性能下降

## 总结

Three Core 的测试套件提供了：

- **全面的功能测试**: 确保所有功能正常工作
- **集成测试**: 验证模块间协作
- **性能测试**: 保证性能符合要求
- **错误处理测试**: 确保系统稳定性
- **自动化测试**: 支持持续集成

通过完善的测试覆盖，确保 Three Core 引擎的可靠性和稳定性。 