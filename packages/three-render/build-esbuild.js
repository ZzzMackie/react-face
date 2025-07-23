import * as esbuild from 'esbuild';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

// 确保dist目录存在
const distDir = resolve(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

async function buildLib() {
  try {
    // 构建ESM版本
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      outfile: 'dist/three-render.esm.js',
      bundle: true,
      platform: 'neutral',
      format: 'esm',
      external: ['vue', 'three', 'cannon-es', 'postprocessing'],
      minify: true,
      sourcemap: true,
      logLevel: 'info',
      loader: {
        '.vue': 'text', // 将Vue文件作为文本导入，后续可以替换为适当的Vue处理器
      }
    });

    // 构建CJS版本
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      outfile: 'dist/three-render.cjs.js',
      bundle: true,
      platform: 'node',
      format: 'cjs',
      external: ['vue', 'three', 'cannon-es', 'postprocessing'],
      minify: true,
      sourcemap: true,
      logLevel: 'info',
      loader: {
        '.vue': 'text', // 将Vue文件作为文本导入，后续可以替换为适当的Vue处理器
      }
    });

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildLib(); 