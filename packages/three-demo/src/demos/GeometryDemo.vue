<template>
  <div class="geometry-demo">
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

      <AmbientLight :intensity="0.3" />
      <DirectionalLight :position="[10, 10, 5]" :intensity="0.8" />

      <GridHelper :size="30" :divisions="30" />
      <AxesHelper :size="10" />

      <!-- 立方体 -->
      <Mesh :position="[-8, 2, 0]" :rotation="[rotation, rotation, 0]">
        <BoxGeometry :width="3" :height="3" :depth="3" />
        <MeshStandardMaterial :color="0x00ff00" :wireframe="false" />
      </Mesh>

      <!-- 球体 -->
      <Mesh :position="[-4, 2, 0]">
        <SphereGeometry :radius="1.5" :width-segments="32" :height-segments="16" />
        <MeshStandardMaterial :color="0xff0000" :wireframe="false" />
      </Mesh>

      <!-- 圆柱体 -->
      <Mesh :position="[0, 2, 0]">
        <CylinderGeometry :radius-top="1.5" :radius-bottom="1.5" :height="3" />
        <MeshStandardMaterial :color="0x0000ff" :wireframe="false" />
      </Mesh>

      <!-- 圆锥体 -->
      <Mesh :position="[4, 2, 0]">
        <ConeGeometry :radius="1.5" :height="3" />
        <MeshStandardMaterial :color="0xffff00" :wireframe="false" />
      </Mesh>

      <!-- 圆环 -->
      <Mesh :position="[8, 2, 0]">
        <TorusGeometry :radius="2" :tube="0.5" />
        <MeshStandardMaterial :color="0xff00ff" :wireframe="false" />
      </Mesh>

      <!-- 八面体 -->
      <Mesh :position="[-8, 6, 0]">
        <OctahedronGeometry :radius="1.5" />
        <MeshStandardMaterial :color="0x00ffff" :wireframe="false" />
      </Mesh>

      <!-- 四面体 -->
      <Mesh :position="[-4, 6, 0]">
        <TetrahedronGeometry :radius="1.5" />
        <MeshStandardMaterial :color="0xff8800" :wireframe="false" />
      </Mesh>

      <!-- 二十面体 -->
      <Mesh :position="[0, 6, 0]">
        <IcosahedronGeometry :radius="1.5" />
        <MeshStandardMaterial :color="0x8800ff" :wireframe="false" />
      </Mesh>

      <!-- 十二面体 -->
      <Mesh :position="[4, 6, 0]">
        <DodecahedronGeometry :radius="1.5" />
        <MeshStandardMaterial :color="0x0088ff" :wireframe="false" />
      </Mesh>

      <!-- 圆环结 -->
      <Mesh :position="[8, 6, 0]">
        <TorusKnotGeometry :radius="1.5" :tube="0.4" />
        <MeshStandardMaterial :color="0xff0088" :wireframe="false" />
      </Mesh>

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
  GridHelper,
  AxesHelper,
  Mesh,
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  ConeGeometry,
  TorusGeometry,
  OctahedronGeometry,
  TetrahedronGeometry,
  IcosahedronGeometry,
  DodecahedronGeometry,
  TorusKnotGeometry,
  MeshStandardMaterial,
  OrbitControls
} from 'three-render'

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