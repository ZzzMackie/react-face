# 更新日志

## [0.6.0] - 2023-06-28

### 新增

- **性能优化组件**
  - 添加 ThreeInstancedMesh 组件 - 实例化渲染，用于高效渲染大量相同几何体的对象
  - 添加性能优化示例 ThreePerformanceExample.vue

### 优化

- 实例化渲染支持多种分布类型：随机、网格、圆形、球形
- 支持动画和交互式控制
- 提供性能监控和统计信息
- 单个绘制调用渲染数千个对象，大幅提高渲染性能

## [0.5.0] - 2023-06-27

### 新增

- **资源管理系统**
  - 添加 ThreeResourceManager 组件 - 统一管理和加载3D资源
  - 添加 ThreeTextureLoader 组件 - 纹理加载和管理
  - 添加 ThreeModelLoader 组件 - GLTF/GLB模型加载和管理
  - 添加资源管理示例 ThreeResourceExample.vue

### 优化

- 资源管理器支持多种资源类型：纹理、立方体纹理、3D模型、音频、字体
- 优化资源加载流程，支持并发控制、超时管理、重试机制
- 资源自动缓存和重用，避免重复加载
- 资源自动清理和内存管理
- 丰富的事件系统：就绪、进度、完成、错误、添加、移除

## [0.4.1] - 2023-06-26

### 新增

- **后处理效果扩展**
  - 添加 ThreeDepthOfFieldEffect 组件 - 景深效果，用于创建真实的景深模糊
  - 添加 ThreeAmbientOcclusionEffect 组件 - 环境光遮蔽效果，增强场景深度感
  - 添加后处理效果示例 ThreePostprocessingExample.vue

### 优化

- 景深效果支持多种参数：焦距、焦距长度、散景缩放等
- 环境光遮蔽效果支持多种参数：半径、偏移、缩放、模糊等
- 提供调试模式，方便可视化效果参数
- 改进后处理效果的事件系统和生命周期管理

## [0.4.0] - 2023-06-25

### 新增

- **粒子系统实现**
  - 添加 ThreeParticleSystem 组件 - 粒子系统，用于创建和管理粒子效果
  - 添加 ThreeParticleEmitter 组件 - 粒子发射器，用于控制粒子的发射
  - 添加粒子系统示例 ThreeParticleExample.vue

### 优化

- 粒子系统支持多种配置：粒子数量、大小、颜色、透明度、混合模式等
- 粒子发射器支持多种类型：点、盒子、球体、圆形、圆锥等
- 提供完整的粒子事件系统：就绪、开始、停止、爆发、完成等
- 支持粒子变化：生命周期、速度、颜色、大小等
- 支持多种粒子效果：火焰、烟雾、爆炸、喷泉、星尘等

## [0.3.9] - 2023-06-24

### 新增

- **动画系统实现**
  - 添加 ThreeAnimationMixer 组件 - 动画混合器，用于管理3D模型的动画
  - 添加 ThreeAnimationClip 组件 - 动画剪辑，用于定义和控制单个动画
  - 添加动画系统示例 ThreeAnimationExample.vue

### 优化

- 动画混合器支持多种配置：时间缩放、调试模式等
- 动画剪辑支持多种参数：循环、重复次数、淡入淡出、混合模式等
- 提供完整的动画事件系统：播放、暂停、停止、完成、循环等
- 支持动态加载3D模型和动画剪辑

## [0.3.8] - 2023-06-23

### 新增

- **拖拽交互系统实现**
  - 添加 ThreeDragControls 组件 - 拖拽控制器，用于管理3D对象的拖拽操作
  - 添加 ThreeDraggable 组件 - 可拖拽对象组件，支持约束、轴锁定等功能
  - 添加拖拽交互示例 ThreeDragExample.vue

### 优化

- 拖拽控制器支持多种配置：拖拽平面、网格对齐、自动选择等
- 可拖拽对象支持多种约束：位置限制、轴锁定、颜色变化等
- 提供完整的拖拽事件系统：拖拽开始、拖拽中、拖拽结束等
- 与轨道控制器集成，在拖拽时自动禁用轨道控制器

## [0.3.7] - 2023-06-22

### 新增

- **交互系统实现**
  - 添加 ThreeRaycaster 组件 - 射线投射器，用于检测鼠标与3D对象的交互
  - 添加 ThreeInteractive 组件 - 可交互对象组件，支持悬停、点击等交互效果
  - 添加交互系统示例 ThreeInteractionExample.vue

### 优化

- 射线投射器支持调试模式，可视化射线方向
- 可交互对象支持多种交互效果：颜色变化、发光效果、缩放等
- 提供完整的事件系统：点击、双击、右键、悬停等
- 实现自定义鼠标光标样式

## [0.3.6] - 2023-06-21

### 新增

- **物理系统实现**
  - 添加 ThreePhysicsWorld 组件 - 物理世界容器，基于cannon-es物理引擎
  - 添加 ThreeRigidBody 组件 - 刚体组件，支持多种形状和物理属性
  - 添加物理系统示例 ThreePhysicsExample.vue
  - 添加 CannonDebugRenderer 工具类，用于可视化物理世界

### 优化

- 使用动态导入方式加载物理引擎，减少初始加载体积
- 支持多种物理形状：盒体、球体、平面、圆柱体、凸多面体、三角网格
- 提供交互式物理演示，可添加和重置物理对象

## [0.3.5] - 2023-06-20

### 新增

- **后处理系统实现**
  - 添加 ThreePostProcessing 组件 - 后处理效果容器，支持多种效果组合
  - 添加 ThreeBloomEffect 组件 - 辉光效果，增强发光物体的视觉效果
  - 添加后处理示例 ThreePostProcessingExample.vue

### 优化

- 更新常量定义，简化注入键类型
- 添加动态导入后处理模块的支持
- 提供后处理效果的交互式控制界面

## [0.3.4] - 2023-06-19

### 新增

- **新组件实现**
  - 添加 ThreeSpotLight 组件 - 聚光灯组件，支持光照阴影和辅助显示
  - 添加 ThreeGridHelper 组件 - 网格辅助组件，用于显示参考网格
  - 添加 ThreeMeshPhongMaterial 组件 - Phong材质组件，支持高光反射

### 优化

- 更新示例代码，展示更多组件功能
- 添加网格地面和更多光照效果
- 增强示例场景的视觉效果

## [0.3.3] - 2023-06-18

### 新增

- **新组件实现**
  - 添加 ThreeTorusGeometry 组件
  - 添加 ThreeMeshBasicMaterial 组件
  - 添加 ThreeAxesHelper 组件

### 优化

- 更新示例代码，展示更多组件功能
- 完善示例中的组件组合展示
- 添加更详细的示例说明

## [0.3.2] - 2023-06-17

### 新增

- **新组件实现**
  - 添加 ThreeSphereGeometry 组件
  - 添加 ThreePointLight 组件
  - 添加 ThreeStats 组件

### 优化

- 更新示例代码，展示更多组件功能
- 改进组件之间的通信机制
- 优化资源管理和释放

## [0.3.1] - 2023-06-16

### 新增

- **新组件实现**
  - 添加 ThreePlaneGeometry 组件
  - 添加 ThreeAmbientLight 组件
  - 添加 ThreeOrbitControls 组件

### 优化

- 更新示例代码，使用新实现的组件
- 完善组件间的依赖注入机制
- 改进资源管理和释放机制

## [0.3.0] - 2023-06-15

### 新增

- **Three-Core 集成**
  - 重构核心组件，使用 three-core 的 Engine 和 manager 系统
  - 添加 ThreeWebGPURenderer 组件，支持 WebGPU 渲染
  - 添加 ThreeResourceManager 组件，优化资源管理
  - 添加 ThreeStats 组件，提供性能监控

- **构建系统优化**
  - 添加多种构建方式，支持不同的开发场景
  - 添加 ESBuild 构建脚本，提供更快的构建速度
  - 优化类型声明文件生成

- **示例**
  - 添加 ThreeCoreExample 示例，展示 three-core 集成

### 优化

- 重构 ThreeCanvas 组件，使用 three-core 的 Engine
- 重构 ThreeScene 组件，使用 three-core 的 SceneManager
- 重构 ThreeCamera 组件，使用 three-core 的 CameraManager
- 改进组件间的依赖注入机制，使用统一的注入键
- 优化资源释放机制，减少内存泄漏

## [0.2.0] - 2023-06-10

### 新增

- **WebGPU支持**
  - 添加`ThreeWebGPURenderer`组件，支持WebGPU渲染
  - 添加`isWebGPUSupported`工具函数检测WebGPU支持

- **资源管理系统**
  - 添加`ThreeResourceManager`组件，智能管理和优化Three.js资源
  - 添加资源自动释放功能，减少内存占用
  - 添加资源共享和缓存机制

- **性能监控工具**
  - 添加`ThreeStats`组件，显示FPS、渲染时间、内存使用等信息
  - 支持监控绘制调用和三角形数量

- **物理系统增强**
  - 添加`ThreeBoxCollider`和`ThreeSphereCollider`碰撞器组件
  - 添加`ThreeConstraint`约束组件，支持多种物理约束

- **后处理系统增强**
  - 添加`ThreeDepthOfFieldEffect`景深效果组件
  - 重构后处理系统，使用最新的postprocessing库

- **工具函数**
  - 添加`ObjectPool`对象池类，优化对象重用
  - 添加`throttle`和`debounce`函数，优化性能
  - 添加设备性能检测和自适应渲染质量设置
  - 添加资源释放工具函数

### 优化

- 优化`ThreeRaycaster`组件，添加节流功能提高性能
- 优化`ThreeInteractive`组件，支持处理没有材质的对象
- 改进类型定义系统，提供更好的类型安全
- 优化导出结构，支持更灵活的导入方式

### 示例

- 添加WebGPU渲染示例
- 添加资源管理和性能监控示例
- 更新物理系统示例，展示新增的碰撞器和约束功能
- 更新后处理示例，展示新增的景深效果

## [0.1.0] - 2023-05-15

### 初始版本

- 核心组件：`ThreeCanvas`, `ThreeScene`, `ThreeCamera`, `ThreeMesh`和`ThreeObject`
- 几何体组件：8种不同的几何体(Box, Sphere等)
- 材质组件：3种材质(Standard, Basic, Phong)
- 灯光组件：5种光源
- 控制器组件：`ThreeOrbitControls`
- 后处理系统：辉光和抗锯齿效果
- 物理系统：基于cannon-es的物理引擎集成
- 交互系统：射线投射和交互式对象
- 高级组件：模型加载器、3D文本、精灵和粒子系统 