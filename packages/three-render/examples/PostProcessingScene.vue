<template>
  <div class="post-processing-container">
    <div class="controls">
      <div>
        <label>辉光强度</label>
        <input type="range" min="0" max="3" step="0.1" v-model.number="bloomStrength" />
        <span>{{ bloomStrength.toFixed(1) }}</span>
      </div>
      <div>
        <label>辉光半径</label>
        <input type="range" min="0" max="1" step="0.01" v-model.number="bloomRadius" />
        <span>{{ bloomRadius.toFixed(2) }}</span>
      </div>
      <div>
        <label>辉光阈值</label>
        <input type="range" min="0" max="1" step="0.01" v-model.number="bloomThreshold" />
        <span>{{ bloomThreshold.toFixed(2) }}</span>
      </div>
      <div>
        <label>FXAA抗锯齿</label>
        <input type="checkbox" v-model="fxaaEnabled" />
      </div>
    </div>

    <ThreeCanvas>
      <ThreeScene>
        <!-- 相机 -->
        <ThreeCamera :position="[0, 2, 10]" :lookAt="[0, 0, 0]" :makeDefault="true" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.4" />
        <ThreeDirectionalLight :position="[5, 5, 5]" :intensity="0.6" :castShadow="true" />
        <ThreePointLight 
          :position="[0, 3, 0]" 
          :color="0xff9000" 
          :intensity="1" 
          :distance="10" 
          :decay="2" 
        />
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -2, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receiveShadow="true">
          <ThreePlane :width="20" :height="20" />
          <ThreeMeshStandardMaterial :color="0x444444" :roughness="0.8" :metalness="0.2" />
        </ThreeMesh>
        
        <!-- 中心环形结 -->
        <ThreeMesh 
          ref="torusKnotMesh"
          :position="[0, 1, 0]" 
          :rotation="[0, time * 0.2, 0]"
          :castShadow="true"
        >
          <ThreeTorusKnot :radius="1.5" :tube="0.5" :p="2" :q="3" />
          <ThreeMeshStandardMaterial :color="0xff3333" :roughness="0.2" :metalness="0.8" :emissive="0xff0000" :emissiveIntensity="0.5" />
        </ThreeMesh>
        
        <!-- 发光球体 -->
        <ThreeMesh 
          v-for="(sphere, i) in spheres" 
          :key="i"
          :position="sphere.position" 
          :castShadow="true"
        >
          <ThreeSphere :radius="0.5" />
          <ThreeMeshStandardMaterial 
            :color="sphere.color" 
            :emissive="sphere.color" 
            :emissiveIntensity="0.5"
            :roughness="0.2" 
            :metalness="0.8" 
          />
        </ThreeMesh>
        
        <!-- 圆锥体 -->
        <ThreeMesh 
          :position="[-4, 0, -4]" 
          :rotation="[0, time * 0.5, 0]"
          :castShadow="true"
        >
          <ThreeCone :radius="1" :height="2" />
          <ThreeMeshBasicMaterial :color="0x44ff44" :wireframe="true" />
        </ThreeMesh>
        
        <!-- 轨道控制器 -->
        <ThreeOrbitControls :enableDamping="true" :dampingFactor="0.05" />
      </ThreeScene>
      
      <!-- 后处理效果 -->
      <ThreePostProcessing>
        <ThreeBloomEffect 
          :strength="bloomStrength" 
          :radius="bloomRadius" 
          :threshold="bloomThreshold" 
        />
        <ThreeFXAAEffect :enabled="fxaaEnabled" />
      </ThreePostProcessing>
    </ThreeCanvas>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import {
  ThreeCanvas,
  ThreeScene,
  ThreeCamera,
  ThreeMesh,
  ThreeBox,
  ThreeSphere,
  ThreePlane,
  ThreeCone,
  ThreeTorusKnot,
  ThreeMeshStandardMaterial,
  ThreeMeshBasicMaterial,
  ThreeAmbientLight,
  ThreeDirectionalLight,
  ThreePointLight,
  ThreeOrbitControls,
  ThreePostProcessing,
  ThreeBloomEffect,
  ThreeFXAAEffect,
  useFrame
} from '../src';

// 引用环形结网格
const torusKnotMesh = ref(null);

// 后处理参数
const bloomStrength = ref(1.5);
const bloomRadius = ref(0.4);
const bloomThreshold = ref(0.85);
const fxaaEnabled = ref(true);

// 时间变量
const time = ref(0);

// 创建发光球体
const spheres = reactive([]);
const sphereCount = 5;

// 初始化发光球体
for (let i = 0; i < sphereCount; i++) {
  const angle = (i / sphereCount) * Math.PI * 2;
  const radius = 4;
  
  // 创建HSL颜色，基于角度
  const hue = (i / sphereCount) * 360;
  const color = `hsl(${hue}, 100%, 50%)`;
  
  spheres.push({
    position: [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ],
    color: color
  });
}

// 使用useFrame进行动画
useFrame((state, delta) => {
  // 更新时间
  time.value += delta;
  
  // 更新球体位置
  spheres.forEach((sphere, index) => {
    const angle = (index / sphereCount) * Math.PI * 2 + time.value * 0.3;
    const radius = 4;
    const height = Math.sin(time.value * 2 + index) * 0.5 + 1;
    
    sphere.position = [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ];
  });
});

// 动画计时器
let animationId = null;

// 组件卸载时停止动画
onBeforeUnmount(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.post-processing-container {
  width: 100%;
  height: 100vh;
  background-color: #000;
  position: relative;
}

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 100;
  width: 250px;
}

.controls > div {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.controls label {
  width: 100px;
  display: inline-block;
}

.controls input[type="range"] {
  width: 100px;
  margin: 0 10px;
}
</style> 