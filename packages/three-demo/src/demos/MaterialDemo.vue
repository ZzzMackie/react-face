<template>
  <div class="material-demo">
    <ThreeRenderer
      :width="width"
      :height="height"
      :background="background"
    >
      <PerspectiveCamera
        :position="[0, 5, 15]"
        :fov="60"
        :aspect="width / height"
        :near="0.1"
        :far="1000"
      />

      <AmbientLight :intensity="0.4" />
      <DirectionalLight :position="[10, 10, 5]" :intensity="0.8" />
      <PointLight :position="[0, 10, 0]" :intensity="0.5" />

      <GridHelper :size="20" :divisions="20" />

      <!-- 标准材质 -->
      <Mesh :position="[-6, 2, 0]" :rotation="[rotation, rotation, 0]">
        <BoxGeometry :width="2" :height="2" :depth="2" />
        <MeshStandardMaterial 
          :color="0x00ff00" 
          :metalness="0.1" 
          :roughness="0.8" 
        />
      </Mesh>

      <!-- 金属材质 -->
      <Mesh :position="[-2, 2, 0]" :rotation="[rotation, rotation, 0]">
        <BoxGeometry :width="2" :height="2" :depth="2" />
        <MeshStandardMaterial 
          :color="0x888888" 
          :metalness="1.0" 
          :roughness="0.1" 
        />
      </Mesh>

      <!-- 塑料材质 -->
      <Mesh :position="[2, 2, 0]" :rotation="[rotation, rotation, 0]">
        <BoxGeometry :width="2" :height="2" :depth="2" />
        <MeshStandardMaterial 
          :color="0xff0000" 
          :metalness="0.0" 
          :roughness="0.3" 
        />
      </Mesh>

      <!-- 玻璃材质 -->
      <Mesh :position="[6, 2, 0]" :rotation="[rotation, rotation, 0]">
        <BoxGeometry :width="2" :height="2" :depth="2" />
        <MeshPhysicalMaterial 
          :color="0xffffff" 
          :metalness="0.0" 
          :roughness="0.0"
          :transmission="0.9"
          :thickness="0.5"
        />
      </Mesh>

      <!-- 线框材质 -->
      <Mesh :position="[-6, 6, 0]">
        <SphereGeometry :radius="1" />
        <MeshBasicMaterial :color="0x00ffff" :wireframe="true" />
      </Mesh>

      <!-- 发光材质 -->
      <Mesh :position="[-2, 6, 0]">
        <SphereGeometry :radius="1" />
        <MeshBasicMaterial :color="0xffff00" />
      </Mesh>

      <!-- 法线材质 -->
      <Mesh :position="[2, 6, 0]">
        <SphereGeometry :radius="1" />
        <MeshNormalMaterial />
      </Mesh>

      <!-- 深度材质 -->
      <Mesh :position="[6, 6, 0]">
        <SphereGeometry :radius="1" />
        <MeshDepthMaterial />
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
  PointLight,
  GridHelper,
  Mesh,
  BoxGeometry,
  SphereGeometry,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  MeshBasicMaterial,
  MeshNormalMaterial,
  MeshDepthMaterial,
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
.material-demo {
  width: 100%;
  height: 100%;
}
</style> 