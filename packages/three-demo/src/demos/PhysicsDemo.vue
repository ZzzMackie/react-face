<template>
  <div class="physics-demo">
    <ThreeRenderer
      :width="width"
      :height="height"
      :background="background"
    >
      <PerspectiveCamera
        :position="[0, 15, 25]"
        :fov="60"
        :aspect="width / height"
        :near="0.1"
        :far="1000"
      />

      <AmbientLight :intensity="0.4" />
      <DirectionalLight :position="[10, 10, 5]" :intensity="0.8" />

      <!-- 物理世界 -->
      <PhysicsWorld :gravity="[0, -9.81, 0]">
        <!-- 地面 -->
        <PhysicsBody :type="'static'" :position="[0, -5, 0]">
          <Mesh :receive-shadow="true">
            <PlaneGeometry :width="20" :height="20" />
            <MeshStandardMaterial :color="0x808080" />
          </Mesh>
          <PlaneCollider :width="20" :height="20" />
        </PhysicsBody>

        <!-- 左墙 -->
        <PhysicsBody :type="'static'" :position="[-10, 0, 0]">
          <Mesh>
            <BoxGeometry :width="1" :height="10" :depth="20" />
            <MeshStandardMaterial :color="0x444444" />
          </Mesh>
          <BoxCollider :width="1" :height="10" :depth="20" />
        </PhysicsBody>

        <!-- 右墙 -->
        <PhysicsBody :type="'static'" :position="[10, 0, 0]">
          <Mesh>
            <BoxGeometry :width="1" :height="10" :depth="20" />
            <MeshStandardMaterial :color="0x444444" />
          </Mesh>
          <BoxCollider :width="1" :height="10" :depth="20" />
        </PhysicsBody>

        <!-- 后墙 -->
        <PhysicsBody :type="'static'" :position="[0, 0, -10]">
          <Mesh>
            <BoxGeometry :width="20" :height="10" :depth="1" />
            <MeshStandardMaterial :color="0x444444" />
          </Mesh>
          <BoxCollider :width="20" :height="10" :depth="1" />
        </PhysicsBody>

        <!-- 前墙 -->
        <PhysicsBody :type="'static'" :position="[0, 0, 10]">
          <Mesh>
            <BoxGeometry :width="20" :height="10" :depth="1" />
            <MeshStandardMaterial :color="0x444444" />
          </Mesh>
          <BoxCollider :width="20" :height="10" :depth="1" />
        </PhysicsBody>

        <!-- 动态球体 -->
        <PhysicsBody
          v-for="(ball, index) in balls"
          :key="index"
          :type="'dynamic'"
          :position="ball.position"
          :mass="1"
        >
          <Mesh :cast-shadow="true">
            <SphereGeometry :radius="0.5" />
            <MeshStandardMaterial :color="ball.color" />
          </Mesh>
          <SphereCollider :radius="0.5" />
        </PhysicsBody>

        <!-- 动态立方体 -->
        <PhysicsBody
          v-for="(cube, index) in cubes"
          :key="`cube-${index}`"
          :type="'dynamic'"
          :position="cube.position"
          :mass="2"
        >
          <Mesh :cast-shadow="true">
            <BoxGeometry :width="1" :height="1" :depth="1" />
            <MeshStandardMaterial :color="cube.color" />
          </Mesh>
          <BoxCollider :width="1" :height="1" :depth="1" />
        </PhysicsBody>

        <!-- 圆柱体 -->
        <PhysicsBody
          v-for="(cylinder, index) in cylinders"
          :key="`cylinder-${index}`"
          :type="'dynamic'"
          :position="cylinder.position"
          :mass="1.5"
        >
          <Mesh :cast-shadow="true">
            <CylinderGeometry :radius-top="0.5" :radius-bottom="0.5" :height="1" />
            <MeshStandardMaterial :color="cylinder.color" />
          </Mesh>
          <CylinderCollider :radius-top="0.5" :radius-bottom="0.5" :height="1" />
        </PhysicsBody>
      </PhysicsWorld>

      <OrbitControls />
    </ThreeRenderer>

    <!-- 控制面板 -->
    <div class="physics-controls">
      <button @click="addBall">添加球体</button>
      <button @click="addCube">添加立方体</button>
      <button @click="addCylinder">添加圆柱体</button>
      <button @click="clearObjects">清空对象</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ThreeRenderer,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Mesh,
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  OrbitControls,
  PhysicsWorld,
  PhysicsBody,
  BoxCollider,
  SphereCollider,
  CylinderCollider,
  PlaneCollider
} from 'three-render'

const width = ref(window.innerWidth)
const height = ref(window.innerHeight)
const background = ref(0x000000)

const balls = ref<any[]>([])
const cubes = ref<any[]>([])
const cylinders = ref<any[]>([])

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

const addCylinder = () => {
  const color = colors[Math.floor(Math.random() * colors.length)]
  cylinders.value.push({
    position: [Math.random() * 10 - 5, 10, Math.random() * 10 - 5],
    color
  })
}

const clearObjects = () => {
  balls.value = []
  cubes.value = []
  cylinders.value = []
}

const handleResize = () => {
  width.value = window.innerWidth
  height.value = window.innerHeight
}

onMounted(() => {
  // 初始化一些对象
  addBall()
  addCube()
  addCylinder()
  
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