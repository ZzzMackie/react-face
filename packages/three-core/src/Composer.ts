/* eslint-disable @typescript-eslint/no-explicit-any */
// import { EffectComposer } from '@fusen/threejs/addons/postprocessing/EffectComposer.js';
// import { RenderPass } from '@fusen/threejs/addons/postprocessing/RenderPass.js';
// import { FilmPass } from '@fusen/threejs/addons/postprocessing/FilmPass.js';
// import { BloomPass } from '@fusen/threejs/addons/postprocessing/BloomPass.js';
// import { ShaderPass } from '@fusen/threejs/addons/postprocessing/ShaderPass.js';
// import { HueSaturationShader } from '@fusen/threejs/examples/jsm/shaders/HueSaturationShader.js';
// import * as THREE from '@fusen/threejs';
// const clock = new THREE.Clock();
import { proxyOptions } from './Proxy.ts';
export class Composer {
  threeEngine: any;
  composer: null;
  constructor(threeEngine: any) {
    this.threeEngine = threeEngine;
    this.composer = null;
    proxyOptions(this, this.threeEngine);
  }
  initComposer() {
    // this.composer = new EffectComposer(this.threeEngine.renderer__three.renderer);
    // var composer = new EffectComposer(this.threeEngine.renderer__three.renderer);
    // const renderPass = new RenderPass(this.threeEngine.scene__three, this.threeEngine.camera__three.viewportCamera);
    // const effectFilm = new FilmPass(0.8, 0.35, 256, false);
    // var bloomPass = new BloomPass(0.1, 25, 5.0, 256);
    // var effectCopy = new ShaderPass(HueSaturationShader);
    // composer.addPass(renderPass);
    // composer.addPass(effectCopy);
    // // var renderScene = new TexturePass(composer.renderTarget2);
    // effectCopy.renderToScreen = true;
    // effectFilm.renderToScreen = true;
    // this.composer.addPass(renderPass);
    // // this.composer.addPass(bloomPass);
    // this.composer.addPass(effectCopy);
    // effectCopy.uniforms.hue.value = 1;
    // effectCopy.uniforms.saturation.value = 0;
    // console.log(this.composer);
  }
  render() {
    // var delta = clock.getDelta();
    // this.composer?.render?.(delta);
  }
}
