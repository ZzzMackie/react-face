// 核心组件
import ThreeCanvas from './components/core/ThreeCanvas.vue';
import ThreeScene from './components/core/ThreeScene.vue';
import ThreeCamera from './components/core/ThreeCamera.vue';
import ThreeMesh from './components/core/ThreeMesh.vue';

// 几何体组件
import ThreeBoxGeometry from './components/geometry/ThreeBoxGeometry.vue';
import ThreePlaneGeometry from './components/geometry/ThreePlaneGeometry.vue';
import ThreeSphereGeometry from './components/geometry/ThreeSphereGeometry.vue';
import ThreeTorusGeometry from './components/geometry/ThreeTorusGeometry.vue';

// 材质组件
import ThreeMeshBasicMaterial from './components/material/ThreeMeshBasicMaterial.vue';
import ThreeMeshStandardMaterial from './components/material/ThreeMeshStandardMaterial.vue';
import ThreeMeshPhongMaterial from './components/material/ThreeMeshPhongMaterial.vue';

// 光照组件
import ThreeAmbientLight from './components/light/ThreeAmbientLight.vue';
import ThreeDirectionalLight from './components/light/ThreeDirectionalLight.vue';
import ThreePointLight from './components/light/ThreePointLight.vue';
import ThreeSpotLight from './components/light/ThreeSpotLight.vue';

// 控制组件
import ThreeOrbitControls from './components/controls/ThreeOrbitControls.vue';

// 后处理组件
import ThreePostProcessing from './components/postprocessing/ThreePostProcessing.vue';
import ThreeBloomEffect from './components/postprocessing/ThreeBloomEffect.vue';
import ThreeDepthOfFieldEffect from './components/postprocessing/ThreeDepthOfFieldEffect.vue';
import ThreeAmbientOcclusionEffect from './components/postprocessing/ThreeAmbientOcclusionEffect.vue';

// 物理组件
import ThreePhysicsWorld from './components/physics/ThreePhysicsWorld.vue';
import ThreeRigidBody from './components/physics/ThreeRigidBody.vue';

// 交互组件
import ThreeRaycaster from './components/interaction/ThreeRaycaster.vue';
import ThreeInteractive from './components/interaction/ThreeInteractive.vue';
import ThreeDragControls from './components/interaction/ThreeDragControls.vue';
import ThreeDraggable from './components/interaction/ThreeDraggable.vue';

// 动画组件
import ThreeAnimationMixer from './components/animation/ThreeAnimationMixer.vue';
import ThreeAnimationClip from './components/animation/ThreeAnimationClip.vue';

// 粒子组件
import ThreeParticleSystem from './components/particles/ThreeParticleSystem.vue';
import ThreeParticleEmitter from './components/particles/ThreeParticleEmitter.vue';

// 资源管理组件
import ThreeResourceManager from './components/resources/ThreeResourceManager.vue';
import ThreeTextureLoader from './components/resources/ThreeTextureLoader.vue';
import ThreeModelLoader from './components/resources/ThreeModelLoader.vue';

// 性能优化组件
import ThreeInstancedMesh from './components/performance/ThreeInstancedMesh.vue';

// 辅助组件
import ThreeStats from './components/debug/ThreeStats.vue';
import ThreeAxesHelper from './components/debug/ThreeAxesHelper.vue';
import ThreeGridHelper from './components/debug/ThreeGridHelper.vue';

// 导出已实现的组件
export {
  // 核心组件
  ThreeCanvas,
  ThreeScene,
  ThreeCamera,
  ThreeMesh,
  
  // 几何体组件
  ThreeBoxGeometry,
  ThreePlaneGeometry,
  ThreeSphereGeometry,
  ThreeTorusGeometry,
  
  // 材质组件
  ThreeMeshBasicMaterial,
  ThreeMeshStandardMaterial,
  ThreeMeshPhongMaterial,
  
  // 光照组件
  ThreeAmbientLight,
  ThreeDirectionalLight,
  ThreePointLight,
  ThreeSpotLight,
  
  // 控制组件
  ThreeOrbitControls,
  
  // 后处理组件
  ThreePostProcessing,
  ThreeBloomEffect,
  ThreeDepthOfFieldEffect,
  ThreeAmbientOcclusionEffect,
  
  // 物理组件
  ThreePhysicsWorld,
  ThreeRigidBody,
  
  // 交互组件
  ThreeRaycaster,
  ThreeInteractive,
  ThreeDragControls,
  ThreeDraggable,
  
  // 动画组件
  ThreeAnimationMixer,
  ThreeAnimationClip,
  
  // 粒子组件
  ThreeParticleSystem,
  ThreeParticleEmitter,
  
  // 资源管理组件
  ThreeResourceManager,
  ThreeTextureLoader,
  ThreeModelLoader,
  
  // 性能优化组件
  ThreeInstancedMesh,
  
  // 辅助组件
  ThreeStats,
  ThreeAxesHelper,
  ThreeGridHelper
};

// 导出默认插件
export default {
  install(app: any) {
    // 注册核心组件
    app.component('ThreeCanvas', ThreeCanvas);
    app.component('ThreeScene', ThreeScene);
    app.component('ThreeCamera', ThreeCamera);
    app.component('ThreeMesh', ThreeMesh);
    
    // 注册几何体组件
    app.component('ThreeBoxGeometry', ThreeBoxGeometry);
    app.component('ThreePlaneGeometry', ThreePlaneGeometry);
    app.component('ThreeSphereGeometry', ThreeSphereGeometry);
    app.component('ThreeTorusGeometry', ThreeTorusGeometry);
    
    // 注册材质组件
    app.component('ThreeMeshBasicMaterial', ThreeMeshBasicMaterial);
    app.component('ThreeMeshStandardMaterial', ThreeMeshStandardMaterial);
    app.component('ThreeMeshPhongMaterial', ThreeMeshPhongMaterial);
    
    // 注册光照组件
    app.component('ThreeAmbientLight', ThreeAmbientLight);
    app.component('ThreeDirectionalLight', ThreeDirectionalLight);
    app.component('ThreePointLight', ThreePointLight);
    app.component('ThreeSpotLight', ThreeSpotLight);
    
    // 注册控制组件
    app.component('ThreeOrbitControls', ThreeOrbitControls);
    
    // 注册后处理组件
    app.component('ThreePostProcessing', ThreePostProcessing);
    app.component('ThreeBloomEffect', ThreeBloomEffect);
    app.component('ThreeDepthOfFieldEffect', ThreeDepthOfFieldEffect);
    app.component('ThreeAmbientOcclusionEffect', ThreeAmbientOcclusionEffect);
    
    // 注册物理组件
    app.component('ThreePhysicsWorld', ThreePhysicsWorld);
    app.component('ThreeRigidBody', ThreeRigidBody);
    
    // 注册交互组件
    app.component('ThreeRaycaster', ThreeRaycaster);
    app.component('ThreeInteractive', ThreeInteractive);
    app.component('ThreeDragControls', ThreeDragControls);
    app.component('ThreeDraggable', ThreeDraggable);
    
    // 注册动画组件
    app.component('ThreeAnimationMixer', ThreeAnimationMixer);
    app.component('ThreeAnimationClip', ThreeAnimationClip);
    
    // 注册粒子组件
    app.component('ThreeParticleSystem', ThreeParticleSystem);
    app.component('ThreeParticleEmitter', ThreeParticleEmitter);
    
    // 注册资源管理组件
    app.component('ThreeResourceManager', ThreeResourceManager);
    app.component('ThreeTextureLoader', ThreeTextureLoader);
    app.component('ThreeModelLoader', ThreeModelLoader);
    
    // 注册性能优化组件
    app.component('ThreeInstancedMesh', ThreeInstancedMesh);
    
    // 注册辅助组件
    app.component('ThreeStats', ThreeStats);
    app.component('ThreeAxesHelper', ThreeAxesHelper);
    app.component('ThreeGridHelper', ThreeGridHelper);
  }
}; 