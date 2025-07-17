<template>
  <div class="lights-showcase-container">
    <div class="controls">
      <div>
        <h3>光源控制</h3>
        <div>
          <label>
            <input type="checkbox" v-model="showHelpers" />
            显示辅助对象
          </label>
        </div>
        <div>
          <label>环境光强度</label>
          <input type="range" min="0" max="1" step="0.1" v-model.number="ambientIntensity" />
          <span>{{ ambientIntensity.toFixed(1) }}</span>
        </div>
        <div>
          <label>方向光强度</label>
          <input type="range" min="0" max="1" step="0.1" v-model.number="directionalIntensity" />
          <span>{{ directionalIntensity.toFixed(1) }}</span>
        </div>
        <div>
          <label>点光源强度</label>
          <input type="range" min="0" max="1" step="0.1" v-model.number="pointIntensity" />
          <span>{{ pointIntensity.toFixed(1) }}</span>
        </div>
        <div>
          <label>聚光灯强度</label>
          <input type="range" min="0" max="1" step="0.1" v-model.number="spotIntensity" />
          <span>{{ spotIntensity.toFixed(1) }}</span>
        </div>
        <div>
          <label>半球光强度</label>
          <input type="range" min="0" max="1" step="0.1" v-model.number="hemisphereIntensity" />
          <span>{{ hemisphereIntensity.toFixed(1) }}</span>
        </div>
      </div>
    </div>

    <ThreeCanvas>
      <ThreeScene>
        <!-- 相机 -->
        <ThreeCamera :position="[0, 5, 15]" :lookAt="[0, 0, 0]" :makeDefault="true" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="ambientIntensity" />
        
        <ThreeDirectionalLight 
          :position="[5, 5, 5]" 
          :intensity="directionalIntensity" 
          :castShadow="true"
          :showHelper="showHelpers"
        />
        
        <ThreePointLight 
          :position="[0, 5, 0]" 
          :color="0xff9000" 
          :intensity="pointIntensity" 
          :distance="10" 
          :decay="2"
          :showHelper="showHelpers"
        />
        
        <ThreeSpotLight 
          :position="[-5, 5, 0]" 
          :target="[0, 0, 0]" 
          :color="0x00ff00" 
          :intensity="spotIntensity" 
          :angle="Math.PI / 6"
          :penumbra="0.2"
          :distance="15"
          :castShadow="true"
          :showHelper="showHelpers"
        />
        
        <ThreeHemisphereLight 
          :skyColor="0x8888ff" 
          :groundColor="0x444422" 
          :intensity="hemisphereIntensity"
          :showHelper="showHelpers"
        />
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -2, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receiveShadow="true">
          <ThreePlane :width="30" :height="30" :widthSegments="20" :heightSegments="20" />
          <ThreeMeshStandardMaterial :color="0xaaaaaa" :roughness="0.8" :metalness="0.2" />
        </ThreeMesh>
        
        <!-- 中心球体 - 使用Phong材质 -->
        <ThreeMesh 
          :position="[0, 0, 0]" 
          :castShadow="true"
        >
          <ThreeSphere :radius="2" :widthSegments="32" :heightSegments="32" />
          <ThreeMeshPhongMaterial 
            :color="0xffffff" 
            :specular="0x111111" 
            :shininess="30"
          />
        </ThreeMesh>
        
        <!-- 立方体阵列 -->
        <ThreeMesh 
          v-for="(cube, i) in cubes" 
          :key="i"
          :position="cube.position" 
          :rotation="cube.rotation"
          :castShadow="true"
        >
          <ThreeBox :width="1.5" :height="1.5" :depth="1.5" />
          <ThreeMeshStandardMaterial 
            :color="cube.color" 
            :roughness="0.4" 
            :metalness="0.6" 
          />
        </ThreeMesh>
        
        <!-- 圆柱体 -->
        <ThreeMesh 
          :position="[-5, 0, -5]" 
          :rotation="[0, time * 0.5, 0]"
          :castShadow="true"
        >
          <ThreeCylinder :radiusTop="1" :radiusBottom="1" :height="4" />
          <ThreeMeshStandardMaterial :color="0x44ff44" :roughness="0.2" :metalness="0.8" />
        </ThreeMesh>
        
        <!-- 圆锥体 -->
        <ThreeMesh 
          :position="[5, 0, -5]" 
          :rotation="[0, -time * 0.5, 0]"
          :castShadow="true"
        >
          <ThreeCone :radius="1.5" :height="3" />
          <ThreeMeshBasicMaterial :color="0xff44ff" :wireframe="true" />
        </ThreeMesh>
        
        <!-- 环形结 -->
        <ThreeMesh 
          :position="[0, 0, -8]" 
          :rotation="[time * 0.2, time * 0.4, 0]"
          :castShadow="true"
        >
          <ThreeTorusKnot :radius="1.5" :tube="0.5" />
          <ThreeMeshStandardMaterial :color="0x4444ff" :roughness="0.3" :metalness="0.7" />
        </ThreeMesh>
        
        <!-- 轨道控制器 -->
        <ThreeOrbitControls :enableDamping="true" :dampingFactor="0.05" />
      </ThreeScene>
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
  ThreeCylinder,
  ThreeCone,
  ThreeTorusKnot,
  ThreeMeshStandardMaterial,
  ThreeMeshBasicMaterial,
  ThreeMeshPhongMaterial,
  ThreeAmbientLight,
  ThreeDirectionalLight,
  ThreePointLight,
  ThreeSpotLight,
  ThreeHemisphereLight,
  ThreeOrbitControls,
  useFrame
} from '../src';

// 光源控制
const showHelpers = ref(true);
const ambientIntensity = ref(0.3);
const directionalIntensity = ref(0.5);
const pointIntensity = ref(0.7);
const spotIntensity = ref(0.6);
const hemisphereIntensity = ref(0.4);

// 时间变量
const time = ref(0);

// 创建立方体数组
const cubes = reactive([]);
const cubeCount = 6;

// 初始化立方体
for (let i = 0; i < cubeCount; i++) {
  const angle = (i / cubeCount) * Math.PI * 2;
  const radius = 6;
  
  // 创建HSL颜色，基于角度
  const hue = (i / cubeCount) * 360;
  const color = `hsl(${hue}, 100%, 50%)`;
  
  cubes.push({
    position: [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ],
    rotation: [0, angle, 0],
    color: color
  });
}

// 使用useFrame进行动画
useFrame((state, delta) => {
  // 更新时间
  time.value += delta;
  
  // 更新立方体位置和旋转
  cubes.forEach((cube, index) => {
    const angle = (index / cubeCount) * Math.PI * 2 + time.value * 0.2;
    const radius = 6;
    const height = Math.sin(time.value * 2 + index) * 0.5 + 1;
    
    cube.position = [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ];
    
    cube.rotation = [
      time.value * 0.5,
      angle,
      time.value * 0.3
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
.lights-showcase-container {
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

.controls h3 {
  margin-top: 0;
  margin-bottom: 10px;
  text-align: center;
}

.controls > div {
  margin-bottom: 10px;
}

.controls > div > div {
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