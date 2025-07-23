<template>
  <div class="three-core-example">
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
        <ThreeSpotLight 
          :position="[0, 10, 0]" 
          :target="[0, 0, 0]" 
          :intensity="0.6" 
          :angle="Math.PI / 6" 
          :penumbra="0.2" 
          :cast-shadow="true"
          :helper="true"
        />
        
        <!-- 地面 -->
        <ThreeMesh :position="[0, -0.5, 0]" :rotation="[-Math.PI / 2, 0, 0]" :receive-shadow="true">
          <ThreePlaneGeometry :width="20" :height="20" />
          <ThreeMeshStandardMaterial :color="0x999999" />
        </ThreeMesh>
        
        <!-- 中心立方体 -->
        <ThreeMesh :position="[0, 1, 0]" :cast-shadow="true" :receive-shadow="true">
          <ThreeBoxGeometry :width="2" :height="2" :depth="2" />
          <ThreeMeshStandardMaterial :color="0x3366cc" :metalness="0.5" :roughness="0.5" />
        </ThreeMesh>
        
        <!-- 球体 -->
        <ThreeMesh :position="[3, 1, 0]" :cast-shadow="true" :receive-shadow="true">
          <ThreeSphereGeometry :radius="1" />
          <ThreeMeshPhongMaterial 
            :color="0xcc3366" 
            :specular="0xffffff"
            :shininess="50"
          />
        </ThreeMesh>
        
        <!-- 圆环 -->
        <ThreeMesh :position="[-3, 1, 0]" :cast-shadow="true" :receive-shadow="true">
          <ThreeTorusGeometry :radius="1" :tube="0.4" :radialSegments="16" :tubularSegments="100" />
          <ThreeMeshBasicMaterial :color="0x66cc33" :wireframe="true" />
        </ThreeMesh>
        
        <!-- 控制器 -->
        <ThreeOrbitControls />
        
        <!-- 性能监控 -->
        <ThreeStats position="top-right" />
      </ThreeScene>
    </ThreeCanvas>
    
    <div class="info-panel">
      <h2>Three-Core 集成示例</h2>
      <p>这个示例展示了如何使用 three-core 的 Engine 和 Manager 系统来构建 Three-Render 组件。</p>
      <p>主要优势：</p>
      <ul>
        <li>更好的资源管理和内存优化</li>
        <li>统一的场景管理机制</li>
        <li>更好的渲染循环控制</li>
        <li>更容易实现高级功能如多场景、多相机等</li>
      </ul>
      <p>组件：</p>
      <ul>
        <li>几何体：BoxGeometry, SphereGeometry, PlaneGeometry, TorusGeometry</li>
        <li>材质：MeshStandardMaterial, MeshBasicMaterial, MeshPhongMaterial</li>
        <li>灯光：AmbientLight, DirectionalLight, PointLight, SpotLight</li>
        <li>辅助：AxesHelper, GridHelper, Stats</li>
      </ul>
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
  ThreeMeshBasicMaterial,
  ThreeMeshPhongMaterial,
  ThreeAmbientLight, 
  ThreeDirectionalLight,
  ThreePointLight,
  ThreeSpotLight,
  ThreeOrbitControls,
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
    ThreeMeshBasicMaterial,
    ThreeMeshPhongMaterial,
    ThreeAmbientLight,
    ThreeDirectionalLight,
    ThreePointLight,
    ThreeSpotLight,
    ThreeOrbitControls,
    ThreeStats,
    ThreeAxesHelper,
    ThreeGridHelper
  },
  setup() {
    const canvasRef = ref(null);
    
    onMounted(() => {
      console.log('Three-Core Example mounted');
    });
    
    return {
      canvasRef
    };
  }
};
</script>

<style scoped>
.three-core-example {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.info-panel {
  padding: 20px;
  width: 300px;
  background-color: #f5f5f5;
  border-left: 1px solid #ddd;
}

h2 {
  margin-top: 0;
  color: #333;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
}
</style> 