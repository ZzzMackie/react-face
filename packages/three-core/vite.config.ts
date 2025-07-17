import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        // 主要入口文件
        index: resolve(__dirname, 'src/index.ts'),
        standard: resolve(__dirname, 'src/standard.ts'),
        lightweight: resolve(__dirname, 'src/lightweight.ts'),
        full: resolve(__dirname, 'src/full.ts'),
        professional: resolve(__dirname, 'src/professional.ts'),
        'test-core': resolve(__dirname, 'src/test-core.ts'),
        
        // Engine 和核心类
        Engine: resolve(__dirname, 'src/core/Engine.ts'),
        Signal: resolve(__dirname, 'src/core/Signal.ts'),
        Proxy: resolve(__dirname, 'src/core/Proxy.ts'),
        ManagerFactory: resolve(__dirname, 'src/core/ManagerFactory.ts'),
        ManagerRegistry: resolve(__dirname, 'src/core/ManagerRegistry.ts'),
        DynamicManagerRegistry: resolve(__dirname, 'src/core/DynamicManagerRegistry.ts'),
        
        // 所有 Manager 类
        AnimationManager: resolve(__dirname, 'src/core/AnimationManager.ts'),
        AssetManager: resolve(__dirname, 'src/core/AssetManager.ts'),
        AudioManager: resolve(__dirname, 'src/core/AudioManager.ts'),
        CameraManager: resolve(__dirname, 'src/core/CameraManager.ts'),
        ComposerManager: resolve(__dirname, 'src/core/ComposerManager.ts'),
        ConfigManager: resolve(__dirname, 'src/core/ConfigManager.ts'),
        ControlsManager: resolve(__dirname, 'src/core/ControlsManager.ts'),
        DatabaseManager: resolve(__dirname, 'src/core/DatabaseManager.ts'),
        DeferredManager: resolve(__dirname, 'src/core/DeferredManager.ts'),
        EnvironmentManager: resolve(__dirname, 'src/core/EnvironmentManager.ts'),
        ErrorManager: resolve(__dirname, 'src/core/ErrorManager.ts'),
        EventManager: resolve(__dirname, 'src/core/EventManager.ts'),
        ExportManager: resolve(__dirname, 'src/core/ExportManager.ts'),
        FluidManager: resolve(__dirname, 'src/core/FluidManager.ts'),
        GeometryManager: resolve(__dirname, 'src/core/GeometryManager.ts'),
        GlobalIlluminationManager: resolve(__dirname, 'src/core/GlobalIlluminationManager.ts'),
        HelperManager: resolve(__dirname, 'src/core/HelperManager.ts'),
        InstanceManager: resolve(__dirname, 'src/core/InstanceManager.ts'),
        LightManager: resolve(__dirname, 'src/core/LightManager.ts'),
        LoaderManager: resolve(__dirname, 'src/core/LoaderManager.ts'),
        LODManager: resolve(__dirname, 'src/core/LODManager.ts'),
        MaterialManager: resolve(__dirname, 'src/core/MaterialManager.ts'),
        MemoryManager: resolve(__dirname, 'src/core/MemoryManager.ts'),
        MonitorManager: resolve(__dirname, 'src/core/MonitorManager.ts'),
        MorphManager: resolve(__dirname, 'src/core/MorphManager.ts'),
        ObjectManager: resolve(__dirname, 'src/core/ObjectManager.ts'),
        OptimizationManager: resolve(__dirname, 'src/core/OptimizationManager.ts'),
        ParticleManager: resolve(__dirname, 'src/core/ParticleManager.ts'),
        PerformanceManager: resolve(__dirname, 'src/core/PerformanceManager.ts'),
        PhysicsManager: resolve(__dirname, 'src/core/PhysicsManager.ts'),
        ProceduralManager: resolve(__dirname, 'src/core/ProceduralManager.ts'),
        RayTracingManager: resolve(__dirname, 'src/core/RayTracingManager.ts'),
        RecoveryManager: resolve(__dirname, 'src/core/RecoveryManager.ts'),
        RenderManager: resolve(__dirname, 'src/core/RenderManager.ts'),
        SceneManager: resolve(__dirname, 'src/core/SceneManager.ts'),
        ScreenSpaceReflectionManager: resolve(__dirname, 'src/core/ScreenSpaceReflectionManager.ts'),
        ShaderManager: resolve(__dirname, 'src/core/ShaderManager.ts'),
        SkeletonManager: resolve(__dirname, 'src/core/SkeletonManager.ts'),
        TextureManager: resolve(__dirname, 'src/core/TextureManager.ts'),
        UIManager: resolve(__dirname, 'src/core/UIManager.ts'),
        ViewHelperManager: resolve(__dirname, 'src/core/ViewHelperManager.ts'),
        VolumetricFogManager: resolve(__dirname, 'src/core/VolumetricFogManager.ts'),
        VolumetricManager: resolve(__dirname, 'src/core/VolumetricManager.ts'),
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      external: ['three', '@react-face/shared-types'],
      output: {
        // 确保chunk文件使用ESM格式
        format: 'es'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
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
