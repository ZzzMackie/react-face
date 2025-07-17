<template>
  <div class="use-frame-container">
    <ThreeCanvas>
      <ThreeScene>
        <!-- 相机 -->
        <ThreeCamera :position="[0, 2, 10]" :lookAt="[0, 0, 0]" :makeDefault="true" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.4" />
        <ThreeDirectionalLight :position="[5, 5, 5]" :intensity="0.6" :castShadow="true" />
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -2, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receiveShadow="true">
          <ThreePlane :width="20" :height="20" />
          <ThreeMeshStandardMaterial :color="0x444444" :roughness="0.8" :metalness="0.2" />
        </ThreeMesh>
        
        <!-- 旋转的立方体 -->
        <ThreeMesh 
          ref="cubeMesh"
          :position="[0, 0, 0]" 
          :castShadow="true"
        >
          <ThreeBox />
          <ThreeMeshStandardMaterial :color="0xff3333" :roughness="0.4" :metalness="0.6" />
        </ThreeMesh>
        
        <!-- 波浪效果的球体阵列 -->
        <ThreeMesh 
          v-for="(sphere, i) in spheres" 
          :key="i"
          :position="sphere.position" 
          :castShadow="true"
          :ref="el => { if (el) sphereRefs[i] = el; }"
        >
          <ThreeSphere :radius="0.3" />
          <ThreeMeshStandardMaterial :color="sphere.color" :roughness="0.2" :metalness="0.8" />
        </ThreeMesh>
        
        <!-- 轨道控制器 -->
        <ThreeOrbitControls :enableDamping="true" :dampingFactor="0.05" />
      </ThreeScene>
    </ThreeCanvas>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import {
  ThreeCanvas,
  ThreeScene,
  ThreeCamera,
  ThreeMesh,
  ThreeBox,
  ThreeSphere,
  ThreePlane,
  ThreeMeshStandardMaterial,
  ThreeAmbientLight,
  ThreeDirectionalLight,
  ThreeOrbitControls,
  useFrame
} from '../src';

// 引用立方体网格
const cubeMesh = ref(null);

// 创建球体阵列数据
const gridSize = 10;
const spheres = reactive([]);
const sphereRefs = reactive([]);

// 初始化球体阵列
for (let x = 0; x < gridSize; x++) {
  for (let z = 0; z < gridSize; z++) {
    const xPos = (x - gridSize / 2 + 0.5) * 1.2;
    const zPos = (z - gridSize / 2 + 0.5) * 1.2;
    
    // 计算距离中心的距离，用于颜色渐变
    const distanceFromCenter = Math.sqrt(xPos * xPos + zPos * zPos);
    const maxDistance = Math.sqrt(2) * (gridSize / 2) * 1.2;
    const colorFactor = distanceFromCenter / maxDistance;
    
    // 创建HSL颜色，基于距离
    const hue = (colorFactor * 270) % 360;
    const color = `hsl(${hue}, 100%, 50%)`;
    
    spheres.push({
      position: [xPos, 0, zPos],
      originalY: 0,
      color: color,
      phase: Math.random() * Math.PI * 2 // 随机相位，使波浪效果更自然
    });
    
    // 为每个球体预留一个引用位置
    sphereRefs.push(null);
  }
}

// 使用useFrame进行动画
useFrame((state, delta) => {
  // 立方体旋转
  if (cubeMesh.value) {
    cubeMesh.value.rotation.x += delta * 0.5;
    cubeMesh.value.rotation.y += delta * 0.3;
  }
  
  // 球体波浪动画
  const time = state.clock.getElapsedTime();
  
  spheres.forEach((sphere, index) => {
    const meshRef = sphereRefs[index];
    if (meshRef) {
      // 计算球体的新位置
      const x = sphere.position[0];
      const z = sphere.position[2];
      
      // 创建从中心向外扩散的波浪效果
      const distance = Math.sqrt(x * x + z * z);
      const wave = Math.sin(distance * 1.5 - time * 2 + sphere.phase) * 0.5;
      
      // 更新Y位置
      meshRef.position.y = sphere.originalY + wave;
      
      // 可选：根据波浪高度调整颜色
      const material = meshRef.children[1]; // 假设材质是第二个子元素
      if (material && material.material) {
        // 根据波浪高度调整材质的金属度
        material.material.metalness = 0.4 + wave * 0.4;
      }
    }
  });
});
</script>

<style scoped>
.use-frame-container {
  width: 100%;
  height: 100vh;
  background-color: #000;
}
</style> 