<template>
  <div class="physics-example">
    <ThreeCanvas :width="800" :height="600" :shadows="true" :antialias="true">
      <ThreeScene :background="0x87CEEB">
        <ThreeCamera :position="[0, 5, 10]" :lookAt="[0, 0, 0]" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.5" />
        <ThreeDirectionalLight :position="[5, 10, 5]" :intensity="1" :cast-shadow="true" />
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -0.5, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
          <ThreePlaneGeometry :width="20" :height="20" />
          <ThreeMeshStandardMaterial :color="0x999999" />
          <ThreeRigidBody type="static" :shape="'box'" :shape-options="{ halfExtents: [10, 0.1, 10] }" />
        </ThreeMesh>
        
        <!-- 物理世界 -->
        <ThreePhysicsWorld :gravity="[0, -9.82, 0]" :debug="false">
          <!-- 盒子 -->
          <ThreeMesh v-for="(box, index) in boxes" :key="`box-${index}`"
            :position="box.position"
            :rotation="box.rotation"
            :cast-shadow="true"
            :receive-shadow="true">
            <ThreeBoxGeometry :width="box.size[0]" :height="box.size[1]" :depth="box.size[2]" />
            <ThreeMeshStandardMaterial :color="box.color" />
            <ThreeRigidBody 
              :mass="box.mass" 
              :shape="'box'" 
              :shape-options="{ halfExtents: [box.size[0]/2, box.size[1]/2, box.size[2]/2] }"
              :linear-damping="0.1"
              :angular-damping="0.1"
              :allow-sleep="true"
            />
            <ThreeInteractive :hover-color="0xff0000" cursor="pointer" @click="applyForce(index)" />
          </ThreeMesh>
          
          <!-- 球体 -->
          <ThreeMesh v-for="(sphere, index) in spheres" :key="`sphere-${index}`"
            :position="sphere.position"
            :cast-shadow="true"
            :receive-shadow="true">
            <ThreeSphereGeometry :radius="sphere.radius" :width-segments="32" :height-segments="32" />
            <ThreeMeshStandardMaterial :color="sphere.color" />
            <ThreeRigidBody 
              :mass="sphere.mass" 
              :shape="'sphere'" 
              :shape-options="{ radius: sphere.radius }"
              :linear-damping="0.1"
              :angular-damping="0.1"
              :allow-sleep="true"
            />
            <ThreeInteractive :hover-color="0x00ff00" cursor="pointer" @click="applyForce(index + boxes.length)" />
          </ThreeMesh>
          
          <!-- 圆柱体 -->
          <ThreeMesh v-for="(cylinder, index) in cylinders" :key="`cylinder-${index}`"
            :position="cylinder.position"
            :rotation="cylinder.rotation"
            :cast-shadow="true"
            :receive-shadow="true">
            <ThreeCylinderGeometry 
              :radius-top="cylinder.radiusTop" 
              :radius-bottom="cylinder.radiusBottom" 
              :height="cylinder.height" 
              :radial-segments="32" 
            />
            <ThreeMeshStandardMaterial :color="cylinder.color" />
            <ThreeRigidBody 
              :mass="cylinder.mass" 
              :shape="'cylinder'" 
              :shape-options="{
                radiusTop: cylinder.radiusTop,
                radiusBottom: cylinder.radiusBottom,
                height: cylinder.height,
                numSegments: 16
              }"
              :linear-damping="0.1"
              :angular-damping="0.1"
              :allow-sleep="true"
            />
            <ThreeInteractive :hover-color="0x0000ff" cursor="pointer" @click="applyForce(index + boxes.length + spheres.length)" />
          </ThreeMesh>
        </ThreePhysicsWorld>
        
        <!-- 控制器 -->
        <ThreeOrbitControls />
        
        <!-- 射线交互 -->
        <ThreeRaycaster :use-pointer="true" :update-on-frame="true" :throttle-ms="16" />
      </ThreeScene>
    </ThreeCanvas>
    
    <div class="controls">
      <button @click="addBox">添加盒子</button>
      <button @click="addSphere">添加球体</button>
      <button @click="addCylinder">添加圆柱体</button>
      <button @click="resetScene">重置场景</button>
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
import { ThreeRaycaster } from '../src/components/interaction';
import { ThreeInteractive } from '../src/components/interaction';
import { ThreePhysicsWorld, ThreeRigidBody } from '../src/components/physics';

// 随机颜色生成
const randomColor = () => Math.floor(Math.random() * 0xffffff);

// 随机位置生成
const randomPosition = () => [
  (Math.random() - 0.5) * 8,
  Math.random() * 10 + 5,
  (Math.random() - 0.5) * 8
];

// 随机旋转生成
const randomRotation = () => [
  Math.random() * Math.PI,
  Math.random() * Math.PI,
  Math.random() * Math.PI
];

// 物体数组
const boxes = ref<any[]>([]);
const spheres = ref<any[]>([]);
const cylinders = ref<any[]>([]);
const rigidBodies = ref<any[]>([]);

// 添加盒子
const addBox = () => {
  const size = [
    Math.random() * 0.5 + 0.5,
    Math.random() * 0.5 + 0.5,
    Math.random() * 0.5 + 0.5
  ];
  
  boxes.value.push({
    position: randomPosition(),
    rotation: randomRotation(),
    size,
    color: randomColor(),
    mass: Math.random() * 5 + 1
  });
};

// 添加球体
const addSphere = () => {
  const radius = Math.random() * 0.5 + 0.5;
  
  spheres.value.push({
    position: randomPosition(),
    radius,
    color: randomColor(),
    mass: Math.random() * 5 + 1
  });
};

// 添加圆柱体
const addCylinder = () => {
  const radiusTop = Math.random() * 0.5 + 0.3;
  const radiusBottom = Math.random() * 0.5 + 0.3;
  const height = Math.random() * 1 + 1;
  
  cylinders.value.push({
    position: randomPosition(),
    rotation: randomRotation(),
    radiusTop,
    radiusBottom,
    height,
    color: randomColor(),
    mass: Math.random() * 5 + 1
  });
};

// 应用力
const applyForce = (index: number) => {
  const allBodies = [...boxes.value, ...spheres.value, ...cylinders.value];
  if (index >= 0 && index < allBodies.length && rigidBodies.value[index]) {
    const force = [
      (Math.random() - 0.5) * 500,
      Math.random() * 500,
      (Math.random() - 0.5) * 500
    ];
    
    rigidBodies.value[index].applyImpulse(force);
  }
};

// 重置场景
const resetScene = () => {
  boxes.value = [];
  spheres.value = [];
  cylinders.value = [];
  rigidBodies.value = [];
  
  // 初始化场景
  initScene();
};

// 初始化场景
const initScene = () => {
  // 添加初始物体
  for (let i = 0; i < 5; i++) {
    addBox();
  }
  
  for (let i = 0; i < 5; i++) {
    addSphere();
  }
  
  for (let i = 0; i < 3; i++) {
    addCylinder();
  }
};

// 组件挂载时初始化场景
onMounted(() => {
  initScene();
});
</script>

<style scoped>
.physics-example {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.controls {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

button {
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
</style> 