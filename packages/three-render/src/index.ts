// 导出核心组件
export { default as ThreeCanvas } from './components/core/ThreeCanvas.vue';
export { default as ThreeScene } from './components/core/ThreeScene.vue';
export { default as ThreeCamera } from './components/core/ThreeCamera.vue';
export { default as ThreeObject } from './components/core/ThreeObject.vue';
export { default as ThreeMesh } from './components/core/ThreeMesh.vue';

// 导出几何体组件
export { default as ThreeGeometry } from './components/geometries/ThreeGeometry.vue';
export { default as ThreeBox } from './components/geometries/ThreeBox.vue';
export { default as ThreeSphere } from './components/geometries/ThreeSphere.vue';
export { default as ThreePlane } from './components/geometries/ThreePlane.vue';
export { default as ThreeCylinder } from './components/geometries/ThreeCylinder.vue';
export { default as ThreeTorus } from './components/geometries/ThreeTorus.vue';
export { default as ThreeCone } from './components/geometries/ThreeCone.vue';
export { default as ThreeTorusKnot } from './components/geometries/ThreeTorusKnot.vue';

// 导出材质组件
export { default as ThreeMeshStandardMaterial } from './components/materials/ThreeMeshStandardMaterial.vue';
export { default as ThreeMeshBasicMaterial } from './components/materials/ThreeMeshBasicMaterial.vue';
export { default as ThreeMeshPhongMaterial } from './components/materials/ThreeMeshPhongMaterial.vue';

// 导出灯光组件
export { default as ThreeDirectionalLight } from './components/lights/ThreeDirectionalLight.vue';
export { default as ThreeAmbientLight } from './components/lights/ThreeAmbientLight.vue';
export { default as ThreePointLight } from './components/lights/ThreePointLight.vue';
export { default as ThreeSpotLight } from './components/lights/ThreeSpotLight.vue';
export { default as ThreeHemisphereLight } from './components/lights/ThreeHemisphereLight.vue';

// 导出控制器组件
export { default as ThreeOrbitControls } from './components/controls/ThreeOrbitControls.vue';

// 导出后处理组件
export { default as ThreePostProcessing } from './components/postprocessing/ThreePostProcessing.vue';
export { default as ThreeBloomEffect } from './components/postprocessing/ThreeBloomEffect.vue';
export { default as ThreeFXAAEffect } from './components/postprocessing/ThreeFXAAEffect.vue';

// 导出组合式 API
export * from './composables';

// 导出常量和类型
export * from './constants';

// 导出工具函数
export * from './utils';

// 插件定义
import { App } from 'vue';
import * as components from './components';

// Vue 插件安装函数
const install = (app: App) => {
  // 注册所有组件
  for (const [name, component] of Object.entries(components)) {
    app.component(name, component);
  }
};

export { install };
export default { install }; 