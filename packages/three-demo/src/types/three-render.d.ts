declare module 'three-render' {
  import { App } from 'vue'
  
  // 插件类型
  interface ThreeRenderPlugin {
    install(app: App): void
  }
  
  // 导出默认插件
  const ThreeRender: ThreeRenderPlugin
  export default ThreeRender
  
  // 导出组件
  export const ThreeCanvas: any
  export const ThreeScene: any
  export const ThreeCamera: any
  export const ThreeMesh: any
  export const ThreeBoxGeometry: any
  export const ThreePlaneGeometry: any
  export const ThreeSphereGeometry: any
  export const ThreeTorusGeometry: any
  export const ThreeMeshBasicMaterial: any
  export const ThreeMeshStandardMaterial: any
  export const ThreeMeshPhongMaterial: any
  export const ThreeAmbientLight: any
  export const ThreeDirectionalLight: any
  export const ThreePointLight: any
  export const ThreeSpotLight: any
  export const ThreeOrbitControls: any
  export const ThreePostProcessing: any
  export const ThreeBloomEffect: any
  export const ThreeDepthOfFieldEffect: any
  export const ThreeAmbientOcclusionEffect: any
  export const ThreePhysicsWorld: any
  export const ThreeRigidBody: any
  export const ThreeRaycaster: any
  export const ThreeInteractive: any
  export const ThreeDragControls: any
  export const ThreeDraggable: any
  export const ThreeAnimationMixer: any
  export const ThreeAnimationClip: any
  export const ThreeParticleSystem: any
  export const ThreeParticleEmitter: any
  export const ThreeResourceManager: any
  export const ThreeTextureLoader: any
  export const ThreeModelLoader: any
  export const ThreeInstancedMesh: any
  export const ThreeStats: any
  export const ThreeAxesHelper: any
  export const ThreeGridHelper: any
} 