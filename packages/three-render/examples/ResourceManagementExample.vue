<template>
  <div class="resource-management-example">
    <ThreeCanvas :width="800" :height="600" :shadows="true" :antialias="true">
      <ThreeScene :background="0x87CEEB">
        <ThreeCamera :position="[0, 5, 10]" :lookAt="[0, 0, 0]" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.5" />
        <ThreeDirectionalLight :position="[5, 10, 5]" :intensity="1" :cast-shadow="true" />
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -0.5, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
          <ThreePlaneGeometry :width="20" :height="20" />
          <ThreeMeshStandardMaterial :color="0x999999" />
        </ThreeMesh>
        
        <!-- 资源管理器 -->
        <ThreeResourceManager 
          :auto-dispose="true" 
          :dispose-interval="30000"
          :debug="debug"
          v-slot="{ textures, materials, geometries, objects }"
        >
          <!-- 动态对象 -->
          <ThreeMesh
            v-for="(obj, index) in activeObjects"
            :key="`obj-${index}`"
            :position="obj.position"
            :rotation="obj.rotation"
            :cast-shadow="true"
            :receive-shadow="true"
          >
            <component :is="obj.geometry.component" v-bind="obj.geometry.props" />
            <ThreeMeshStandardMaterial :color="obj.color" :metalness="obj.metalness" :roughness="obj.roughness" />
          </ThreeMesh>
        </ThreeResourceManager>
        
        <!-- 控制器 -->
        <ThreeOrbitControls />
        
        <!-- 性能监控 -->
        <ThreeStats 
          :show-fps="true" 
          :show-ms="true" 
          :show-mem="true"
          :show-draw-calls="true"
          :show-triangles="true"
          position="top-right"
          :bg-color="'rgba(0, 0, 0, 0.7)'"
          :fg-color="'#00ff00'"
        />
      </ThreeScene>
    </ThreeCanvas>
    
    <div class="controls">
      <div class="control-section">
        <h3>资源管理</h3>
        <div class="stats">
          <div>活跃对象: {{ activeObjects.length }}</div>
          <div>已创建对象: {{ createdObjectsCount }}</div>
          <div>已销毁对象: {{ destroyedObjectsCount }}</div>
        </div>
        <div class="buttons">
          <button @click="addObjects(10)">添加10个对象</button>
          <button @click="addObjects(50)">添加50个对象</button>
          <button @click="removeObjects(10)">移除10个对象</button>
          <button @click="removeObjects(50)">移除50个对象</button>
          <button @click="clearObjects()">清空所有对象</button>
        </div>
      </div>
      
      <div class="control-section">
        <h3>设置</h3>
        <div class="settings">
          <label>
            <input type="checkbox" v-model="autoAddRemove" />
            自动添加/移除对象
          </label>
          <label>
            <input type="checkbox" v-model="debug" />
            调试模式
          </label>
          <div>
            <label>对象生命周期 (秒): {{ objectLifetime }}</label>
            <input type="range" min="1" max="30" step="1" v-model.number="objectLifetime" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ThreeCanvas, ThreeScene, ThreeCamera, ThreeMesh } from '../src/components/core';
import { ThreeBoxGeometry, ThreeSphereGeometry, ThreeCylinderGeometry, ThreePlaneGeometry } from '../src/components/geometry';
import { ThreeMeshStandardMaterial } from '../src/components/material';
import { ThreeAmbientLight, ThreeDirectionalLight } from '../src/components/light';
import { ThreeOrbitControls } from '../src/components/controls';
import { ThreeResourceManager } from '../src/components/core';
import { ThreeStats } from '../src/components/debug';

// 随机颜色生成
const randomColor = () => Math.floor(Math.random() * 0xffffff);

// 随机位置生成
const randomPosition = (range = 8) => [
  (Math.random() - 0.5) * range,
  Math.random() * 4 + 0.5,
  (Math.random() - 0.5) * range
];

// 随机旋转生成
const randomRotation = () => [
  Math.random() * Math.PI,
  Math.random() * Math.PI,
  Math.random() * Math.PI
];

// 几何体类型
const geometryTypes = [
  {
    component: ThreeBoxGeometry,
    props: { width: 1, height: 1, depth: 1 }
  },
  {
    component: ThreeSphereGeometry,
    props: { radius: 0.5, widthSegments: 32, heightSegments: 32 }
  },
  {
    component: ThreeCylinderGeometry,
    props: { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 }
  }
];

// 对象数组
const activeObjects = ref<any[]>([]);
const createdObjectsCount = ref<number>(0);
const destroyedObjectsCount = ref<number>(0);

// 设置
const autoAddRemove = ref<boolean>(false);
const objectLifetime = ref<number>(5);
const debug = ref<boolean>(false);

// 添加对象
const addObjects = (count: number) => {
  for (let i = 0; i < count; i++) {
    const geometryType = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
    
    activeObjects.value.push({
      id: `obj-${Date.now()}-${Math.random()}`,
      position: randomPosition(),
      rotation: randomRotation(),
      geometry: geometryType,
      color: randomColor(),
      metalness: Math.random() * 0.8,
      roughness: Math.random() * 0.8,
      createdAt: Date.now()
    });
    
    createdObjectsCount.value++;
  }
};

// 移除对象
const removeObjects = (count: number) => {
  const removeCount = Math.min(count, activeObjects.value.length);
  activeObjects.value.splice(0, removeCount);
  destroyedObjectsCount.value += removeCount;
};

// 清空所有对象
const clearObjects = () => {
  destroyedObjectsCount.value += activeObjects.value.length;
  activeObjects.value = [];
};

// 自动添加/移除对象
let autoAddRemoveInterval: number | null = null;

const startAutoAddRemove = () => {
  if (autoAddRemoveInterval !== null) return;
  
  autoAddRemoveInterval = window.setInterval(() => {
    // 随机添加1-5个对象
    const addCount = Math.floor(Math.random() * 5) + 1;
    addObjects(addCount);
    
    // 检查并移除过期对象
    const now = Date.now();
    const expiredObjects = activeObjects.value.filter(
      obj => now - obj.createdAt > objectLifetime.value * 1000
    );
    
    destroyedObjectsCount.value += expiredObjects.length;
    activeObjects.value = activeObjects.value.filter(
      obj => now - obj.createdAt <= objectLifetime.value * 1000
    );
  }, 1000);
};

const stopAutoAddRemove = () => {
  if (autoAddRemoveInterval !== null) {
    clearInterval(autoAddRemoveInterval);
    autoAddRemoveInterval = null;
  }
};

// 监听自动添加/移除设置变化
watch(autoAddRemove, (enabled) => {
  if (enabled) {
    startAutoAddRemove();
  } else {
    stopAutoAddRemove();
  }
});

// 组件挂载和卸载
onMounted(() => {
  // 初始化场景
  addObjects(20);
});

onBeforeUnmount(() => {
  // 停止自动添加/移除
  stopAutoAddRemove();
});
</script>

<style scoped>
.resource-management-example {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.controls {
  margin-top: 16px;
  display: flex;
  gap: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
  width: 800px;
}

.control-section {
  flex: 1;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.stats {
  margin-bottom: 10px;
  font-family: monospace;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

button {
  padding: 8px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background-color: #45a049;
}

.settings {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="range"] {
  width: 100%;
  margin-bottom: 10px;
}

input[type="checkbox"] {
  margin-right: 5px;
}
</style> 