import { Object3D, Camera, Scene, WebGLRenderer, Clock, Vector2, Raycaster, Intersection } from 'three';
import { World, Body, Shape, Constraint } from 'cannon-es';
import { Ref } from 'vue';

// 基本类型
export type Vector3Tuple = [number, number, number];
export type ColorValue = string | number;

// 物理世界类型
export interface PhysicsWorldOptions {
  gravity?: Vector3Tuple;
  iterations?: number;
  tolerance?: number;
  broadphase?: 'naive' | 'sap' | 'grid';
  allowSleep?: boolean;
  timeStep?: number;
  maxSubSteps?: number;
  paused?: boolean;
  debug?: boolean;
}

export interface PhysicsWorldAPI {
  world: World;
  addBody: (body: Body) => void;
  removeBody: (body: Body) => void;
}

// 刚体类型
export type BodyType = 'dynamic' | 'static' | 'kinematic';

export interface RigidBodyOptions {
  type?: BodyType;
  mass?: number;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  linearDamping?: number;
  angularDamping?: number;
  linearFactor?: Vector3Tuple;
  angularFactor?: Vector3Tuple;
  fixedRotation?: boolean;
  allowSleep?: boolean;
  sleepSpeedLimit?: number;
  sleepTimeLimit?: number;
  collisionFilterGroup?: number;
  collisionFilterMask?: number;
  shape?: 'auto' | 'box' | 'sphere' | 'cylinder' | 'plane';
  shapeOptions?: Record<string, any>;
  autoFit?: boolean;
  offset?: Vector3Tuple;
}

// 碰撞器类型
export interface ColliderOptions {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  offset?: Vector3Tuple;
  isTrigger?: boolean;
  collisionFilterGroup?: number;
  collisionFilterMask?: number;
}

export interface BoxColliderOptions extends ColliderOptions {
  size: Vector3Tuple;
}

export interface SphereColliderOptions extends ColliderOptions {
  radius: number;
}

// 约束类型
export type ConstraintType = 'point' | 'distance' | 'hinge' | 'lock' | 'spring';

export interface ConstraintOptions {
  type: ConstraintType;
  bodyA: Body;
  bodyB?: Body | null;
  pivotA?: Vector3Tuple;
  pivotB?: Vector3Tuple;
  axisA?: Vector3Tuple;
  axisB?: Vector3Tuple;
  distance?: number;
  maxForce?: number;
  collideConnected?: boolean;
  stiffness?: number;
  damping?: number;
  restLength?: number;
  motorEnabled?: boolean;
  motorSpeed?: number;
  motorMaxForce?: number;
}

// 射线交互类型
export interface RaycasterOptions {
  enabled?: boolean;
  recursive?: boolean;
  usePointer?: boolean;
  pointerDownOnly?: boolean;
  camera?: Camera | null;
  objects?: Object3D[];
  near?: number;
  far?: number;
  updateOnFrame?: boolean;
}

export interface RaycasterAPI {
  raycaster: Raycaster;
  intersections: Intersection[];
  pointer: Vector2;
  addInteractiveObject: (object: Object3D) => void;
  removeInteractiveObject: (object: Object3D) => void;
}

export interface RaycasterEvent {
  object: Object3D;
  intersection: Intersection;
  pointer: Vector2;
  event?: MouseEvent | TouchEvent;
}

// 交互对象类型
export interface InteractiveOptions {
  enabled?: boolean;
  cursor?: string;
  hoverColor?: ColorValue;
  activeColor?: ColorValue;
  hoverScale?: number;
  activeScale?: number;
  hoverOpacity?: number;
  activeOpacity?: number;
}

// Three.js 核心对象类型
export interface ThreeContext {
  scene: Ref<Scene | null>;
  camera: Ref<Camera | null>;
  renderer: Ref<WebGLRenderer | null>;
  canvas: Ref<HTMLCanvasElement | null>;
  clock: Ref<Clock | null>;
  size: Ref<{ width: number; height: number }>;
}

// 动画帧回调类型
export type FrameCallback = (time: number, delta: number) => void;

// 事件类型
export interface ThreeEventMap {
  click: RaycasterEvent;
  hover: RaycasterEvent;
  pointerdown: RaycasterEvent;
  pointerup: RaycasterEvent;
  pointermove: RaycasterEvent;
  pointerenter: RaycasterEvent;
  pointerleave: RaycasterEvent;
  collide: { body: Body; contact: any };
  step: { time: number; deltaTime: number; bodies: Body[] };
}

// 组件类型
export type ThreeComponent = {
  name: string;
  props: Record<string, any>;
  emits: string[];
  setup: (props: any, context: any) => any;
};

// 组件属性类型
export interface ThreeCanvasProps {
  width?: number | string;
  height?: number | string;
  antialias?: boolean;
  alpha?: boolean;
  shadows?: boolean;
  toneMapping?: number;
  toneMappingExposure?: number;
  outputEncoding?: number;
  physicallyCorrectLights?: boolean;
  pixelRatio?: number;
  frameloop?: 'always' | 'demand' | 'never';
}

export interface ThreeSceneProps {
  background?: ColorValue;
  environment?: string;
  fog?: any;
}

export interface ThreeCameraProps {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  lookAt?: Vector3Tuple | Object3D;
  makeDefault?: boolean;
  zoom?: number;
  orthographic?: boolean;
  orthographicSize?: number;
}

export interface ThreeMeshProps {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: number | Vector3Tuple;
  castShadow?: boolean;
  receiveShadow?: boolean;
  visible?: boolean;
  renderOrder?: number;
  frustumCulled?: boolean;
}

export interface ThreeObjectProps {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: number | Vector3Tuple;
  visible?: boolean;
  renderOrder?: number;
  frustumCulled?: boolean;
} 

// WebGPU相关类型扩展
declare global {
  interface Navigator {
    gpu?: {
      requestAdapter(): Promise<GPUAdapter | null>;
    };
  }
  
  interface GPUAdapter {
    requestDevice(): Promise<GPUDevice | null>;
  }
  
  interface GPUDevice {
    // 基本GPU设备接口
  }
} 