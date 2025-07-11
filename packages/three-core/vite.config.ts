import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        lightweight: resolve(__dirname, 'src/lightweight.ts'),
        standard: resolve(__dirname, 'src/standard.ts'),
        full: resolve(__dirname, 'src/full.ts'),
        professional: resolve(__dirname, 'src/professional.ts')
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['three', '@react-face/shared-types'],
      output: {
        // 为每个管理器创建单独的chunk
        manualChunks: {
          // 核心管理器
          'core-scene': ['./src/core/SceneManager.ts'],
          'core-camera': ['./src/core/CameraManager.ts'],
          'core-renderer': ['./src/core/RenderManager.ts'],
          'core-controls': ['./src/core/ControlsManager.ts'],
          
          // 渲染相关管理器
          'rendering-lights': ['./src/core/LightManager.ts'],
          'rendering-materials': ['./src/core/MaterialManager.ts'],
          'rendering-geometries': ['./src/core/GeometryManager.ts'],
          'rendering-textures': ['./src/core/TextureManager.ts'],
          'rendering-environment': ['./src/core/EnvironmentManager.ts'],
          'rendering-particles': ['./src/core/ParticleManager.ts'],
          'rendering-shaders': ['./src/core/ShaderManager.ts'],
          
          // 高级渲染管理器
          'advanced-raytracing': ['./src/core/RayTracingManager.ts'],
          'advanced-deferred': ['./src/core/DeferredManager.ts'],
          'advanced-volumetric': ['./src/core/VolumetricManager.ts'],
          'advanced-composer': ['./src/core/ComposerManager.ts'],
          
          // 动画相关管理器
          'animation-main': ['./src/core/AnimationManager.ts'],
          'animation-morph': ['./src/core/MorphManager.ts'],
          'animation-skeleton': ['./src/core/SkeletonManager.ts'],
          
          // 物理相关管理器
          'physics-main': ['./src/core/PhysicsManager.ts'],
          'physics-fluid': ['./src/core/FluidManager.ts'],
          
          // 音频管理器
          'audio-main': ['./src/core/AudioManager.ts'],
          
          // 优化相关管理器
          'optimization-performance': ['./src/core/PerformanceManager.ts'],
          'optimization-monitor': ['./src/core/MonitorManager.ts'],
          'optimization-memory': ['./src/core/MemoryManager.ts'],
          'optimization-recovery': ['./src/core/RecoveryManager.ts'],
          'optimization-instance': ['./src/core/InstanceManager.ts'],
          'optimization-lod': ['./src/core/LODManager.ts'],
          'optimization-main': ['./src/core/OptimizationManager.ts'],
          
          // 工具管理器
          'utility-events': ['./src/core/EventManager.ts'],
          'utility-helpers': ['./src/core/HelperManager.ts'],
          'utility-ui': ['./src/core/UIManager.ts'],
          'utility-export': ['./src/core/ExportManager.ts'],
          'utility-database': ['./src/core/DatabaseManager.ts'],
          'utility-objects': ['./src/core/ObjectManager.ts'],
          'utility-loader': ['./src/core/LoaderManager.ts'],
          'utility-error': ['./src/core/ErrorManager.ts'],
          'utility-viewhelper': ['./src/core/ViewHelperManager.ts'],
          'utility-procedural': ['./src/core/ProceduralManager.ts'],
          
          // 核心工具
          'core-engine': ['./src/core/Engine.ts'],
          'core-factory': ['./src/core/ManagerFactory.ts'],
          'core-registry': ['./src/core/ManagerRegistry.ts'],
          'core-signal': ['./src/core/Signal.ts']
        },
        // 确保每个chunk都有合适的名称
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId) {
            const name = facadeModuleId.split('/').pop()?.replace('.ts', '');
            return `chunks/${name}.js`;
          }
          return 'chunks/[name]-[hash].js';
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    target: 'es2020'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: []
});
