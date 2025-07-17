<template>
  <div class="scene-container">
    <three-canvas :width="800" :height="600">
      <three-scene :background="0x87ceeb">
        <three-camera 
          type="perspective" 
          :position="[0, 2, 5]" 
          :lookAt="[0, 0, 0]" 
          :makeDefault="true"
        />
        <three-mesh :position="[0, 0, 0]">
          <three-box 
            :width="1" 
            :height="1" 
            :depth="1" 
            :widthSegments="1" 
            :heightSegments="1"
            :depthSegments="1" 
            :center="true"
          />
          <three-mesh-standard-material
            color="red"
            :roughness="0.5"
            :metalness="0.5"
          />
        </three-mesh>
        
        <three-mesh :position="[2, 0, 0]">
          <three-geometry type="sphere" />
          <three-mesh-standard-material
            color="blue"
            :roughness="0.2"
            :metalness="0.8"
          />
        </three-mesh>
        
        <three-mesh :position="[-2, 0, 0]">
          <three-geometry type="torus" />
          <three-mesh-standard-material
            color="green"
            :roughness="0.8"
            :metalness="0.2"
          />
        </three-mesh>
        
        <three-object :position="[0, 5, 0]">
          <!-- 环境光 -->
          <three-object
            :object="ambientLight"
          />
          
          <!-- 方向光 -->
          <three-object
            :object="directionalLight"
            :position="[5, 5, 5]"
          />
        </three-object>
      </three-scene>
    </three-canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as THREE from 'three';

import {
  ThreeCanvas,
  ThreeScene,
  ThreeCamera,
  ThreeObject,
  ThreeMesh,
  ThreeBox,
  ThreeGeometry,
  ThreeMeshStandardMaterial,
  useFrame
} from '../src';

// 创建灯光
const ambientLight = ref(new THREE.AmbientLight(0xffffff, 0.5));
const directionalLight = ref(new THREE.DirectionalLight(0xffffff, 0.8));

// 旋转动画
const rotationSpeed = 0.01;

onMounted(() => {
  // 使用 useFrame 实现旋转动画
  useFrame((state, delta) => {
    // 获取所有 meshes
    const meshes = state.scene?.children.filter(obj => obj instanceof THREE.Mesh);
    
    if (meshes && meshes.length > 0) {
      // 旋转每个网格
      meshes.forEach(mesh => {
        if (mesh instanceof THREE.Mesh) {
          mesh.rotation.x += rotationSpeed;
          mesh.rotation.y += rotationSpeed * 0.5;
        }
      });
    }
  });
});
</script>

<style scoped>
.scene-container {
  width: 800px;
  height: 600px;
  margin: 0 auto;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}
</style> 