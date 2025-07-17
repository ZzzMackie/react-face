import * as THREE from 'three'
import { createSignal } from './Signal'

export interface Manager {
  initialize(): Promise<void>
  dispose(): void
}

export interface VolumetricFogConfig {
  enabled: boolean
  density: number
  scattering: number
  absorption: number
  phaseFunction: number
  steps: number
  jitter: number
  noiseScale: number
  noiseSpeed: number
  color: THREE.Color
  height: number
  falloff: number
}

export class VolumetricFogManager implements Manager {
  private config: VolumetricFogConfig
  private engine: any
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.Camera | null = null
  private renderTarget: THREE.WebGLRenderTarget | null = null
  private material: THREE.ShaderMaterial | null = null
  private quad: THREE.Mesh | null = null
  private noiseTexture: THREE.Texture | null = null
  private time: number = 0

  // 信号系统
  public readonly fogInitialized = createSignal<void>(undefined)
  public readonly fogUpdated = createSignal<void>(undefined)
  public readonly configUpdated = createSignal<VolumetricFogConfig | null>(null)
  public readonly disposed = createSignal<void>(undefined)

  constructor(engine: any) {
    this.engine = engine
    this.config = {
      enabled: true,
      density: 0.1,
      scattering: 0.1,
      absorption: 0.01,
      phaseFunction: 0.5,
      steps: 64,
      jitter: 0.1,
      noiseScale: 1.0,
      noiseSpeed: 0.1,
      color: new THREE.Color(0x87CEEB),
      height: 10,
      falloff: 1.0
    }
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) return

    this.renderer = this.engine.renderer
    this.scene = this.engine.sceneManager?.getScene()
    this.camera = this.engine.cameraManager?.getCamera()

    if (!this.renderer || !this.scene || !this.camera) {
      console.warn('Volumetric Fog Manager: Required managers not available')
      return
    }

    this.createNoiseTexture()
    this.createRenderTarget()
    this.createFogMaterial()
    this.createQuad()

    this.fogInitialized.emit(undefined)
  }

  private createNoiseTexture(): void {
    // 创建噪声纹理
    const size = 256
    const data = new Uint8Array(size * size * 4)
    
    for (let i = 0; i < size * size; i++) {
      const stride = i * 4
      const value = Math.random() * 255
      data[stride] = value
      data[stride + 1] = value
      data[stride + 2] = value
      data[stride + 3] = 255
    }

    this.noiseTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
    this.noiseTexture.wrapS = THREE.RepeatWrapping
    this.noiseTexture.wrapT = THREE.RepeatWrapping
    this.noiseTexture.minFilter = THREE.LinearFilter
    this.noiseTexture.magFilter = THREE.LinearFilter
    this.noiseTexture.generateMipmaps = false
  }

  private createRenderTarget(): void {
    if (!this.renderer) return

    const width = this.renderer.domElement.width
    const height = this.renderer.domElement.height

    this.renderTarget = new THREE.WebGLRenderTarget(
      width,
      height,
      {
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding,
        generateMipmaps: false
      }
    )
  }

  private createFogMaterial(): void {
    // 体积雾着色器
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
      uniform sampler2D tNoise;
      uniform vec3 fogColor;
      uniform float fogDensity;
      uniform float fogScattering;
      uniform float fogAbsorption;
      uniform float phaseFunction;
      uniform float fogSteps;
      uniform float fogJitter;
      uniform float noiseScale;
      uniform float noiseSpeed;
      uniform float fogHeight;
      uniform float fogFalloff;
      uniform mat4 projectionMatrix;
      uniform mat4 viewMatrix;
      uniform vec2 resolution;
      uniform float time;

      varying vec2 vUv;

      vec3 getWorldPos(vec2 uv, float depth) {
        vec4 clipPos = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 worldPos = inverse(projectionMatrix * viewMatrix) * clipPos;
        return worldPos.xyz / worldPos.w;
      }

      float rayleighPhase(float cosTheta) {
        return 3.0 / (16.0 * 3.14159) * (1.0 + cosTheta * cosTheta);
      }

      float miePhase(float cosTheta) {
        float g = phaseFunction;
        return (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * cosTheta, 1.5);
      }

      float phase(float cosTheta) {
        return mix(rayleighPhase(cosTheta), miePhase(cosTheta), 0.1);
      }

      float getFogDensity(vec3 worldPos) {
        float heightFactor = smoothstep(0.0, fogHeight, worldPos.y);
        float noise = texture2D(tNoise, worldPos.xz * noiseScale + time * noiseSpeed).r;
        return fogDensity * (1.0 - heightFactor * fogFalloff) * (1.0 + noise * 0.5);
      }

      void main() {
        vec4 diffuse = texture2D(tDiffuse, vUv);
        float depth = texture2D(tDepth, vUv).r;
        
        vec3 worldPos = getWorldPos(vUv, depth);
        vec3 cameraPos = (inverse(viewMatrix) * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        vec3 rayDir = normalize(worldPos - cameraPos);
        float rayLength = length(worldPos - cameraPos);
        
        // 体积积分
        vec3 fog = vec3(0.0);
        float stepSize = rayLength / fogSteps;
        
        for (float i = 0.0; i < fogSteps; i++) {
          float t = i * stepSize;
          vec3 samplePos = cameraPos + rayDir * t;
          
          float density = getFogDensity(samplePos);
          float extinction = density * (fogScattering + fogAbsorption);
          
          // 散射
          float cosTheta = dot(-rayDir, normalize(vec3(0.0, 1.0, 0.0)));
          float scattering = density * fogScattering * phase(cosTheta);
          
          fog += scattering * stepSize * exp(-extinction * t);
        }
        
        // 应用雾效果
        vec3 finalColor = diffuse.rgb + fog * fogColor;
        float alpha = 1.0 - exp(-fogDensity * rayLength);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        tNoise: { value: this.noiseTexture },
        fogColor: { value: this.config.color },
        fogDensity: { value: this.config.density },
        fogScattering: { value: this.config.scattering },
        fogAbsorption: { value: this.config.absorption },
        phaseFunction: { value: this.config.phaseFunction },
        fogSteps: { value: this.config.steps },
        fogJitter: { value: this.config.jitter },
        noiseScale: { value: this.config.noiseScale },
        noiseSpeed: { value: this.config.noiseSpeed },
        fogHeight: { value: this.config.height },
        fogFalloff: { value: this.config.falloff },
        projectionMatrix: { value: new THREE.Matrix4() },
        viewMatrix: { value: new THREE.Matrix4() },
        resolution: { value: new THREE.Vector2() },
        time: { value: 0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
  }

  private createQuad(): void {
    const geometry = new THREE.PlaneGeometry(2, 2)
    if (this.material) {
      this.quad = new THREE.Mesh(geometry, this.material)
    }
  }

  /**
   * 渲染体积雾
   */
  render(diffuseTexture: THREE.Texture, depthTexture: THREE.Texture): THREE.Texture {
    if (!this.renderer || !this.material || !this.quad || !this.camera) {
      return diffuseTexture
    }

    // 更新时间
    this.time += 0.016 // 假设60fps

    // 更新材质uniforms
    this.material.uniforms.tDiffuse.value = diffuseTexture
    this.material.uniforms.tDepth.value = depthTexture
    this.material.uniforms.projectionMatrix.value = this.camera.projectionMatrix
    this.material.uniforms.viewMatrix.value = this.camera.matrixWorldInverse
    this.material.uniforms.resolution.value.set(
      this.renderer.domElement.width,
      this.renderer.domElement.height
    )
    this.material.uniforms.time.value = this.time

    // 渲染到目标
    this.renderer.setRenderTarget(this.renderTarget)
    if (this.quad && this.material) {
      this.renderer.render(this.quad, new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1))
    }
    this.renderer.setRenderTarget(null)

    this.fogUpdated.emit(undefined)
    return this.renderTarget!.texture
  }

  /**
   * 更新配置
   */
  setConfig(config: Partial<VolumetricFogConfig>): void {
    this.config = { ...this.config, ...config }
    
    if (this.material) {
      this.material.uniforms.fogColor.value = this.config.color
      this.material.uniforms.fogDensity.value = this.config.density
      this.material.uniforms.fogScattering.value = this.config.scattering
      this.material.uniforms.fogAbsorption.value = this.config.absorption
      this.material.uniforms.phaseFunction.value = this.config.phaseFunction
      this.material.uniforms.fogSteps.value = this.config.steps
      this.material.uniforms.fogJitter.value = this.config.jitter
      this.material.uniforms.noiseScale.value = this.config.noiseScale
      this.material.uniforms.noiseSpeed.value = this.config.noiseSpeed
      this.material.uniforms.fogHeight.value = this.config.height
      this.material.uniforms.fogFalloff.value = this.config.falloff
    }

    this.configUpdated.emit(this.config)
  }

  /**
   * 获取配置
   */
  getConfig(): VolumetricFogConfig {
    return { ...this.config }
  }

  /**
   * 更新方法
   */
  update(deltaTime: number): void {
    this.time += deltaTime
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
    if (this.noiseTexture) {
      this.noiseTexture.dispose()
    }
    this.disposed.emit(undefined)
  }
}