import { InjectionKey, Ref } from 'vue';
import { Object3D, Scene, Camera, WebGLRenderer } from 'three';

// 父对象注入键
export const PARENT_INJECTION_KEY = Symbol('three-parent') as InjectionKey<Ref<Object3D | null>>;

// Three.js 核心对象注入键
export const SCENE_INJECTION_KEY = Symbol('three-scene') as InjectionKey<Ref<Scene | null>>;
export const CAMERA_INJECTION_KEY = Symbol('three-camera') as InjectionKey<Ref<Camera | null>>;
export const RENDERER_INJECTION_KEY = Symbol('three-renderer') as InjectionKey<Ref<WebGLRenderer | null>>;

// 动画帧注入键
export const FRAME_LOOP_INJECTION_KEY = Symbol('three-frame-loop') as InjectionKey<(callback: FrameCallback) => void>;

// 动画帧回调类型
export type FrameCallback = (time: number, delta: number) => void; 