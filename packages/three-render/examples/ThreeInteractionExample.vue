<template>
  <div class="three-interaction-example">
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
        <ThreeRaycaster 
          :enabled="true" 
          :debug="showRayDebug" 
          @click="handleClick"
          @hover="handleHover"
        />
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -0.5, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
          <ThreePlaneGeometry :width="20" :height="20" />
          <ThreeMeshStandardMaterial :color="0x999999" />
        </ThreeMesh>
        
        <!-- 可交互对象 -->
        <ThreeMesh 
          v-for="(item, index) in interactiveObjects" 
          :key="index"
          :position="item.position" 
          :rotation="item.rotation" 
          :cast-shadow="true" 
          :receive-shadow="true"
        >
          <component :is="item.geometry.component" v-bind="item.geometry.props" />
          <component :is="item.material.component" v-bind="item.material.props" />
          <ThreeInteractive 
            :cursor="item.cursor" 
            :hover-color="item.hoverColor"
            :hover-emissive="item.hoverEmissive"
            :hover-emissive-intensity="item.hoverEmissiveIntensity"
            :hover-scale="item.hoverScale"
            @click="handleObjectClick(item, $event)"
            @mouseover="handleObjectMouseOver(item, $event)"
            @mouseout="handleObjectMouseOut(item, $event)"
          />
        </ThreeMesh>
        
        <!-- 控制器 -->
        <ThreeOrbitControls />
        
        <!-- 性能监控 -->
        <ThreeStats position="top-right" />
      </ThreeScene>
    </ThreeCanvas>
    
    <div class="controls-panel">
      <h2>交互系统示例</h2>
      
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showRayDebug" />
          显示射线调试
        </label>
      </div>
      
      <div class="control-group">
        <button @click="addCube">添加立方体</button>
        <button @click="addSphere">添加球体</button>
        <button @click="addTorus">添加圆环</button>
        <button @click="reset">重置场景</button>
      </div>
      
      <div class="info-panel">
        <h3>交互信息</h3>
        <div v-if="hoveredObject">
          <p><strong>当前悬停:</strong> {{ hoveredObject.name }}</p>
          <p><strong>位置:</strong> {{ formatVector(hoveredObject.position) }}</p>
        </div>
        <div v-else>
          <p>鼠标悬停在对象上查看信息</p>
        </div>
        
        <h3>点击记录</h3>
        <ul class="click-log">
          <li v-for="(log, index) in clickLogs.slice().reverse()" :key="index">
            {{ log }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
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
  ThreeInteractive,
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
    ThreeInteractive,
    ThreeStats,
    ThreeAxesHelper,
    ThreeGridHelper
  },
  setup() {
    // 调试开关
    const showRayDebug = ref(false);
    
    // 可交互对象列表
    const interactiveObjects = ref([]);
    
    // 当前悬停的对象
    const hoveredObject = ref(null);
    
    // 点击记录
    const clickLogs = ref([]);
    
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
      const name = `立方体 #${interactiveObjects.value.length + 1}`;
      
      interactiveObjects.value.push({
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
        cursor: 'pointer',
        hoverColor: null,
        hoverEmissive: 0xffff00,
        hoverEmissiveIntensity: 0.5,
        hoverScale: 1.1
      });
    };
    
    // 添加球体
    const addSphere = () => {
      const x = (Math.random() - 0.5) * 8;
      const y = Math.random() * 3 + 0.5;
      const z = (Math.random() - 0.5) * 8;
      
      const radius = Math.random() * 0.7 + 0.3;
      const color = getRandomColor();
      const name = `球体 #${interactiveObjects.value.length + 1}`;
      
      interactiveObjects.value.push({
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
        cursor: 'move',
        hoverColor: 0xff0000,
        hoverEmissive: null,
        hoverEmissiveIntensity: 1,
        hoverScale: 1.2
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
      const name = `圆环 #${interactiveObjects.value.length + 1}`;
      
      interactiveObjects.value.push({
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
        cursor: 'help',
        hoverColor: 0x00ff00,
        hoverEmissive: null,
        hoverEmissiveIntensity: 1,
        hoverScale: 1.15
      });
    };
    
    // 重置场景
    const reset = () => {
      interactiveObjects.value = [];
      hoveredObject.value = null;
      clickLogs.value = [];
    };
    
    // 处理点击事件
    const handleClick = (event) => {
      if (event.object) {
        const objectIndex = interactiveObjects.value.findIndex(obj => 
          obj.position[0] === event.object.position.x &&
          obj.position[1] === event.object.position.y &&
          obj.position[2] === event.object.position.z
        );
        
        if (objectIndex !== -1) {
          const clickedObject = interactiveObjects.value[objectIndex];
          clickLogs.value.push(`点击了 ${clickedObject.name} - 位置: ${formatVector(clickedObject.position)}`);
          
          // 限制日志长度
          if (clickLogs.value.length > 10) {
            clickLogs.value.shift();
          }
        }
      }
    };
    
    // 处理悬停事件
    const handleHover = (event) => {
      if (event.object) {
        const objectIndex = interactiveObjects.value.findIndex(obj => 
          obj.position[0] === event.object.position.x &&
          obj.position[1] === event.object.position.y &&
          obj.position[2] === event.object.position.z
        );
        
        if (objectIndex !== -1) {
          hoveredObject.value = interactiveObjects.value[objectIndex];
        }
      } else {
        hoveredObject.value = null;
      }
    };
    
    // 处理对象点击事件
    const handleObjectClick = (object, event) => {
      clickLogs.value.push(`通过组件事件点击了 ${object.name}`);
      
      // 限制日志长度
      if (clickLogs.value.length > 10) {
        clickLogs.value.shift();
      }
    };
    
    // 处理对象鼠标进入事件
    const handleObjectMouseOver = (object, event) => {
      // 可以在这里添加额外的鼠标进入处理逻辑
    };
    
    // 处理对象鼠标离开事件
    const handleObjectMouseOut = (object, event) => {
      // 可以在这里添加额外的鼠标离开处理逻辑
    };
    
    // 初始化场景
    const initScene = () => {
      // 添加一些初始对象
      addCube();
      addSphere();
      addTorus();
    };
    
    onMounted(() => {
      console.log('Three-Interaction Example mounted');
      initScene();
    });
    
    return {
      showRayDebug,
      interactiveObjects,
      hoveredObject,
      clickLogs,
      addCube,
      addSphere,
      addTorus,
      reset,
      handleClick,
      handleHover,
      handleObjectClick,
      handleObjectMouseOver,
      handleObjectMouseOut,
      formatVector
    };
  }
};
</script>

<style scoped>
.three-interaction-example {
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

.click-log {
  max-height: 200px;
  overflow-y: auto;
  padding-left: 20px;
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.click-log li {
  margin-bottom: 8px;
  font-size: 14px;
}
</style> 