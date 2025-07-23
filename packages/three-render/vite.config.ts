import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      vue({
        script: {
          // 在production模式下禁用类型检查
          defineModel: true,
          propsDestructure: true
        }
      }),
      // 只在非production模式下生成类型声明文件
      !isProduction && dts({
        include: ['src/**/*.ts', 'src/**/*.d.ts', 'src/**/*.vue'],
        staticImport: true,
        insertTypesEntry: true,
        skipDiagnostics: isProduction,
        logDiagnostics: !isProduction
      })
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'ThreeRender',
        fileName: 'three-render'
      },
      rollupOptions: {
        external: ['vue', 'three', 'cannon-es', 'postprocessing'],
        output: {
          globals: {
            vue: 'Vue',
            three: 'THREE',
            'cannon-es': 'CANNON',
            'postprocessing': 'POSTPROCESSING'
          }
        }
      },
      // 在production模式下禁用类型检查
      minify: isProduction ? 'terser' : false,
      sourcemap: !isProduction,
      // 在production模式下禁用类型检查
      reportCompressedSize: !isProduction
    },
    esbuild: {
      // 在production模式下禁用类型检查
      tsconfigRaw: isProduction ? { compilerOptions: { skipLibCheck: true, skipDefaultLibCheck: true } } : undefined
    },
    optimizeDeps: {
      exclude: ['vue-demi']
    }
  };
}); 