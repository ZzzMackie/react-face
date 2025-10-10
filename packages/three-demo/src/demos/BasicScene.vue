<template>
  <div class="basic-scene">
    <ThreeCanvas
      :width="width"
      :height="height"
      :background="background"
      @renderer-ready="onRendererReady"
    >
      <!-- 透视相机 -->
      <ThreeCamera
        :position="[0, 5, 10]"
        :fov="75"
        :aspect="width / height"
        :near="0.1"
        :far="1000"
      />

      <!-- 环境光 -->
      <ThreeAmbientLight :intensity="0.4" />

      <!-- 方向光 -->
      <ThreeDirectionalLight
        :position="[10, 10, 5]"
        :intensity="1"
        :cast-shadow="true"
      />

      <!-- 网格辅助线 -->
      <ThreeGridHelper :size="20" :divisions="20" />

      <!-- 坐标轴辅助 -->
      <ThreeAxesHelper :size="5" />

      <!-- 立方体 -->
      <ThreeMesh
        :position="[0, 1, 0]"
        :rotation="[0, rotation, 0]"
        :cast-shadow="true"
        :receive-shadow="true"
      >
        <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
        <ThreeMeshStandardMaterial :color="0x00ff00" />
      </ThreeMesh>

      <!-- 球体 -->
      <ThreeMesh
        :position="[3, 1, 0]"
        :cast-shadow="true"
        :receive-shadow="true"
      >
        <ThreeSphereGeometry :radius="1" :width-segments="32" :height-segments="16" />
        <ThreeMeshStandardMaterial :color="0xff0000" />
      </ThreeMesh>

      <!-- 圆环 -->
      <ThreeMesh
        :position="[-3, 1, 0]"
        :cast-shadow="true"
        :receive-shadow="true"
      >
        <ThreeTorusGeometry :radius="1" :tube="0.3" />
        <ThreeMeshStandardMaterial :color="0x0000ff" />
      </ThreeMesh>

      <!-- 地面 -->
      <ThreeMesh :position="[0, -1, 0]" :receive-shadow="true">
        <ThreePlaneGeometry :width="20" :height="20" />
        <ThreeMeshStandardMaterial :color="0x808080" />
      </ThreeMesh>

      <!-- 轨道控制器 -->
      <ThreeOrbitControls
        :enable-damping="true"
        :damping-factor="0.05"
        :enable-zoom="true"
        :enable-pan="true"
        :enable-rotate="true"
      />
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

const onRendererReady = () => {
  console.log('渲染器已准备就绪')
}

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
.basic-scene {
  width: 100%;
  height: 100%;
}
</style> 