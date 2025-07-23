<template>
  <div class="three-animation-example">
    <ThreeCanvas :width="800" :height="600">
      <ThreeScene :background="0x87CEEB">
        <ThreeCamera :position="[0, 5, 10]" :lookAt="[0, 0, 0]" />
        
        <!-- 辅助对象 -->
        <ThreeAxesHelper :size="5" />
        <ThreeGridHelper :size="20" :divisions="20" :position="[0, 0.01, 0]" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.5" />
        <ThreeDirectionalLight :position="[5, 10, 5]" :intensity="1" :cast-shadow="true" />
        <ThreePointLight :position="[-5, 5, -5]" :intensity="0.8" :distance="20" :color="0x00ffff" :cast-shadow="true" />
        
        <!-- 3D模型 -->
        <ThreeMesh 
          v-if="model" 
          :object="model" 
          :position="[0, 0, 0]" 
          :rotation="[0, 0, 0]" 
          :scale="[1, 1, 1]" 
          :cast-shadow="true" 
          :receive-shadow="true"
        >
          <!-- 动画混合器 -->
          <ThreeAnimationMixer 
            :enabled="true" 
            :time-scale="timeScale" 
            :debug="debug"
            @ready="handleMixerReady"
            @update="handleMixerUpdate"
            @finished="handleAnimationFinished"
          >
            <!-- 动画剪辑 -->
            <ThreeAnimationClip 
              v-for="clip in animationClips" 
              :key="clip.name"
              :name="clip.name"
              :auto-play="clip.name === currentAnimation"
              :loop="loopAnimation"
              :repetitions="repetitions"
              :clamp-when-finished="clampWhenFinished"
              :time-scale="clip.timeScale || 1.0"
              :weight="clip.weight || 1.0"
              :fade-in="fadeInTime"
              :enabled="clip.enabled !== false"
              @ready="handleClipReady(clip.name, $event)"
              @play="handleClipPlay(clip.name, $event)"
              @finished="handleClipFinished(clip.name, $event)"
            />
          </ThreeAnimationMixer>
        </ThreeMesh>
        
        <!-- 控制器 -->
        <ThreeOrbitControls />
        
        <!-- 性能监控 -->
        <ThreeStats position="top-right" />
      </ThreeScene>
    </ThreeCanvas>
    
    <div class="controls-panel">
      <h2>动画系统示例</h2>
      
      <div v-if="isLoading" class="loading-section">
        <p>加载中...</p>
        <div class="progress-bar">
          <div class="progress" :style="{ width: `${loadingProgress}%` }"></div>
        </div>
      </div>
      
      <template v-else>
        <div class="control-group">
          <h3>模型信息</h3>
          <p>模型名称: {{ modelInfo.name || '未知' }}</p>
          <p>动画数量: {{ animationClips.length }}</p>
          <p>当前动画: {{ currentAnimation || '无' }}</p>
        </div>
        
        <div class="control-group">
          <h3>动画控制</h3>
          
          <div class="select-group">
            <label>选择动画:</label>
            <select v-model="currentAnimation" @change="playAnimation">
              <option v-for="clip in animationClips" :key="clip.name" :value="clip.name">
                {{ clip.name }}
              </option>
            </select>
          </div>
          
          <div class="button-group">
            <button @click="playAnimation" :disabled="!currentAnimation">播放</button>
            <button @click="pauseAnimation" :disabled="!isPlaying">暂停</button>
            <button @click="stopAnimation">停止</button>
          </div>
          
          <div class="checkbox-group">
            <label>
              <input type="checkbox" v-model="loopAnimation" />
              循环播放
            </label>
            
            <label>
              <input type="checkbox" v-model="clampWhenFinished" />
              结束时保持最后一帧
            </label>
            
            <label>
              <input type="checkbox" v-model="debug" />
              调试模式
            </label>
          </div>
        </div>
        
        <div class="control-group">
          <h3>动画参数</h3>
          
          <div class="slider-group">
            <label>时间缩放: {{ timeScale.toFixed(2) }}</label>
            <input type="range" v-model.number="timeScale" min="0.1" max="2" step="0.1" />
          </div>
          
          <div class="slider-group">
            <label>淡入时间: {{ fadeInTime.toFixed(2) }} 秒</label>
            <input type="range" v-model.number="fadeInTime" min="0" max="2" step="0.1" />
          </div>
          
          <div class="input-group">
            <label>重复次数:</label>
            <input 
              type="number" 
              v-model.number="repetitions" 
              min="1" 
              :max="loopAnimation ? Infinity : 10" 
              :disabled="loopAnimation"
            />
          </div>
        </div>
        
        <div class="info-panel">
          <h3>动画事件</h3>
          <ul class="event-log">
            <li v-for="(log, index) in eventLogs.slice().reverse()" :key="index">
              {{ log }}
            </li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { 
  ThreeCanvas, 
  ThreeScene, 
  ThreeCamera, 
  ThreeMesh, 
  ThreeAmbientLight, 
  ThreeDirectionalLight,
  ThreePointLight,
  ThreeOrbitControls,
  ThreeAnimationMixer,
  ThreeAnimationClip,
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
    ThreeAmbientLight,
    ThreeDirectionalLight,
    ThreePointLight,
    ThreeOrbitControls,
    ThreeAnimationMixer,
    ThreeAnimationClip,
    ThreeStats,
    ThreeAxesHelper,
    ThreeGridHelper
  },
  setup() {
    // 模型引用
    const model = ref(null);
    
    // 模型信息
    const modelInfo = reactive({
      name: '',
      path: '',
      format: ''
    });
    
    // 加载状态
    const isLoading = ref(true);
    const loadingProgress = ref(0);
    
    // 动画混合器引用
    const mixer = ref(null);
    
    // 动画剪辑列表
    const animationClips = ref([]);
    
    // 当前动画
    const currentAnimation = ref('');
    
    // 播放状态
    const isPlaying = ref(false);
    const isPaused = ref(false);
    
    // 动画参数
    const timeScale = ref(1.0);
    const fadeInTime = ref(0.5);
    const loopAnimation = ref(true);
    const repetitions = ref(1);
    const clampWhenFinished = ref(false);
    
    // 调试模式
    const debug = ref(false);
    
    // 事件日志
    const eventLogs = ref([]);
    
    // 加载模型
    const loadModel = async () => {
      isLoading.value = true;
      loadingProgress.value = 0;
      
      try {
        // 动态导入 GLTFLoader
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        
        // 创建加载器
        const loader = new GLTFLoader();
        
        // 设置加载进度回调
        loader.onProgress = (xhr) => {
          if (xhr.lengthComputable) {
            loadingProgress.value = Math.round((xhr.loaded / xhr.total) * 100);
          }
        };
        
        // 加载模型
        // 这里使用一个示例模型URL，实际使用时请替换为有效的URL
        const modelUrl = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';
        
        // 加载模型
        const gltf = await new Promise((resolve, reject) => {
          loader.load(
            modelUrl,
            resolve,
            undefined,
            reject
          );
        });
        
        // 设置模型
        model.value = gltf.scene;
        
        // 设置模型信息
        modelInfo.name = 'RobotExpressive';
        modelInfo.path = modelUrl;
        modelInfo.format = 'glb';
        
        // 设置动画剪辑
        if (gltf.animations && gltf.animations.length > 0) {
          // 将动画剪辑添加到模型
          model.value.animations = gltf.animations;
          
          // 设置动画剪辑列表
          animationClips.value = gltf.animations.map(clip => ({
            name: clip.name,
            duration: clip.duration,
            enabled: true
          }));
          
          // 设置默认动画
          if (animationClips.value.length > 0) {
            currentAnimation.value = animationClips.value[0].name;
          }
          
          addEventLog(`加载了 ${animationClips.value.length} 个动画剪辑`);
        } else {
          addEventLog('模型没有动画');
        }
        
        // 处理模型
        setupModel(model.value);
        
        isLoading.value = false;
      } catch (error) {
        console.error('Failed to load model:', error);
        addEventLog(`加载模型失败: ${error.message}`);
        isLoading.value = false;
      }
    };
    
    // 设置模型
    const setupModel = (model) => {
      if (!model) return;
      
      // 遍历模型
      model.traverse((child) => {
        // 设置阴影
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // 缩放模型
      model.scale.set(1, 1, 1);
      
      addEventLog('模型设置完成');
    };
    
    // 播放动画
    const playAnimation = () => {
      if (!currentAnimation.value || !mixer.value) return;
      
      // 播放动画
      const action = mixer.value.play(currentAnimation.value, {
        repetitions: loopAnimation.value ? Infinity : repetitions.value,
        clampWhenFinished: clampWhenFinished.value,
        fadeIn: fadeInTime.value,
        timeScale: timeScale.value
      });
      
      if (action) {
        isPlaying.value = true;
        isPaused.value = false;
        addEventLog(`播放动画: ${currentAnimation.value}`);
      }
    };
    
    // 暂停动画
    const pauseAnimation = () => {
      if (!currentAnimation.value || !mixer.value || !isPlaying.value) return;
      
      // 暂停动画
      mixer.value.pause(currentAnimation.value);
      
      isPaused.value = true;
      addEventLog(`暂停动画: ${currentAnimation.value}`);
    };
    
    // 停止动画
    const stopAnimation = () => {
      if (!mixer.value) return;
      
      // 停止所有动画
      mixer.value.stop();
      
      isPlaying.value = false;
      isPaused.value = false;
      addEventLog('停止所有动画');
    };
    
    // 添加事件日志
    const addEventLog = (message) => {
      const timestamp = new Date().toLocaleTimeString();
      eventLogs.value.push(`[${timestamp}] ${message}`);
      
      // 限制日志长度
      if (eventLogs.value.length > 10) {
        eventLogs.value.shift();
      }
    };
    
    // 处理混合器就绪事件
    const handleMixerReady = (event) => {
      mixer.value = event.mixer;
      addEventLog('动画混合器就绪');
    };
    
    // 处理混合器更新事件
    const handleMixerUpdate = (event) => {
      // 可以在这里添加额外的更新处理逻辑
    };
    
    // 处理动画完成事件
    const handleAnimationFinished = (event) => {
      if (!loopAnimation.value) {
        isPlaying.value = false;
        addEventLog(`动画完成: ${currentAnimation.value}`);
      }
    };
    
    // 处理剪辑就绪事件
    const handleClipReady = (clipName, event) => {
      addEventLog(`动画剪辑就绪: ${clipName}`);
    };
    
    // 处理剪辑播放事件
    const handleClipPlay = (clipName, event) => {
      // 可以在这里添加额外的播放处理逻辑
    };
    
    // 处理剪辑完成事件
    const handleClipFinished = (clipName, event) => {
      // 可以在这里添加额外的完成处理逻辑
    };
    
    // 组件挂载
    onMounted(() => {
      // 加载模型
      loadModel();
    });
    
    return {
      model,
      modelInfo,
      isLoading,
      loadingProgress,
      mixer,
      animationClips,
      currentAnimation,
      isPlaying,
      isPaused,
      timeScale,
      fadeInTime,
      loopAnimation,
      repetitions,
      clampWhenFinished,
      debug,
      eventLogs,
      playAnimation,
      pauseAnimation,
      stopAnimation,
      handleMixerReady,
      handleMixerUpdate,
      handleAnimationFinished,
      handleClipReady,
      handleClipPlay,
      handleClipFinished,
      Infinity
    };
  }
};
</script>

<style scoped>
.three-animation-example {
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

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 10px;
}

.progress {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
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

.select-group select {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.button-group {
  display: flex;
  margin-bottom: 15px;
}

button {
  flex: 1;
  margin-right: 8px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:last-child {
  margin-right: 0;
  background-color: #f44336;
}

button:last-child:hover:not(:disabled) {
  background-color: #d32f2f;
}

.checkbox-group {
  margin-top: 15px;
}

.checkbox-group label {
  display: block;
  margin-bottom: 10px;
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

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
}

.input-group input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
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