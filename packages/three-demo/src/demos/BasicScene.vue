<template>
  <div class="basic-scene">
    <ThreeRenderer
      :width="width"
      :height="height"
      :background="background"
      @renderer-ready="onRendererReady"
    >
      <!-- 透视相机 -->
      <PerspectiveCamera
        :position="[0, 5, 10]"
        :fov="75"
        :aspect="width / height"
        :near="0.1"
        :far="1000"
      />

      <!-- 环境光 -->
      <AmbientLight :intensity="0.4" />

      <!-- 方向光 -->
      <DirectionalLight
        :position="[10, 10, 5]"
        :intensity="1"
        :cast-shadow="true"
      />

      <!-- 网格辅助线 -->
      <GridHelper :size="20" :divisions="20" />

      <!-- 坐标轴辅助 -->
      <AxesHelper :size="5" />

      <!-- 立方体 -->
      <Mesh
        :position="[0, 1, 0]"
        :rotation="[0, rotation, 0]"
        :cast-shadow="true"
        :receive-shadow="true"
      >
        <BoxGeometry :width="2" :height="2" :depth="2" />
        <MeshStandardMaterial :color="0x00ff00" />
      </Mesh>

      <!-- 球体 -->
      <Mesh
        :position="[3, 1, 0]"
        :cast-shadow="true"
        :receive-shadow="true"
      >
        <SphereGeometry :radius="1" :width-segments="32" :height-segments="16" />
        <MeshStandardMaterial :color="0xff0000" />
      </Mesh>

      <!-- 圆柱体 -->
      <Mesh
        :position="[-3, 1, 0]"
        :cast-shadow="true"
        :receive-shadow="true"
      >
        <CylinderGeometry :radius-top="1" :radius-bottom="1" :height="2" />
        <MeshStandardMaterial :color="0x0000ff" />
      </Mesh>

      <!-- 地面 -->
      <Mesh :position="[0, -1, 0]" :receive-shadow="true">
        <PlaneGeometry :width="20" :height="20" />
        <MeshStandardMaterial :color="0x808080" />
      </Mesh>

      <!-- 轨道控制器 -->
      <OrbitControls
        :enable-damping="true"
        :damping-factor="0.05"
        :enable-zoom="true"
        :enable-pan="true"
        :enable-rotate="true"
      />
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
  GridHelper,
  AxesHelper,
  Mesh,
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  OrbitControls
} from 'three-render'

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