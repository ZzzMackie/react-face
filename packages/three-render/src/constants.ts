import { InjectionKey, Ref } from 'vue';
import * as THREE from 'three';

// 渲染上下文
export const RENDER_CONTEXT_KEY = Symbol('three-render-context') as InjectionKey<{
  renderer: Ref<THREE.WebGLRenderer | null>;
  scene: Ref<THREE.Scene | null>;
  camera: Ref<THREE.Camera | null>;
  canvas: Ref<HTMLCanvasElement | null>;
  size: Ref<{ width: number; height: number }>;
  updateComplete: Ref<boolean>;
}>;

// 相机上下文
export const CAMERA_CONTEXT_KEY = Symbol('three-camera-context') as InjectionKey<{
  camera: Ref<THREE.Camera | null>;
}>;

// 场景上下文
export const SCENE_CONTEXT_KEY = Symbol('three-scene-context') as InjectionKey<{
  scene: Ref<THREE.Scene | null>;
}>;

// 场景符号
export const SCENE_SYMBOL = Symbol('three-scene-symbol');

// 场景上下文键
export const sceneKeys = {
  context: SCENE_CONTEXT_KEY,
  symbol: SCENE_SYMBOL,
};

// 几何体上下文
export const GEOMETRY_CONTEXT_KEY = Symbol('three-geometry-context') as InjectionKey<{
  geometry: Ref<THREE.BufferGeometry | null>;
}>;

// 几何体符号
export const GEOMETRY_SYMBOL = Symbol('three-geometry-symbol');

// 几何体上下文键
export const geometryKeys = {
  context: GEOMETRY_CONTEXT_KEY,
  symbol: GEOMETRY_SYMBOL,
};

// 材质上下文
export const MATERIAL_CONTEXT_KEY = Symbol('three-material-context') as InjectionKey<{
  material: Ref<THREE.Material | null>;
}>;

// 材质符号
export const MATERIAL_SYMBOL = Symbol('three-material-symbol');

// 材质上下文键
export const materialKeys = {
  context: MATERIAL_CONTEXT_KEY,
  symbol: MATERIAL_SYMBOL,
};

// 网格上下文
export const MESH_CONTEXT_KEY = Symbol('three-mesh-context') as InjectionKey<{
  mesh: Ref<THREE.Mesh | null>;
}>;

// 网格符号
export const MESH_SYMBOL = Symbol('three-mesh-symbol');

// 网格上下文键
export const meshKeys = {
  context: MESH_CONTEXT_KEY,
  symbol: MESH_SYMBOL,
};

// 后处理上下文
export const POST_PROCESSING_CONTEXT_KEY = Symbol('three-post-processing-context') as InjectionKey<{
  composer: Ref<any | null>;
}>;

// 画布上下文
export const CANVAS_CONTEXT_KEY = Symbol('three-canvas-context') as InjectionKey<{
  engine: Ref<any>;
  containerRef: Ref<HTMLElement | null>;
}>;

// 后处理效果类型
export enum PostProcessingEffectType {
  BLOOM = 'bloom',
  DEPTH_OF_FIELD = 'depth-of-field',
  FILM = 'film',
  GLITCH = 'glitch',
  ANTI_ALIAS = 'anti-alias',
  OUTLINE = 'outline',
  PIXELATION = 'pixelation',
  NOISE = 'noise',
  GOD_RAYS = 'god-rays',
  COLOR_CORRECTION = 'color-correction',
  CUSTOM = 'custom'
}

// 几何体类型
export enum GeometryType {
  BOX = 'box',
  SPHERE = 'sphere',
  CYLINDER = 'cylinder',
  CONE = 'cone',
  PLANE = 'plane',
  CIRCLE = 'circle',
  RING = 'ring',
  TORUS = 'torus',
  TORUS_KNOT = 'torus-knot',
  TETRAHEDRON = 'tetrahedron',
  OCTAHEDRON = 'octahedron',
  DODECAHEDRON = 'dodecahedron',
  ICOSAHEDRON = 'icosahedron',
  TEXT = 'text',
  EXTRUDE = 'extrude',
  LATHE = 'lathe',
  SHAPE = 'shape',
  TUBE = 'tube',
  CUSTOM = 'custom'
}

// 材质类型
export enum MaterialType {
  BASIC = 'basic',
  STANDARD = 'standard',
  PHYSICAL = 'physical',
  LAMBERT = 'lambert',
  PHONG = 'phong',
  TOON = 'toon',
  NORMAL = 'normal',
  DEPTH = 'depth',
  LINE_BASIC = 'line-basic',
  LINE_DASHED = 'line-dashed',
  POINTS = 'points',
  SHADER = 'shader',
  SPRITE = 'sprite',
  CUSTOM = 'custom'
}

/**
 * 事件名称
 */
export const OBJECT_EVENTS = {
  CLICK: 'click',
  DBL_CLICK: 'dblclick',
  CONTEXT_MENU: 'contextmenu',
  POINTER_DOWN: 'pointerdown',
  POINTER_UP: 'pointerup',
  POINTER_MOVE: 'pointermove',
  POINTER_ENTER: 'pointerenter',
  POINTER_LEAVE: 'pointerleave',
  POINTER_OVER: 'pointerover',
  POINTER_OUT: 'pointerout',
  DRAG_START: 'dragstart',
  DRAG: 'drag',
  DRAG_END: 'dragend',
  WHEEL: 'wheel'
};

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  ANTIALIAS: true,
  AUTO_RESIZE: true,
  AUTO_RENDER: true,
  SHADOWS: true,
  STATS: false,
  BACKGROUND_COLOR: 0x000000,
  ALPHA: false,
  PHYSICALLY_CORRECT_LIGHTS: false,
  OUTPUT_ENCODING: 'sRGB',
  TONE_MAPPING: 'ACESFilmic',
  TONE_MAPPING_EXPOSURE: 1,
  SAMPLES: 0
};

/**
 * 默认相机配置
 */
export const DEFAULT_CAMERA = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: [0, 0, 5],
  LOOK_AT: [0, 0, 0]
};

/**
 * 默认光源配置
 */
export const DEFAULT_LIGHT = {
  COLOR: 0xffffff,
  INTENSITY: 1,
  POSITION: [0, 1, 0],
  CAST_SHADOW: false
};

/**
 * 默认材质配置
 */
export const DEFAULT_MATERIAL = {
  COLOR: 0xcccccc,
  ROUGHNESS: 0.5,
  METALNESS: 0.5,
  SIDE: 'front'
};

/**
 * 默认几何体配置
 */
export const DEFAULT_GEOMETRY = {
  BOX: {
    WIDTH: 1,
    HEIGHT: 1,
    DEPTH: 1,
    SEGMENTS: 1
  },
  SPHERE: {
    RADIUS: 1,
    WIDTH_SEGMENTS: 32,
    HEIGHT_SEGMENTS: 16
  },
  PLANE: {
    WIDTH: 1,
    HEIGHT: 1,
    WIDTH_SEGMENTS: 1,
    HEIGHT_SEGMENTS: 1
  }
};

/**
 * 默认控制器配置
 */
export const DEFAULT_CONTROLS = {
  ENABLE_ROTATE: true,
  ENABLE_PAN: true,
  ENABLE_ZOOM: true,
  ENABLE_DAMPING: true,
  DAMPING_FACTOR: 0.05,
  MIN_DISTANCE: 0,
  MAX_DISTANCE: Infinity
};

/**
 * 默认后处理配置
 */
export const DEFAULT_POST_PROCESSING = {
  RENDER_SCALE: 1,
  USE_PHYSICAL_EXPOSURE: false,
  EXPOSURE: 1,
  AUTO_CLEAR: true,
  AUTO_CLEAR_DEPTH: true,
  AUTO_UPDATE: true,
  PRECISION: 'highp'
};

/**
 * 后处理效果类型
 */
export const EFFECT_TYPES = {
  BLOOM: 'bloom',
  DEPTH_OF_FIELD: 'depthOfField',
  SSAO: 'ssao',
  MOTION_BLUR: 'motionBlur',
  OUTLINE: 'outline',
  GLITCH: 'glitch',
  NOISE: 'noise',
  VIGNETTE: 'vignette',
  TONE_MAPPING: 'toneMapping',
  COLOR_CORRECTION: 'colorCorrection',
  SSAA: 'ssaa',
  FXAA: 'fxaa',
  SMAA: 'smaa',
  GOD_RAYS: 'godRays',
  BOKEH: 'bokeh',
  FILM: 'film',
  HDR: 'hdr',
  LUT: 'lut',
  PIXELATE: 'pixelate',
  CHROMATIC_ABERRATION: 'chromaticAberration',
  SELECTIVE_BLOOM: 'selectiveBloom',
  LENS_DISTORTION: 'lensDistortion'
};

/**
 * 默认效果顺序（从先到后）
 */
export const DEFAULT_EFFECTS_ORDER = [
  EFFECT_TYPES.SSAO,
  EFFECT_TYPES.MOTION_BLUR,
  EFFECT_TYPES.DEPTH_OF_FIELD,
  EFFECT_TYPES.BLOOM,
  EFFECT_TYPES.GOD_RAYS,
  EFFECT_TYPES.HDR,
  EFFECT_TYPES.LUT,
  EFFECT_TYPES.COLOR_CORRECTION,
  EFFECT_TYPES.CHROMATIC_ABERRATION,
  EFFECT_TYPES.LENS_DISTORTION,
  EFFECT_TYPES.NOISE,
  EFFECT_TYPES.FILM,
  EFFECT_TYPES.GLITCH,
  EFFECT_TYPES.PIXELATE,
  EFFECT_TYPES.VIGNETTE,
  EFFECT_TYPES.OUTLINE,
  EFFECT_TYPES.TONE_MAPPING,
  EFFECT_TYPES.FXAA,
  EFFECT_TYPES.SMAA,
  EFFECT_TYPES.SSAA
]; 