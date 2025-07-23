<template>
  <div class="post-processing-example">
    <ThreeCanvas :width="800" :height="600" :shadows="true" :antialias="true">
      <ThreeScene :background="0x87CEEB">
        <ThreeCamera :position="[0, 2, 5]" :lookAt="[0, 0, 0]" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.5" />
        <ThreeDirectionalLight :position="[5, 10, 5]" :intensity="1" :cast-shadow="true" />
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -0.5, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
          <ThreePlaneGeometry :width="20" :height="20" />
          <ThreeMeshStandardMaterial :color="0x999999" />
        </ThreeMesh>
        
        <!-- 对象 -->
        <ThreeMesh 
          v-for="(obj, index) in objects" 
          :key="`obj-${index}`"
          :position="obj.position"
          :rotation="obj.rotation"
          :cast-shadow="true"
          :receive-shadow="true"
        >
          <component :is="obj.geometry.component" v-bind="obj.geometry.props" />
          <ThreeMeshStandardMaterial :color="obj.color" :metalness="obj.metalness" :roughness="obj.roughness" />
        </ThreeMesh>
        
        <!-- 后处理 -->
        <ThreePostProcessing 
          :smaa="true" 
          :smaa-preset="'high'"
          :normal-pass="true"
        >
          <!-- 景深效果 -->
          <ThreeDepthOfFieldEffect
            :enabled="dofEnabled"
            :focus-distance="focusDistance"
            :focal-length="focalLength"
            :bokeh-scale="bokehScale"
            :max-blur="maxBlur"
          />
          
          <!-- 辉光效果 -->
          <ThreeBloomEffect
            :enabled="bloomEnabled"
            :intensity="bloomIntensity"
            :threshold="bloomThreshold"
            :radius="bloomRadius"
          />
        </ThreePostProcessing>
        
        <!-- 控制器 -->
        <ThreeOrbitControls />
      </ThreeScene>
    </ThreeCanvas>
    
    <div class="controls">
      <div class="control-section">
        <h3>景深效果</h3>
        <label>
          <input type="checkbox" v-model="dofEnabled" />
          启用景深
        </label>
        <div>
          <label>焦距: {{ focusDistance.toFixed(2) }}</label>
          <input type="range" min="0" max="10" step="0.1" v-model.number="focusDistance" />
        </div>
        <div>
          <label>焦长: {{ focalLength.toFixed(2) }}</label>
          <input type="range" min="0.01" max="0.2" step="0.01" v-model.number="focalLength" />
        </div>
        <div>
          <label>散景比例: {{ bokehScale.toFixed(2) }}</label>
          <input type="range" min="0" max="10" step="0.1" v-model.number="bokehScale" />
        </div>
        <div>
          <label>最大模糊: {{ maxBlur.toFixed(2) }}</label>
          <input type="range" min="0" max="1" step="0.01" v-model.number="maxBlur" />
        </div>
      </div>
      
      <div class="control-section">
        <h3>辉光效果</h3>
        <label>
          <input type="checkbox" v-model="bloomEnabled" />
          启用辉光
        </label>
        <div>
          <label>强度: {{ bloomIntensity.toFixed(2) }}</label>
          <input type="range" min="0" max="3" step="0.05" v-model.number="bloomIntensity" />
        </div>
        <div>
          <label>阈值: {{ bloomThreshold.toFixed(2) }}</label>
          <input type="range" min="0" max="1" step="0.01" v-model.number="bloomThreshold" />
        </div>
        <div>
          <label>半径: {{ bloomRadius.toFixed(2) }}</label>
          <input type="range" min="0" max="1" step="0.01" v-model.number="bloomRadius" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ThreeCanvas, ThreeScene, ThreeCamera, ThreeMesh } from '../src/components/core';
import { ThreeBoxGeometry, ThreeSphereGeometry, ThreeCylinderGeometry, ThreePlaneGeometry } from '../src/components/geometry';
import { ThreeMeshStandardMaterial } from '../src/components/material';
import { ThreeAmbientLight, ThreeDirectionalLight } from '../src/components/light';
import { ThreeOrbitControls } from '../src/components/controls';
import { ThreePostProcessing } from '../src/components/postprocessing';
import { ThreeDepthOfFieldEffect } from '../src/components/postprocessing';
import { ThreeBloomEffect } from '../src/components/postprocessing';

// 随机颜色生成
const randomColor = () => Math.floor(Math.random() * 0xffffff);

// 随机位置生成
const randomPosition = (range = 4) => [
  (Math.random() - 0.5) * range,
  Math.random() * 2,
  (Math.random() - 0.5) * range
];

// 随机旋转生成
const randomRotation = () => [
  Math.random() * Math.PI,
  Math.random() * Math.PI,
  Math.random() * Math.PI
];

// 几何体类型
const geometryTypes = [
  {
    component: ThreeBoxGeometry,
    props: { width: 1, height: 1, depth: 1 }
  },
  {
    component: ThreeSphereGeometry,
    props: { radius: 0.5, widthSegments: 32, heightSegments: 32 }
  },
  {
    component: ThreeCylinderGeometry,
    props: { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 }
  }
];

// 对象数组
const objects = ref<any[]>([]);

// 景深效果参数
const dofEnabled = ref(true);
const focusDistance = ref(3.0);
const focalLength = ref(0.05);
const bokehScale = ref(2.0);
const maxBlur = ref(0.1);

// 辉光效果参数
const bloomEnabled = ref(true);
const bloomIntensity = ref(0.5);
const bloomThreshold = ref(0.9);
const bloomRadius = ref(0.4);

// 初始化场景
const initScene = () => {
  // 创建对象
  for (let i = 0; i < 20; i++) {
    const geometryType = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
    
    objects.value.push({
      position: randomPosition(),
      rotation: randomRotation(),
      geometry: geometryType,
      color: randomColor(),
      metalness: Math.random() * 0.8,
      roughness: Math.random() * 0.8
    });
  }
};

// 组件挂载时初始化场景
onMounted(() => {
  initScene();
});
</script>

<style scoped>
.post-processing-example {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.controls {
  margin-top: 16px;
  display: flex;
  gap: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
  width: 800px;
}

.control-section {
  flex: 1;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="range"] {
  width: 100%;
  margin-bottom: 10px;
}

input[type="checkbox"] {
  margin-right: 5px;
}
</style> 