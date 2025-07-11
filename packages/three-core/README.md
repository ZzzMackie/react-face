# Three-Core

一个现代化的3D引擎核心库，基于Three.js构建，采用模块化架构设计，提供完整的功能集和易扩展的API。

## ✨ 特性

- 🏗️ **模块化架构** - 按需初始化的管理器系统
- 📡 **信号系统** - 响应式事件通信机制
- 🎨 **完整功能集** - 场景、渲染、材质、动画等全面支持
- 🚀 **高性能** - 优化的渲染管道和内存管理
- 🔧 **易扩展** - 插件化的管理器设计
- 📱 **现代化** - TypeScript + ES6+ 支持
- 🧪 **完整测试** - 单元测试和集成测试覆盖

## 📦 安装

```bash
npm install three-core
```

## 🚀 快速开始

### 基础使用

```javascript
import { Engine } from 'three-core';

// 创建引擎实例
const engine = new Engine({
  container: document.getElementById('container'),
  width: 800,
  height: 600,
  antialias: true,
  shadowMap: true
});

// 初始化引擎
await engine.initialize();

// 开始渲染
engine.startRenderLoop();
```

### 使用管理器

```javascript
// 获取场景管理器
const sceneManager = await engine.getManager('scene');

// 获取材质管理器
const materialManager = await engine.getManager('materials');

// 获取对象管理器
const objectManager = await engine.getManager('objects');

// 创建材质
const material = materialManager.createMaterial('myMaterial', {
  type: 'MeshLambertMaterial',
  color: 0xff0000
});

// 创建对象
const cube = objectManager.createObject('myCube', {
  geometry: 'BoxGeometry',
  material: 'myMaterial',
  position: { x: 0, y: 0, z: 0 }
});
```

## 🏗️ 架构设计

### 核心组件

- **Engine** - 引擎核心，统一调度各个管理器
- **Signal** - 信号系统，提供响应式事件通信
- **Manager** - 管理器接口，定义标准管理器行为

### 管理器系统

引擎采用模块化的管理器架构，每个管理器负责特定的功能领域：

#### 基础管理器
- **SceneManager** - 场景管理
- **RenderManager** - 渲染管理
- **CameraManager** - 相机管理
- **ControlManager** - 控制器管理
- **LightManager** - 灯光管理
- **MaterialManager** - 材质管理
- **ObjectManager** - 对象管理
- **GeometryManager** - 几何体管理
- **TextureManager** - 纹理管理
- **LoaderManager** - 加载器管理

#### 高级管理器
- **AnimationManager** - 动画管理
- **PerformanceManager** - 性能监控
- **EventManager** - 事件处理
- **ParticleManager** - 粒子系统
- **ShaderManager** - 着色器管理
- **EnvironmentManager** - 环境效果
- **VolumetricManager** - 体积光管理
- **PostProcessManager** - 后处理管理
- **ScreenSpaceManager** - 屏幕空间效果
- **SkeletonManager** - 骨骼动画管理
- **UIManager** - UI元素管理

## 📚 API 文档

### Engine 类

#### 构造函数
```typescript
new Engine(config?: EngineConfig)
```

#### 配置选项
```typescript
interface EngineConfig {
  container?: HTMLElement;
  width?: number;
  height?: number;
  antialias?: boolean;
  alpha?: boolean;
  shadowMap?: boolean;
  pixelRatio?: number;
  autoRender?: boolean;
  autoResize?: boolean;
}
```

#### 主要方法
```typescript
// 初始化引擎
await engine.initialize(): Promise<void>

// 获取管理器
await engine.getManager<T>(name: string): Promise<T | null>

// 同步获取管理器（需要先初始化）
engine.getManagerSync<T>(name: string): T

// 渲染场景
engine.render(): void

// 开始渲染循环
engine.startRenderLoop(): void

// 停止渲染循环
engine.stopRenderLoop(): void

// 设置容器
engine.setContainer(container: HTMLElement): void

// 设置尺寸
engine.setSize(width: number, height: number): void

// 获取统计信息
engine.getStats(): EngineStats
```

### 信号系统

```typescript
// 创建信号
const signal = createSignal<T>(initialValue: T);

// 订阅信号
signal.subscribe(callback: (value: T) => void): () => void;

// 设置值
signal.value = newValue;

// 销毁信号
signal.dispose(): void;
```

### 管理器接口

所有管理器都实现 `Manager` 接口：

```typescript
interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
```

## 🎯 使用示例

### 基础场景设置

```javascript
import { Engine } from 'three-core';

async function setupScene() {
  const engine = new Engine({
    container: document.getElementById('container'),
    width: window.innerWidth,
    height: window.innerHeight
  });

  await engine.initialize();

  // 获取管理器
  const sceneManager = await engine.getManager('scene');
  const lightManager = await engine.getManager('lights');
  const objectManager = await engine.getManager('objects');

  // 设置背景
  sceneManager.setBackground(new THREE.Color(0x000000));

  // 添加光源
  lightManager.createDirectionalLight('mainLight', {
    color: 0xffffff,
    intensity: 1,
    position: { x: 5, y: 5, z: 5 }
  });

  // 添加对象
  objectManager.createObject('cube', {
    geometry: 'BoxGeometry',
    material: 'MeshLambertMaterial',
    position: { x: 0, y: 0, z: 0 }
  });

  engine.startRenderLoop();
}
```

### 体积光效果

```javascript
// 获取体积光管理器
const volumetricManager = await engine.getManager('volumetric');

// 创建体积光
const volumetricLight = volumetricManager.createVolumetricLight('volumetric1', {
  color: 0xff6600,
  intensity: 2.0,
  density: 0.1,
  samples: 32,
  noiseScale: 2.0,
  noiseIntensity: 0.3,
  animationSpeed: 0.5,
  windDirection: new THREE.Vector3(1, 0, 0),
  windSpeed: 0.2,
  size: new THREE.Vector3(5, 5, 5),
  position: new THREE.Vector3(0, 2, 0)
});
```

### UI元素管理

```javascript
// 获取UI管理器
const uiManager = await engine.getManager('ui');

// 创建文本元素
const textElement = uiManager.createTextElement('text1', 'Hello Three-Core!', {
  position: new THREE.Vector3(0, 3, 0),
  size: { width: 2, height: 0.5 },
  color: 0xffffff,
  interactive: true
});

// 创建按钮元素
const buttonElement = uiManager.createButtonElement('button1', '点击我!', {
  position: new THREE.Vector3(0, 1.5, 0),
  size: { width: 1.5, height: 0.4 },
  color: 0x4CAF50,
  interactive: true
});

// 监听UI事件
uiManager.elementClicked.subscribe((data) => {
  if (data) {
    console.log('UI元素被点击:', data.element);
  }
});
```

### 骨骼动画

```javascript
// 获取骨骼动画管理器
const skeletonManager = await engine.getManager('skeleton');

// 创建骨骼动画
const skeletonAnimation = skeletonManager.createSkeletonAnimation(
  'character1',
  'walk',
  skinnedMesh,
  animations,
  {
    autoPlay: true,
    loop: true,
    timeScale: 1.0,
    weight: 1.0
  }
);

// 播放动画
skeletonManager.playAnimation('character1', 'walk');

// 混合动画
skeletonManager.blendAnimations('character1', ['walk', 'run'], [0.7, 0.3]);
```

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npm test -- --testNamePattern="Engine"
```

### 测试结构

```
tests/
├── unit/           # 单元测试
│   ├── Engine.test.ts
│   ├── Signal.test.ts
│   └── managers/   # 管理器测试
├── integration/    # 集成测试
└── utils/          # 测试工具
```

## 🛠️ 开发

### 环境设置

```bash
# 克隆仓库
git clone https://github.com/your-org/three-core.git
cd three-core

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build
```

### 代码规范

项目使用 ESLint 进行代码规范检查：

```bash
# 检查代码规范
npm run lint

# 自动修复
npm run lint:fix
```

### 提交规范

项目使用语义化提交规范：

- `feat:` - 新功能
- `fix:` - 修复bug
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `refactor:` - 代码重构
- `test:` - 测试相关
- `chore:` - 构建工具或辅助工具的变动

## 📊 性能

### 性能目标

- **渲染性能**: 60fps 稳定帧率
- **内存使用**: 优化的内存管理和垃圾回收
- **加载性能**: 异步加载和资源压缩
- **扩展性**: 支持1000+对象渲染

### 性能监控

```javascript
// 获取性能统计
const performanceManager = await engine.getManager('performance');
const stats = performanceManager.getStats();

console.log('FPS:', stats.fps);
console.log('内存使用:', stats.memory);
console.log('渲染时间:', stats.renderTime);
```

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](CONTRIBUTING.md) 了解详细信息。

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详细信息。

## 🔗 相关链接

- [在线文档](https://three-core-docs.vercel.app)
- [在线演示](https://three-core-demo.vercel.app)
- [问题反馈](https://github.com/your-org/three-core/issues)
- [功能请求](https://github.com/your-org/three-core/discussions)

## 📈 路线图

### v1.2.0 (计划中)
- [ ] 高级渲染功能
- [ ] 高级物理系统
- [ ] 高级动画系统
- [ ] 高级特效系统

### v1.3.0 (计划中)
- [ ] 交互和UI系统
- [ ] 网络和多人系统
- [ ] 数据和分析系统
- [ ] 扩展功能

### v2.0.0 (长期计划)
- [ ] 完整功能集
- [ ] 性能优化
- [ ] 企业级特性
- [ ] 生态系统
