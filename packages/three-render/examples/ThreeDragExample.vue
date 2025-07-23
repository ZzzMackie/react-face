<template>
  <div class="three-drag-example">
    <ThreeCanvas :width="800" :height="600">
      <ThreeScene :background="0x87CEEB">
        <ThreeCamera :position="[0, 5, 10]" :lookAt="[0, 0, 0]" />
        
        <!-- 辅助对象 -->
        <ThreeAxesHelper :size="5" />
        <ThreeGridHelper :size="20" :divisions="20" :position="[0, 0.01, 0]" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.5" />
        <ThreeDirectionalLight :position="[5, 10, 5]" :intensity="1" :cast-shadow="true" />
        <ThreePointLight :position="[-5, 5, -5]" :intensity="0.8" :distance="20" :color="0x00ffff" :cast-shadow="true" />
        
        <!-- 射线投射器 -->
        <ThreeRaycaster :enabled="true" :debug="showRayDebug" />
        
        <!-- 拖拽控制器 -->
        <ThreeDragControls 
          :enabled="true" 
          :drag-plane-normal="dragPlaneNormal"
          :snap-to-grid="snapToGrid"
          :grid-size="gridSize"
          @dragstart="handleDragStart"
          @drag="handleDrag"
          @dragend="handleDragEnd"
        />
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -0.5, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
          <ThreePlaneGeometry :width="20" :height="20" />
          <ThreeMeshStandardMaterial :color="0x999999" />
        </ThreeMesh>
        
        <!-- 可拖拽对象 -->
        <ThreeMesh 
          v-for="(item, index) in draggableObjects" 
          :key="index"
          :position="item.position" 
          :rotation="item.rotation" 
          :cast-shadow="true" 
          :receive-shadow="true"
        >
          <component :is="item.geometry.component" v-bind="item.geometry.props" />
          <component :is="item.material.component" v-bind="item.material.props" />
          <ThreeDraggable 
            :enabled="item.draggable" 
            :constraints="item.constraints"
            :lock-axis="item.lockAxis"
            :drag-start-color="item.dragStartColor"
            :drag-color="item.dragColor"
            @dragstart="handleObjectDragStart(item, $event)"
            @drag="handleObjectDrag(item, $event)"
            @dragend="handleObjectDragEnd(item, $event)"
          />
        </ThreeMesh>
        
        <!-- 控制器 -->
        <ThreeOrbitControls :enabled="!isDragging" />
        
        <!-- 性能监控 -->
        <ThreeStats position="top-right" />
      </ThreeScene>
    </ThreeCanvas>
    
    <div class="controls-panel">
      <h2>拖拽交互示例</h2>
      
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showRayDebug" />
          显示射线调试
        </label>
        
        <label>
          <input type="checkbox" v-model="snapToGrid" />
          网格对齐
        </label>
        
        <div class="slider-group">
          <label>网格大小: {{ gridSize.toFixed(1) }}</label>
          <input type="range" v-model.number="gridSize" min="0.1" max="2" step="0.1" />
        </div>
      </div>
      
      <div class="control-group">
        <h3>拖拽平面法线</h3>
        <div class="radio-group">
          <label>
            <input type="radio" v-model="dragPlaneType" value="horizontal" />
            水平平面 (Y轴)
          </label>
          <label>
            <input type="radio" v-model="dragPlaneType" value="vertical" />
            垂直平面 (Z轴)
          </label>
          <label>
            <input type="radio" v-model="dragPlaneType" value="side" />
            侧面平面 (X轴)
          </label>
        </div>
      </div>
      
      <div class="control-group">
        <button @click="addCube">添加立方体</button>
        <button @click="addSphere">添加球体</button>
        <button @click="addTorus">添加圆环</button>
        <button @click="reset">重置场景</button>
      </div>
      
      <div class="info-panel">
        <h3>拖拽信息</h3>
        <div v-if="currentDragObject">
          <p><strong>当前拖拽:</strong> {{ currentDragObject.name }}</p>
          <p><strong>位置:</strong> {{ formatVector(currentDragObject.position) }}</p>
          <p><strong>开始位置:</strong> {{ formatVector(dragStartPosition) }}</p>
        </div>
        <div v-else>
          <p>拖拽对象查看信息</p>
        </div>
        
        <h3>拖拽记录</h3>
        <ul class="drag-log">
          <li v-for="(log, index) in dragLogs.slice().reverse()" :key="index">
            {{ log }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  ThreeCanvas, 
  ThreeScene, 
  ThreeCamera, 
  ThreeMesh, 
  ThreeBoxGeometry, 
  ThreePlaneGeometry, 
  ThreeSphereGeometry,
  ThreeTorusGeometry,
  ThreeMeshStandardMaterial,
  ThreeMeshPhongMaterial,
  ThreeMeshBasicMaterial,
  ThreeAmbientLight, 
  ThreeDirectionalLight,
  ThreePointLight,
  ThreeOrbitControls,
  ThreeRaycaster,
  ThreeDragControls,
  ThreeDraggable,
  ThreeStats,
  ThreeAxesHelper,
  ThreeGridHelper
} from '../src';

export default {
  components: {
    ThreeCanvas,
    ThreeScene,
    ThreeCamera,
    ThreeMesh,
    ThreeBoxGeometry,
    ThreePlaneGeometry,
    ThreeSphereGeometry,
    ThreeTorusGeometry,
    ThreeMeshStandardMaterial,
    ThreeMeshPhongMaterial,
    ThreeMeshBasicMaterial,
    ThreeAmbientLight,
    ThreeDirectionalLight,
    ThreePointLight,
    ThreeOrbitControls,
    ThreeRaycaster,
    ThreeDragControls,
    ThreeDraggable,
    ThreeStats,
    ThreeAxesHelper,
    ThreeGridHelper
  },
  setup() {
    // 调试开关
    const showRayDebug = ref(false);
    
    // 网格对齐
    const snapToGrid = ref(true);
    const gridSize = ref(0.5);
    
    // 拖拽平面类型
    const dragPlaneType = ref('horizontal');
    
    // 拖拽平面法线
    const dragPlaneNormal = computed(() => {
      switch (dragPlaneType.value) {
        case 'horizontal': return [0, 1, 0]; // Y轴
        case 'vertical': return [0, 0, 1]; // Z轴
        case 'side': return [1, 0, 0]; // X轴
        default: return [0, 1, 0];
      }
    });
    
    // 可拖拽对象列表
    const draggableObjects = ref([]);
    
    // 当前拖拽对象
    const currentDragObject = ref(null);
    
    // 拖拽开始位置
    const dragStartPosition = ref(null);
    
    // 是否正在拖拽
    const isDragging = ref(false);
    
    // 拖拽记录
    const dragLogs = ref([]);
    
    // 随机颜色
    const getRandomColor = () => {
      return Math.floor(Math.random() * 0xffffff);
    };
    
    // 格式化向量
    const formatVector = (vector) => {
      if (!vector) return '';
      return `[${vector[0].toFixed(2)}, ${vector[1].toFixed(2)}, ${vector[2].toFixed(2)}]`;
    };
    
    // 添加立方体
    const addCube = () => {
      const x = (Math.random() - 0.5) * 8;
      const y = Math.random() * 3 + 0.5;
      const z = (Math.random() - 0.5) * 8;
      
      const size = Math.random() * 1 + 0.5;
      const color = getRandomColor();
      const name = `立方体 #${draggableObjects.value.length + 1}`;
      
      draggableObjects.value.push({
        name,
        position: [x, y, z],
        rotation: [0, Math.random() * Math.PI * 2, 0],
        geometry: {
          component: ThreeBoxGeometry,
          props: {
            width: size,
            height: size,
            depth: size
          }
        },
        material: {
          component: ThreeMeshStandardMaterial,
          props: {
            color,
            metalness: 0.3,
            roughness: 0.7
          }
        },
        draggable: true,
        constraints: {
          x: { min: -10, max: 10 },
          y: { min: 0, max: 10 },
          z: { min: -10, max: 10 }
        },
        lockAxis: [],
        dragStartColor: 0xffff00,
        dragColor: 0xff9900
      });
    };
    
    // 添加球体
    const addSphere = () => {
      const x = (Math.random() - 0.5) * 8;
      const y = Math.random() * 3 + 0.5;
      const z = (Math.random() - 0.5) * 8;
      
      const radius = Math.random() * 0.7 + 0.3;
      const color = getRandomColor();
      const name = `球体 #${draggableObjects.value.length + 1}`;
      
      draggableObjects.value.push({
        name,
        position: [x, y, z],
        rotation: [0, 0, 0],
        geometry: {
          component: ThreeSphereGeometry,
          props: {
            radius
          }
        },
        material: {
          component: ThreeMeshPhongMaterial,
          props: {
            color,
            specular: 0xffffff,
            shininess: 30
          }
        },
        draggable: true,
        constraints: {
          x: { min: -10, max: 10 },
          y: { min: 0, max: 10 },
          z: { min: -10, max: 10 }
        },
        lockAxis: ['y'],
        dragStartColor: 0x00ffff,
        dragColor: 0x00aaff
      });
    };
    
    // 添加圆环
    const addTorus = () => {
      const x = (Math.random() - 0.5) * 8;
      const y = Math.random() * 3 + 0.5;
      const z = (Math.random() - 0.5) * 8;
      
      const radius = Math.random() * 0.7 + 0.3;
      const tube = radius * 0.3;
      const color = getRandomColor();
      const name = `圆环 #${draggableObjects.value.length + 1}`;
      
      draggableObjects.value.push({
        name,
        position: [x, y, z],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        geometry: {
          component: ThreeTorusGeometry,
          props: {
            radius,
            tube
          }
        },
        material: {
          component: ThreeMeshBasicMaterial,
          props: {
            color,
            wireframe: Math.random() > 0.5
          }
        },
        draggable: true,
        constraints: {
          x: { min: -10, max: 10 },
          y: { min: 0, max: 10 },
          z: { min: -10, max: 10 }
        },
        lockAxis: [],
        dragStartColor: 0x00ff00,
        dragColor: 0x00aa00
      });
    };
    
    // 重置场景
    const reset = () => {
      draggableObjects.value = [];
      currentDragObject.value = null;
      dragStartPosition.value = null;
      isDragging.value = false;
      dragLogs.value = [];
    };
    
    // 处理拖拽开始
    const handleDragStart = (event) => {
      isDragging.value = true;
      
      const objectIndex = draggableObjects.value.findIndex(obj => 
        obj.position[0] === event.object.position.x &&
        obj.position[1] === event.object.position.y &&
        obj.position[2] === event.object.position.z
      );
      
      if (objectIndex !== -1) {
        currentDragObject.value = draggableObjects.value[objectIndex];
        dragStartPosition.value = event.startPosition;
      }
    };
    
    // 处理拖拽
    const handleDrag = (event) => {
      if (!currentDragObject.value) return;
      
      // 更新对象位置
      currentDragObject.value.position = event.position;
    };
    
    // 处理拖拽结束
    const handleDragEnd = (event) => {
      isDragging.value = false;
      
      if (currentDragObject.value) {
        dragLogs.value.push(`拖拽结束: ${currentDragObject.value.name} - 位置: ${formatVector(event.position)}`);
        
        // 限制日志长度
        if (dragLogs.value.length > 10) {
          dragLogs.value.shift();
        }
        
        currentDragObject.value = null;
        dragStartPosition.value = null;
      }
    };
    
    // 处理对象拖拽开始
    const handleObjectDragStart = (object, event) => {
      dragLogs.value.push(`开始拖拽: ${object.name}`);
      
      // 限制日志长度
      if (dragLogs.value.length > 10) {
        dragLogs.value.shift();
      }
    };
    
    // 处理对象拖拽
    const handleObjectDrag = (object, event) => {
      // 可以在这里添加额外的拖拽处理逻辑
    };
    
    // 处理对象拖拽结束
    const handleObjectDragEnd = (object, event) => {
      dragLogs.value.push(`拖拽完成: ${object.name} - 位置: ${formatVector(event.position)}`);
      
      // 限制日志长度
      if (dragLogs.value.length > 10) {
        dragLogs.value.shift();
      }
    };
    
    // 监听拖拽平面类型变化
    watch(dragPlaneType, () => {
      dragLogs.value.push(`拖拽平面已更改为: ${dragPlaneType.value}`);
      
      // 限制日志长度
      if (dragLogs.value.length > 10) {
        dragLogs.value.shift();
      }
    });
    
    // 初始化场景
    const initScene = () => {
      // 添加一些初始对象
      addCube();
      addSphere();
      addTorus();
    };
    
    onMounted(() => {
      console.log('Three-Drag Example mounted');
      initScene();
    });
    
    return {
      showRayDebug,
      snapToGrid,
      gridSize,
      dragPlaneType,
      dragPlaneNormal,
      draggableObjects,
      currentDragObject,
      dragStartPosition,
      isDragging,
      dragLogs,
      addCube,
      addSphere,
      addTorus,
      reset,
      handleDragStart,
      handleDrag,
      handleDragEnd,
      handleObjectDragStart,
      handleObjectDrag,
      handleObjectDragEnd,
      formatVector
    };
  }
};
</script>

<style scoped>
.three-drag-example {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.controls-panel {
  padding: 20px;
  width: 300px;
  background-color: #f5f5f5;
  border-left: 1px solid #ddd;
  overflow-y: auto;
}

h2 {
  margin-top: 0;
  color: #333;
}

h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #555;
}

.control-group {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.control-group label {
  display: block;
  margin-bottom: 10px;
}

.radio-group label {
  margin-left: 10px;
}

.slider-group {
  margin-top: 15px;
}

.slider-group input {
  width: 100%;
  margin-top: 5px;
}

button {
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 8px 16px;
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

button:last-child {
  background-color: #f44336;
}

button:last-child:hover {
  background-color: #d32f2f;
}

.info-panel {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.drag-log {
  max-height: 200px;
  overflow-y: auto;
  padding-left: 20px;
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.drag-log li {
  margin-bottom: 8px;
  font-size: 14px;
}
</style> 