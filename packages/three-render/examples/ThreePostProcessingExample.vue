<template>
  <div class="three-postprocessing-example">
    <ThreeCanvas :width="800" :height="600">
      <ThreeScene :background="0x222222">
        <ThreeCamera :position="[0, 5, 10]" :lookAt="[0, 0, 0]" />
        
        <!-- 辅助对象 -->
        <ThreeAxesHelper :size="5" />
        <ThreeGridHelper :size="20" :divisions="20" :position="[0, 0.01, 0]" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.5" />
        <ThreeDirectionalLight :position="[5, 10, 5]" :intensity="1" :cast-shadow="true" />
        <ThreePointLight :position="[-5, 5, -5]" :intensity="0.8" :distance="20" :color="0x00ffff" :cast-shadow="true" />
        
        <!-- 场景对象 -->
        <!-- 地面 -->
        <ThreeMesh :position="[0, -0.5, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
          <ThreePlaneGeometry :width="20" :height="20" />
          <ThreeMeshStandardMaterial :color="0x333333" />
        </ThreeMesh>
        
        <!-- 立方体组 -->
        <ThreeMesh 
          v-for="(cube, index) in cubes" 
          :key="index"
          :position="cube.position" 
          :rotation="cube.rotation" 
          :scale="cube.scale"
          :cast-shadow="true" 
          :receive-shadow="true"
        >
          <ThreeBoxGeometry :width="1" :height="1" :depth="1" />
          <ThreeMeshStandardMaterial :color="cube.color" :metalness="0.5" :roughness="0.5" />
        </ThreeMesh>
        
        <!-- 球体组 -->
        <ThreeMesh 
          v-for="(sphere, index) in spheres" 
          :key="index"
          :position="sphere.position" 
          :cast-shadow="true" 
          :receive-shadow="true"
        >
          <ThreeSphereGeometry :radius="0.5" :width-segments="32" :height-segments="32" />
          <ThreeMeshStandardMaterial :color="sphere.color" :metalness="0.8" :roughness="0.2" />
        </ThreeMesh>
        
        <!-- 后处理 -->
        <ThreePostProcessing>
          <!-- 景深效果 -->
          <ThreeDepthOfFieldEffect 
            :enabled="dofEnabled"
            :focus-distance="focusDistance"
            :focal-length="focalLength"
            :bokeh-scale="bokehScale"
            :debug="dofDebug"
            @ready="handleDofReady"
          />
          
          <!-- 环境光遮蔽效果 -->
          <ThreeAmbientOcclusionEffect 
            :enabled="aoEnabled"
            :radius="aoRadius"
            :bias="aoBias"
            :scale="aoScale"
            :blur-radius="aoBlurRadius"
            :debug="aoDebug"
            @ready="handleAoReady"
          />
          
          <!-- 辉光效果 -->
          <ThreeBloomEffect 
            :enabled="bloomEnabled"
            :strength="bloomStrength"
            :radius="bloomRadius"
            :threshold="bloomThreshold"
            @ready="handleBloomReady"
          />
        </ThreePostProcessing>
        
        <!-- 控制器 -->
        <ThreeOrbitControls />
        
        <!-- 性能监控 -->
        <ThreeStats position="top-right" />
      </ThreeScene>
    </ThreeCanvas>
    
    <div class="controls-panel">
      <h2>后处理效果示例</h2>
      
      <div class="control-group">
        <h3>景深效果</h3>
        
        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="dofEnabled" />
            启用景深
          </label>
          
          <label>
            <input type="checkbox" v-model="dofDebug" />
            调试模式
          </label>
        </div>
        
        <div class="slider-group">
          <label>焦距: {{ focusDistance.toFixed(1) }}</label>
          <input type="range" v-model.number="focusDistance" min="1" max="20" step="0.1" />
        </div>
        
        <div class="slider-group">
          <label>焦距长度: {{ focalLength.toFixed(1) }}</label>
          <input type="range" v-model.number="focalLength" min="1" max="10" step="0.1" />
        </div>
        
        <div class="slider-group">
          <label>散景缩放: {{ bokehScale.toFixed(1) }}</label>
          <input type="range" v-model.number="bokehScale" min="0" max="5" step="0.1" />
        </div>
      </div>
      
      <div class="control-group">
        <h3>环境光遮蔽效果</h3>
        
        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="aoEnabled" />
            启用环境光遮蔽
          </label>
          
          <label>
            <input type="checkbox" v-model="aoDebug" />
            调试模式
          </label>
        </div>
        
        <div class="slider-group">
          <label>半径: {{ aoRadius.toFixed(2) }}</label>
          <input type="range" v-model.number="aoRadius" min="0.1" max="1" step="0.01" />
        </div>
        
        <div class="slider-group">
          <label>偏移: {{ aoBias.toFixed(2) }}</label>
          <input type="range" v-model.number="aoBias" min="0" max="1" step="0.01" />
        </div>
        
        <div class="slider-group">
          <label>缩放: {{ aoScale.toFixed(2) }}</label>
          <input type="range" v-model.number="aoScale" min="0.5" max="2" step="0.01" />
        </div>
        
        <div class="slider-group">
          <label>模糊半径: {{ aoBlurRadius }}</label>
          <input type="range" v-model.number="aoBlurRadius" min="0" max="4" step="1" />
        </div>
      </div>
      
      <div class="control-group">
        <h3>辉光效果</h3>
        
        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="bloomEnabled" />
            启用辉光
          </label>
        </div>
        
        <div class="slider-group">
          <label>强度: {{ bloomStrength.toFixed(2) }}</label>
          <input type="range" v-model.number="bloomStrength" min="0" max="2" step="0.01" />
        </div>
        
        <div class="slider-group">
          <label>半径: {{ bloomRadius.toFixed(2) }}</label>
          <input type="range" v-model.number="bloomRadius" min="0" max="1" step="0.01" />
        </div>
        
        <div class="slider-group">
          <label>阈值: {{ bloomThreshold.toFixed(2) }}</label>
          <input type="range" v-model.number="bloomThreshold" min="0" max="1" step="0.01" />
        </div>
      </div>
      
      <div class="control-group">
        <h3>场景控制</h3>
        
        <div class="button-group">
          <button @click="randomizeCubes">随机立方体</button>
          <button @click="randomizeSpheres">随机球体</button>
        </div>
        
        <div class="button-group">
          <button @click="resetScene">重置场景</button>
        </div>
      </div>
      
      <div class="info-panel">
        <h3>效果状态</h3>
        <p>景深效果: {{ dofEnabled ? '已启用' : '已禁用' }}</p>
        <p>环境光遮蔽: {{ aoEnabled ? '已启用' : '已禁用' }}</p>
        <p>辉光效果: {{ bloomEnabled ? '已启用' : '已禁用' }}</p>
        
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
import { ref, reactive, onMounted } from 'vue';
import { 
  ThreeCanvas, 
  ThreeScene, 
  ThreeCamera, 
  ThreeMesh, 
  ThreeBoxGeometry,
  ThreePlaneGeometry,
  ThreeSphereGeometry,
  ThreeMeshStandardMaterial,
  ThreeAmbientLight, 
  ThreeDirectionalLight,
  ThreePointLight,
  ThreeOrbitControls,
  ThreePostProcessing,
  ThreeDepthOfFieldEffect,
  ThreeAmbientOcclusionEffect,
  ThreeBloomEffect,
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
    ThreeSphereGeometry,
    ThreeMeshStandardMaterial,
    ThreeAmbientLight,
    ThreeDirectionalLight,
    ThreePointLight,
    ThreeOrbitControls,
    ThreePostProcessing,
    ThreeDepthOfFieldEffect,
    ThreeAmbientOcclusionEffect,
    ThreeBloomEffect,
    ThreeStats,
    ThreeAxesHelper,
    ThreeGridHelper
  },
  setup() {
    // 场景对象
    const cubes = ref([]);
    const spheres = ref([]);
    
    // 景深效果设置
    const dofEnabled = ref(true);
    const dofDebug = ref(false);
    const focusDistance = ref(10);
    const focalLength = ref(5);
    const bokehScale = ref(2);
    
    // 环境光遮蔽效果设置
    const aoEnabled = ref(true);
    const aoDebug = ref(false);
    const aoRadius = ref(0.5);
    const aoBias = ref(0.5);
    const aoScale = ref(1.0);
    const aoBlurRadius = ref(2);
    
    // 辉光效果设置
    const bloomEnabled = ref(true);
    const bloomStrength = ref(0.5);
    const bloomRadius = ref(0.4);
    const bloomThreshold = ref(0.8);
    
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
    
    // 随机颜色
    const getRandomColor = () => {
      return Math.floor(Math.random() * 0xffffff);
    };
    
    // 创建立方体
    const createCubes = () => {
      cubes.value = [];
      
      // 创建一排立方体
      for (let i = -5; i <= 5; i += 2) {
        cubes.value.push({
          position: [i, 0.5, 0],
          rotation: [0, Math.PI / 4, 0],
          scale: [1, 1, 1],
          color: getRandomColor()
        });
      }
    };
    
    // 创建球体
    const createSpheres = () => {
      spheres.value = [];
      
      // 创建一排球体
      for (let i = -4; i <= 4; i += 2) {
        spheres.value.push({
          position: [i, 0.5, -3],
          color: getRandomColor()
        });
      }
    };
    
    // 随机化立方体
    const randomizeCubes = () => {
      cubes.value.forEach(cube => {
        cube.color = getRandomColor();
        cube.rotation = [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ];
        cube.scale = [
          0.5 + Math.random(),
          0.5 + Math.random(),
          0.5 + Math.random()
        ];
      });
      
      addEventLog('立方体已随机化');
    };
    
    // 随机化球体
    const randomizeSpheres = () => {
      spheres.value.forEach(sphere => {
        sphere.color = getRandomColor();
        sphere.position[1] = 0.5 + Math.random() * 1.5;
      });
      
      addEventLog('球体已随机化');
    };
    
    // 重置场景
    const resetScene = () => {
      createCubes();
      createSpheres();
      
      addEventLog('场景已重置');
    };
    
    // 处理景深效果就绪事件
    const handleDofReady = () => {
      addEventLog('景深效果已就绪');
    };
    
    // 处理环境光遮蔽效果就绪事件
    const handleAoReady = () => {
      addEventLog('环境光遮蔽效果已就绪');
    };
    
    // 处理辉光效果就绪事件
    const handleBloomReady = () => {
      addEventLog('辉光效果已就绪');
    };
    
    // 组件挂载
    onMounted(() => {
      // 初始化场景
      resetScene();
    });
    
    return {
      cubes,
      spheres,
      dofEnabled,
      dofDebug,
      focusDistance,
      focalLength,
      bokehScale,
      aoEnabled,
      aoDebug,
      aoRadius,
      aoBias,
      aoScale,
      aoBlurRadius,
      bloomEnabled,
      bloomStrength,
      bloomRadius,
      bloomThreshold,
      eventLogs,
      randomizeCubes,
      randomizeSpheres,
      resetScene,
      handleDofReady,
      handleAoReady,
      handleBloomReady
    };
  }
};
</script>

<style scoped>
.three-postprocessing-example {
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

.control-group {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.checkbox-group {
  margin-bottom: 15px;
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

button:hover {
  background-color: #45a049;
}

button:last-child {
  margin-right: 0;
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