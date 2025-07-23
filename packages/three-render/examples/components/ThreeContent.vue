<template>
  <div>
    <!-- 地面 -->
    <ThreeMesh :position="[0, -0.5, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
      <ThreePlaneGeometry :width="20" :height="20" />
      <ThreeMeshStandardMaterial :color="0x999999" />
    </ThreeMesh>
    
    <!-- 中心立方体 -->
    <ThreeMesh :position="[0, 1, 0]" :rotation="[0, rotationY, 0]" :cast-shadow="true" :receive-shadow="true">
      <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
      <ThreeMeshStandardMaterial :color="0x3366cc" :metalness="0.5" :roughness="0.5" />
    </ThreeMesh>
    
    <!-- 围绕中心的球体 -->
    <ThreeMesh 
      v-for="(sphere, index) in spheres" 
      :key="`sphere-${index}`"
      :position="getSpherePosition(index)"
      :cast-shadow="true"
      :receive-shadow="true"
    >
      <ThreeSphereGeometry :radius="0.5" :width-segments="32" :height-segments="32" />
      <ThreeMeshStandardMaterial :color="sphere.color" :metalness="0.2" :roughness="0.8" />
    </ThreeMesh>
    
    <!-- 圆环 -->
    <ThreeMesh :position="[0, 0.5, 0]" :rotation="[Math.PI / 2, 0, rotationY * 0.5]" :cast-shadow="true" :receive-shadow="true">
      <ThreeTorusGeometry :radius="5" :tube="0.2" :radial-segments="16" :tubular-segments="100" />
      <ThreeMeshStandardMaterial :color="0xffcc00" :metalness="0.3" :roughness="0.7" />
    </ThreeMesh>
    
    <!-- 圆柱体 -->
    <ThreeMesh 
      v-for="(cylinder, index) in cylinders" 
      :key="`cylinder-${index}`"
      :position="cylinder.position"
      :rotation="[0, rotationY * (index % 2 ? 1 : -1), 0]"
      :cast-shadow="true"
      :receive-shadow="true"
    >
      <ThreeCylinderGeometry :radius-top="0.5" :radius-bottom="0.5" :height="2" :radial-segments="32" />
      <ThreeMeshStandardMaterial :color="cylinder.color" :metalness="0.4" :roughness="0.6" />
    </ThreeMesh>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useFrame } from '../../src/composables/useFrame';

// 旋转角度
const rotationY = ref<number>(0);

// 球体配置
const spheres = ref<{ color: number }[]>([
  { color: 0xff0000 },
  { color: 0x00ff00 },
  { color: 0x0000ff },
  { color: 0xff00ff },
  { color: 0xffff00 },
  { color: 0x00ffff }
]);

// 圆柱体配置
const cylinders = ref<{ position: [number, number, number]; color: number }[]>([
  { position: [-4, 1, -4], color: 0xcc3300 },
  { position: [4, 1, -4], color: 0x33cc00 },
  { position: [-4, 1, 4], color: 0x0033cc },
  { position: [4, 1, 4], color: 0xcc33cc }
]);

// 计算球体位置
const getSpherePosition = (index: number): [number, number, number] => {
  const angle = (index / spheres.value.length) * Math.PI * 2 + rotationY.value;
  const radius = 3;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = Math.sin(rotationY.value * 2 + index) * 0.5 + 1;
  return [x, y, z];
};

// 更新动画
const update = (time: number) => {
  rotationY.value = time * 0.0005;
};

// 添加帧更新
onMounted(() => {
  useFrame(update);
});
</script> 