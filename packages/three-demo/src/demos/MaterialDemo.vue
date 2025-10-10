<template>
  <div class="material-demo">
    <ThreeCanvas
      :width="width"
      :height="height"
      :background="background"
    >
      <ThreeCamera
        :position="[0, 5, 15]"
        :fov="60"
        :aspect="width / height"
        :near="0.1"
        :far="1000"
      />

      <ThreeAmbientLight :intensity="0.4" />
      <ThreeDirectionalLight :position="[10, 10, 5]" :intensity="0.8" />
      <ThreePointLight :position="[0, 10, 0]" :intensity="0.5" />

      <ThreeGridHelper :size="20" :divisions="20" />

      <!-- 标准材质 -->
      <ThreeMesh :position="[-6, 2, 0]" :rotation="[rotation, rotation, 0]">
        <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
        <ThreeMeshStandardMaterial 
          :color="0x00ff00" 
          :metalness="0.1" 
          :roughness="0.8" 
        />
      </ThreeMesh>

      <!-- 金属材质 -->
      <ThreeMesh :position="[-2, 2, 0]" :rotation="[rotation, rotation, 0]">
        <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
        <ThreeMeshStandardMaterial 
          :color="0x888888" 
          :metalness="1.0" 
          :roughness="0.1" 
        />
      </ThreeMesh>

      <!-- 塑料材质 -->
      <ThreeMesh :position="[2, 2, 0]" :rotation="[rotation, rotation, 0]">
        <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
        <ThreeMeshStandardMaterial 
          :color="0xff0000" 
          :metalness="0.0" 
          :roughness="0.3" 
        />
      </ThreeMesh>

      <!-- 基础材质 -->
      <ThreeMesh :position="[6, 2, 0]" :rotation="[rotation, rotation, 0]">
        <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
        <ThreeMeshBasicMaterial 
          :color="0xffffff" 
        />
      </ThreeMesh>

      <!-- 线框材质 -->
      <ThreeMesh :position="[-6, 6, 0]">
        <ThreeSphereGeometry :radius="1" />
        <ThreeMeshBasicMaterial :color="0x00ffff" :wireframe="true" />
      </ThreeMesh>

      <!-- 发光材质 -->
      <ThreeMesh :position="[-2, 6, 0]">
        <ThreeSphereGeometry :radius="1" />
        <ThreeMeshBasicMaterial :color="0xffff00" />
      </ThreeMesh>

      <!-- 标准材质球体 -->
      <ThreeMesh :position="[2, 6, 0]">
        <ThreeSphereGeometry :radius="1" />
        <ThreeMeshStandardMaterial :color="0x8800ff" />
      </ThreeMesh>

      <!-- 基础材质立方体 -->
      <ThreeMesh :position="[6, 6, 0]">
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
.material-demo {
  width: 100%;
  height: 100%;
}
</style> 