<template>
  <div class="three-performance-example">
    <ThreeCanvas :width="800" :height="600">
      <ThreeScene :background="0x222222">
        <ThreeCamera :position="[0, 5, 20]" :lookAt="[0, 0, 0]" />
        
        <!-- 辅助对象 -->
        <ThreeAxesHelper :size="5" />
        <ThreeGridHelper :size="20" :divisions="20" :position="[0, -0.01, 0]" />
        
        <!-- 灯光 -->
        <ThreeAmbientLight :intensity="0.5" />
        <ThreeDirectionalLight 
          :position="[5, 10, 5]" 
          :intensity="1" 
          :cast-shadow="true" 
          :shadow-map-size="[2048, 2048]"
        />
        
        <!-- 实例化渲染 - 盒子 -->
        <ThreeInstancedMesh
          v-if="showBoxes"
          :count="boxCount"
          :position="[-7, 0, 0]"
          :spread="boxSpread"
          :distribution="boxDistribution"
          :animated="boxAnimated"
          :animation-speed="boxAnimationSpeed"
          :cast-shadow="true"
          :receive-shadow="true"
          :color="0x3366cc"
          @ready="handleBoxesReady"
        >
          <ThreeBoxGeometry :width="0.8" :height="0.8" :depth="0.8" />
          <ThreeMeshStandardMaterial :metalness="0.7" :roughness="0.3" />
        </ThreeInstancedMesh>
        
        <!-- 实例化渲染 - 球体 -->
        <ThreeInstancedMesh
          v-if="showSpheres"
          :count="sphereCount"
          :position="[7, 0, 0]"
          :spread="sphereSpread"
          :distribution="sphereDistribution"
          :animated="sphereAnimated"
          :animation-speed="sphereAnimationSpeed"
          :cast-shadow="true"
          :receive-shadow="true"
          :color="0xcc3366"
          @ready="handleSpheresReady"
        >
          <ThreeSphereGeometry :radius="0.5" :width-segments="16" :height-segments="16" />
          <ThreeMeshStandardMaterial :metalness="0.7" :roughness="0.3" />
        </ThreeInstancedMesh>
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -2, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
          <ThreePlaneGeometry :width="40" :height="40" />
          <ThreeMeshStandardMaterial :color="0x333333" />
        </ThreeMesh>
        
        <!-- 控制器 -->
        <ThreeOrbitControls />
        
        <!-- 性能监控 -->
        <ThreeStats position="top-right" />
      </ThreeScene>
    </ThreeCanvas>
    
    <div class="controls-panel">
      <h2>性能优化示例</h2>
      <p>实例化渲染可以高效地渲染大量相同几何体的对象</p>
      
      <div class="control-group">
        <h3>盒子实例</h3>
        
        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="showBoxes" />
            显示盒子
          </label>
          
          <label>
            <input type="checkbox" v-model="boxAnimated" />
            启用动画
          </label>
        </div>
        
        <div class="slider-group">
          <label>数量: {{ boxCount }}</label>
          <input type="range" v-model.number="boxCount" min="100" max="10000" step="100" />
        </div>
        
        <div class="slider-group">
          <label>分布范围: {{ boxSpread.toFixed(1) }}</label>
          <input type="range" v-model.number="boxSpread" min="5" max="20" step="0.1" />
        </div>
        
        <div class="slider-group">
          <label>动画速度: {{ boxAnimationSpeed.toFixed(2) }}</label>
          <input type="range" v-model.number="boxAnimationSpeed" min="0.01" max="0.5" step="0.01" />
        </div>
        
        <div class="select-group">
          <label>分布类型:</label>
          <select v-model="boxDistribution">
            <option value="random">随机分布</option>
            <option value="grid">网格分布</option>
            <option value="circle">圆形分布</option>
            <option value="sphere">球形分布</option>
          </select>
        </div>
      </div>
      
      <div class="control-group">
        <h3>球体实例</h3>
        
        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="showSpheres" />
            显示球体
          </label>
          
          <label>
            <input type="checkbox" v-model="sphereAnimated" />
            启用动画
          </label>
        </div>
        
        <div class="slider-group">
          <label>数量: {{ sphereCount }}</label>
          <input type="range" v-model.number="sphereCount" min="100" max="10000" step="100" />
        </div>
        
        <div class="slider-group">
          <label>分布范围: {{ sphereSpread.toFixed(1) }}</label>
          <input type="range" v-model.number="sphereSpread" min="5" max="20" step="0.1" />
        </div>
        
        <div class="slider-group">
          <label>动画速度: {{ sphereAnimationSpeed.toFixed(2) }}</label>
          <input type="range" v-model.number="sphereAnimationSpeed" min="0.01" max="0.5" step="0.01" />
        </div>
        
        <div class="select-group">
          <label>分布类型:</label>
          <select v-model="sphereDistribution">
            <option value="random">随机分布</option>
            <option value="grid">网格分布</option>
            <option value="circle">圆形分布</option>
            <option value="sphere">球形分布</option>
          </select>
        </div>
      </div>
      
      <div class="info-panel">
        <h3>性能信息</h3>
        <p>盒子实例数量: {{ boxCount }}</p>
        <p>球体实例数量: {{ sphereCount }}</p>
        <p>总实例数量: {{ boxCount + sphereCount }}</p>
        <p>总顶点数量: {{ totalVertexCount.toLocaleString() }}</p>
        <p>总三角形数量: {{ totalTriangleCount.toLocaleString() }}</p>
        <p>绘制调用次数: {{ drawCalls }}</p>
        
        <h3>实例化渲染说明</h3>
        <p>实例化渲染使用单个绘制调用渲染多个相同几何体的对象，大幅提高性能。</p>
        <p>适用于渲染大量相似对象，如粒子、树木、草地等。</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { 
  ThreeCanvas, 
  ThreeScene, 
  ThreeCamera, 
  ThreeMesh, 
  ThreeBoxGeometry,
  ThreeSphereGeometry,
  ThreePlaneGeometry,
  ThreeMeshStandardMaterial,
  ThreeAmbientLight, 
  ThreeDirectionalLight,
  ThreeOrbitControls,
  ThreeStats,
  ThreeAxesHelper,
  ThreeGridHelper
} from '../src';

// 导入实例化渲染组件
import ThreeInstancedMesh from '../src/components/performance/ThreeInstancedMesh.vue';

export default {
  components: {
    ThreeCanvas,
    ThreeScene,
    ThreeCamera,
    ThreeMesh,
    ThreeBoxGeometry,
    ThreeSphereGeometry,
    ThreePlaneGeometry,
    ThreeMeshStandardMaterial,
    ThreeAmbientLight,
    ThreeDirectionalLight,
    ThreeOrbitControls,
    ThreeStats,
    ThreeAxesHelper,
    ThreeGridHelper,
    ThreeInstancedMesh
  },
  setup() {
    // 盒子实例配置
    const showBoxes = ref(true);
    const boxCount = ref(1000);
    const boxSpread = ref(10);
    const boxDistribution = ref('random');
    const boxAnimated = ref(true);
    const boxAnimationSpeed = ref(0.1);
    
    // 球体实例配置
    const showSpheres = ref(true);
    const sphereCount = ref(1000);
    const sphereSpread = ref(10);
    const sphereDistribution = ref('sphere');
    const sphereAnimated = ref(true);
    const sphereAnimationSpeed = ref(0.1);
    
    // 性能信息
    const boxGeometryInfo = ref({ vertices: 0, triangles: 0 });
    const sphereGeometryInfo = ref({ vertices: 0, triangles: 0 });
    const drawCalls = ref(0);
    
    // 计算总顶点数和三角形数
    const totalVertexCount = computed(() => {
      let count = 0;
      if (showBoxes.value) count += boxGeometryInfo.value.vertices * boxCount.value;
      if (showSpheres.value) count += sphereGeometryInfo.value.vertices * sphereCount.value;
      return count;
    });
    
    const totalTriangleCount = computed(() => {
      let count = 0;
      if (showBoxes.value) count += boxGeometryInfo.value.triangles * boxCount.value;
      if (showSpheres.value) count += sphereGeometryInfo.value.triangles * sphereCount.value;
      return count;
    });
    
    // 处理盒子实例就绪事件
    const handleBoxesReady = (event) => {
      const geometry = event.instancedMesh.geometry;
      boxGeometryInfo.value = {
        vertices: geometry.attributes.position.count,
        triangles: geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3
      };
      
      // 更新绘制调用次数
      updateDrawCalls();
    };
    
    // 处理球体实例就绪事件
    const handleSpheresReady = (event) => {
      const geometry = event.instancedMesh.geometry;
      sphereGeometryInfo.value = {
        vertices: geometry.attributes.position.count,
        triangles: geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3
      };
      
      // 更新绘制调用次数
      updateDrawCalls();
    };
    
    // 更新绘制调用次数
    const updateDrawCalls = () => {
      let calls = 0;
      if (showBoxes.value) calls += 1;
      if (showSpheres.value) calls += 1;
      calls += 1; // 地面
      drawCalls.value = calls;
    };
    
    // 监听显示状态变化
    watch(() => [showBoxes.value, showSpheres.value], () => {
      updateDrawCalls();
    });
    
    // 组件挂载
    onMounted(() => {
      // 初始化绘制调用次数
      updateDrawCalls();
    });
    
    return {
      // 盒子实例
      showBoxes,
      boxCount,
      boxSpread,
      boxDistribution,
      boxAnimated,
      boxAnimationSpeed,
      
      // 球体实例
      showSpheres,
      sphereCount,
      sphereSpread,
      sphereDistribution,
      sphereAnimated,
      sphereAnimationSpeed,
      
      // 性能信息
      totalVertexCount,
      totalTriangleCount,
      drawCalls,
      
      // 事件处理
      handleBoxesReady,
      handleSpheresReady
    };
  }
};
</script>

<style scoped>
.three-performance-example {
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

p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.control-group {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.checkbox-group {
  margin-bottom: 15px;
}

.checkbox-group label {
  display: block;
  margin-bottom: 10px;
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
  border: 1px solid #ddd;
  border-radius: 4px;
}

.info-panel {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style> 