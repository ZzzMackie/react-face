<template>
  <div class="three-resource-example">
    <ThreeCanvas :width="800" :height="600">
      <ThreeResourceManager 
        @ready="handleResourceManagerReady" 
        @progress="handleProgress" 
        @complete="handleComplete"
      >
        <ThreeScene :background="0x222222">
          <ThreeCamera :position="[0, 2, 5]" :lookAt="[0, 0, 0]" />
          
          <!-- 辅助对象 -->
          <ThreeAxesHelper :size="3" />
          <ThreeGridHelper :size="10" :divisions="10" />
          
          <!-- 灯光 -->
          <ThreeAmbientLight :intensity="0.5" />
          <ThreeDirectionalLight :position="[3, 5, 3]" :intensity="1" :cast-shadow="true" />
          <ThreePointLight :position="[-3, 3, -3]" :intensity="0.7" :color="0x00ffff" />
          
          <!-- 纹理示例 - 立方体 -->
          <ThreeTextureLoader 
            v-if="selectedTexture" 
            :url="selectedTexture" 
            @ready="handleTextureReady" 
            @load="handleTextureLoad"
          >
            <template v-slot="{ texture }">
              <ThreeMesh :position="[2, 1, 0]" :rotation="[0, rotationY, 0]" :cast-shadow="true">
                <ThreeBoxGeometry :width="1" :height="1" :depth="1" />
                <ThreeMeshStandardMaterial :map="texture" :metalness="0.3" :roughness="0.7" />
              </ThreeMesh>
            </template>
          </ThreeTextureLoader>
          
          <!-- 模型示例 -->
          <ThreeModelLoader
            v-if="selectedModel"
            :url="selectedModel"
            :position="[-2, 0, 0]"
            :rotation="[0, rotationY * 0.5, 0]"
            :scale="modelScale"
            :cast-shadow="true"
            :receive-shadow="true"
            @ready="handleModelReady"
            @load="handleModelLoad"
            @add="handleModelAdd"
          >
            <!-- 可以在这里使用模型和动画 -->
            <template v-slot="{ model, animations }">
              <!-- 可以在这里添加模型相关的组件，例如动画混合器 -->
              <ThreeAnimationMixer 
                v-if="animations && animations.length > 0" 
                :animations="animations" 
                :autoplay="true"
                :clip-index="0"
              />
            </template>
          </ThreeModelLoader>
          
          <!-- 平面 - 用于接收阴影 -->
          <ThreeMesh :position="[0, -0.01, 0]" :rotation="[-Math.PI/2, 0, 0]" :receive-shadow="true">
            <ThreePlaneGeometry :width="10" :height="10" />
            <ThreeMeshStandardMaterial :color="0xdddddd" />
          </ThreeMesh>
          
          <!-- 控制器 -->
          <ThreeOrbitControls />
          
          <!-- 性能监控 -->
          <ThreeStats position="top-right" />
        </ThreeScene>
      </ThreeResourceManager>
    </ThreeCanvas>
    
    <div class="controls-panel">
      <h2>资源管理示例</h2>
      
      <div class="progress-bar" v-if="loading">
        <div class="progress-fill" :style="{ width: `${progress * 100}%` }"></div>
        <span class="progress-text">加载中... {{ Math.round(progress * 100) }}%</span>
      </div>
      
      <div class="control-group">
        <h3>纹理加载</h3>
        
        <div class="select-group">
          <label for="texture-select">选择纹理：</label>
          <select id="texture-select" v-model="selectedTexture">
            <option value="">-- 选择纹理 --</option>
            <option v-for="(texture, index) in availableTextures" :key="index" :value="texture.url">
              {{ texture.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="control-group">
        <h3>模型加载</h3>
        
        <div class="select-group">
          <label for="model-select">选择模型：</label>
          <select id="model-select" v-model="selectedModel">
            <option value="">-- 选择模型 --</option>
            <option v-for="(model, index) in availableModels" :key="index" :value="model.url">
              {{ model.name }}
            </option>
          </select>
        </div>
        
        <div class="slider-group">
          <label for="model-scale">模型缩放：{{ modelScale.toFixed(2) }}</label>
          <input type="range" id="model-scale" v-model.number="modelScale" min="0.1" max="2" step="0.01" />
        </div>
      </div>
      
      <div class="info-panel">
        <h3>资源信息</h3>
        <p>当前纹理：{{ currentTexture || '无' }}</p>
        <p>当前模型：{{ currentModel || '无' }}</p>
        <p>模型动画数：{{ animationsCount }}</p>
        
        <h3>事件日志</h3>
        <ul class="event-log">
          <li v-for="(log, index) in eventLogs.slice().reverse()" :key="index">
            {{ log }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { 
  ThreeCanvas, 
  ThreeScene, 
  ThreeCamera, 
  ThreeMesh, 
  ThreeBoxGeometry,
  ThreePlaneGeometry,
  ThreeMeshStandardMaterial,
  ThreeAmbientLight, 
  ThreeDirectionalLight,
  ThreePointLight,
  ThreeOrbitControls,
  ThreeResourceManager,
  ThreeTextureLoader,
  ThreeModelLoader,
  ThreeAnimationMixer,
  ThreeStats,
  ThreeAxesHelper,
  ThreeGridHelper
} from '../src';

export default {
  components: {
    ThreeCanvas,
    ThreeScene,
    ThreeCamera,
    ThreeMesh,
    ThreeBoxGeometry,
    ThreePlaneGeometry,
    ThreeMeshStandardMaterial,
    ThreeAmbientLight,
    ThreeDirectionalLight,
    ThreePointLight,
    ThreeOrbitControls,
    ThreeResourceManager,
    ThreeTextureLoader,
    ThreeModelLoader,
    ThreeAnimationMixer,
    ThreeStats,
    ThreeAxesHelper,
    ThreeGridHelper
  },
  setup() {
    // 加载状态
    const loading = ref(false);
    const progress = ref(0);
    
    // 旋转
    const rotationY = ref(0);
    
    // 选中的资源
    const selectedTexture = ref('');
    const selectedModel = ref('');
    const modelScale = ref(1);
    
    // 当前资源信息
    const currentTexture = ref('');
    const currentModel = ref('');
    const animationsCount = ref(0);
    
    // 可用纹理列表
    const availableTextures = reactive([
      { name: '砖墙', url: 'https://threejs.org/examples/textures/brick_diffuse.jpg' },
      { name: '木板', url: 'https://threejs.org/examples/textures/hardwood2_diffuse.jpg' },
      { name: '大理石', url: 'https://threejs.org/examples/textures/marble.jpg' },
      { name: '地球', url: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg' },
      { name: '圆形', url: 'https://threejs.org/examples/textures/circles.jpg' },
      { name: '皮革', url: 'https://threejs.org/examples/textures/leather.jpg' }
    ]);
    
    // 可用模型列表
    const availableModels = reactive([
      { name: 'FlightHelmet', url: 'https://threejs.org/examples/models/gltf/FlightHelmet/glTF/FlightHelmet.gltf' },
      { name: 'DamagedHelmet', url: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf' },
      { name: 'Duck', url: 'https://threejs.org/examples/models/gltf/Duck/glTF/Duck.gltf' },
      { name: 'Fox', url: 'https://threejs.org/examples/models/gltf/Fox/glTF/Fox.gltf' }
    ]);
    
    // 事件日志
    const eventLogs = ref([]);
    
    // 添加事件日志
    const addEventLog = (message) => {
      const timestamp = new Date().toLocaleTimeString();
      eventLogs.value.push(`[${timestamp}] ${message}`);
      
      // 限制日志长度
      if (eventLogs.value.length > 10) {
        eventLogs.value.shift();
      }
    };
    
    // 处理资源管理器就绪
    const handleResourceManagerReady = (event) => {
      addEventLog('资源管理器已就绪');
    };
    
    // 处理进度更新
    const handleProgress = (event) => {
      loading.value = event.progress < 1;
      progress.value = event.progress;
      
      // 不要为每个进度更新添加日志，这会导致日志过多
      // 只在重要的进度点添加
      if (event.progress === 0 || event.progress === 1 || Math.round(event.progress * 100) % 25 === 0) {
        addEventLog(`资源加载进度: ${Math.round(event.progress * 100)}%`);
      }
    };
    
    // 处理加载完成
    const handleComplete = (event) => {
      loading.value = false;
      progress.value = 1;
      addEventLog('所有资源加载完成');
    };
    
    // 处理纹理就绪
    const handleTextureReady = (event) => {
      addEventLog('纹理加载器已就绪');
    };
    
    // 处理纹理加载
    const handleTextureLoad = (event) => {
      currentTexture.value = selectedTexture.value.split('/').pop();
      addEventLog(`纹理已加载: ${currentTexture.value}`);
    };
    
    // 处理模型就绪
    const handleModelReady = (event) => {
      addEventLog('模型加载器已就绪');
    };
    
    // 处理模型加载
    const handleModelLoad = (event) => {
      currentModel.value = selectedModel.value.split('/').pop();
      animationsCount.value = event.animations.length;
      addEventLog(`模型已加载: ${currentModel.value}，包含 ${animationsCount.value} 个动画`);
    };
    
    // 处理模型添加
    const handleModelAdd = (event) => {
      addEventLog('模型已添加到场景');
    };
    
    // 动画循环
    let animationFrame;
    
    const animate = () => {
      rotationY.value += 0.01;
      animationFrame = requestAnimationFrame(animate);
    };
    
    // 组件挂载和卸载
    onMounted(() => {
      // 默认选择第一个纹理和模型
      if (availableTextures.length > 0) {
        selectedTexture.value = availableTextures[0].url;
      }
      
      if (availableModels.length > 0) {
        selectedModel.value = availableModels[0].url;
      }
      
      // 开始动画
      animate();
    });
    
    onBeforeUnmount(() => {
      // 清理动画
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    });
    
    return {
      loading,
      progress,
      rotationY,
      selectedTexture,
      selectedModel,
      modelScale,
      currentTexture,
      currentModel,
      animationsCount,
      availableTextures,
      availableModels,
      eventLogs,
      handleResourceManagerReady,
      handleProgress,
      handleComplete,
      handleTextureReady,
      handleTextureLoad,
      handleModelReady,
      handleModelLoad,
      handleModelAdd
    };
  }
};
</script>

<style scoped>
.three-resource-example {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.controls-panel {
  padding: 20px;
  width: 300px;
  background-color: #f5f5f5;
  border-left: 1px solid #ddd;
  overflow-y: auto;
}

h2 {
  margin-top: 0;
  color: #333;
}

h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #555;
}

.progress-bar {
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  margin-bottom: 20px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  font-size: 12px;
}

.control-group {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.select-group {
  margin-bottom: 15px;
}

.select-group label {
  display: block;
  margin-bottom: 5px;
}

.select-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.slider-group {
  margin-bottom: 15px;
}

.slider-group label {
  display: block;
  margin-bottom: 5px;
}

.slider-group input {
  width: 100%;
}

.info-panel {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.event-log {
  max-height: 200px;
  overflow-y: auto;
  padding-left: 20px;
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.event-log li {
  margin-bottom: 8px;
  font-size: 14px;
}
</style> 