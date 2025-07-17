import * as THREE from 'three'
import { createSignal } from './Signal'

export interface Manager {
  initialize(): Promise<void>
  dispose(): void
}

export interface ScreenSpaceReflectionConfig {
  enabled: boolean
  maxSteps: number
  maxDistance: number
  thickness: number
  resolution: number
  intensity: number
  fadeDistance: number
  roughnessFade: number
  maxRoughness: number
}

export class ScreenSpaceReflectionManager implements Manager {
  private config: ScreenSpaceReflectionConfig
  private engine: any
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.Camera | null = null
  private renderTarget: THREE.WebGLRenderTarget | null = null
  private material: THREE.ShaderMaterial | null = null
  private quad: THREE.Mesh | null = null

  // 信号系统
  public readonly ssrInitialized = createSignal<void>(undefined)
  public readonly ssrUpdated = createSignal<void>(undefined)
  public readonly configUpdated = createSignal<ScreenSpaceReflectionConfig | null>(null)
  public readonly disposed = createSignal<void>(undefined)

  constructor(engine: any) {
    this.engine = engine
    this.config = {
      enabled: true,
      maxSteps: 256,
      maxDistance: 10,
      thickness: 0.1,
      resolution: 1.0,
      intensity: 1.0,
      fadeDistance: 10,
      roughnessFade: 0.1,
      maxRoughness: 0.5
    }
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) return

    this.renderer = this.engine.renderer
    this.scene = this.engine.sceneManager?.getScene()
    this.camera = this.engine.cameraManager?.getCamera()

    if (!this.renderer || !this.scene || !this.camera) {
      console.warn('SSR Manager: Required managers not available')
      return
    }

    this.createRenderTarget()
    this.createSSRMaterial()
    this.createQuad()

    this.ssrInitialized.emit(undefined)
  }

  private createRenderTarget(): void {
    if (!this.renderer) return

    const width = this.renderer.domElement.width
    const height = this.renderer.domElement.height

    this.renderTarget = new THREE.WebGLRenderTarget(
      width * this.config.resolution,
      height * this.config.resolution,
      {
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding,
        generateMipmaps: false
      }
    )
  }

  private createSSRMaterial(): void {
    // 屏幕空间反射着色器
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform sampler2D tDiffuse;
      uniform sampler2D tDepth;
      uniform sampler2D tNormal;
      uniform sampler2D tRoughness;
      uniform mat4 projectionMatrix;
      uniform mat4 viewMatrix;
      uniform mat4 modelMatrix;
      uniform vec2 resolution;
      uniform float maxSteps;
      uniform float maxDistance;
      uniform float thickness;
      uniform float intensity;
      uniform float fadeDistance;
      uniform float roughnessFade;
      uniform float maxRoughness;

      varying vec2 vUv;

      vec3 getWorldPos(vec2 uv, float depth) {
        vec4 clipPos = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 worldPos = inverse(projectionMatrix * viewMatrix) * clipPos;
        return worldPos.xyz / worldPos.w;
      }

      vec3 getViewPos(vec2 uv, float depth) {
        vec4 clipPos = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 viewPos = inverse(projectionMatrix) * clipPos;
        return viewPos.xyz / viewPos.w;
      }

      vec2 getScreenPos(vec3 worldPos) {
        vec4 clipPos = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
        return (clipPos.xy / clipPos.w) * 0.5 + 0.5;
      }

      void main() {
        vec4 diffuse = texture2D(tDiffuse, vUv);
        float depth = texture2D(tDepth, vUv).r;
        vec3 normal = texture2D(tNormal, vUv).rgb * 2.0 - 1.0;
        float roughness = texture2D(tRoughness, vUv).r;

        if (roughness > maxRoughness) {
          gl_FragColor = diffuse;
          return;
        }

        vec3 worldPos = getWorldPos(vUv, depth);
        vec3 viewPos = getViewPos(vUv, depth);

        // 计算反射方向
        vec3 reflectDir = reflect(normalize(viewPos), normal);
        
        // 屏幕空间光线追踪
        vec3 rayStep = reflectDir * maxDistance / maxSteps;
        vec3 currentPos = worldPos;
        vec2 hitPixel = vUv;
        bool hit = false;

        for (float i = 0.0; i < maxSteps; i++) {
          currentPos += rayStep;
          vec2 screenPos = getScreenPos(currentPos);
          
          if (screenPos.x < 0.0 || screenPos.x > 1.0 || 
              screenPos.y < 0.0 || screenPos.y > 1.0) {
            break;
          }

          float rayDepth = texture2D(tDepth, screenPos).r;
          vec3 rayWorldPos = getWorldPos(screenPos, rayDepth);
          
          if (distance(currentPos, rayWorldPos) < thickness) {
            hitPixel = screenPos;
            hit = true;
            break;
          }
        }

        vec4 reflection = vec4(0.0);
        if (hit) {
          reflection = texture2D(tDiffuse, hitPixel);
          
          // 距离衰减
          float distance = length(currentPos - worldPos);
          float fade = 1.0 - clamp(distance / fadeDistance, 0.0, 1.0);
          
          // 粗糙度衰减
          float roughnessFadeFactor = 1.0 - clamp(roughness / roughnessFade, 0.0, 1.0);
          
          reflection *= fade * roughnessFadeFactor * intensity;
        }

        gl_FragColor = diffuse + reflection;
      }
    `

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        tNormal: { value: null },
        tRoughness: { value: null },
        projectionMatrix: { value: new THREE.Matrix4() },
        viewMatrix: { value: new THREE.Matrix4() },
        modelMatrix: { value: new THREE.Matrix4() },
        resolution: { value: new THREE.Vector2() },
        maxSteps: { value: this.config.maxSteps },
        maxDistance: { value: this.config.maxDistance },
        thickness: { value: this.config.thickness },
        intensity: { value: this.config.intensity },
        fadeDistance: { value: this.config.fadeDistance },
        roughnessFade: { value: this.config.roughnessFade },
        maxRoughness: { value: this.config.maxRoughness }
      },
      vertexShader,
      fragmentShader
    })
  }

  private createQuad(): void {
    const geometry = new THREE.PlaneGeometry(2, 2)
    if (this.material) {
      this.quad = new THREE.Mesh(geometry, this.material)
    }
  }

  /**
   * 渲染屏幕空间反射
   */
  render(diffuseTexture: THREE.Texture, depthTexture: THREE.Texture, normalTexture: THREE.Texture, roughnessTexture: THREE.Texture): THREE.Texture {
    if (!this.renderer || !this.material || !this.quad || !this.camera) {
      return diffuseTexture
    }

    // 更新材质uniforms
    this.material.uniforms.tDiffuse.value = diffuseTexture
    this.material.uniforms.tDepth.value = depthTexture
    this.material.uniforms.tNormal.value = normalTexture
    this.material.uniforms.tRoughness.value = roughnessTexture
    this.material.uniforms.projectionMatrix.value = this.camera.projectionMatrix
    this.material.uniforms.viewMatrix.value = this.camera.matrixWorldInverse
    this.material.uniforms.resolution.value.set(
      this.renderer.domElement.width,
      this.renderer.domElement.height
    )

    // 渲染到目标
    this.renderer.setRenderTarget(this.renderTarget)
    if (this.quad && this.material) {
      this.renderer.render(this.quad, new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1))
    }
    this.renderer.setRenderTarget(null)

    this.ssrUpdated.emit(undefined)
    return this.renderTarget!.texture
  }

  /**
   * 更新配置
   */
  setConfig(config: Partial<ScreenSpaceReflectionConfig>): void {
    this.config = { ...this.config, ...config }
    
    if (this.material) {
      this.material.uniforms.maxSteps.value = this.config.maxSteps
      this.material.uniforms.maxDistance.value = this.config.maxDistance
      this.material.uniforms.thickness.value = this.config.thickness
      this.material.uniforms.intensity.value = this.config.intensity
      this.material.uniforms.fadeDistance.value = this.config.fadeDistance
      this.material.uniforms.roughnessFade.value = this.config.roughnessFade
      this.material.uniforms.maxRoughness.value = this.config.maxRoughness
    }

    this.configUpdated.emit(this.config)
  }

  /**
   * 获取配置
   */
  getConfig(): ScreenSpaceReflectionConfig {
    return { ...this.config }
  }

  /**
   * 更新方法
   */
  update(): void {
    // 可以在这里添加实时更新逻辑
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.renderTarget) {
      this.renderTarget.dispose()
    }
    if (this.material) {
      this.material.dispose()
    }
    if (this.quad) {
      this.quad.geometry.dispose()
    }
    this.disposed.emit(undefined)
  }
}