<template>
  <div class="geometry-demo">
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

      <ThreeAmbientLight :intensity="0.3" />
      <ThreeDirectionalLight :position="[10, 10, 5]" :intensity="0.8" />

      <ThreeGridHelper :size="30" :divisions="30" />
      <ThreeAxesHelper :size="10" />

      <!-- 立方体 -->
      <ThreeMesh :position="[-8, 2, 0]" :rotation="[rotation, rotation, 0]">
        <ThreeBoxGeometry :width="3" :height="3" :depth="3" />
        <ThreeMeshStandardMaterial :color="0x00ff00" :wireframe="false" />
      </ThreeMesh>

      <!-- 球体 -->
      <ThreeMesh :position="[-4, 2, 0]">
        <ThreeSphereGeometry :radius="1.5" :width-segments="32" :height-segments="16" />
        <ThreeMeshStandardMaterial :color="0xff0000" :wireframe="false" />
      </ThreeMesh>

      <!-- 圆环 -->
      <ThreeMesh :position="[0, 2, 0]">
        <ThreeTorusGeometry :radius="2" :tube="0.5" />
        <ThreeMeshStandardMaterial :color="0x0000ff" :wireframe="false" />
      </ThreeMesh>

      <!-- 平面 -->
      <ThreeMesh :position="[4, 2, 0]">
        <ThreePlaneGeometry :width="3" :height="3" />
        <ThreeMeshStandardMaterial :color="0xffff00" :wireframe="false" />
      </ThreeMesh>

      <!-- 线框立方体 -->
      <ThreeMesh :position="[8, 2, 0]">
        <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
        <ThreeMeshStandardMaterial :color="0xff00ff" :wireframe="true" />
      </ThreeMesh>

      <!-- 线框球体 -->
      <ThreeMesh :position="[-8, 6, 0]">
        <ThreeSphereGeometry :radius="1.5" />
        <ThreeMeshStandardMaterial :color="0x00ffff" :wireframe="true" />
      </ThreeMesh>

      <!-- 线框圆环 -->
      <ThreeMesh :position="[-4, 6, 0]">
        <ThreeTorusGeometry :radius="1.5" :tube="0.4" />
        <ThreeMeshStandardMaterial :color="0xff8800" :wireframe="true" />
      </ThreeMesh>

      <!-- 线框平面 -->
      <ThreeMesh :position="[0, 6, 0]">
        <ThreePlaneGeometry :width="3" :height="3" />
        <ThreeMeshStandardMaterial :color="0x8800ff" :wireframe="true" />
      </ThreeMesh>

      <!-- 基础材质球体 -->
      <ThreeMesh :position="[4, 6, 0]">
        <ThreeSphereGeometry :radius="1.5" />
        <ThreeMeshBasicMaterial :color="0x0088ff" />
      </ThreeMesh>

      <!-- 基础材质立方体 -->
      <ThreeMesh :position="[8, 6, 0]">
        <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
        <ThreeMeshBasicMaterial :color="0xff0088" />
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
.geometry-demo {
  width: 100%;
  height: 100%;
}
</style> 