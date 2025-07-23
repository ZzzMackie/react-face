<template>
  <div class="scene-container">
    <ThreeCanvas>
      <ThreeScene background="#050505">
        <!-- 相机 -->
        <ThreeCamera :position="[0, 5, 15]" :look-at="[0, 0, 0]" />
        
        <!-- 控制器 -->
        <ThreeOrbitControls :enable-damping="true" :enable-pan="true" :auto-rotate="false" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.5" />
        <ThreeDirectionalLight :position="[5, 10, 5]" :intensity="1" :cast-shadow="true" />
        <ThreePointLight :position="[-5, 5, -5]" :intensity="0.5" color="#0088ff" />
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -2, 0]" :rotation="[-Math.PI/2, 0, 0]" :receive-shadow="true">
          <ThreePlane :width="30" :height="30" />
          <ThreeMeshStandardMaterial color="#333333" />
        </ThreeMesh>
        
        <!-- 射线交互系统 -->
        <ThreeRaycaster 
          :recursive="true" 
          :update-on-frame="true"
          @hover="onHover"
          @click="onClick"
        >
          <!-- 可交互对象 - 立方体 -->
          <ThreeMesh 
            v-for="(pos, i) in cubePositions" 
            :key="'cube-' + i" 
            :position="pos" 
            :rotation="[0, Math.PI * i / 5, 0]" 
            :cast-shadow="true"
          >
            <ThreeBox :width="2" :height="2" :depth="2" />
            <ThreeMeshStandardMaterial :color="cubeColors[i]" :metalness="0.5" :roughness="0.5" />
            <ThreeInteractive 
              :hover-color="'#ffffff'" 
              :hover-scale="1.1"
              :active-color="'#ff0000'"
              :active-scale="0.9"
              @click="onCubeClick(i)"
              @pointerenter="onCubeEnter(i)"
              @pointerleave="onCubeLeave(i)"
            />
          </ThreeMesh>
          
          <!-- 可交互对象 - 球体 -->
          <ThreeMesh :position="[0, 3, 0]" :cast-shadow="true">
            <ThreeSphere :radius="1.5" :width-segments="32" :height-segments="32" />
            <ThreeMeshStandardMaterial color="#ffaa00" :metalness="0.8" :roughness="0.2" />
            <ThreeInteractive 
              :hover-color="'#ffff00'" 
              :hover-opacity="0.8"
              @click="onSphereClick"
            />
          </ThreeMesh>
          
          <!-- 可交互对象 - 环形 -->
          <ThreeMesh :position="[-5, 2, -3]" :rotation="[Math.PI/4, 0, 0]" :cast-shadow="true">
            <ThreeTorus :radius="1.5" :tube="0.5" :radial-segments="16" :tubular-segments="100" />
            <ThreeMeshStandardMaterial color="#00aaff" :metalness="0.6" :roughness="0.4" />
            <ThreeInteractive 
              :hover-color="'#00ffff'" 
              :hover-scale="1.2"
              @click="onTorusClick"
            />
          </ThreeMesh>
          
          <!-- 可交互对象 - 圆锥 -->
          <ThreeMesh :position="[5, 2, -3]" :rotation="[0, 0, 0]" :cast-shadow="true">
            <ThreeCone :radius="1.5" :height="3" :radial-segments="32" />
            <ThreeMeshStandardMaterial color="#ff00aa" :metalness="0.4" :roughness="0.6" />
            <ThreeInteractive 
              :hover-color="'#ff00ff'" 
              :hover-scale="1.1"
              @click="onConeClick"
            />
          </ThreeMesh>
        </ThreeRaycaster>
        
        <!-- 信息面板 -->
        <div class="info-panel">
          <h2>交互式场景</h2>
          <p>悬停在对象上可以看到效果</p>
          <p>点击对象可以触发动作</p>
          <div v-if="selectedObject">
            <h3>选中对象: {{ selectedObject.name }}</h3>
            <p>颜色: {{ selectedObject.color }}</p>
            <p>位置: [{{ selectedObject.position.join(', ') }}]</p>
            <button @click="resetSelection">清除选择</button>
          </div>
        </div>
      </ThreeScene>
    </ThreeCanvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  ThreeCanvas,
  ThreeScene,
  ThreeCamera,
  ThreeMesh,
  ThreeBox,
  ThreeSphere,
  ThreePlane,
  ThreeTorus,
  ThreeCone,
  ThreeMeshStandardMaterial,
  ThreeDirectionalLight,
  ThreeAmbientLight,
  ThreePointLight,
  ThreeOrbitControls,
  ThreeRaycaster,
  ThreeInteractive
} from '../src';

// 立方体位置和颜色
const cubePositions = ref([
  [-8, 1, 0],
  [-4, 1, 0],
  [0, 1, 0],
  [4, 1, 0],
  [8, 1, 0]
]);

const cubeColors = ref([
  '#ff4444',
  '#44ff44',
  '#4444ff',
  '#ffff44',
  '#ff44ff'
]);

// 选中的对象
const selectedObject = ref(null);

// 悬停事件
const onHover = (event) => {
  // 可以在这里处理通用的悬停逻辑
};

// 点击事件
const onClick = (event) => {
  // 可以在这里处理通用的点击逻辑
};

// 立方体点击事件
const onCubeClick = (index) => {
  selectedObject.value = {
    name: `立方体 ${index + 1}`,
    color: cubeColors.value[index],
    position: cubePositions.value[index]
  };
  
  // 让立方体旋转一圈
  const mesh = document.querySelector(`[data-cube-id="${index}"]`);
  if (mesh) {
    mesh.animate([
      { transform: 'rotateY(0deg)' },
      { transform: 'rotateY(360deg)' }
    ], {
      duration: 1000,
      iterations: 1
    });
  }
};

// 立方体悬停事件
const onCubeEnter = (index) => {
  console.log(`悬停在立方体 ${index + 1} 上`);
};

// 立方体离开事件
const onCubeLeave = (index) => {
  console.log(`离开立方体 ${index + 1}`);
};

// 球体点击事件
const onSphereClick = () => {
  selectedObject.value = {
    name: '球体',
    color: '#ffaa00',
    position: [0, 3, 0]
  };
};

// 环形点击事件
const onTorusClick = () => {
  selectedObject.value = {
    name: '环形',
    color: '#00aaff',
    position: [-5, 2, -3]
  };
};

// 圆锥点击事件
const onConeClick = () => {
  selectedObject.value = {
    name: '圆锥',
    color: '#ff00aa',
    position: [5, 2, -3]
  };
};

// 重置选择
const resetSelection = () => {
  selectedObject.value = null;
};
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  background-color: #000;
  overflow: hidden;
  position: relative;
}

.info-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 8px;
  width: 250px;
  z-index: 10;
}

h2 {
  margin-top: 0;
  color: #00aaff;
}

h3 {
  color: #ffaa00;
}

button {
  background-color: #444;
  color: white;
  border: none;
  padding: 8px 16px;
  margin-top: 10px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #666;
}
</style> 