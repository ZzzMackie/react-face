<template>
  <div class="three-physics-example">
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
        
        <!-- 物理世界 -->
        <ThreePhysicsWorld :gravity="[0, -9.8, 0]" :debug="showDebug">
          <!-- 地面 -->
          <ThreeMesh :position="[0, -0.5, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
            <ThreePlaneGeometry :width="20" :height="20" />
            <ThreeMeshStandardMaterial :color="0x999999" />
            <ThreeRigidBody type="plane" :mass="0" />
          </ThreeMesh>
          
          <!-- 静态盒子 -->
          <ThreeMesh :position="[0, 0.5, 0]" :rotation="[0, 0, 0]" :cast-shadow="true" :receive-shadow="true">
            <ThreeBoxGeometry :width="2" :height="1" :depth="2" />
            <ThreeMeshStandardMaterial :color="0x3366cc" :metalness="0.5" :roughness="0.5" />
            <ThreeRigidBody type="box" :mass="0" :size="[2, 1, 2]" />
          </ThreeMesh>
          
          <!-- 动态球体 -->
          <template v-for="(ball, index) in balls">
            <ThreeMesh 
              :key="`ball-${index}`"
              :position="ball.position" 
              :cast-shadow="true" 
              :receive-shadow="true"
            >
              <ThreeSphereGeometry :radius="ball.radius" />
              <ThreeMeshPhongMaterial 
                :color="ball.color" 
                :specular="0xffffff"
                :shininess="30"
              />
              <ThreeRigidBody 
                type="sphere" 
                :mass="ball.mass" 
                :position="ball.position"
                :size="[ball.radius * 2]"
                :material="{ friction: 0.3, restitution: 0.7 }"
              />
            </ThreeMesh>
          </template>
          
          <!-- 动态盒子 -->
          <template v-for="(box, index) in boxes">
            <ThreeMesh 
              :key="`box-${index}`"
              :position="box.position" 
              :rotation="box.rotation" 
              :cast-shadow="true" 
              :receive-shadow="true"
            >
              <ThreeBoxGeometry :width="box.size[0]" :height="box.size[1]" :depth="box.size[2]" />
              <ThreeMeshStandardMaterial :color="box.color" :metalness="0.2" :roughness="0.8" />
              <ThreeRigidBody 
                type="box" 
                :mass="box.mass" 
                :position="box.position"
                :rotation="box.rotation"
                :size="box.size"
                :material="{ friction: 0.5, restitution: 0.3 }"
              />
            </ThreeMesh>
          </template>
        </ThreePhysicsWorld>
        
        <!-- 控制器 -->
        <ThreeOrbitControls />
        
        <!-- 性能监控 -->
        <ThreeStats position="top-right" />
      </ThreeScene>
    </ThreeCanvas>
    
    <div class="controls-panel">
      <h2>物理系统示例</h2>
      
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showDebug" />
          显示物理调试
        </label>
      </div>
      
      <div class="control-group">
        <button @click="addBall">添加球体</button>
        <button @click="addBox">添加盒子</button>
        <button @click="reset">重置场景</button>
      </div>
      
      <div class="info-panel">
        <p>物体数量: {{ balls.length + boxes.length }}</p>
        <p>操作说明:</p>
        <ul>
          <li>点击"添加球体"按钮添加随机球体</li>
          <li>点击"添加盒子"按钮添加随机盒子</li>
          <li>点击"重置场景"按钮清空所有动态物体</li>
          <li>勾选"显示物理调试"可以查看物理碰撞体</li>
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
  ThreeMeshStandardMaterial,
  ThreeMeshPhongMaterial,
  ThreeAmbientLight, 
  ThreeDirectionalLight,
  ThreePointLight,
  ThreeOrbitControls,
  ThreePhysicsWorld,
  ThreeRigidBody,
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
    ThreeMeshStandardMaterial,
    ThreeMeshPhongMaterial,
    ThreeAmbientLight,
    ThreeDirectionalLight,
    ThreePointLight,
    ThreeOrbitControls,
    ThreePhysicsWorld,
    ThreeRigidBody,
    ThreeStats,
    ThreeAxesHelper,
    ThreeGridHelper
  },
  setup() {
    // 调试开关
    const showDebug = ref(false);
    
    // 动态物体列表
    const balls = ref([]);
    const boxes = ref([]);
    
    // 随机颜色
    const getRandomColor = () => {
      return Math.floor(Math.random() * 0xffffff);
    };
    
    // 添加球体
    const addBall = () => {
      // 随机位置和大小
      const x = (Math.random() - 0.5) * 4;
      const y = Math.random() * 5 + 3;
      const z = (Math.random() - 0.5) * 4;
      const radius = Math.random() * 0.3 + 0.2;
      const mass = Math.random() * 2 + 0.5;
      
      // 添加到列表
      balls.value.push({
        position: [x, y, z],
        radius,
        mass,
        color: getRandomColor()
      });
    };
    
    // 添加盒子
    const addBox = () => {
      // 随机位置、大小和旋转
      const x = (Math.random() - 0.5) * 4;
      const y = Math.random() * 5 + 3;
      const z = (Math.random() - 0.5) * 4;
      const width = Math.random() * 0.8 + 0.4;
      const height = Math.random() * 0.8 + 0.4;
      const depth = Math.random() * 0.8 + 0.4;
      const mass = Math.random() * 2 + 0.5;
      
      // 随机旋转
      const rx = Math.random() * Math.PI;
      const ry = Math.random() * Math.PI;
      const rz = Math.random() * Math.PI;
      
      // 添加到列表
      boxes.value.push({
        position: [x, y, z],
        rotation: [rx, ry, rz],
        size: [width, height, depth],
        mass,
        color: getRandomColor()
      });
    };
    
    // 重置场景
    const reset = () => {
      balls.value = [];
      boxes.value = [];
    };
    
    // 初始化场景
    const initScene = () => {
      // 添加一些初始物体
      for (let i = 0; i < 3; i++) {
        addBall();
      }
      
      for (let i = 0; i < 2; i++) {
        addBox();
      }
    };
    
    onMounted(() => {
      console.log('Three-Physics Example mounted');
      initScene();
    });
    
    return {
      showDebug,
      balls,
      boxes,
      addBall,
      addBox,
      reset
    };
  }
};
</script>

<style scoped>
.three-physics-example {
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

.control-group {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

button {
  margin-right: 10px;
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

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
}
</style> 