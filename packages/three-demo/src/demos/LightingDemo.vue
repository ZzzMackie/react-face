<template>
  <div class="lighting-demo">
    <ThreeRenderer
      :width="width"
      :height="height"
      :background="background"
    >
      <PerspectiveCamera
        :position="[0, 10, 20]"
        :fov="60"
        :aspect="width / height"
        :near="0.1"
        :far="1000"
      />

      <!-- 环境光 -->
      <AmbientLight :intensity="0.2" />

      <!-- 方向光 -->
      <DirectionalLight
        :position="[10, 10, 5]"
        :intensity="0.8"
        :cast-shadow="true"
      />

      <!-- 点光源 -->
      <PointLight
        :position="[0, 10, 0]"
        :intensity="0.5"
        :distance="20"
        :decay="2"
      />

      <!-- 聚光灯 -->
      <SpotLight
        :position="[0, 15, 0]"
        :target="spotLightTarget"
        :intensity="0.8"
        :angle="0.3"
        :penumbra="0.1"
        :distance="30"
        :cast-shadow="true"
      />

      <!-- 半球光 -->
      <HemisphereLight
        :sky-color="0x87ceeb"
        :ground-color="0x8b4513"
        :intensity="0.3"
      />

      <GridHelper :size="30" :divisions="30" />

      <!-- 地面 -->
      <Mesh :position="[0, -2, 0]" :receive-shadow="true">
        <PlaneGeometry :width="30" :height="30" />
        <MeshStandardMaterial :color="0x808080" />
      </Mesh>

      <!-- 立方体组 -->
      <Group v-for="(cube, index) in cubes" :key="index">
        <Mesh
          :position="cube.position"
          :rotation="[rotation, rotation, 0]"
          :cast-shadow="true"
          :receive-shadow="true"
        >
          <BoxGeometry :width="2" :height="2" :depth="2" />
          <MeshStandardMaterial :color="cube.color" />
        </Mesh>
      </Group>

      <!-- 球体组 -->
      <Group v-for="(sphere, index) in spheres" :key="index">
        <Mesh
          :position="sphere.position"
          :cast-shadow="true"
          :receive-shadow="true"
        >
          <SphereGeometry :radius="1" />
          <MeshStandardMaterial :color="sphere.color" />
        </Mesh>
      </Group>

      <OrbitControls />
    </ThreeRenderer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ThreeRenderer,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  HemisphereLight,
  GridHelper,
  Mesh,
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  Group,
  OrbitControls
} from 'three-render'

const width = ref(window.innerWidth)
const height = ref(window.innerHeight)
const background = ref(0x000000)
const rotation = ref(0)
const spotLightTarget = ref([0, 0, 0])

const cubes = ref([
  { position: [-6, 0, 0], color: 0x00ff00 },
  { position: [-2, 0, 0], color: 0xff0000 },
  { position: [2, 0, 0], color: 0x0000ff },
  { position: [6, 0, 0], color: 0xffff00 }
])

const spheres = ref([
  { position: [-6, 4, 0], color: 0xff00ff },
  { position: [-2, 4, 0], color: 0x00ffff },
  { position: [2, 4, 0], color: 0xff8800 },
  { position: [6, 4, 0], color: 0x8800ff }
])

let animationId: number

const animate = () => {
  rotation.value += 0.01
  animationId = requestAnimationFrame(animate)
}

const handleResize = () => {
  width.value = window.innerWidth
  height.value = window.innerHeight
}

onMounted(() => {
  animate()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.lighting-demo {
  width: 100%;
  height: 100%;
}
</style> 