import * as THREE from 'three';
/**
 * 管理器接口
 */
export interface Manager {
    initialize(): Promise<void>;
    dispose(): void;
}
/**
 * 引擎配置接口
 */
export interface EngineConfig {
    container?: HTMLElement;
    width?: number;
    height?: number;
    antialias?: boolean;
    alpha?: boolean;
    shadowMap?: boolean;
    pixelRatio?: number;
    autoRender?: boolean;
    autoResize?: boolean;
}
/**
 * 引擎管理器接口
 */
export interface EngineManager {
    initialize(): Promise<void>;
    dispose(): void;
    update?(): void;
    render?(): void;
}
/**
 * 引擎管理器配置接口
 */
export interface EngineManagerConfig {
    enabled?: boolean;
    debug?: boolean;
    [key: string]: any;
}
/**
 * 管理器类型
 */
export type ManagerType = 'scene' | 'camera' | 'renderer' | 'controls' | 'lights' | 'materials' | 'geometries' | 'textures' | 'animations' | 'physics' | 'audio' | 'particles' | 'shaders' | 'environment' | 'events' | 'helpers' | 'ui' | 'performance' | 'export' | 'loader' | 'objects' | 'database' | 'rayTracing' | 'deferred' | 'fluid' | 'morph' | 'procedural' | 'optimization' | 'error' | 'composer' | 'viewHelper' | 'volumetric' | 'skeleton';
/**
 * 管理器实例
 */
export interface ManagerInstance {
    type: ManagerType;
    instance: EngineManager;
    config: EngineManagerConfig;
}
/**
 * 管理器映射
 */
export interface ManagerMap {
    [key: string]: ManagerInstance;
}
/**
 * 引擎接口
 */
export interface Engine {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
    managers: ManagerMap;
    config: EngineConfig;
    initialize(): Promise<void>;
    dispose(): void;
    render(): void;
    update(): void;
    getManager(type: ManagerType): EngineManager | null;
    addManager(type: ManagerType, manager: EngineManager, config?: EngineManagerConfig): void;
    removeManager(type: ManagerType): void;
    updateRenderer(): void;
    resize(width?: number, height?: number): void;
    addToScene(object: THREE.Object3D): void;
    removeFromScene(object: THREE.Object3D): void;
    setCamera(camera: THREE.Camera): void;
    getCamera(): THREE.Camera;
    setRenderer(renderer: THREE.WebGLRenderer): void;
    getRenderer(): THREE.WebGLRenderer;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    emit(event: string, ...args: any[]): void;
    getContainer(): HTMLElement | null;
    setContainer(container: HTMLElement): void;
    getSize(): {
        width: number;
        height: number;
    };
    setSize(width: number, height: number): void;
    object3D__three?: any;
    light__three?: any;
    camera__three?: any;
    renderer__three?: any;
    scene__three?: any;
    material__three?: any;
    geometry__three?: any;
    texture__three?: any;
    animation__three?: any;
    physics__three?: any;
    audio__three?: any;
    particle__three?: any;
    shader__three?: any;
    environment__three?: any;
    event__three?: any;
    helper__three?: any;
    ui__three?: any;
    performance__three?: any;
    export__three?: any;
    loader__three?: any;
    database__three?: any;
    rayTracing__three?: any;
    deferred__three?: any;
    fluid__three?: any;
    morph__three?: any;
    procedural__three?: any;
    optimization__three?: any;
    error__three?: any;
    composer__three?: any;
    viewHelper__three?: any;
    volumetric__three?: any;
    skeleton__three?: any;
}
