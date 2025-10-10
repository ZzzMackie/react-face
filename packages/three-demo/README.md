# Three.js 渲染演示包

这是一个基于 `three-render` 组件的 Three.js 渲染演示应用，展示了各种 3D 渲染功能和效果。

## 功能特性

### 🎯 基础场景演示
- 基本的 Three.js 场景设置
- 相机、光照、几何体配置
- 轨道控制器交互

### 📐 几何体演示
- 立方体、球体、圆柱体
- 圆锥体、圆环、多面体
- 圆环结等复杂几何体

### 🎨 材质演示
- 标准材质、金属材质
- 塑料材质、玻璃材质
- 线框材质、发光材质
- 法线材质、深度材质

### 💡 光照演示
- 环境光、方向光
- 点光源、聚光灯
- 半球光效果

### 🎬 动画演示
- 旋转、弹跳、波浪运动
- 螺旋运动、缩放动画
- 颜色变化、轨道运动
- 脉冲、摇摆动画

### ⚡ 物理演示
- 基于 Cannon.js 的物理引擎
- 重力、碰撞检测
- 动态物体交互
- 实时物理模拟

## 快速开始

### 安装依赖

```bash
# 在 react-face 根目录下
pnpm install
```

### 启动开发服务器

```bash
# 进入 three-demo 包目录
cd packages/three-demo

# 启动开发服务器
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

## 项目结构

```
three-demo/
├── src/
│   ├── demos/           # 演示组件
│   │   ├── BasicScene.vue      # 基础场景
│   │   ├── GeometryDemo.vue    # 几何体演示
│   │   ├── MaterialDemo.vue    # 材质演示
│   │   ├── LightingDemo.vue    # 光照演示
│   │   ├── AnimationDemo.vue   # 动画演示
│   │   └── PhysicsDemo.vue     # 物理演示
│   ├── App.vue          # 主应用组件
│   └── main.ts          # 应用入口
├── package.json         # 包配置
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── index.html           # HTML 模板
```

## 技术栈

- **Vue 3** - 前端框架
- **TypeScript** - 类型安全
- **Three.js** - 3D 图形库
- **Cannon.js** - 物理引擎
- **three-render** - Vue 3 Three.js 组件库
- **Vite** - 构建工具

## 使用说明

1. 启动应用后，左侧会显示演示菜单
2. 点击不同的演示按钮切换场景
3. 使用鼠标进行场景交互：
   - 左键拖拽：旋转视角
   - 右键拖拽：平移视角
   - 滚轮：缩放视角

## 自定义开发

### 添加新的演示场景

1. 在 `src/demos/` 目录下创建新的 Vue 组件
2. 在 `src/App.vue` 中导入并注册新组件
3. 在演示列表中添加新的演示项

### 修改现有演示

每个演示组件都是独立的 Vue 组件，可以自由修改：
- 调整相机位置和参数
- 修改光照设置
- 添加或移除几何体
- 自定义材质和颜色
- 实现自定义动画

## 注意事项

- 确保 `three-render` 包已正确安装和配置
- 物理演示需要 Cannon.js 支持
- 某些高级材质可能需要 WebGL 2.0 支持
- 建议在现代浏览器中运行以获得最佳性能

## 许可证

MIT License 