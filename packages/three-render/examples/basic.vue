<template>
  <div class="example">
    <ThreeCanvas :stats="true">
      <ThreeScene>
        <!-- 相机 -->
        <ThreeCamera :position="[0, 2, 5]" :look-at="[0, 0, 0]" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.5" />
        <ThreeDirectionalLight :position="[10, 10, 10]" :intensity="1" :cast-shadow="true" />
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -1, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
          <ThreePlaneGeometry :args="[20, 20]" />
          <ThreeMeshStandardMaterial :color="'#cccccc'" />
        </ThreeMesh>
        
        <!-- 旋转的立方体 -->
        <ThreeMesh
          :position="[0, 0, 0]"
          :rotation="rotation"
          :cast-shadow="true"
          :receive-shadow="true"
          @click="handleBoxClick"
        >
          <ThreeBoxGeometry :args="[1, 1, 1]" />
          <ThreeMeshStandardMaterial :color="boxColor" :metalness="0.5" :roughness="0.5" />
        </ThreeMesh>
        
        <!-- 球体 -->
        <ThreeMesh :position="[2, 0, 0]" :cast-shadow="true" :receive-shadow="true">
          <ThreeSphereGeometry :args="[0.5, 32, 32]" />
          <ThreeMeshStandardMaterial :color="'#3498db'" :metalness="0.2" :roughness="0.3" />
        </ThreeMesh>
        
        <!-- 圆环 -->
        <ThreeMesh :position="[-2, 0, 0]" :cast-shadow="true" :receive-shadow="true">
          <ThreeTorusGeometry :args="[0.5, 0.2, 16, 32]" />
          <ThreeMeshStandardMaterial :color="'#e74c3c'" :metalness="0.8" :roughness="0.2" />
        </ThreeMesh>
        
        <!-- 辅助工具 -->
        <ThreeGridHelper :args="[20, 20]" />
        <ThreeAxesHelper :args="[5]" />
        
        <!-- 控制器 -->
        <ThreeOrbitControls />
      </ThreeScene>
    </ThreeCanvas>
    
    <div class="controls">
      <h3>控制面板</h3>
      <div class="control-group">
        <label>立方体颜色</label>
        <input type="color" v-model="boxColor" />
      </div>
      <div class="control-group">
        <label>旋转速度</label>
        <input type="range" min="0" max="0.1" step="0.001" v-model="rotationSpeed" />
      </div>
      <div class="control-group">
        <button @click="resetRotation">重置旋转</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import {
  ThreeCanvas,
  ThreeScene,
  ThreeCamera,
  ThreeAmbientLight,
  ThreeDirectionalLight,
  ThreeMesh,
  ThreeBoxGeometry,
  ThreeSphereGeometry,
  ThreePlaneGeometry,
  ThreeTorusGeometry,
  ThreeMeshStandardMaterial,
  ThreeGridHelper,
  ThreeAxesHelper,
  ThreeOrbitControls
} from '../src';

// 立方体颜色
const boxColor = ref('#9b59b6');

// 立方体旋转
const rotation = ref([0, 0, 0]);

// 旋转速度
const rotationSpeed = ref(0.01);

// 动画帧ID
let animationId: number | null = null;

// 点击立方体事件
function handleBoxClick() {
  // 随机颜色
  boxColor.value = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

// 重置旋转
function resetRotation() {
  rotation.value = [0, 0, 0];
}

// 动画循环
function animate() {
  // 更新旋转
  rotation.value[0] += Number(rotationSpeed.value);
  rotation.value[1] += Number(rotationSpeed.value) * 1.5;
  
  // 继续动画循环
  animationId = requestAnimationFrame(animate);
}

// 生命周期钩子
onMounted(() => {
  // 开始动画
  animate();
});

onBeforeUnmount(() => {
  // 停止动画
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.example {
  display: flex;
  height: 100vh;
}

.controls {
  width: 300px;
  padding: 20px;
  background-color: #f5f5f5;
  border-left: 1px solid #ddd;
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.control-group input {
  width: 100%;
}

.control-group button {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.control-group button:hover {
  background-color: #2980b9;
}

/* ThreeCanvas 会自动填充剩余空间 */
:deep(.three-canvas) {
  flex: 1;
}
</style> 