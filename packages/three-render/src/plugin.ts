import { App } from 'vue';

// 核心组件
import ThreeCanvas from './components/core/ThreeCanvas.vue';
import ThreeScene from './components/core/ThreeScene.vue';
import ThreeCamera from './components/core/ThreeCamera.vue';
import ThreeMesh from './components/core/ThreeMesh.vue';
import ThreeObject from './components/core/ThreeObject.vue';
import ThreeResourceManager from './components/core/ThreeResourceManager.vue';
import ThreeWebGPURenderer from './components/core/ThreeWebGPURenderer.vue';

// 物理组件
import ThreePhysicsWorld from './components/physics/ThreePhysicsWorld.vue';
import ThreeRigidBody from './components/physics/ThreeRigidBody.vue';
import ThreeBoxCollider from './components/physics/ThreeBoxCollider.vue';
import ThreeSphereCollider from './components/physics/ThreeSphereCollider.vue';
import ThreeConstraint from './components/physics/ThreeConstraint.vue';

// 后处理组件
import ThreePostProcessing from './components/postprocessing/ThreePostProcessing.vue';
import ThreeBloomEffect from './components/postprocessing/ThreeBloomEffect.vue';
import ThreeFXAAEffect from './components/postprocessing/ThreeFXAAEffect.vue';
import ThreeDepthOfFieldEffect from './components/postprocessing/ThreeDepthOfFieldEffect.vue';

// 调试组件
import ThreeStats from './components/debug/ThreeStats.vue';

// 交互组件
import ThreeRaycaster from './components/interaction/ThreeRaycaster.vue';
import ThreeInteractive from './components/interaction/ThreeInteractive.vue';

export default {
  install(app: App) {
    // 注册核心组件
    app.component('ThreeCanvas', ThreeCanvas);
    app.component('ThreeScene', ThreeScene);
    app.component('ThreeCamera', ThreeCamera);
    app.component('ThreeMesh', ThreeMesh);
    app.component('ThreeObject', ThreeObject);
    app.component('ThreeResourceManager', ThreeResourceManager);
    app.component('ThreeWebGPURenderer', ThreeWebGPURenderer);
    
    // 注册物理组件
    app.component('ThreePhysicsWorld', ThreePhysicsWorld);
    app.component('ThreeRigidBody', ThreeRigidBody);
    app.component('ThreeBoxCollider', ThreeBoxCollider);
    app.component('ThreeSphereCollider', ThreeSphereCollider);
    app.component('ThreeConstraint', ThreeConstraint);
    
    // 注册后处理组件
    app.component('ThreePostProcessing', ThreePostProcessing);
    app.component('ThreeBloomEffect', ThreeBloomEffect);
    app.component('ThreeFXAAEffect', ThreeFXAAEffect);
    app.component('ThreeDepthOfFieldEffect', ThreeDepthOfFieldEffect);
    
    // 注册调试组件
    app.component('ThreeStats', ThreeStats);
    
    // 注册交互组件
    app.component('ThreeRaycaster', ThreeRaycaster);
    app.component('ThreeInteractive', ThreeInteractive);
  }
}; 