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
        
        <!-- 物理世界 -->
        <ThreePhysicsWorld 
          :gravity="[0, -9.82, 0]" 
          :iterations="10"
          :allow-sleep="true"
          @step="onPhysicsStep"
          @collide="onCollision"
        >
          <!-- 地面 -->
          <ThreeMesh :position="[0, -2, 0]" :rotation="[-Math.PI/2, 0, 0]" :receive-shadow="true">
            <ThreePlane :width="30" :height="30" />
            <ThreeMeshStandardMaterial color="#333333" />
            <ThreeRigidBody type="static" />
          </ThreeMesh>
          
          <!-- 动态箱子 -->
          <ThreeMesh 
            v-for="(pos, i) in boxPositions" 
            :key="'box-' + i" 
            :position="pos" 
            :rotation="[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]" 
            :cast-shadow="true"
          >
            <ThreeBox :width="1" :height="1" :depth="1" />
            <ThreeMeshStandardMaterial :color="getRandomColor()" :metalness="0.5" :roughness="0.5" />
            <ThreeRigidBody 
              type="dynamic" 
              :mass="1" 
              :linear-damping="0.1" 
              :angular-damping="0.1"
            />
          </ThreeMesh>
          
          <!-- 球体 -->
          <ThreeMesh :position="[0, 5, 0]" :cast-shadow="true">
            <ThreeSphere :radius="1" :width-segments="32" :height-segments="32" />
            <ThreeMeshStandardMaterial color="#ff4400" :metalness="0.7" :roughness="0.3" />
            <ThreeRigidBody 
              type="dynamic" 
              :mass="2" 
              :linear-damping="0.1" 
              :angular-damping="0.1"
            />
          </ThreeMesh>
          
          <!-- 斜坡 -->
          <ThreeMesh :position="[-5, 0, 0]" :rotation="[0, 0, Math.PI/8]" :receive-shadow="true">
            <ThreeBox :width="8" :height="0.5" :depth="4" />
            <ThreeMeshStandardMaterial color="#666666" />
            <ThreeRigidBody type="static" />
          </ThreeMesh>
          
          <!-- 障碍物 -->
          <ThreeMesh :position="[0, 0, -3]" :cast-shadow="true" :receive-shadow="true">
            <ThreeCylinder :radius-top="0.5" :radius-bottom="1" :height="4" :radial-segments="16" />
            <ThreeMeshStandardMaterial color="#4444ff" />
            <ThreeRigidBody type="static" />
          </ThreeMesh>
          
          <!-- 触发器区域 -->
          <ThreeObject :position="[5, 0, 0]">
            <ThreeBoxCollider 
              :size="[3, 3, 3]" 
              :is-trigger="true"
              @collide="onTriggerEnter"
            />
          </ThreeObject>
          
          <!-- 约束演示：两个球体之间的弹簧 -->
          <ThreeMesh :position="[-5, 5, 5]" :cast-shadow="true" ref="sphere1">
            <ThreeSphere :radius="0.5" :width-segments="16" :height-segments="16" />
            <ThreeMeshStandardMaterial color="#ff0000" />
            <ThreeRigidBody 
              type="dynamic" 
              :mass="1" 
              :linear-damping="0.1" 
              :angular-damping="0.1"
              ref="body1"
            />
          </ThreeMesh>
          
          <ThreeMesh :position="[-3, 5, 5]" :cast-shadow="true" ref="sphere2">
            <ThreeSphere :radius="0.5" :width-segments="16" :height-segments="16" />
            <ThreeMeshStandardMaterial color="#00ff00" />
            <ThreeRigidBody 
              type="dynamic" 
              :mass="1" 
              :linear-damping="0.1" 
              :angular-damping="0.1"
              ref="body2"
            />
          </ThreeMesh>
          
          <ThreeConstraint 
            v-if="body1 && body2"
            type="spring" 
            :body-a="body1.body" 
            :body-b="body2.body"
            :stiffness="100"
            :damping="5"
            :rest-length="2"
          />
          
          <!-- 添加按钮：添加新的物体 -->
          <div class="controls">
            <button @click="addRandomBox">添加盒子</button>
            <button @click="addRandomSphere">添加球体</button>
            <button @click="resetScene">重置场景</button>
          </div>
        </ThreePhysicsWorld>
      </ThreeScene>
    </ThreeCanvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  ThreeCanvas,
  ThreeScene,
  ThreeCamera,
  ThreeMesh,
  ThreeObject,
  ThreeBox,
  ThreeSphere,
  ThreePlane,
  ThreeCylinder,
  ThreeMeshStandardMaterial,
  ThreeDirectionalLight,
  ThreeAmbientLight,
  ThreePointLight,
  ThreeOrbitControls,
  ThreePhysicsWorld,
  ThreeRigidBody,
  ThreeBoxCollider,
  ThreeConstraint
} from '../src';

// 盒子位置
const boxPositions = ref([
  [2, 5, 0],
  [0, 7, 2],
  [-2, 9, -1],
  [1, 11, 1],
  [-1, 13, 0]
]);

// 约束引用
const sphere1 = ref(null);
const sphere2 = ref(null);
const body1 = ref(null);
const body2 = ref(null);

// 生成随机颜色
const getRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

// 物理步进回调
const onPhysicsStep = (event) => {
  // 可以在这里处理每一步物理模拟后的逻辑
};

// 碰撞回调
const onCollision = (event) => {
  // 处理物体之间的碰撞
  console.log('Collision detected');
};

// 触发器回调
const onTriggerEnter = (event) => {
  console.log('Trigger entered');
  // 可以在这里添加特效或者改变物体属性
};

// 添加随机盒子
const addRandomBox = () => {
  const x = (Math.random() - 0.5) * 10;
  const y = Math.random() * 10 + 5;
  const z = (Math.random() - 0.5) * 10;
  boxPositions.value.push([x, y, z]);
};

// 添加随机球体
const addRandomSphere = () => {
  // 在实际应用中，你可能需要更复杂的逻辑来动态添加球体
  console.log('Add sphere functionality would be implemented here');
};

// 重置场景
const resetScene = () => {
  boxPositions.value = [
    [2, 5, 0],
    [0, 7, 2],
    [-2, 9, -1],
    [1, 11, 1],
    [-1, 13, 0]
  ];
};

onMounted(() => {
  // 初始化逻辑
});
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  background-color: #000;
  overflow: hidden;
  position: relative;
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 10;
}

button {
  background-color: #444;
  color: white;
  border: none;
  padding: 8px 16px;
  margin-right: 8px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #666;
}
</style> 