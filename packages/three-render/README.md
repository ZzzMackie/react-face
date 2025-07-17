# Three-Render

基于 Vue 3 的声明式 Three.js 渲染库，类似于 React 的 react-three-fiber，但专为 Vue 3 设计。使用 three-core 作为底层渲染引擎。

## 特性

- **声明式 3D 渲染**：使用 Vue 组件和模板语法创建和管理 Three.js 场景
- **响应式**：充分利用 Vue 3 的响应式系统自动更新 Three.js 对象
- **组合式 API**：提供类似 react-three-fiber 的钩子函数，如 `useThree` 和 `useFrame`
- **高性能**：优化的渲染循环，支持实例化渲染和 LOD
- **高级功能**：内置后处理效果、WebGPU 支持、物理模拟等
- **易于集成**：与 Vue 生态系统无缝集成

## 安装

```bash
# 使用 npm
npm install three-render three

# 使用 yarn
yarn add three-render three

# 使用 pnpm
pnpm add three-render three
```

## 快速开始

```vue
<template>
  <three-canvas>
    <three-scene :background="0x87ceeb">
      <three-camera :position="[0, 2, 5]" :lookAt="[0, 0, 0]" :makeDefault="true" />
      <three-mesh :position="[0, 0, 0]">
        <three-box :width="1" :height="1" :depth="1" :center="true" />
        <three-mesh-standard-material color="red" :metalness="0.5" :roughness="0.5" />
      </three-mesh>
      <!-- 添加灯光 -->
      <three-object :object="ambientLight" />
      <three-object :object="directionalLight" :position="[5, 5, 5]" />
    </three-scene>
  </three-canvas>
</template>

<script setup>
import { ref } from 'vue'
import * as THREE from 'three'
import { 
  ThreeCanvas, 
  ThreeScene, 
  ThreeCamera, 
  ThreeMesh, 
  ThreeBox, 
  ThreeObject, 
  ThreeMeshStandardMaterial 
} from 'three-render'

// 创建灯光
const ambientLight = ref(new THREE.AmbientLight(0xffffff, 0.5))
const directionalLight = ref(new THREE.DirectionalLight(0xffffff, 0.8))
</script>
```

## 全局注册组件

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import ThreeRender from 'three-render'

const app = createApp(App)
app.use(ThreeRender)
app.mount('#app')
```

## 组件 API

### ThreeCanvas

创建 Three.js 渲染上下文和画布

```vue
<three-canvas
  :width="800"
  :height="600"
  :antialias="true"
  :alpha="true"
  :shadows="true"
  :physicallyCorrectLights="true"
  :webGPU="false"
  :pixelRatio="window.devicePixelRatio"
  :frameloop="'demand'"
  @created="onCanvasCreated"
/>
```

### ThreeScene

创建 Three.js 场景

```vue
<three-scene
  :background="0x87ceeb"
  :environment="environmentTexture"
  :fog="{ type: 'exp2', color: 0xcccccc, density: 0.02 }"
/>
```

### ThreeCamera

创建相机对象

```vue
<three-camera
  type="perspective"
  :fov="75"
  :aspect="16/9"
  :near="0.1"
  :far="1000"
  :position="[0, 0, 5]"
  :lookAt="[0, 0, 0]"
  :makeDefault="true"
/>
```

### ThreeMesh

创建网格对象

```vue
<three-mesh
  :position="[0, 0, 0]"
  :rotation="[0, 0, 0]"
  :scale="1"
  :castShadow="true"
  :receiveShadow="true"
  @click="handleClick"
  @pointerenter="handlePointerEnter"
  @pointerleave="handlePointerLeave"
>
  <!-- 几何体和材质作为子组件 -->
</three-mesh>
```

### ThreeGeometry

创建各种几何体

```vue
<three-geometry 
  type="box"
  :width="1"
  :height="1"
  :depth="1"
  :widthSegments="1"
  :heightSegments="1"
  :depthSegments="1"
  :center="true"
/>

<three-geometry 
  type="sphere"
  :radius="1"
  :widthSegments="32"
  :heightSegments="16"
/>

<three-geometry 
  type="torus"
  :radius="1"
  :tube="0.4"
  :radialSegments="16"
  :tubularSegments="100"
/>
```

### ThreeMeshStandardMaterial

创建标准 PBR 材质

```vue
<three-mesh-standard-material
  color="red"
  :roughness="0.5"
  :metalness="0.5"
  :emissive="0x000000"
  :transparent="false"
  :opacity="1"
  :side="'front'"
  :wireframe="false"
  :map="diffuseTexture"
  :normalMap="normalTexture"
/>
```

## 组合式 API

### useThree

访问 Three.js 核心对象和状态

```js
import { useThree } from 'three-render'

// 在组件内部使用
const { 
  scene,
  camera,
  renderer,
  gl,
  size,
  viewport
} = useThree()

// 使用这些对象
console.log(scene.value)
camera.value.position.z = 5
```

### useFrame

添加帧动画回调

```js
import { useFrame } from 'three-render'

// 在每一帧调用
useFrame((state, delta) => {
  // state 包含场景、相机等
  // delta 是自上一帧以来经过的时间
  
  // 旋转网格
  mesh.value.rotation.x += 0.01
})

// 指定优先级（越低越先执行）
useFrame((state, delta) => {
  // 先执行的逻辑
}, 1)

// 指定特定的渲染目标
useFrame((state, delta) => {
  // 针对特定渲染器的逻辑
}, 0, myRenderTarget)
```

## 高级用法

### 后处理效果

```vue
<template>
  <three-canvas>
    <three-scene>
      <!-- 场景内容 -->
    </three-scene>
    <three-post-processing>
      <three-bloom-effect :strength="1.5" />
      <three-color-correction-effect :saturation="1.2" />
    </three-post-processing>
  </three-canvas>
</template>
```

### 物理模拟

```vue
<template>
  <three-canvas>
    <three-physics-world :gravity="[0, -9.8, 0]">
      <three-scene>
        <!-- 刚体和碰撞体 -->
        <three-rigid-body :mass="1" :position="[0, 10, 0]">
          <three-box />
          <three-box-collider />
        </three-rigid-body>
        
        <!-- 地面 -->
        <three-rigid-body :mass="0" :position="[0, 0, 0]">
          <three-plane :width="20" :height="20" />
          <three-plane-collider />
        </three-rigid-body>
      </three-scene>
    </three-physics-world>
  </three-canvas>
</template>
```

## 兼容性

- Vue >= 3.0.0
- Three.js >= 0.125.0
- 支持现代浏览器和 WebGL 2.0
- WebGPU 支持（可选）

## 与 React Three Fiber 的区别

Three-Render 的设计灵感来源于 react-three-fiber，但针对 Vue 的组合式 API 和模板系统进行了重新设计。主要区别：

1. **使用 Vue 模板**：而不是 JSX
2. **组合式 API**：使用 Vue 3 的组合式 API，而不是 React 钩子
3. **依赖注入**：利用 Vue 的依赖注入而不是 React 上下文
4. **自动响应式**：充分利用 Vue 的响应式系统

## 贡献指南

欢迎贡献代码、报告问题或提出建议！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

## 许可证

MIT 