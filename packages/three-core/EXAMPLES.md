# Three-Core 示例使用说明

## 🚀 快速开始

### 方法一：开发模式（推荐）

1. **启动开发服务器**
   ```bash
   pnpm dev
   ```

2. **访问示例**
   - 打开浏览器访问 `http://localhost:3000`
   - 点击示例链接或直接访问：
     - `http://localhost:3000/examples/advanced-effects.html`

3. **优势**
   - 支持热重载
   - 自动处理TypeScript文件
   - 实时错误提示
   - 开发体验最佳

### 方法二：构建后运行

1. **构建库**
   ```bash
   pnpm build
   ```

2. **启动本地服务器**
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 或使用Node.js
   npx serve .
   ```

3. **访问示例**
   - 打开浏览器访问 `http://localhost:8000/examples/advanced-effects-built.html`

4. **优势**
   - 可以直接在浏览器中运行
   - 不需要开发环境
   - 适合演示和分享

## 📁 示例文件说明

### 开发模式示例

- `advanced-effects.html` - 高级特效示例
- `basic.html` - 基础功能示例
- `managers.html` - 管理器使用示例
- `signals.html` - 信号系统示例
- `performance.html` - 性能监控示例
- `particles.html` - 粒子系统示例

### 构建版本示例

- `advanced-effects-built.html` - 高级特效示例（构建版本）

## 🔧 示例功能

### 高级特效示例

包含以下功能：

1. **体积光效果**
   - 可调节强度
   - 动画效果
   - 噪声纹理

2. **景深效果**
   - 可调节焦距
   - 背景虚化
   - 焦点控制

3. **运动模糊**
   - 可调节强度
   - 动态模糊
   - 性能优化

4. **色彩校正**
   - 亮度调节
   - 对比度调节
   - 饱和度调节

5. **屏幕空间反射**
   - 实时反射
   - 可调节强度
   - 性能优化

6. **环境光遮蔽**
   - 阴影增强
   - 可调节强度
   - 真实感提升

## 🎮 控制说明

### 界面控制

- **切换按钮**: 启用/禁用对应效果
- **滑块控制**: 调节效果参数
- **重置按钮**: 恢复默认设置
- **自动旋转**: 切换场景自动旋转

### 键盘控制

- `WASD`: 相机移动
- `鼠标拖拽`: 相机旋转
- `滚轮`: 缩放

## 🐛 常见问题

### 1. 模块导入错误

**问题**: `Failed to load module script`

**解决方案**:
- 确保使用开发服务器: `pnpm dev`
- 或使用构建后的文件: `advanced-effects-built.html`

### 2. Three.js未找到

**问题**: `THREE is not defined`

**解决方案**:
- 确保Three.js已正确加载
- 检查网络连接（CDN加载）

### 3. 管理器初始化失败

**问题**: `Manager initialization failed`

**解决方案**:
- 检查浏览器控制台错误信息
- 确保所有依赖已正确安装
- 尝试刷新页面

### 4. 性能问题

**问题**: 帧率低，卡顿

**解决方案**:
- 降低特效强度
- 减少对象数量
- 关闭不必要的效果
- 检查硬件性能

## 📊 性能监控

示例包含实时性能监控：

- **FPS**: 帧率显示
- **渲染时间**: 单帧渲染时间
- **三角形数量**: 场景复杂度
- **绘制调用**: 渲染调用次数

## 🔧 自定义开发

### 修改示例

1. 编辑对应的HTML文件
2. 修改JavaScript代码
3. 保存后自动重载（开发模式）

### 添加新示例

1. 创建新的HTML文件
2. 参考现有示例结构
3. 添加必要的样式和脚本
4. 更新文档

### 调试技巧

1. **使用浏览器开发者工具**
   - Console: 查看错误信息
   - Network: 检查资源加载
   - Performance: 分析性能

2. **使用Vite开发工具**
   - 热重载
   - 错误覆盖
   - 源码映射

3. **使用Three.js调试工具**
   - Stats.js: 性能统计
   - GUI: 参数调节

## 📚 学习资源

- [Three.js官方文档](https://threejs.org/docs/)
- [Vite官方文档](https://vitejs.dev/)
- [TypeScript官方文档](https://www.typescriptlang.org/)

## 🤝 贡献示例

欢迎贡献新的示例！

1. Fork项目
2. 创建新示例
3. 添加文档说明
4. 提交Pull Request

## �� 许可证

示例代码遵循MIT许可证。 