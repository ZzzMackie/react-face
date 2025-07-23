# Three.js 渲染演示包 - 使用说明

## 🚀 快速启动

### 方法一：使用启动脚本（推荐）

**Windows 用户：**
```bash
# 双击运行或在命令行中执行
start.bat
```

**Linux/Mac 用户：**
```bash
# 给脚本执行权限
chmod +x start.sh

# 运行脚本
./start.sh
```

### 方法二：手动启动

```bash
# 1. 进入 three-demo 目录
cd react-face/packages/three-demo

# 2. 安装依赖（如果还没安装）
pnpm install

# 3. 启动开发服务器
pnpm dev
```

## 🎮 演示功能

启动后，您将看到一个包含以下演示的交互式界面：

### 1. 基础场景
- 基本的 Three.js 场景设置
- 旋转的立方体、球体、圆柱体
- 网格辅助线和坐标轴
- 轨道控制器交互

### 2. 几何体演示
- 展示各种 3D 几何体
- 包括立方体、球体、圆柱体、圆锥体
- 圆环、多面体、圆环结等复杂形状

### 3. 材质演示
- 不同材质效果展示
- 金属、塑料、玻璃材质
- 线框、发光、法线材质

### 4. 光照演示
- 多种光源类型
- 环境光、方向光、点光源
- 聚光灯、半球光效果

### 5. 动画演示
- 各种动画效果
- 旋转、弹跳、波浪运动
- 螺旋、缩放、颜色变化

### 6. 物理演示
- 基于 Cannon.js 的物理引擎
- 重力、碰撞检测
- 动态物体交互

## 🖱️ 交互操作

- **左键拖拽**：旋转视角
- **右键拖拽**：平移视角
- **滚轮**：缩放视角
- **左侧菜单**：切换演示场景

## 🔧 自定义开发

### 修改现有演示

每个演示都是独立的 Vue 组件，位于 `src/demos/` 目录：

```vue
<!-- 示例：修改基础场景 -->
<template>
  <ThreeRenderer>
    <!-- 添加您的 3D 内容 -->
    <Mesh :position="[0, 0, 0]">
      <BoxGeometry />
      <MeshStandardMaterial :color="0xff0000" />
    </Mesh>
  </ThreeRenderer>
</template>
```

### 添加新演示

1. 在 `src/demos/` 创建新的 `.vue` 文件
2. 在 `src/App.vue` 中导入并注册
3. 在演示列表中添加新项目

## 🐛 故障排除

### 常见问题

1. **依赖安装失败**
   ```bash
   # 清理缓存后重新安装
   pnpm store prune
   pnpm install
   ```

2. **端口被占用**
   ```bash
   # 修改 vite.config.ts 中的端口
   server: { port: 3002 }
   ```

3. **浏览器兼容性**
   - 确保使用现代浏览器
   - 启用 WebGL 支持
   - 检查显卡驱动

### 性能优化

- 减少几何体复杂度
- 优化材质设置
- 合理使用光照
- 控制动画帧率

## 📚 学习资源

- [Three.js 官方文档](https://threejs.org/docs/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Cannon.js 物理引擎](https://schteppe.github.io/cannon.js/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个演示包！ 