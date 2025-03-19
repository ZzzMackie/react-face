import { defineConfig } from 'vite'
import { resolve } from 'path';
import { terser } from 'rollup-plugin-terser';
// https://vite.dev/config/
export default defineConfig({
  resolve: {
      alias: {
        '@': resolve(__dirname, './')
      }
    },
    build: {
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry: resolve(__dirname, './main.ts'),
        name: 'three-core',
        // the proper extensions will be added
        fileName: 'three-core'
      },
      rollupOptions: {
        cache: true,
        plugins: [
          terser({
            compress: {
              drop_console: true
            }
          })
        ]
      }
    },
})
