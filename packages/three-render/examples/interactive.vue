<template>
  <div class="three-example-container">
    <!-- 3D 渲染区域 -->
    <ThreeCanvas 
      :stats="showStats" 
      :show-fps="showFps"
      :post-processing="enablePostProcessing"
      :quality="quality"
      :outline="true"
      @initialized="handleInitialized">
      
      <ThreeScene :fog="{ type: 'exponential', color: '#111827', density: 0.03 }">
        <!-- 相机设置 -->
        <ThreeCamera :position="[0, 2, 5]" :look-at="[0, 0, 0]" />
        
        <!-- 轨道控制器 -->
        <ThreeOrbitControls :enable-damping="true" :damping-factor="0.05" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.5" />
        <ThreeDirectionalLight :position="[5, 10, 5]" :intensity="1" :cast-shadow="true" />
        <ThreePointLight :position="[-5, 8, -5]" :color="'#3498db'" :intensity="0.8" :distance="20" />
        
        <!-- 地面 -->
        <ThreeMesh 
          :position="[0, -1, 0]" 
          :rotation="[-Math.PI/2, 0, 0]"
          :receive-shadow="true">
          <ThreePlaneGeometry :args="[20, 20]" />
          <ThreeMeshStandardMaterial :color="'#222222'" :metalness="0.1" :roughness="0.9" />
        </ThreeMesh>
        
        <!-- 交互立方体 -->
        <ThreeMesh 
          ref="cubeRef"
          :position="cubePosition" 
          :rotation="cubeRotation"
          :scale="hovered ? 1.1 : 1"
          :cast-shadow="true" 
          :receive-shadow="true"
          @click="handleCubeClick"
          @pointerover="() => hovered = true"
          @pointerout="() => hovered = false">
          <ThreeBoxGeometry :args="[1, 1, 1]" />
          <ThreeMeshStandardMaterial :color="cubeColor" :metalness="0.5" :roughness="0.5" />
        </ThreeMesh>
        
        <!-- 球体 -->
        <ThreeMesh 
          :position="[2, 0, 0]" 
          :cast-shadow="true" 
          :receive-shadow="true">
          <ThreeSphereGeometry :args="[0.5, 32, 32]" />
          <ThreeMeshStandardMaterial :color="'#3498db'" :metalness="0.8" :roughness="0.2" />
        </ThreeMesh>
        
        <!-- 圆环 -->
        <ThreeMesh 
          :position="[-2, 0, 0]"
          :rotation="torusRotation" 
          :cast-shadow="true" 
          :receive-shadow="true">
          <ThreeTorusGeometry :args="[0.5, 0.2, 16, 32]" />
          <ThreeMeshStandardMaterial :color="'#e74c3c'" :metalness="0.6" :roughness="0.4" />
        </ThreeMesh>
        
        <!-- 动态文字 -->
        <ThreeText 
          :text="'Three-Render'" 
          :position="[0, 2, 0]"
          :size="0.5"
          :height="0.1"
          :color="'#f39c12'"
          :cast-shadow="true"
          :bevel-enabled="true"
          :bevel-thickness="0.01"
          :bevel-size="0.01" />
        
        <!-- 粒子系统 -->
        <ThreeParticles 
          :count="500"
          :size="0.05"
          :color="'#ffffff'"
          :opacity="0.7"
          :size-attenuation="true"
          :velocity-scale="0.01"
          :bounds="[-5, 5]" />
        
        <!-- 后处理效果 -->
        <ThreePostProcessing v-if="enablePostProcessing">
          <ThreeBloomEffect :strength="0.5" :radius="0.4" :threshold="0.8" />
          <ThreeSSAOEffect :radius="5" :intensity="30" :lumInfluence="0.5" />
        </ThreePostProcessing>
        
        <!-- 辅助器 -->
        <ThreeGridHelper :args="[20, 20]" :visible="showHelpers" />
        <ThreeAxesHelper :args="[5]" :visible="showHelpers" />
      </ThreeScene>
    </ThreeCanvas>
    
    <!-- 控制面板 -->
    <div class="controls-panel">
      <h2>控制面板</h2>
      
      <div class="control-group">
        <label>立方体颜色</label>
        <input type="color" v-model="cubeColor" />
      </div>
      
      <div class="control-group">
        <label>立方体位置 X</label>
        <input type="range" min="-3" max="3" step="0.1" v-model="cubePosition[0]" />
      </div>
      
      <div class="control-group">
        <label>立方体位置 Y</label>
        <input type="range" min="-1" max="3" step="0.1" v-model="cubePosition[1]" />
      </div>
      
      <div class="control-group">
        <label>动画速度</label>
        <input type="range" min="0" max="0.1" step="0.001" v-model="animationSpeed" />
      </div>
      
      <div class="control-group">
        <label>渲染质量</label>
        <select v-model="quality">
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
          <option value="ultra">超高</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showStats" />
          显示性能统计
        </label>
      </div>
      
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showFps" />
          显示 FPS
        </label>
      </div>
      
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="enablePostProcessing" />
          启用后处理
        </label>
      </div>
      
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showHelpers" />
          显示辅助器
        </label>
      </div>
      
      <div class="control-group">
        <button @click="captureScreenshot">截图</button>
        <button @click="resetScene">重置场景</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import {
  // 核心组件
  ThreeCanvas,
  ThreeScene,
  ThreeCamera,
  ThreeMesh,
  ThreeObject,
  
  // 几何体
  ThreeBoxGeometry,
  ThreeSphereGeometry,
  ThreePlaneGeometry,
  ThreeTorusGeometry,
  
  // 材质
  ThreeMeshStandardMaterial,
  
  // 灯光
  ThreeAmbientLight,
  ThreeDirectionalLight,
  ThreePointLight,
  
  // 控制器
  ThreeOrbitControls,
  
  // 辅助器
  ThreeGridHelper,
  ThreeAxesHelper,
  
  // 特效
  ThreePostProcessing,
  ThreeBloomEffect,
  ThreeSSAOEffect,
  
  // 高级组件
  ThreeText,
  ThreeParticles,
  
  // 组合式API
  useThree,
  useFrame
} from '../src';

// 场景控制
const showStats = ref(true);
const showFps = ref(true);
const enablePostProcessing = ref(true);
const showHelpers = ref(false);
const quality = ref('high');

// 立方体状态
const cubeRef = ref(null);
const cubeColor = ref('#9c59b6');
const cubePosition = reactive([0, 0, 0]);
const cubeRotation = reactive([0, 0, 0]);
const hovered = ref(false);

// 圆环状态
const torusRotation = reactive([0, 0, 0]);

// 动画参数
const animationSpeed = ref(0.01);
let animationId = null;

// Canvas 引用
const canvasRef = ref(null);

// 点击立方体事件
const handleCubeClick = () => {
  // 切换颜色
  cubeColor.value = cubeColor.value === '#9c59b6' ? '#e74c3c' : '#9c59b6';
  
  // 启用轮廓效果
  if (canvasRef.value) {
    canvasRef.value.enableOutline(cubeRef.value.object.value, 0xffff00);
    
    // 3秒后移除轮廓
    setTimeout(() => {
      canvasRef.value.disableOutline(cubeRef.value.object.value);
    }, 3000);
  }
};

// 初始化处理
const handleInitialized = (engine) => {
  canvasRef.value = engine;
  
  // 使用 useFrame 组合式API进行动画
  const setFrameCallback = useFrame((state, delta) => {
    // 更新立方体旋转
    cubeRotation[1] += Number(animationSpeed.value);
    
    // 更新圆环旋转
    torusRotation[0] += Number(animationSpeed.value) * 0.5;
    torusRotation[1] += Number(animationSpeed.value) * 0.8;
  });
};

// 截图
const captureScreenshot = () => {
  if (canvasRef.value) {
    const image = canvasRef.value.captureScreenshot({
      width: 1920,
      height: 1080,
      format: 'png'
    });
    
    // 创建下载链接
    if (image) {
      const link = document.createElement('a');
      link.href = image;
      link.download = 'three-render-screenshot.png';
      link.click();
    }
  }
};

// 重置场景
const resetScene = () => {
  // 重置立方体
  cubePosition[0] = 0;
  cubePosition[1] = 0;
  cubePosition[2] = 0;
  cubeRotation[0] = 0;
  cubeRotation[1] = 0;
  cubeRotation[2] = 0;
  
  // 重置圆环
  torusRotation[0] = 0;
  torusRotation[1] = 0;
  torusRotation[2] = 0;
  
  // 重置颜色
  cubeColor.value = '#9c59b6';
};

// 生命周期钩子
onMounted(() => {
  // 初始化
});

onBeforeUnmount(() => {
  // 清理资源
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.three-example-container {
  display: flex;
  height: 100vh;
}

.controls-panel {
  width: 300px;
  padding: 20px;
  background-color: #f8fafc;
  border-left: 1px solid #e2e8f0;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

.controls-panel h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #1e293b;
  font-weight: 600;
  font-size: 1.5rem;
}

.control-group {
  margin-bottom: 16px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #334155;
}

.control-group input[type="range"],
.control-group input[type="color"],
.control-group select {
  width: 100%;
  padding: 4px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
}

.control-group button {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  font-weight: 500;
}

.control-group button:hover {
  background-color: #2563eb;
}

.control-group button:active {
  background-color: #1d4ed8;
}

/* ThreeCanvas 会自动填充剩余空间 */
:deep(.three-canvas) {
  flex: 1;
}
</style> 