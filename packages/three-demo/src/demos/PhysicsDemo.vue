<template>
  <div class="physics-demo">
    <ThreeCanvas
      :width="width"
      :height="height"
      :background="background"
    >
      <ThreeCamera
        :position="[0, 15, 25]"
        :fov="60"
        :aspect="width / height"
        :near="0.1"
        :far="1000"
      />

      <ThreeAmbientLight :intensity="0.4" />
      <ThreeDirectionalLight :position="[10, 10, 5]" :intensity="0.8" />

      <!-- 地面 -->
      <ThreeMesh :position="[0, -5, 0]" :receive-shadow="true">
        <ThreePlaneGeometry :width="20" :height="20" />
        <ThreeMeshStandardMaterial :color="0x808080" />
      </ThreeMesh>

      <!-- 左墙 -->
      <ThreeMesh :position="[-10, 0, 0]">
        <ThreeBoxGeometry :width="1" :height="10" :depth="20" />
        <ThreeMeshStandardMaterial :color="0x444444" />
      </ThreeMesh>

      <!-- 右墙 -->
      <ThreeMesh :position="[10, 0, 0]">
        <ThreeBoxGeometry :width="1" :height="10" :depth="20" />
        <ThreeMeshStandardMaterial :color="0x444444" />
      </ThreeMesh>

      <!-- 后墙 -->
      <ThreeMesh :position="[0, 0, -10]">
        <ThreeBoxGeometry :width="20" :height="10" :depth="1" />
        <ThreeMeshStandardMaterial :color="0x444444" />
      </ThreeMesh>

      <!-- 前墙 -->
      <ThreeMesh :position="[0, 0, 10]">
        <ThreeBoxGeometry :width="20" :height="10" :depth="1" />
        <ThreeMeshStandardMaterial :color="0x444444" />
      </ThreeMesh>

      <!-- 动态球体 -->
      <ThreeMesh
        v-for="(ball, index) in balls"
        :key="index"
        :position="ball.position"
        :cast-shadow="true"
      >
        <ThreeSphereGeometry :radius="0.5" />
        <ThreeMeshStandardMaterial :color="ball.color" />
      </ThreeMesh>

      <!-- 动态立方体 -->
      <ThreeMesh
        v-for="(cube, index) in cubes"
        :key="`cube-${index}`"
        :position="cube.position"
        :cast-shadow="true"
      >
        <ThreeBoxGeometry :width="1" :height="1" :depth="1" />
        <ThreeMeshStandardMaterial :color="cube.color" />
      </ThreeMesh>

      <ThreeOrbitControls />
    </ThreeCanvas>

    <!-- 控制面板 -->
    <div class="physics-controls">
      <button @click="addBall">添加球体</button>
      <button @click="addCube">添加立方体</button>
      <button @click="clearObjects">清空对象</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const width = ref(window.innerWidth)
const height = ref(window.innerHeight)
const background = ref(0x000000)

const balls = ref<any[]>([])
const cubes = ref<any[]>([])

const colors = [
  0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff,
  0xff8800, 0x8800ff, 0x0088ff, 0xff0088, 0x88ff00, 0x008888
]

const addBall = () => {
  const color = colors[Math.floor(Math.random() * colors.length)]
  balls.value.push({
    position: [Math.random() * 10 - 5, 10, Math.random() * 10 - 5],
    color
  })
}

const addCube = () => {
  const color = colors[Math.floor(Math.random() * colors.length)]
  cubes.value.push({
    position: [Math.random() * 10 - 5, 10, Math.random() * 10 - 5],
    color
  })
}

const clearObjects = () => {
  balls.value = []
  cubes.value = []
}

const handleResize = () => {
  width.value = window.innerWidth
  height.value = window.innerHeight
}

onMounted(() => {
  // 初始化一些对象
  addBall()
  addCube()
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.physics-demo {
  width: 100%;
  height: 100%;
  position: relative;
}

.physics-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.physics-controls button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  margin: 5px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: block;
  width: 100%;
}

.physics-controls button:hover {
  background: #45a049;
}
</style> 