<template>
  <div class="animation-scene-container">
    <ThreeCanvas>
      <ThreeScene>
        <!-- 相机 -->
        <ThreeCamera :position="[0, 2, 10]" :lookAt="[0, 0, 0]" :makeDefault="true" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.4" />
        <ThreeDirectionalLight :position="[5, 5, 5]" :intensity="0.6" :castShadow="true" />
        <ThreePointLight 
          :position="lightPosition" 
          :color="0xff9000" 
          :intensity="1" 
          :distance="10" 
          :decay="2" 
        />
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -2, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receiveShadow="true">
          <ThreePlane :width="20" :height="20" :widthSegments="10" :heightSegments="10" />
          <ThreeMeshStandardMaterial :color="0x444444" :roughness="0.8" :metalness="0.2" />
        </ThreeMesh>
        
        <!-- 中心立方体 - 使用基础材质 -->
        <ThreeMesh 
          :position="[0, 0, 0]" 
          :rotation="cubeRotation" 
          :castShadow="true"
        >
          <ThreeBox :width="1.5" :height="1.5" :depth="1.5" />
          <ThreeMeshBasicMaterial :color="0xff3333" :wireframe="true" />
        </ThreeMesh>
        
        <!-- 环形 -->
        <ThreeMesh 
          :position="[0, 0, 0]" 
          :rotation="torusRotation" 
          :castShadow="true"
        >
          <ThreeTorus :radius="3" :tube="0.2" :radialSegments="16" :tubularSegments="100" />
          <ThreeMeshStandardMaterial :color="0x44ff44" :roughness="0.2" :metalness="0.8" />
        </ThreeMesh>
        
        <!-- 圆柱体群 -->
        <ThreeMesh 
          v-for="(cylinder, i) in cylinders" 
          :key="i"
          :position="cylinder.position" 
          :rotation="cylinder.rotation" 
          :castShadow="true"
        >
          <ThreeCylinder 
            :radiusTop="0.3" 
            :radiusBottom="0.3" 
            :height="1.5" 
            :radialSegments="16" 
          />
          <ThreeMeshStandardMaterial :color="cylinder.color" :roughness="0.5" :metalness="0.5" />
        </ThreeMesh>
        
        <!-- 轨道控制器 -->
        <ThreeOrbitControls :enableDamping="true" :dampingFactor="0.05" />
      </ThreeScene>
    </ThreeCanvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import {
  ThreeCanvas,
  ThreeScene,
  ThreeCamera,
  ThreeMesh,
  ThreeBox,
  ThreeCylinder,
  ThreeTorus,
  ThreePlane,
  ThreeMeshStandardMaterial,
  ThreeMeshBasicMaterial,
  ThreeAmbientLight,
  ThreeDirectionalLight,
  ThreePointLight,
  ThreeOrbitControls,
  useFrame
} from '../src';

// 动画状态
const cubeRotation = ref([0, 0, 0]);
const torusRotation = ref([Math.PI / 2, 0, 0]);
const lightPosition = ref([0, 3, 0]);

// 创建圆柱体数组
const cylinders = ref([]);
const cylinderCount = 8;

// 初始化圆柱体
for (let i = 0; i < cylinderCount; i++) {
  const angle = (i / cylinderCount) * Math.PI * 2;
  const radius = 5;
  cylinders.value.push({
    position: [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ],
    rotation: [0, angle, 0],
    color: 0x3333ff + (i * 0x110000) // 不同的颜色
  });
}

// 动画计时器
let animationId = null;
let time = 0;

// 动画函数
const animate = () => {
  time += 0.01;
  
  // 更新立方体旋转
  cubeRotation.value = [
    time * 0.5,
    time * 0.3,
    0
  ];
  
  // 更新环形旋转
  torusRotation.value = [
    Math.PI / 2,
    time * 0.2,
    0
  ];
  
  // 更新光源位置
  lightPosition.value = [
    Math.sin(time) * 5,
    2 + Math.sin(time * 0.7) * 1,
    Math.cos(time) * 5
  ];
  
  // 更新圆柱体
  for (let i = 0; i < cylinderCount; i++) {
    const cylinder = cylinders.value[i];
    const angle = (i / cylinderCount) * Math.PI * 2;
    const radius = 5;
    const height = 1 + Math.sin(time + i * 0.5) * 0.5;
    
    cylinder.position = [
      Math.cos(angle + time * 0.1) * radius,
      height - 1,
      Math.sin(angle + time * 0.1) * radius
    ];
    
    cylinder.rotation = [
      Math.sin(time * 0.5 + i) * 0.2,
      angle + time * 0.1,
      0
    ];
  }
  
  // 继续动画循环
  animationId = requestAnimationFrame(animate);
};

// 使用useFrame钩子
useFrame((state, delta) => {
  // 这里也可以进行动画更新
  // 但在这个例子中我们使用requestAnimationFrame来演示
});

// 组件挂载时启动动画
onMounted(() => {
  animate();
});

// 组件卸载时停止动画
onBeforeUnmount(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.animation-scene-container {
  width: 100%;
  height: 100vh;
  background-color: #000;
}
</style> 