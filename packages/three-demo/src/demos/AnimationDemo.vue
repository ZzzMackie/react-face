<template>
  <div class="animation-demo">
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

      <ThreeAmbientLight :intensity="0.4" />
      <ThreeDirectionalLight :position="[10, 10, 5]" :intensity="0.8" />

      <ThreeGridHelper :size="30" :divisions="30" />

      <!-- 旋转的立方体 -->
      <ThreeMesh
        :position="[-8, 2, 0]"
        :rotation="[rotation, rotation * 2, rotation * 0.5]"
      >
        <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
        <ThreeMeshStandardMaterial :color="0x00ff00" />
      </ThreeMesh>

      <!-- 弹跳的球体 -->
      <ThreeMesh :position="[-4, bounceHeight, 0]">
        <ThreeSphereGeometry :radius="1" />
        <ThreeMeshStandardMaterial :color="0xff0000" />
      </ThreeMesh>

      <!-- 波浪运动的立方体 -->
      <ThreeMesh
        :position="[0, 2 + Math.sin(waveTime) * 2, 0]"
        :rotation="[0, waveTime, 0]"
      >
        <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
        <ThreeMeshStandardMaterial :color="0x0000ff" />
      </ThreeMesh>

      <!-- 螺旋运动的球体 -->
      <ThreeMesh
        :position="[
          4 + Math.cos(spiralTime) * 3,
          2 + Math.sin(spiralTime) * 2,
          Math.sin(spiralTime) * 2
        ]"
      >
        <ThreeSphereGeometry :radius="0.8" />
        <ThreeMeshStandardMaterial :color="0xffff00" />
      </ThreeMesh>

      <!-- 缩放动画的立方体 -->
      <ThreeMesh
        :position="[8, 2, 0]"
        :scale="[scale, scale, scale]"
        :rotation="[0, rotation, 0]"
      >
        <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
        <ThreeMeshStandardMaterial :color="0xff00ff" />
      </ThreeMesh>

      <!-- 颜色变化的球体 -->
      <ThreeMesh :position="[-8, 6, 0]">
        <ThreeSphereGeometry :radius="1" />
        <ThreeMeshStandardMaterial :color="colorChange" />
      </ThreeMesh>

      <!-- 轨道运动的立方体 -->
      <ThreeMesh
        :position="[
          Math.cos(orbitTime) * 4,
          6,
          Math.sin(orbitTime) * 4
        ]"
        :rotation="[0, orbitTime, 0]"
      >
        <ThreeBoxGeometry :width="1.5" :height="1.5" :depth="1.5" />
        <ThreeMeshStandardMaterial :color="0x00ffff" />
      </ThreeMesh>

      <!-- 脉冲动画的球体 -->
      <ThreeMesh
        :position="[0, 6, 0]"
        :scale="[pulse, pulse, pulse]"
      >
        <ThreeSphereGeometry :radius="1" />
        <ThreeMeshStandardMaterial :color="0xff8800" />
      </ThreeMesh>

      <!-- 摇摆的立方体 -->
      <ThreeMesh
        :position="[8, 6, 0]"
        :rotation="[0, 0, Math.sin(swingTime) * 0.5]"
      >
        <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
        <ThreeMeshStandardMaterial :color="0x8800ff" />
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

// 动画状态
const rotation = ref(0)
const bounceHeight = ref(2)
const waveTime = ref(0)
const spiralTime = ref(0)
const scale = ref(1)
const colorChange = ref(0xff0000)
const orbitTime = ref(0)
const pulse = ref(1)
const swingTime = ref(0)

let animationId: number

const animate = () => {
  // 基础旋转
  rotation.value += 0.02

  // 弹跳动画
  bounceHeight.value = 2 + Math.abs(Math.sin(rotation.value * 2)) * 3

  // 波浪动画
  waveTime.value += 0.03

  // 螺旋动画
  spiralTime.value += 0.04

  // 缩放动画
  scale.value = 1 + Math.sin(rotation.value * 3) * 0.3

  // 颜色变化
  const hue = (rotation.value * 50) % 360
  colorChange.value = parseInt(`0x${Math.floor(hue / 60) % 6 === 0 ? 'ff' : '00'}${Math.floor(hue / 60) % 6 === 1 ? 'ff' : '00'}${Math.floor(hue / 60) % 6 === 2 ? 'ff' : '00'}`)

  // 轨道动画
  orbitTime.value += 0.02

  // 脉冲动画
  pulse.value = 1 + Math.sin(rotation.value * 4) * 0.2

  // 摇摆动画
  swingTime.value += 0.05

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
.animation-demo {
  width: 100%;
  height: 100%;
}
</style> 