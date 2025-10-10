<template>
  <div class="lighting-demo">
    <ThreeCanvas
      :width="width"
      :height="height"
      :background="background"
    >
      <ThreeCamera
        :position="[0, 10, 20]"
        :fov="60"
        :aspect="width / height"
        :near="0.1"
        :far="1000"
      />

      <!-- 环境光 -->
      <ThreeAmbientLight :intensity="0.2" />

      <!-- 方向光 -->
      <ThreeDirectionalLight
        :position="[10, 10, 5]"
        :intensity="0.8"
        :cast-shadow="true"
      />

      <!-- 点光源 -->
      <ThreePointLight
        :position="[0, 10, 0]"
        :intensity="0.5"
        :distance="20"
        :decay="2"
      />

      <!-- 聚光灯 -->
      <ThreeSpotLight
        :position="[0, 15, 0]"
        :target="spotLightTarget"
        :intensity="0.8"
        :angle="0.3"
        :penumbra="0.1"
        :distance="30"
        :cast-shadow="true"
      />

      <ThreeGridHelper :size="30" :divisions="30" />

      <!-- 地面 -->
      <ThreeMesh :position="[0, -2, 0]" :receive-shadow="true">
        <ThreePlaneGeometry :width="30" :height="30" />
        <ThreeMeshStandardMaterial :color="0x808080" />
      </ThreeMesh>

      <!-- 立方体组 -->
      <ThreeMesh
        v-for="(cube, index) in cubes"
        :key="index"
        :position="cube.position"
        :rotation="[rotation, rotation, 0]"
        :cast-shadow="true"
        :receive-shadow="true"
      >
        <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
        <ThreeMeshStandardMaterial :color="cube.color" />
      </ThreeMesh>

      <!-- 球体组 -->
      <ThreeMesh
        v-for="(sphere, index) in spheres"
        :key="`sphere-${index}`"
        :position="sphere.position"
        :cast-shadow="true"
        :receive-shadow="true"
      >
        <ThreeSphereGeometry :radius="1" />
        <ThreeMeshStandardMaterial :color="sphere.color" />
      </ThreeMesh>

      <ThreeOrbitControls />
    </ThreeCanvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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