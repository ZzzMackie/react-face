# Three-Core

一个基于 Three.js 的模块化 3D 引擎，提供完整的管理器系统。

## 🚀 特性

- **模块化架构**: 38个专门的管理器处理不同功能
- **类型安全**: 完整的 TypeScript 支持
- **对象管理**: 完整的 3D 对象生命周期管理
- **模型导入**: 支持 GLTF、FBX、OBJ 等格式
- **性能监控**: 实时性能监控和警告系统
- **信号系统**: 响应式事件系统

## 📦 安装

```bash
npm install @react-face/three-core
```

## 🎯 快速开始

### 基础使用

```typescript
import { Engine } from '@react-face/three-core';

// 创建引擎实例
const engine = new Engine({
  container: document.getElementById('container'),
  width: 800,
  height: 600,
  antialias: true,
  shadowMap: true,
  enableManagers: ['scene', 'renderer', 'camera', 'objects', 'loader', 'monitor']
});

// 等待引擎初始化
engine.engineInitialized.subscribe((engine) => {
  if (engine) {
    console.log('引擎初始化完成');
  }
});
```

### 对象管理

```typescript
// 获取对象管理器
const objects = await engine.getObjects();

// 创建几何体和材质
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

// 创建网格对象
const mesh = objects.createMesh('myMesh', geometry, material, {
  position: { x: 0, y: 0, z: 0 },
  castShadow: true,
  receiveShadow: true
});

// 选择对象
objects.selectObject('myMesh');

// 更新对象
objects.updateObject('myMesh', {
  position: { x: 1, y: 1, z: 1 },
  scale: { x: 2, y: 2, z: 2 }
});

// 获取统计信息
const stats = objects.getStats();
console.log('对象统计:', stats);
```

### 模型加载

```typescript
// 获取加载器管理器
const loader = await engine.getLoader();

// 设置Draco解码器路径
loader.setDracoDecoderPath('/draco/');

// 加载GLTF模型
const result = await loader.loadGLTF('/models/example.glb', {
  onProgress: (event) => {
    console.log('加载进度:', event.loaded / event.total);
  },
  onError: (error) => {
    console.error('加载失败:', error);
  }
});

// 解析模型到各个管理器
await loader.parseLoadedModel('/models/example.glb', result);

// 获取加载统计
const stats = loader.getStats();
console.log('加载器统计:', stats);
```

### 性能监控

```typescript
// 获取监控管理器
const monitor = await engine.getMonitor();

// 配置监控
monitor.setConfig({
  enabled: true,
  updateInterval: 1000,
  logToConsole: true,
  maxHistory: 100
});

// 监听性能数据
monitor.performanceUpdated.subscribe((data) => {
  console.log('FPS:', data.fps);
  console.log('渲染调用:', data.render.calls);
  console.log('三角形数量:', data.render.triangles);
});

// 监听资源数据
monitor.resourceUpdated.subscribe((data) => {
  console.log('对象数量:', data.objects);
  console.log('几何体数量:', data.geometries);
  console.log('材质数量:', data.materials);
});

// 监听警告
monitor.memoryWarning.subscribe((warning) => {
  console.warn('内存警告:', warning);
});

monitor.performanceWarning.subscribe((warning) => {
  console.warn('性能警告:', warning);
});

// 开始监控
monitor.startMonitoring();

// 获取性能统计
const performanceStats = monitor.getPerformanceStats();
console.log('性能统计:', performanceStats);
```

## 📚 管理器列表

### 核心管理器
- `SceneManager` - 场景管理
- `RenderManager` - 渲染管理
- `CameraManager` - 相机管理
- `ControlsManager` - 控制器管理

### 对象管理器
- `ObjectManager` - 3D对象管理 ⭐ 新增
- `GeometryManager` - 几何体管理
- `MaterialManager` - 材质管理
- `TextureManager` - 纹理管理

### 加载管理器
- `LoaderManager` - 模型加载管理 ⭐ 新增
- `AssetManager` - 资源管理

### 效果管理器
- `LightManager` - 光照管理
- `ShaderManager` - 着色器管理
- `ParticleManager` - 粒子管理
- `AnimationManager` - 动画管理

### 监控管理器
- `MonitorManager` - 性能监控管理 ⭐ 新增
- `PerformanceManager` - 性能管理
- `ErrorManager` - 错误管理

### 高级管理器
- `PhysicsManager` - 物理管理
- `AudioManager` - 音频管理
- `RayTracingManager` - 光线追踪
- `DeferredManager` - 延迟渲染
- `FluidManager` - 流体管理
- `VolumetricManager` - 体积渲染

## 🔧 API 参考

### Engine

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
  enableManagers?: ManagerType[];
}
```

### ObjectManager

```typescript
// 创建对象
createObject(id: string, object: THREE.Object3D, config?: Object3DConfig): THREE.Object3D
createMesh(id: string, geometry: THREE.BufferGeometry, material: THREE.Material, config?: MeshConfig): THREE.Mesh
createGroup(id: string, config?: Object3DConfig): THREE.Group

// 获取对象
getObject(id: string): THREE.Object3D | undefined
getMesh(id: string): THREE.Mesh | undefined
getGroup(id: string): THREE.Group | undefined
getAllObjects(): THREE.Object3D[]

// 操作对象
removeObject(id: string): boolean
updateObject(id: string, config: Object3DConfig): boolean
selectObject(id: string): boolean

// 统计信息
getStats(): { total: number; meshes: number; groups: number; selected: boolean }
```

### LoaderManager

```typescript
// 加载模型
loadGLTF(url: string, options?: LoadOptions): Promise<LoadResult>
loadFBX(url: string, options?: LoadOptions): Promise<LoadResult>
loadOBJ(url: string, options?: LoadOptions): Promise<LoadResult>

// 解析模型
parseLoadedModel(url: string, result: LoadResult): Promise<void>

// 配置
setDracoDecoderPath(path: string): void

// 统计信息
getStats(): { loaded: number; loading: number; total: number }
```

### MonitorManager

```typescript
// 配置监控
setConfig(config: MonitorConfig): void
startMonitoring(): void
stopMonitoring(): void

// 获取数据
getPerformanceData(): PerformanceData[]
getResourceData(): ResourceData[]
getPerformanceStats(): PerformanceStats

// 清理
clearHistory(): void
```

## 📖 示例

查看 `src/examples/` 目录中的完整示例：

- `ObjectLoaderExample.ts` - 对象管理和模型加载示例
- `MonitorExample.ts` - 性能监控示例
- `SimpleExample.ts` - 基础使用示例

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## �� 许可证

MIT License
