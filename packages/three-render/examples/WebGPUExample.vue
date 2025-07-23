<template>
  <div class="webgpu-example">
    <ThreeCanvas v-if="!useWebGPU" :width="800" :height="600" :shadows="true" :antialias="true">
      <ThreeScene :background="0x87CEEB">
        <ThreeCamera :position="[0, 5, 10]" :lookAt="[0, 0, 0]" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.5" />
        <ThreeDirectionalLight :position="[5, 10, 5]" :intensity="1" :cast-shadow="true" />
        
        <!-- 3D内容 -->
        <ThreeContent />
        
        <!-- 控制器 -->
        <ThreeOrbitControls />
        
        <!-- 性能监控 -->
        <ThreeStats 
          :show-fps="true" 
          :show-ms="true" 
          :show-mem="true"
          position="top-right"
          :bg-color="'rgba(0, 0, 0, 0.7)'"
        />
      </ThreeScene>
    </ThreeCanvas>
    
    <!-- WebGPU渲染器 -->
    <div v-else class="webgpu-container">
      <ThreeWebGPURenderer
        :width="800"
        :height="600"
        :antialias="true"
        :power-preference="'high-performance'"
        @initialized="onWebGPUInitialized"
        @error="onWebGPUError"
        v-slot="{ isSupported, isInitialized }"
      >
        <div v-if="isSupported && isInitialized">
          <ThreeScene :background="0x87CEEB">
            <ThreeCamera :position="[0, 5, 10]" :lookAt="[0, 0, 0]" />
            
            <!-- 灯光 -->
            <ThreeAmbientLight :intensity="0.5" />
            <ThreeDirectionalLight :position="[5, 10, 5]" :intensity="1" :cast-shadow="true" />
            
            <!-- 3D内容 -->
            <ThreeContent />
            
            <!-- 控制器 -->
            <ThreeOrbitControls />
            
            <!-- 性能监控 -->
            <ThreeStats 
              :show-fps="true" 
              :show-ms="true" 
              :show-mem="true"
              position="top-right"
              :bg-color="'rgba(0, 0, 0, 0.7)'"
            />
          </ThreeScene>
        </div>
        <template #not-supported>
          <div class="error-message">
            <h3>WebGPU不受支持</h3>
            <p>您的浏览器不支持WebGPU。请尝试使用最新版本的Chrome或Edge。</p>
            <button @click="useWebGPU = false">切换到WebGL</button>
          </div>
        </template>
      </ThreeWebGPURenderer>
    </div>
    
    <div class="controls">
      <h3>渲染模式</h3>
      <div class="render-mode">
        <label>
          <input type="radio" v-model="useWebGPU" :value="false" />
          WebGL
        </label>
        <label>
          <input type="radio" v-model="useWebGPU" :value="true" />
          WebGPU
        </label>
      </div>
      
      <div v-if="webgpuStatus" class="status">
        <h4>WebGPU状态</h4>
        <pre>{{ webgpuStatus }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  ThreeCanvas, 
  ThreeScene, 
  ThreeCamera, 
  ThreeAmbientLight, 
  ThreeDirectionalLight,
  ThreeOrbitControls,
  ThreeStats,
  ThreeWebGPURenderer
} from '../src';
import ThreeContent from './components/ThreeContent.vue';
import { isWebGPUSupported } from '../src/utils';

// 渲染模式
const useWebGPU = ref<boolean>(false);
const webgpuStatus = ref<string>('');

// 检查WebGPU支持
const checkWebGPUSupport = async () => {
  try {
    const supported = await isWebGPUSupported();
    webgpuStatus.value = supported 
      ? '✅ WebGPU支持已检测到' 
      : '❌ WebGPU不受支持';
    
    // 如果支持WebGPU，默认使用它
    if (supported) {
      useWebGPU.value = true;
    }
  } catch (error) {
    webgpuStatus.value = `❌ WebGPU检测错误: ${error.message}`;
    useWebGPU.value = false;
  }
};

// WebGPU初始化回调
const onWebGPUInitialized = (renderer: any) => {
  webgpuStatus.value = `✅ WebGPU已初始化\n设备: ${renderer.getContext().getPreferredFormat(renderer.getAdapter())}`;
};

// WebGPU错误回调
const onWebGPUError = (error: Error) => {
  webgpuStatus.value = `❌ WebGPU错误: ${error.message}`;
  useWebGPU.value = false;
};

// 组件挂载时检查WebGPU支持
checkWebGPUSupport();
</script>

<style scoped>
.webgpu-example {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.webgpu-container {
  width: 800px;
  height: 600px;
  position: relative;
}

.controls {
  margin-top: 16px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
  width: 800px;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.render-mode {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.status {
  margin-top: 10px;
  padding: 10px;
  background-color: #eee;
  border-radius: 4px;
}

h4 {
  margin-top: 0;
  margin-bottom: 5px;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: monospace;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
}

button {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background-color: #45a049;
}
</style> 