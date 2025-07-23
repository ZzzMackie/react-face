declare module 'three-core' {
  export class Engine {
    constructor(config: any);
    
    // 静态属性
    static THREE: any;
    
    // 实例方法
    start(): void;
    stop(): void;
    dispose(): void;
    setSize(width: number, height: number): void;
    setShadows(enabled: boolean): void;
    onBeforeRender(callback: () => void): void;
    onAfterRender(callback: () => void): void;
    
    // 管理器相关方法
    getManager(name: string): any;
    getOrCreateManager(name: string): Promise<any>;
    
    // 场景、相机、渲染器访问方法
    getScene(): Promise<any>;
    getCamera(): Promise<any>;
    getRenderer(): Promise<any>;
  }
  
  export class SceneManager {
    constructor(engine: Engine);
    
    createScene(): any;
    getScene(): any;
    addObject(object: any): void;
    removeObject(object: any): void;
  }
  
  export class CameraManager {
    constructor(engine: Engine);
    
    createCamera(config?: any): any;
    getCamera(): any;
    setPosition(x: number, y: number, z: number): void;
    lookAt(x: number, y: number, z: number): void;
  }
  
  export class RendererManager {
    constructor(engine: Engine);
    
    createRenderer(config?: any): any;
    getRenderer(): any;
    setSize(width: number, height: number): void;
    render(): void;
  }
  
  export class LightManager {
    constructor(engine: Engine);
    
    createLight(type: string, config?: any): any;
    getLight(id: string): any;
    addLight(light: any): void;
    removeLight(light: any): void;
  }
  
  export class ControlsManager {
    constructor(engine: Engine);
    
    createControls(type: string, config?: any): any;
    getControls(): any;
    update(): void;
  }
  
  export class ResourceManager {
    constructor(engine: Engine);
    
    loadTexture(url: string): Promise<any>;
    loadModel(url: string): Promise<any>;
    getTexture(id: string): any;
    getGeometry(id: string): any;
    getMaterial(id: string): any;
    dispose(): void;
  }
  
  export class ComposerManager {
    constructor(engine: Engine);
    
    initialize(config?: any): Promise<void>;
    getComposer(): any;
    addPass(pass: any): void;
    removePass(pass: any): void;
    render(): void;
  }
  
  export class PhysicsManager {
    constructor(engine: Engine);
    
    initialize(config?: any): Promise<void>;
    getWorld(): any;
    addBody(body: any): void;
    removeBody(body: any): void;
    update(delta: number): void;
  }
  
  export class PerformanceManager {
    constructor(engine: Engine);
    
    enableStats(container?: HTMLElement): void;
    getFPS(): number;
    getMemoryInfo(): any;
    getDrawCalls(): number;
    getTriangles(): number;
  }
} 