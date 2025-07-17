<template>
  <div class="complex-scene-container">
    <ThreeCanvas>
      <ThreeScene>
        <!-- 相机 -->
        <ThreeCamera :position="[0, 5, 10]" :lookAt="[0, 0, 0]" :makeDefault="true" />
        
        <!-- 灯光 -->
        <ThreeDirectionalLight :position="[5, 5, 5]" :intensity="1" :castShadow="true" />
        <ThreeDirectionalLight :position="[-5, 5, -5]" :color="0x8080ff" :intensity="0.5" />
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -2, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receiveShadow="true">
          <ThreePlane :width="20" :height="20" :widthSegments="10" :heightSegments="10" />
          <ThreeMeshStandardMaterial :color="0xaaaaaa" :roughness="0.8" :metalness="0.2" />
        </ThreeMesh>
        
        <!-- 中心立方体 -->
        <ThreeMesh :position="[0, 0, 0]" :castShadow="true">
          <ThreeBox />
          <ThreeMeshStandardMaterial :color="0xff3333" :roughness="0.4" :metalness="0.6" />
        </ThreeMesh>
        
        <!-- 球体 -->
        <ThreeMesh :position="[-3, 0, 0]" :castShadow="true">
          <ThreeSphere :radius="1" />
          <ThreeMeshStandardMaterial :color="0x33ff33" :roughness="0.2" :metalness="0.8" />
        </ThreeMesh>
        
        <!-- 小立方体群 -->
        <ThreeMesh v-for="i in 5" :key="i" 
            :position="[Math.sin(i * Math.PI * 0.4) * 4, 0, Math.cos(i * Math.PI * 0.4) * 4]" 
            :castShadow="true">
          <ThreeBox :width="0.75" :height="0.75" :depth="0.75" />
          <ThreeMeshStandardMaterial :color="0x3333ff" :roughness="0.5" :metalness="0.5" />
        </ThreeMesh>
        
        <!-- 轨道控制器 -->
        <ThreeOrbitControls :enableDamping="true" :dampingFactor="0.05" />
      </ThreeScene>
    </ThreeCanvas>
  </div>
</template>

<script setup>
import {
  ThreeCanvas,
  ThreeScene,
  ThreeCamera,
  ThreeMesh,
  ThreeBox,
  ThreeSphere,
  ThreePlane,
  ThreeMeshStandardMaterial,
  ThreeDirectionalLight,
  ThreeOrbitControls
} from '../src';
</script>

<style scoped>
.complex-scene-container {
  width: 100%;
  height: 100vh;
  background-color: #000;
}
</style> 