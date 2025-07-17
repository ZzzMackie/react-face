import * as THREE from 'three'
import { createSignal } from './Signal'

export interface Manager {
  initialize(): Promise<void>
  dispose(): void
}

export interface GlobalIlluminationConfig {
  enabled: boolean
  probeResolution: number
  irradianceMapSize: number
  reflectionMapSize: number
  maxDistance: number
  intensity: number
  ambientIntensity: number
  updateInterval: number
}

export interface LightProbe {
  position: THREE.Vector3
  irradiance: THREE.CubeTexture
  reflection: THREE.CubeTexture
  influence: number
}

export class GlobalIlluminationManager implements Manager {
  private config: GlobalIlluminationConfig
  private lightProbes: LightProbe[] = []
  private irradianceMap: THREE.CubeTexture | null = null
  private reflectionMap: THREE.CubeTexture | null = null
  private renderTarget: THREE.WebGLCubeRenderTarget | null = null
  private pmremGenerator: THREE.PMREMGenerator | null = null
  private updateTimer: number = 0
  private engine: any
  private renderer: THREE.WebGLRenderer | null = null

  // 信号系统
  public readonly globalIlluminationInitialized = createSignal<void>(undefined)
  public readonly lightProbeAdded = createSignal<LightProbe | null>(null)
  public readonly globalIlluminationUpdated = createSignal<void>(undefined)
  public readonly configUpdated = createSignal<GlobalIlluminationConfig | null>(null)
  public readonly disposed = createSignal<void>(undefined)

  constructor(engine: any) {
    this.engine = engine
    this.config = {
      enabled: true,
      probeResolution: 256,
      irradianceMapSize: 64,
      reflectionMapSize: 256,
      maxDistance: 100,
      intensity: 1.0,
      ambientIntensity: 0.3,
      updateInterval: 1000
    }
  }

  /**
   * 初始化全局光照系统
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) return

    this.renderer = this.engine.renderer
    if (this.renderer) {
      this.pmremGenerator = new THREE.PMREMGenerator(this.renderer)
      this.pmremGenerator.compileEquirectangularShader()

      this.createRenderTarget()
      this.createDefaultProbes()
      this.updateGlobalIllumination()

      this.globalIlluminationInitialized.emit(undefined)
    }
  }

  /**
   * 创建渲染目标
   */
  private createRenderTarget(): void {
    this.renderTarget = new THREE.WebGLCubeRenderTarget(
      this.config.probeResolution,
      {
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding,
        generateMipmaps: true
      }
    )
  }

  /**
   * 创建默认光照探针
   */
  private createDefaultProbes(): void {
    const scene = this.engine.sceneManager.getScene()
    if (!scene) return

    // 创建环境光照探针
    const ambientProbe = {
      position: new THREE.Vector3(0, 0, 0),
      irradiance: null as any,
      reflection: null as any,
      influence: 1.0
    }

    // 从场景中获取环境贴图
    const environment = scene.environment || scene.background
    if (environment instanceof THREE.CubeTexture) {
      ambientProbe.irradiance = this.pmremGenerator!.fromCubemap(environment).texture
      ambientProbe.reflection = environment
    }

    this.lightProbes.push(ambientProbe)
  }

  /**
   * 添加光照探针
   */
  addLightProbe(position: THREE.Vector3, influence: number = 1.0): LightProbe {
    const probe: LightProbe = {
      position: position.clone(),
      irradiance: null as any,
      reflection: null as any,
      influence
    }

    this.lightProbes.push(probe)
    this.updateProbe(probe)
    this.lightProbeAdded.emit(probe)

    return probe
  }

  /**
   * 更新光照探针
   */
  private updateProbe(probe: LightProbe): void {
    if (!this.renderTarget || !this.pmremGenerator) return

    const scene = this.engine.sceneManager.getScene()
    if (!scene) return

    // 创建临时相机用于渲染探针
    const camera = new THREE.CubeCamera(0.1, this.config.maxDistance, this.renderTarget)
    
    // 设置相机位置
    camera.position.copy(probe.position)
    camera.updateMatrixWorld()

    // 渲染环境贴图
    camera.update(this.engine.renderer, scene)

    // 生成辐照度贴图
    const irradiance = this.pmremGenerator.fromCubemap(this.renderTarget.texture).texture
    probe.irradiance = irradiance as THREE.CubeTexture
    
    // 生成反射贴图
    probe.reflection = this.renderTarget.texture.clone() as THREE.CubeTexture
  }

  /**
   * 更新全局光照
   */
  updateGlobalIllumination(): void {
    if (!this.config.enabled || this.lightProbes.length === 0) return

    const scene = this.engine.sceneManager.getScene()
    if (!scene) return

    // 计算混合的辐照度贴图
    const blendedIrradiance = this.blendIrradianceMaps()
    if (blendedIrradiance) {
      scene.environment = blendedIrradiance
    }

    // 应用环境光照强度
    const ambientLight = scene.getObjectByName('ambient') as THREE.AmbientLight
    if (ambientLight) {
      ambientLight.intensity = this.config.ambientIntensity
    }

    this.globalIlluminationUpdated.emit(undefined)
  }

  /**
   * 混合辐照度贴图
   */
  private blendIrradianceMaps(): THREE.CubeTexture | null {
    if (this.lightProbes.length === 0) return null

    // 简单混合：使用第一个探针的辐照度贴图
    // 在实际应用中，这里应该实现更复杂的混合算法
    return this.lightProbes[0].irradiance
  }

  /**
   * 获取最近的探针
   */
  getNearestProbe(position: THREE.Vector3): LightProbe | null {
    if (this.lightProbes.length === 0) return null

    let nearestProbe = this.lightProbes[0]
    let minDistance = position.distanceTo(nearestProbe.position)

    for (const probe of this.lightProbes) {
      const distance = position.distanceTo(probe.position)
      if (distance < minDistance) {
        minDistance = distance
        nearestProbe = probe
      }
    }

    return nearestProbe
  }

  /**
   * 更新方法
   */
  update(deltaTime: number): void {
    if (!this.config.enabled) return

    this.updateTimer += deltaTime
    if (this.updateTimer >= this.config.updateInterval) {
      this.updateGlobalIllumination()
      this.updateTimer = 0
    }
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<GlobalIlluminationConfig>): void {
    this.config = { ...this.config, ...config }
    this.configUpdated.emit(this.config)
  }

  /**
   * 获取配置
   */
  getConfig(): GlobalIlluminationConfig {
    return { ...this.config }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.renderTarget) {
      this.renderTarget.dispose()
    }
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose()
    }
    this.lightProbes = []
    this.disposed.emit(undefined)
  }
}