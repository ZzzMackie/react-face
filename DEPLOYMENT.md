# Vercel 部署指南

## 问题解决

### 错误信息
```
Warning: Could not identify Next.js version, ensure it is defined as a project dependency.
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.
```

### 解决方案

#### 1. Vercel 项目设置
在 Vercel Dashboard 中设置：
- **Root Directory**: `apps/editor`
- **Framework Preset**: `Next.js`
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

#### 2. 环境变量
确保在 Vercel 中设置必要的环境变量：
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### 3. 部署配置
项目已包含以下配置文件：

**根目录 `vercel.json`**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/editor/package.json",
      "use": "@vercel/next",
      "config": {
        "rootDirectory": "apps/editor"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/editor/$1"
    }
  ],
  "installCommand": "pnpm install",
  "buildCommand": "cd apps/editor && pnpm build",
  "outputDirectory": "apps/editor/.next"
}
```

**应用目录 `apps/editor/vercel.json`**:
```json
{
  "version": 2,
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

#### 4. 部署步骤

1. **连接 GitHub 仓库**
   - 在 Vercel Dashboard 中点击 "New Project"
   - 选择你的 GitHub 仓库

2. **配置项目**
   - Root Directory: `apps/editor`
   - Framework: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`

3. **环境变量**
   - 在 Vercel Dashboard 的 Environment Variables 中添加必要的变量

4. **部署**
   - 点击 "Deploy" 开始部署

#### 5. 常见问题

**问题**: 构建失败，找不到 Next.js
**解决**: 确保 Root Directory 设置为 `apps/editor`

**问题**: 依赖安装失败
**解决**: 确保使用 pnpm 作为包管理器

**问题**: 构建超时
**解决**: 增加构建超时时间或优化构建过程

#### 6. 本地测试

在部署前，可以在本地测试构建：

```bash
# 进入编辑器应用目录
cd apps/editor

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 启动生产服务器
pnpm start
```

#### 7. 监控部署

- 在 Vercel Dashboard 中查看部署日志
- 检查构建输出和错误信息
- 验证部署后的应用功能

## 注意事项

1. **Monorepo 支持**: 确保 Vercel 正确识别 monorepo 结构
2. **依赖管理**: 使用 pnpm 作为包管理器
3. **环境变量**: 生产环境需要设置相应的环境变量
4. **构建优化**: 考虑使用 Turbo 进行构建优化
5. **缓存策略**: 配置适当的缓存策略以提高性能