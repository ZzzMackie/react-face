# Three-Render

Three-Render是一个Vue 3组件库，用于简化Three.js的使用和开发。它提供了一组声明式组件，使您能够以Vue组件的方式构建3D应用程序。

## 特性

- **声明式API**：使用Vue组件语法构建3D场景
- **响应式**：自动响应数据变化，更新3D场景
- **组件化**：将3D场景拆分为可重用的组件
- **类型安全**：完整的TypeScript类型定义
- **物理引擎**：内置cannon-es物理引擎支持
- **后处理效果**：支持多种后处理效果
- **WebGPU支持**：可选的WebGPU渲染器
- **资源管理**：智能资源管理和优化
- **性能监控**：内置性能监控工具

## 安装

```bash
npm install three-render three @types/three
```

## 基本用法

```vue
<template>
  <ThreeCanvas>
    <ThreeScene>
      <ThreeCamera :position="[0, 0, 5]" />
      <ThreeAmbientLight />
      <ThreeDirectionalLight :position="[0, 1, 0]" />
      <ThreeMesh>
        <ThreeBoxGeometry />
        <ThreeMeshStandardMaterial :color="0x3366cc" />
      </ThreeMesh>
    </ThreeScene>
  </ThreeCanvas>
</template>

<script setup>
import { ThreeCanvas, ThreeScene, ThreeCamera, ThreeMesh, ThreeBoxGeometry, ThreeMeshStandardMaterial, ThreeAmbientLight, ThreeDirectionalLight } from 'three-render';
</script>
```

## 组件

### 核心组件

- `ThreeCanvas` - 创建Three.js画布
- `ThreeScene` - 创建3D场景
- `ThreeCamera` - 创建相机
- `ThreeMesh` - 创建网格对象
- `ThreeObject` - 创建通用3D对象
- `ThreeResourceManager` - 管理和优化资源
- `ThreeWebGPURenderer` - WebGPU渲染器

### 几何体组件

- `ThreeBoxGeometry` - 立方体
- `ThreeSphereGeometry` - 球体
- `ThreePlaneGeometry` - 平面
- `ThreeCylinderGeometry` - 圆柱体
- `ThreeConeGeometry` - 圆锥体
- `ThreeTorusGeometry` - 圆环
- `ThreeTorusKnotGeometry` - 环形结
- `ThreeCircleGeometry` - 圆形

### 材质组件

- `ThreeMeshStandardMaterial` - 标准材质
- `ThreeMeshBasicMaterial` - 基础材质
- `ThreeMeshPhongMaterial` - Phong材质

### 灯光组件

- `ThreeAmbientLight` - 环境光
- `ThreeDirectionalLight` - 平行光
- `ThreePointLight` - 点光源
- `ThreeSpotLight` - 聚光灯
- `ThreeHemisphereLight` - 半球光

### 控制器组件

- `ThreeOrbitControls` - 轨道控制器

### 交互组件

- `ThreeRaycaster` - 射线投射器
- `ThreeInteractive` - 交互式对象

### 后处理组件

- `ThreePostProcessing` - 后处理系统
- `ThreeBloomEffect` - 辉光效果
- `ThreeAntialias` - 抗锯齿效果
- `ThreeDepthOfFieldEffect` - 景深效果

### 高级组件

- `ThreeGLTFModel` - GLTF模型加载器
- `ThreeText` - 3D文本
- `ThreeSprite` - 精灵
- `ThreeParticles` - 粒子系统

### 物理组件

- `ThreePhysicsWorld` - 物理世界
- `ThreeRigidBody` - 刚体
- `ThreeBoxCollider` - 盒体碰撞器
- `ThreeSphereCollider` - 球体碰撞器
- `ThreeConstraint` - 物理约束

### 调试组件

- `ThreeStats` - 性能监控

## 组合式API

- `useThree` - 访问Three.js核心对象
- `useFrame` - 添加帧更新回调
- `useRaycaster` - 射线投射功能
- `usePhysics` - 物理引擎功能
- `useTexture` - 纹理加载功能
- `useModel` - 模型加载功能

## 高级功能

### WebGPU支持

Three-Render提供可选的WebGPU渲染器，可在支持的浏览器中启用：

```vue
<ThreeWebGPURenderer v-slot="{ isSupported, isInitialized }">
  <ThreeScene v-if="isSupported && isInitialized">
    <!-- 3D内容 -->
  </ThreeScene>
  <template #not-supported>
    <div>WebGPU不受支持</div>
  </template>
</ThreeWebGPURenderer>
```

### 资源管理

使用`ThreeResourceManager`组件优化资源使用：

```vue
<ThreeResourceManager :auto-dispose="true" :dispose-interval="30000">
  <!-- 3D内容 -->
</ThreeResourceManager>
```

### 性能监控

使用`ThreeStats`组件监控性能：

```vue
<ThreeStats 
  :show-fps="true" 
  :show-ms="true" 
  :show-mem="true"
  :show-draw-calls="true"
  :show-triangles="true"
/>
```

### 物理系统

使用物理组件添加物理交互：

```vue
<ThreePhysicsWorld :gravity="[0, -9.82, 0]">
  <ThreeRigidBody :mass="1" :position="[0, 5, 0]">
    <ThreeMesh>
      <ThreeBoxGeometry />
      <ThreeMeshStandardMaterial :color="0x3366cc" />
    </ThreeMesh>
    <ThreeBoxCollider />
  </ThreeRigidBody>
  
  <ThreeRigidBody :mass="0" :position="[0, -0.5, 0]">
    <ThreeMesh :rotation="[-Math.PI / 2, 0, 0]">
      <ThreePlaneGeometry :width="10" :height="10" />
      <ThreeMeshStandardMaterial :color="0x999999" />
    </ThreeMesh>
    <ThreeBoxCollider :size="[10, 0.1, 10]" />
  </ThreeRigidBody>
</ThreePhysicsWorld>
```

## 示例

- 基础场景
- 物理系统
- 后处理效果
- 资源管理
- WebGPU渲染

## 浏览器支持

- 现代浏览器（Chrome、Firefox、Safari、Edge）
- WebGPU功能需要支持WebGPU的浏览器（Chrome 113+、Edge 113+）

## 许可证

MIT 

## 构建

Three-Render提供了几种不同的构建方式：

1. **标准构建**：使用Vue SFC编译器和TypeScript类型检查
   ```bash
   npm run build
   ```

2. **简化构建**：跳过类型检查，使用Vite直接构建
   ```bash
   npm run build:simple
   ```

3. **ESBuild构建**：使用ESBuild进行快速构建，适合开发环境
   ```bash
   npm run build:esbuild
   ```

如果在构建过程中遇到类型检查错误，可以尝试使用简化构建或ESBuild构建。 

## Three-Core 集成

Three-Render 现在与 Three-Core 引擎深度集成，利用其强大的管理器系统来提供更好的性能和更丰富的功能：

### 主要优势

- **统一的资源管理**：通过 ResourceManager 自动管理纹理、几何体和材质的加载和释放
- **优化的渲染循环**：使用 Engine 的渲染循环系统，支持自定义渲染钩子
- **场景管理**：通过 SceneManager 更好地组织和管理场景对象
- **相机控制**：使用 CameraManager 轻松切换和管理多个相机
- **物理集成**：通过 PhysicsManager 提供与 cannon-es 的无缝集成
- **后处理系统**：通过 ComposerManager 统一管理后处理效果
- **性能监控**：使用 PerformanceManager 监控应用性能

### 示例

```vue
<template>
  <ThreeCanvas>
    <ThreeScene :background="0x87CEEB">
      <ThreeCamera :position="[0, 5, 10]" :lookAt="[0, 0, 0]" />
      
      <!-- 灯光 -->
      <ThreeAmbientLight :intensity="0.5" />
      <ThreeDirectionalLight :position="[5, 10, 5]" :intensity="1" :cast-shadow="true" />
      
      <!-- 3D内容 -->
      <ThreeMesh :position="[0, 1, 0]" :cast-shadow="true" :receive-shadow="true">
        <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
        <ThreeMeshStandardMaterial :color="0x3366cc" />
      </ThreeMesh>
      
      <!-- 控制器 -->
      <ThreeOrbitControls />
    </ThreeScene>
  </ThreeCanvas>
</template>
```

查看 `examples/ThreeCoreExample.vue` 获取更多示例。 