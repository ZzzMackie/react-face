<template>
  <div class="app">
    <!-- 控制面板 -->
    <div class="controls">
      <h3>Three.js 渲染演示</h3>
      <button 
        v-for="demo in demos" 
        :key="demo.name"
        :class="{ active: currentDemo === demo.name }"
        @click="switchDemo(demo.name)"
      >
        {{ demo.label }}
      </button>
    </div>

    <!-- Three.js 渲染容器 -->
    <div class="render-container">
      <!-- 基础场景演示 -->
      <BasicScene v-if="currentDemo === 'basic'" />
      
      <!-- 几何体演示 -->
      <GeometryDemo v-if="currentDemo === 'geometry'" />
      
      <!-- 材质演示 -->
      <MaterialDemo v-if="currentDemo === 'material'" />
      
      <!-- 光照演示 -->
      <LightingDemo v-if="currentDemo === 'lighting'" />
      
      <!-- 动画演示 -->
      <AnimationDemo v-if="currentDemo === 'animation'" />
      
      <!-- 物理演示 -->
      <PhysicsDemo v-if="currentDemo === 'physics'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BasicScene from './demos/BasicScene.vue'
import GeometryDemo from './demos/GeometryDemo.vue'
import MaterialDemo from './demos/MaterialDemo.vue'
import LightingDemo from './demos/LightingDemo.vue'
import AnimationDemo from './demos/AnimationDemo.vue'
import PhysicsDemo from './demos/PhysicsDemo.vue'

const currentDemo = ref('basic')

const demos = [
  { name: 'basic', label: '基础场景' },
  { name: 'geometry', label: '几何体' },
  { name: 'material', label: '材质' },
  { name: 'lighting', label: '光照' },
  { name: 'animation', label: '动画' },
  { name: 'physics', label: '物理' }
]

const switchDemo = (demoName: string) => {
  currentDemo.value = demoName
}
</script>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.render-container {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.controls h3 {
  margin: 0 0 15px 0;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.controls button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: block;
  width: 100%;
  text-align: left;
}

.controls button:hover {
  background: #45a049;
  transform: translateX(5px);
}

.controls button.active {
  background: #2196F3;
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
}
</style> 