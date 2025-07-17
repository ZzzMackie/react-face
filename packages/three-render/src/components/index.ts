// 核心组件
export { default as ThreeCanvas } from './core/ThreeCanvas.vue';
export { default as ThreeScene } from './core/ThreeScene.vue';
export { default as ThreeObject } from './core/ThreeObject.vue';

// 相机组件
export { default as ThreeCamera } from './cameras/ThreeCamera.vue';
export { default as ThreePerspectiveCamera } from './cameras/ThreePerspectiveCamera.vue';
export { default as ThreeOrthographicCamera } from './cameras/ThreeOrthographicCamera.vue';

// 灯光组件
export { default as ThreeAmbientLight } from './lights/ThreeAmbientLight.vue';
export { default as ThreeDirectionalLight } from './lights/ThreeDirectionalLight.vue';
export { default as ThreePointLight } from './lights/ThreePointLight.vue';
export { default as ThreeSpotLight } from './lights/ThreeSpotLight.vue';
export { default as ThreeHemisphereLight } from './lights/ThreeHemisphereLight.vue';
export { default as ThreeRectAreaLight } from './lights/ThreeRectAreaLight.vue';

// 几何体组件
export { default as ThreeMesh } from './objects/ThreeMesh.vue';
export { default as ThreeGroup } from './objects/ThreeGroup.vue';
export { default as ThreeBoxGeometry } from './geometries/ThreeBoxGeometry.vue';
export { default as ThreeSphereGeometry } from './geometries/ThreeSphereGeometry.vue';
export { default as ThreePlaneGeometry } from './geometries/ThreePlaneGeometry.vue';
export { default as ThreeCylinderGeometry } from './geometries/ThreeCylinderGeometry.vue';
export { default as ThreeConeGeometry } from './geometries/ThreeConeGeometry.vue';
export { default as ThreeTorusGeometry } from './geometries/ThreeTorusGeometry.vue';
export { default as ThreeTorusKnotGeometry } from './geometries/ThreeTorusKnotGeometry.vue';

// 材质组件
export { default as ThreeMeshBasicMaterial } from './materials/ThreeMeshBasicMaterial.vue';
export { default as ThreeMeshStandardMaterial } from './materials/ThreeMeshStandardMaterial.vue';
export { default as ThreeMeshPhysicalMaterial } from './materials/ThreeMeshPhysicalMaterial.vue';
export { default as ThreeMeshLambertMaterial } from './materials/ThreeMeshLambertMaterial.vue';
export { default as ThreeMeshPhongMaterial } from './materials/ThreeMeshPhongMaterial.vue';
export { default as ThreeMeshToonMaterial } from './materials/ThreeMeshToonMaterial.vue';
export { default as ThreeMeshNormalMaterial } from './materials/ThreeMeshNormalMaterial.vue';
export { default as ThreeMeshDepthMaterial } from './materials/ThreeMeshDepthMaterial.vue';
export { default as ThreeShaderMaterial } from './materials/ThreeShaderMaterial.vue';
export { default as ThreeLineBasicMaterial } from './materials/ThreeLineBasicMaterial.vue';
export { default as ThreeLineDashedMaterial } from './materials/ThreeLineDashedMaterial.vue';
export { default as ThreePointsMaterial } from './materials/ThreePointsMaterial.vue';

// 控制器组件
export { default as ThreeOrbitControls } from './controls/ThreeOrbitControls.vue';
export { default as ThreeTransformControls } from './controls/ThreeTransformControls.vue';
export { default as ThreeTrackballControls } from './controls/ThreeTrackballControls.vue';
export { default as ThreeFlyControls } from './controls/ThreeFlyControls.vue';
export { default as ThreeFirstPersonControls } from './controls/ThreeFirstPersonControls.vue';
export { default as ThreePointerLockControls } from './controls/ThreePointerLockControls.vue';
export { default as ThreeDragControls } from './controls/ThreeDragControls.vue';

// 辅助组件
export { default as ThreeAxesHelper } from './helpers/ThreeAxesHelper.vue';
export { default as ThreeGridHelper } from './helpers/ThreeGridHelper.vue';
export { default as ThreeBoxHelper } from './helpers/ThreeBoxHelper.vue';
export { default as ThreePolarGridHelper } from './helpers/ThreePolarGridHelper.vue';
export { default as ThreeDirectionalLightHelper } from './helpers/ThreeDirectionalLightHelper.vue';
export { default as ThreeSpotLightHelper } from './helpers/ThreeSpotLightHelper.vue';
export { default as ThreePointLightHelper } from './helpers/ThreePointLightHelper.vue';
export { default as ThreeCameraHelper } from './helpers/ThreeCameraHelper.vue';

// 特效组件
export { default as ThreePostProcessing } from './effects/ThreePostProcessing.vue';
export { default as ThreeBloomEffect } from './effects/ThreeBloomEffect.vue';
export { default as ThreeOutlineEffect } from './effects/ThreeOutlineEffect.vue';
export { default as ThreeSSAOEffect } from './effects/ThreeSSAOEffect.vue';
export { default as ThreeSSREffect } from './effects/ThreeSSREffect.vue';
export { default as ThreeDepthOfFieldEffect } from './effects/ThreeDepthOfFieldEffect.vue';
export { default as ThreeVignetteEffect } from './effects/ThreeVignetteEffect.vue';
export { default as ThreeFilmEffect } from './effects/ThreeFilmEffect.vue';

// 加载器组件
export { default as ThreeGLTFModel } from './loaders/ThreeGLTFModel.vue';
export { default as ThreeFBXModel } from './loaders/ThreeFBXModel.vue';
export { default as ThreeOBJModel } from './loaders/ThreeOBJModel.vue';
export { default as ThreeSTLModel } from './loaders/ThreeSTLModel.vue';
export { default as ThreeTextureLoader } from './loaders/ThreeTextureLoader.vue';
export { default as ThreeCubeTextureLoader } from './loaders/ThreeCubeTextureLoader.vue';
export { default as ThreeHDRLoader } from './loaders/ThreeHDRLoader.vue';

// 高级组件
export { default as ThreeParticles } from './advanced/ThreeParticles.vue';
export { default as ThreeInstances } from './advanced/ThreeInstances.vue';
export { default as ThreeReflector } from './advanced/ThreeReflector.vue';
export { default as ThreeWater } from './advanced/ThreeWater.vue';
export { default as ThreeSky } from './advanced/ThreeSky.vue';
export { default as ThreeSprite } from './advanced/ThreeSprite.vue';
export { default as ThreeText } from './advanced/ThreeText.vue';
export { default as ThreeCSS3D } from './advanced/ThreeCSS3D.vue';
export { default as ThreeHTML } from './advanced/ThreeHTML.vue';

// 物理组件
export { default as ThreePhysics } from './physics/ThreePhysics.vue';
export { default as ThreeRigidBody } from './physics/ThreeRigidBody.vue';
export { default as ThreeCollider } from './physics/ThreeCollider.vue';
export { default as ThreeConstraint } from './physics/ThreeConstraint.vue';
export { default as ThreeRaycast } from './physics/ThreeRaycast.vue';

// UI组件
export { default as ThreeUI } from './ui/ThreeUI.vue';
export { default as ThreeLabel } from './ui/ThreeLabel.vue';
export { default as ThreeButton } from './ui/ThreeButton.vue';
export { default as ThreePanel } from './ui/ThreePanel.vue';
export { default as ThreeSlider } from './ui/ThreeSlider.vue';
export { default as ThreeTooltip } from './ui/ThreeTooltip.vue';

// 动画组件
export { default as ThreeAnimation } from './animation/ThreeAnimation.vue';
export { default as ThreeAnimationMixer } from './animation/ThreeAnimationMixer.vue';
export { default as ThreeAnimationClip } from './animation/ThreeAnimationClip.vue';
export { default as ThreeKeyframeTrack } from './animation/ThreeKeyframeTrack.vue';
export { default as ThreeMorph } from './animation/ThreeMorph.vue';
export { default as ThreeSkeleton } from './animation/ThreeSkeleton.vue';

// 环境组件
export { default as ThreeEnvironment } from './environment/ThreeEnvironment.vue';
export { default as ThreeFog } from './environment/ThreeFog.vue';
export { default as ThreeBackground } from './environment/ThreeBackground.vue';
export { default as ThreeSkybox } from './environment/ThreeSkybox.vue';
export { default as ThreeHDRI } from './environment/ThreeHDRI.vue'; 