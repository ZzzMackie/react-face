<template>
  <div class="three-particle-example">
    <ThreeCanvas :width="800" :height="600">
      <ThreeScene :background="0x000000">
        <ThreeCamera :position="[0, 5, 10]" :lookAt="[0, 0, 0]" />
        
        <!-- 辅助对象 -->
        <ThreeAxesHelper :size="5" />
        <ThreeGridHelper :size="20" :divisions="20" :position="[0, 0.01, 0]" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.5" />
        <ThreeDirectionalLight :position="[5, 10, 5]" :intensity="1" :cast-shadow="true" />
        
        <!-- 粒子系统 -->
        <ThreeParticleSystem
          ref="particleSystem"
          :count="particleCount"
          :size="particleSize"
          :size-attenuation="sizeAttenuation"
          :color="particleColor"
          :transparent="transparent"
          :opacity="opacity"
          :blending="blending"
          :vertex-colors="vertexColors"
          :depth-write="depthWrite"
          :depth-test="depthTest"
          :sort-particles="sortParticles"
          :texture="particleTexture"
          :auto-start="true"
          @ready="handleParticleSystemReady"
        >
          <!-- 粒子发射器 - 火焰 -->
          <ThreeParticleEmitter
            v-if="showFireEmitter"
            ref="fireEmitter"
            type="cone"
            :position="[0, 0, 0]"
            :direction="[0, 1, 0]"
            :size="[0.5, 30, 0.5]"
            :rate="emissionRate"
            :enabled="true"
            :loop="true"
            :particle-lifetime="1.0"
            :particle-lifetime-variation="0.2"
            :particle-velocity="1.0"
            :particle-velocity-variation="0.2"
            :particle-color="[1.0, 0.5, 0.1]"
            :particle-color-variation="0.1"
            :particle-size="0.2"
            :particle-size-variation="0.1"
            :gravity="[0, 0.5, 0]"
            :drag="0.1"
            @ready="handleFireEmitterReady"
          />
          
          <!-- 粒子发射器 - 烟雾 -->
          <ThreeParticleEmitter
            v-if="showSmokeEmitter"
            ref="smokeEmitter"
            type="sphere"
            :position="[0, 2, 0]"
            :direction="[0, 0.5, 0]"
            :size="[1, 1, 1]"
            :rate="emissionRate * 0.5"
            :enabled="true"
            :loop="true"
            :particle-lifetime="2.0"
            :particle-lifetime-variation="0.5"
            :particle-velocity="0.5"
            :particle-velocity-variation="0.2"
            :particle-color="[0.3, 0.3, 0.3]"
            :particle-color-variation="0.1"
            :particle-size="0.5"
            :particle-size-variation="0.2"
            :gravity="[0, 0.2, 0]"
            :drag="0.05"
            @ready="handleSmokeEmitterReady"
          />
          
          <!-- 粒子发射器 - 爆炸 -->
          <ThreeParticleEmitter
            v-if="showExplosionEmitter"
            ref="explosionEmitter"
            type="sphere"
            :position="explosionPosition"
            :direction="[0, 0, 0]"
            :size="[0.1, 0.1, 0.1]"
            :rate="0"
            :enabled="false"
            :loop="false"
            :burst-count="explosionParticles"
            :particle-lifetime="1.5"
            :particle-lifetime-variation="0.5"
            :particle-velocity="3.0"
            :particle-velocity-variation="0.5"
            :particle-color="[1.0, 0.8, 0.2]"
            :particle-color-variation="0.2"
            :particle-size="0.3"
            :particle-size-variation="0.2"
            :gravity="[0, -0.5, 0]"
            :drag="0.02"
            @ready="handleExplosionEmitterReady"
            @complete="handleExplosionComplete"
          />
          
          <!-- 粒子发射器 - 喷泉 -->
          <ThreeParticleEmitter
            v-if="showFountainEmitter"
            ref="fountainEmitter"
            type="circle"
            :position="[-3, 0, 0]"
            :direction="[0, 3, 0]"
            :size="[0.1, 0.1, 0.1]"
            :rate="emissionRate * 2"
            :enabled="true"
            :loop="true"
            :particle-lifetime="2.0"
            :particle-lifetime-variation="0.3"
            :particle-velocity="2.0"
            :particle-velocity-variation="0.3"
            :particle-color="[0.2, 0.4, 1.0]"
            :particle-color-variation="0.1"
            :particle-size="0.15"
            :particle-size-variation="0.05"
            :gravity="[0, -2, 0]"
            :drag="0.01"
            @ready="handleFountainEmitterReady"
          />
          
          <!-- 粒子发射器 - 星尘 -->
          <ThreeParticleEmitter
            v-if="showStardustEmitter"
            ref="stardustEmitter"
            type="box"
            :position="[3, 0, 0]"
            :direction="[0, 0, 0]"
            :size="[2, 2, 2]"
            :rate="emissionRate * 0.5"
            :enabled="true"
            :loop="true"
            :particle-lifetime="5.0"
            :particle-lifetime-variation="2.0"
            :particle-velocity="0.1"
            :particle-velocity-variation="0.05"
            :particle-color="[0.9, 0.9, 1.0]"
            :particle-color-variation="0.1"
            :particle-size="0.1"
            :particle-size-variation="0.05"
            :gravity="[0, 0, 0]"
            :drag="0.0"
            @ready="handleStardustEmitterReady"
          />
        </ThreeParticleSystem>
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -0.5, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
          <ThreePlaneGeometry :width="20" :height="20" />
          <ThreeMeshStandardMaterial :color="0x333333" />
        </ThreeMesh>
        
        <!-- 控制器 -->
        <ThreeOrbitControls />
        
        <!-- 性能监控 -->
        <ThreeStats position="top-right" />
      </ThreeScene>
    </ThreeCanvas>
    
    <div class="controls-panel">
      <h2>粒子系统示例</h2>
      
      <div class="control-group">
        <h3>粒子系统设置</h3>
        
        <div class="slider-group">
          <label>粒子数量: {{ particleCount }}</label>
          <input type="range" v-model.number="particleCount" min="1000" max="10000" step="1000" />
        </div>
        
        <div class="slider-group">
          <label>粒子大小: {{ particleSize.toFixed(2) }}</label>
          <input type="range" v-model.number="particleSize" min="0.05" max="0.5" step="0.01" />
        </div>
        
        <div class="slider-group">
          <label>不透明度: {{ opacity.toFixed(2) }}</label>
          <input type="range" v-model.number="opacity" min="0" max="1" step="0.01" />
        </div>
        
        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="sizeAttenuation" />
            大小衰减
          </label>
          
          <label>
            <input type="checkbox" v-model="transparent" />
            透明
          </label>
          
          <label>
            <input type="checkbox" v-model="vertexColors" />
            顶点颜色
          </label>
          
          <label>
            <input type="checkbox" v-model="depthWrite" />
            深度写入
          </label>
          
          <label>
            <input type="checkbox" v-model="depthTest" />
            深度测试
          </label>
          
          <label>
            <input type="checkbox" v-model="sortParticles" />
            排序粒子
          </label>
        </div>
        
        <div class="select-group">
          <label>混合模式:</label>
          <select v-model="blending">
            <option value="normal">正常</option>
            <option value="additive">叠加</option>
            <option value="subtractive">减法</option>
            <option value="multiply">乘法</option>
          </select>
        </div>
        
        <div class="color-group">
          <label>粒子颜色:</label>
          <input type="color" v-model="particleColorHex" @change="updateParticleColor" />
        </div>
        
        <div class="select-group">
          <label>粒子纹理:</label>
          <select v-model="particleTexture">
            <option value="">无</option>
            <option value="https://threejs.org/examples/textures/sprites/spark1.png">火花</option>
            <option value="https://threejs.org/examples/textures/sprites/circle.png">圆形</option>
            <option value="https://threejs.org/examples/textures/sprites/snowflake2.png">雪花</option>
          </select>
        </div>
      </div>
      
      <div class="control-group">
        <h3>发射器设置</h3>
        
        <div class="slider-group">
          <label>发射速率: {{ emissionRate }} 粒子/秒</label>
          <input type="range" v-model.number="emissionRate" min="1" max="100" step="1" />
        </div>
        
        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="showFireEmitter" />
            火焰发射器
          </label>
          
          <label>
            <input type="checkbox" v-model="showSmokeEmitter" />
            烟雾发射器
          </label>
          
          <label>
            <input type="checkbox" v-model="showFountainEmitter" />
            喷泉发射器
          </label>
          
          <label>
            <input type="checkbox" v-model="showStardustEmitter" />
            星尘发射器
          </label>
        </div>
        
        <div class="button-group">
          <button @click="triggerExplosion">触发爆炸</button>
          <button @click="resetParticleSystem">重置系统</button>
        </div>
      </div>
      
      <div class="info-panel">
        <h3>粒子系统信息</h3>
        <p>活跃粒子: {{ activeParticles }}</p>
        <p>帧率: {{ fps }} FPS</p>
        
        <h3>事件日志</h3>
        <ul class="event-log">
          <li v-for="(log, index) in eventLogs.slice().reverse()" :key="index">
            {{ log }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { 
  ThreeCanvas, 
  ThreeScene, 
  ThreeCamera, 
  ThreeMesh, 
  ThreePlaneGeometry,
  ThreeMeshStandardMaterial,
  ThreeAmbientLight, 
  ThreeDirectionalLight,
  ThreeOrbitControls,
  ThreeParticleSystem,
  ThreeParticleEmitter,
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
    ThreePlaneGeometry,
    ThreeMeshStandardMaterial,
    ThreeAmbientLight,
    ThreeDirectionalLight,
    ThreeOrbitControls,
    ThreeParticleSystem,
    ThreeParticleEmitter,
    ThreeStats,
    ThreeAxesHelper,
    ThreeGridHelper
  },
  setup() {
    // 粒子系统引用
    const particleSystem = ref(null);
    
    // 发射器引用
    const fireEmitter = ref(null);
    const smokeEmitter = ref(null);
    const explosionEmitter = ref(null);
    const fountainEmitter = ref(null);
    const stardustEmitter = ref(null);
    
    // 粒子系统设置
    const particleCount = ref(5000);
    const particleSize = ref(0.1);
    const sizeAttenuation = ref(true);
    const particleColor = ref(0xffffff);
    const particleColorHex = ref('#ffffff');
    const transparent = ref(true);
    const opacity = ref(0.8);
    const blending = ref('additive');
    const vertexColors = ref(true);
    const depthWrite = ref(false);
    const depthTest = ref(true);
    const sortParticles = ref(false);
    const particleTexture = ref('https://threejs.org/examples/textures/sprites/spark1.png');
    
    // 发射器设置
    const emissionRate = ref(20);
    const showFireEmitter = ref(true);
    const showSmokeEmitter = ref(true);
    const showExplosionEmitter = ref(true);
    const showFountainEmitter = ref(true);
    const showStardustEmitter = ref(true);
    
    // 爆炸设置
    const explosionPosition = ref([0, 2, 0]);
    const explosionParticles = ref(500);
    
    // 统计信息
    const activeParticles = ref(0);
    const fps = ref(0);
    
    // 事件日志
    const eventLogs = ref([]);
    
    // 帧率计算
    let frameCount = 0;
    let lastTime = 0;
    const updateFPS = () => {
      frameCount++;
      
      const now = performance.now();
      const elapsed = now - lastTime;
      
      if (elapsed >= 1000) {
        fps.value = Math.round(frameCount * 1000 / elapsed);
        frameCount = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    // 更新粒子颜色
    const updateParticleColor = () => {
      // 将十六进制颜色转换为数值
      particleColor.value = parseInt(particleColorHex.value.replace('#', '0x'), 16);
    };
    
    // 触发爆炸
    const triggerExplosion = () => {
      if (!explosionEmitter.value) return;
      
      // 随机爆炸位置
      explosionPosition.value = [
        (Math.random() - 0.5) * 6,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 6
      ];
      
      // 启动爆炸发射器
      explosionEmitter.value.start();
      
      // 记录事件
      addEventLog(`触发爆炸 @ [${explosionPosition.value.map(v => v.toFixed(2)).join(', ')}]`);
    };
    
    // 重置粒子系统
    const resetParticleSystem = () => {
      if (!particleSystem.value) return;
      
      // 重置粒子系统
      particleSystem.value.reset();
      
      // 记录事件
      addEventLog('重置粒子系统');
    };
    
    // 添加事件日志
    const addEventLog = (message) => {
      const timestamp = new Date().toLocaleTimeString();
      eventLogs.value.push(`[${timestamp}] ${message}`);
      
      // 限制日志长度
      if (eventLogs.value.length > 10) {
        eventLogs.value.shift();
      }
    };
    
    // 处理粒子系统就绪事件
    const handleParticleSystemReady = () => {
      addEventLog('粒子系统就绪');
    };
    
    // 处理火焰发射器就绪事件
    const handleFireEmitterReady = () => {
      addEventLog('火焰发射器就绪');
    };
    
    // 处理烟雾发射器就绪事件
    const handleSmokeEmitterReady = () => {
      addEventLog('烟雾发射器就绪');
    };
    
    // 处理爆炸发射器就绪事件
    const handleExplosionEmitterReady = () => {
      addEventLog('爆炸发射器就绪');
    };
    
    // 处理喷泉发射器就绪事件
    const handleFountainEmitterReady = () => {
      addEventLog('喷泉发射器就绪');
    };
    
    // 处理星尘发射器就绪事件
    const handleStardustEmitterReady = () => {
      addEventLog('星尘发射器就绪');
    };
    
    // 处理爆炸完成事件
    const handleExplosionComplete = () => {
      addEventLog('爆炸完成');
    };
    
    // 组件挂载和卸载
    onMounted(() => {
      // 开始计算帧率
      lastTime = performance.now();
      updateFPS();
      
      // 更新活跃粒子数量
      setInterval(() => {
        // 这里只是一个估计值，实际上应该从粒子系统获取
        activeParticles.value = Math.floor(Math.random() * particleCount.value * 0.8);
      }, 1000);
    });
    
    onBeforeUnmount(() => {
      // 清理定时器
      clearInterval(updateFPS);
    });
    
    return {
      particleSystem,
      fireEmitter,
      smokeEmitter,
      explosionEmitter,
      fountainEmitter,
      stardustEmitter,
      particleCount,
      particleSize,
      sizeAttenuation,
      particleColor,
      particleColorHex,
      transparent,
      opacity,
      blending,
      vertexColors,
      depthWrite,
      depthTest,
      sortParticles,
      particleTexture,
      emissionRate,
      showFireEmitter,
      showSmokeEmitter,
      showExplosionEmitter,
      showFountainEmitter,
      showStardustEmitter,
      explosionPosition,
      explosionParticles,
      activeParticles,
      fps,
      eventLogs,
      updateParticleColor,
      triggerExplosion,
      resetParticleSystem,
      handleParticleSystemReady,
      handleFireEmitterReady,
      handleSmokeEmitterReady,
      handleExplosionEmitterReady,
      handleFountainEmitterReady,
      handleStardustEmitterReady,
      handleExplosionComplete
    };
  }
};
</script>

<style scoped>
.three-particle-example {
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

.slider-group {
  margin-bottom: 15px;
}

.slider-group label {
  display: block;
  margin-bottom: 5px;
}

.slider-group input {
  width: 100%;
}

.checkbox-group {
  margin-bottom: 15px;
}

.checkbox-group label {
  display: block;
  margin-bottom: 10px;
}

.select-group {
  margin-bottom: 15px;
}

.select-group label {
  display: block;
  margin-bottom: 5px;
}

.select-group select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.color-group {
  margin-bottom: 15px;
}

.color-group label {
  display: block;
  margin-bottom: 5px;
}

.color-group input {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 4px;
  padding: 0;
  cursor: pointer;
}

.button-group {
  display: flex;
  margin-bottom: 15px;
}

button {
  flex: 1;
  margin-right: 8px;
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
  margin-right: 0;
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

.event-log {
  max-height: 200px;
  overflow-y: auto;
  padding-left: 20px;
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.event-log li {
  margin-bottom: 8px;
  font-size: 14px;
}
</style> 