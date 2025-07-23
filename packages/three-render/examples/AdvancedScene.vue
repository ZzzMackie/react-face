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
        
        <!-- GLTF 模型 (如果有模型文件) -->
        <!-- 
        <ThreeGLTFLoader 
          src="/models/robot.glb" 
          :position="[-5, 0, 0]" 
          :scale="1.5"
          :cast-shadow="true"
          :receive-shadow="true"
          :animation-index="0"
          :animation-play="true"
          :animation-loop="true"
        />
        -->
        
        <!-- 3D 文本 -->
        <ThreeObject :position="[0, 3, 0]" :rotation="[0, -Math.PI/6, 0]">
          <ThreeText 
            text="Three.js + Vue" 
            font-path="/fonts/helvetiker_bold.typeface.json"
            :size="1"
            :height="0.2"
            :bevel-enabled="true"
            :bevel-thickness="0.05"
            :bevel-size="0.02"
            :bevel-segments="3"
            color="#ff3366"
            :metalness="0.8"
            :roughness="0.2"
            :cast-shadow="true"
          />
        </ThreeObject>
        
        <!-- 精灵 -->
        <ThreeSprite 
          src="/textures/circle.png"
          :position="[4, 2, 2]"
          :scale="1"
          color="#ffff00"
          :opacity="0.8"
        />
        
        <!-- 粒子系统 -->
        <ThreeParticleSystem 
          :count="1000"
          :size="0.05"
          color="#4488ff"
          :spread="8"
          :position="[0, 0, 0]"
          :animated="true"
          :animation-speed="0.2"
          texture="/textures/particle.png"
        />
        
        <!-- 几何体展示 -->
        <ThreeMesh :position="[-4, 0, -3]" :rotation="[0, Math.PI/4, 0]" :cast-shadow="true">
          <ThreeBox :width="1.5" :height="1.5" :depth="1.5" />
          <ThreeMeshStandardMaterial color="#ff4400" :metalness="0.5" :roughness="0.5" />
        </ThreeMesh>
        
        <ThreeMesh :position="[-2, 0, 0]" :cast-shadow="true">
          <ThreeSphere :radius="1" :width-segments="32" :height-segments="32" />
          <ThreeMeshPhongMaterial color="#44ff44" :shininess="60" />
        </ThreeMesh>
        
        <ThreeMesh :position="[2, 0, 0]" :rotation="[0, 0, 0]" :cast-shadow="true">
          <ThreeTorus :radius="1" :tube="0.4" :radial-segments="16" :tubular-segments="100" />
          <ThreeMeshStandardMaterial color="#4444ff" :metalness="0.8" :roughness="0.2" />
        </ThreeMesh>
        
        <ThreeMesh :position="[4, 0, -3]" :rotation="[0, -Math.PI/4, 0]" :cast-shadow="true">
          <ThreeCone :radius="1" :height="2" :radial-segments="32" />
          <ThreeMeshStandardMaterial color="#ff44ff" :metalness="0.3" :roughness="0.7" />
        </ThreeMesh>
        
        <!-- 后处理 -->
        <ThreePostProcessing>
          <ThreeBloomEffect :strength="0.5" :radius="0.5" :threshold="0.8" />
          <ThreeFXAAEffect />
        </ThreePostProcessing>
      </ThreeScene>
    </ThreeCanvas>
  </div>
</template>

<script setup lang="ts">
import {
  ThreeCanvas,
  ThreeScene,
  ThreeCamera,
  ThreeMesh,
  ThreeObject,
  ThreeBox,
  ThreeSphere,
  ThreePlane,
  ThreeTorus,
  ThreeCone,
  ThreeMeshStandardMaterial,
  ThreeMeshPhongMaterial,
  ThreeDirectionalLight,
  ThreeAmbientLight,
  ThreePointLight,
  ThreeOrbitControls,
  ThreePostProcessing,
  ThreeBloomEffect,
  ThreeFXAAEffect,
  ThreeGLTFLoader,
  ThreeSprite,
  ThreeText,
  ThreeParticleSystem
} from '../src';
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  background-color: #000;
  overflow: hidden;
}
</style> 