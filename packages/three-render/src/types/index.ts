// 重新导出 three-core 的类型
export * from 'three-core';

// 组件属性类型
export * from './props';

// 事件类型
export * from './events';

// 渲染器类型
export * from './renderer';

// 上下文类型
export * from './context';

// 工具类型
export * from './utils';

/**
 * 向量类型
 */
export type ThreeVector2 = [number, number];
export type ThreeVector3 = [number, number, number];
export type ThreeVector4 = [number, number, number, number];
export type ThreeEuler = [number, number, number] | [number, number, number, string];
export type ThreeColor = string | number;
export type ThreeMatrix3 = [
  number, number, number,
  number, number, number,
  number, number, number
];
export type ThreeMatrix4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

/**
 * 几何体参数类型
 */
export interface ThreeBoxGeometryProps {
  width?: number;
  height?: number;
  depth?: number;
  widthSegments?: number;
  heightSegments?: number;
  depthSegments?: number;
  args?: [number?, number?, number?, number?, number?, number?];
}

export interface ThreeSphereGeometryProps {
  radius?: number;
  widthSegments?: number;
  heightSegments?: number;
  phiStart?: number;
  phiLength?: number;
  thetaStart?: number;
  thetaLength?: number;
  args?: [number?, number?, number?, number?, number?, number?, number?];
}

export interface ThreePlaneGeometryProps {
  width?: number;
  height?: number;
  widthSegments?: number;
  heightSegments?: number;
  args?: [number?, number?, number?, number?];
}

export interface ThreeCylinderGeometryProps {
  radiusTop?: number;
  radiusBottom?: number;
  height?: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean;
  thetaStart?: number;
  thetaLength?: number;
  args?: [number?, number?, number?, number?, number?, boolean?, number?, number?];
}

/**
 * 材质参数类型
 */
export interface ThreeMaterialBaseProps {
  transparent?: boolean;
  opacity?: number;
  side?: 'front' | 'back' | 'double';
  depthTest?: boolean;
  depthWrite?: boolean;
  alphaTest?: number;
  visible?: boolean;
  toneMapped?: boolean;
  vertexColors?: boolean;
  blending?: string;
  dithering?: boolean;
  flatShading?: boolean;
  fog?: boolean;
  precision?: 'highp' | 'mediump' | 'lowp';
}

export interface ThreeMeshBasicMaterialProps extends ThreeMaterialBaseProps {
  color?: ThreeColor;
  wireframe?: boolean;
  map?: any;
  alphaMap?: any;
  aoMap?: any;
  aoMapIntensity?: number;
  envMap?: any;
  reflectivity?: number;
  refractionRatio?: number;
  combine?: string;
}

export interface ThreeMeshStandardMaterialProps extends ThreeMaterialBaseProps {
  color?: ThreeColor;
  roughness?: number;
  metalness?: number;
  map?: any;
  normalMap?: any;
  normalScale?: ThreeVector2;
  roughnessMap?: any;
  metalnessMap?: any;
  alphaMap?: any;
  aoMap?: any;
  aoMapIntensity?: number;
  emissive?: ThreeColor;
  emissiveIntensity?: number;
  emissiveMap?: any;
  bumpMap?: any;
  bumpScale?: number;
  displacementMap?: any;
  displacementScale?: number;
  displacementBias?: number;
  envMap?: any;
  envMapIntensity?: number;
  wireframe?: boolean;
  flatShading?: boolean;
}

/**
 * 光源参数类型
 */
export interface ThreeLightBaseProps {
  color?: ThreeColor;
  intensity?: number;
  castShadow?: boolean;
  shadow?: {
    mapSize?: ThreeVector2;
    camera?: {
      near?: number;
      far?: number;
    };
    bias?: number;
    radius?: number;
    blurSamples?: number;
  };
}

export interface ThreeDirectionalLightProps extends ThreeLightBaseProps {
  position?: ThreeVector3;
  target?: any;
}

export interface ThreePointLightProps extends ThreeLightBaseProps {
  position?: ThreeVector3;
  distance?: number;
  decay?: number;
}

export interface ThreeSpotLightProps extends ThreeLightBaseProps {
  position?: ThreeVector3;
  target?: any;
  distance?: number;
  angle?: number;
  penumbra?: number;
  decay?: number;
}

/**
 * 控制器参数类型
 */
export interface ThreeOrbitControlsProps {
  enableRotate?: boolean;
  enablePan?: boolean;
  enableZoom?: boolean;
  enableDamping?: boolean;
  dampingFactor?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  minAzimuthAngle?: number;
  maxAzimuthAngle?: number;
  target?: ThreeVector3;
}

export interface ThreeTransformControlsProps {
  mode?: 'translate' | 'rotate' | 'scale';
  size?: number;
  showX?: boolean;
  showY?: boolean;
  showZ?: boolean;
  enabled?: boolean;
  translationSnap?: number;
  rotationSnap?: number;
  scaleSnap?: number;
  space?: 'world' | 'local';
  axis?: 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ';
}

/**
 * 插件配置类型
 */
export interface ThreeRenderPluginOptions {
  registerComponents?: boolean;
  usePrefix?: boolean;
  prefix?: string;
  config?: {
    antialias?: boolean;
    shadows?: boolean;
    autoRender?: boolean;
    stats?: boolean;
    pixelRatio?: number;
  };
} 