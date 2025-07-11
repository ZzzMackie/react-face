import { defineConfig } from 'vite'
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
// https://vite.dev/config/
export default defineConfig({
  resolve: {
      alias: {
        '@': resolve(__dirname, './')
      }
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'ThreeCore',
        fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
        formats: ['es', 'cjs', 'umd']
      },
      rollupOptions: {
        external: ['three'],
        output: {
          globals: {
            three: 'THREE'
          }
        }
      },
      sourcemap: true,
      minify: 'terser',
      target: 'es2018'
    },
    plugins: [
      dts({
        insertTypesEntry: true,
        exclude: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*']
      })
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts']
    },
    server: {
      port: 3000,
      open: true,
      fs: {
        allow: ['..']
      }
    },
    preview: {
      port: 4173,
      open: true
    },
    optimizeDeps: {
      include: ['three']
    }
})
