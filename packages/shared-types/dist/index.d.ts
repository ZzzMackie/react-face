export type { Engine, EngineConfig, EngineManager, EngineManagerConfig, ManagerType, ManagerInstance, ManagerMap, Manager } from './Engine';
export interface ConfigStorage {
    language: string;
    autosave: boolean;
    'project/title': string;
    'project/editable': boolean;
    'project/vr': boolean;
    'project/renderer/antialias': boolean;
    'project/renderer/shadows': boolean;
    'project/renderer/shadowType': number;
    'project/renderer/toneMapping': number;
    'project/renderer/toneMappingExposure': number;
    'project/renderer/ClearColor/backgroundColor': string;
    'project/renderer/ClearColor/backgroundOpacity': number;
    'settings/history': boolean;
    'settings/shortcuts/translate': string;
    'settings/shortcuts/rotate': string;
    'settings/shortcuts/scale': string;
    'settings/shortcuts/undo': string;
    'settings/shortcuts/focus': string;
    'THREE/UVMapping': number;
    'THREE/CubeReflectionMapping': number;
    'THREE/CubeRefractionMapping': number;
    'THREE/EquirectangularReflectionMapping': number;
    'THREE/EquirectangularRefractionMapping': number;
    'THREE/CubeUVReflectionMapping': number;
    [key: string]: string | boolean | number;
}
export interface CameraConfig {
    fov?: number;
    aspect?: number;
    near?: number;
    far?: number;
    position?: CameraPosition;
}
export interface CameraPosition {
    x?: number;
    y?: number;
    z?: number;
}
export interface CameraData {
    position?: CameraPosition;
    layers?: any;
    aspect?: number;
    [key: string]: any;
}
export interface CameraWithCustomProps {
    position: any;
    layers: any;
    aspect?: number;
    [key: string]: any;
}
export interface OrbitControlsConfig {
    enabled?: boolean;
    target?: any;
    minDistance?: number;
    maxDistance?: number;
    minZoom?: number;
    maxZoom?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
    minAzimuthAngle?: number;
    maxAzimuthAngle?: number;
    enableDamping?: boolean;
    dampingFactor?: number;
    enableZoom?: boolean;
    zoomSpeed?: number;
    enableRotate?: boolean;
    rotateSpeed?: number;
    enablePan?: boolean;
    panSpeed?: number;
    screenSpacePanning?: boolean;
    keyPanSpeed?: number;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    enableKeys?: boolean;
    keys?: any;
    mouseButtons?: any;
    touches?: any;
    [key: string]: any;
}
export type TransformControlsMode = 'translate' | 'rotate' | 'scale';
export interface TransformControlsParams {
    object?: any;
    visible?: boolean;
    enabled?: boolean;
    mode?: TransformControlsMode;
    size?: number;
    space?: string;
    showX?: boolean;
    showY?: boolean;
    showZ?: boolean;
    [key: string]: any;
}
export interface RendererConfig {
    antialias?: boolean;
    shadows?: boolean;
    shadowType?: number;
    toneMapping?: number;
    toneMappingExposure?: number;
    clearColor?: string;
    backgroundOpacity?: number;
}
export interface SceneConfig {
    background?: any;
    fog?: any;
    environment?: any;
}
export interface MaterialConfig {
    type?: string;
    color?: any;
    opacity?: number;
    transparent?: boolean;
    side?: number;
    [key: string]: any;
}
export interface GeometryConfig {
    type?: string;
    parameters?: any;
    [key: string]: any;
}
export interface LightConfig {
    type?: string;
    color?: any;
    intensity?: number;
    position?: CameraPosition;
    [key: string]: any;
}
export interface Object3DConfig {
    type?: string;
    position?: CameraPosition;
    rotation?: CameraPosition;
    scale?: CameraPosition;
    [key: string]: any;
}
export interface TransformControlsEvent {
    type: 'translate' | 'rotation' | 'scale';
    object: any;
}
export interface Vector3 {
    x: number;
    y: number;
    z: number;
}
export interface Euler {
    x: number;
    y: number;
    z: number;
    order?: string;
}
export interface ManagerConfig {
    enabled?: boolean;
    debug?: boolean;
    [key: string]: any;
}
export interface PerformanceMetrics {
    fps: number;
    memory: {
        geometries: number;
        textures: number;
    };
    render: {
        calls: number;
        triangles: number;
        points: number;
        lines: number;
    };
    timestamp: number;
}
export interface ErrorInfo {
    type: 'warning' | 'error' | 'critical';
    message: string;
    stack?: string;
    timestamp: number;
    context?: any;
}
export interface ResourceInfo {
    type: 'geometry' | 'texture' | 'material' | 'light' | 'object3d';
    id: string;
    name?: string;
    size?: number;
    loaded: boolean;
    error?: string;
}
