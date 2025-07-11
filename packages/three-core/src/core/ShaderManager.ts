import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface ShaderConfig {
  enableHotReload?: boolean;
  defaultPrecision?: string;
  includeExtensions?: boolean;
}

export interface ShaderInfo {
  id: string;
  material: THREE.ShaderMaterial;
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [key: string]: THREE.IUniform };
  enabled: boolean;
}

/**
 * 着色器管理器
 * 负责管理 Three.js 着色器
 */
export class ShaderManager implements Manager {
  private engine: unknown;
  private shaders: Map<string, ShaderInfo> = new Map();
  private config: ShaderConfig;

  // 信号系统
  public readonly shaderCreated = createSignal<ShaderInfo | null>(null);
  public readonly shaderRemoved = createSignal<string | null>(null);
  public readonly shaderUpdated = createSignal<ShaderInfo | null>(null);

  constructor(engine: unknown, config: ShaderConfig = {}) {
    this.engine = engine;
    this.config = {
      enableHotReload: false,
      defaultPrecision: 'mediump',
      includeExtensions: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化着色器系统
  }

  dispose(): void {
    this.removeAllShaders();
  }

  createShaderMaterial(
    id: string,
    vertexShader: string,
    fragmentShader: string,
    uniforms?: { [key: string]: THREE.IUniform },
    options?: {
      transparent?: boolean;
      side?: THREE.Side;
      blending?: THREE.Blending;
      depthTest?: boolean;
      depthWrite?: boolean;
    }
  ): THREE.ShaderMaterial {
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: uniforms || {},
      transparent: options?.transparent ?? false,
      side: options?.side ?? THREE.FrontSide,
      blending: options?.blending ?? THREE.NormalBlending,
      depthTest: options?.depthTest ?? true,
      depthWrite: options?.depthWrite ?? true
    });

    const shaderInfo: ShaderInfo = {
      id,
      material,
      vertexShader,
      fragmentShader,
      uniforms: uniforms || {},
      enabled: true
    };

    this.shaders.set(id, shaderInfo);
    this.shaderCreated.emit(shaderInfo);

    return material;
  }

  createBasicShader(
    id: string,
    color: THREE.ColorRepresentation = 0xffffff,
    options?: {
      transparent?: boolean;
      opacity?: number;
    }
  ): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 color;
      varying vec3 vPosition;
      void main() {
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const uniforms = {
      color: { value: new THREE.Color(color) }
    };

    return this.createShaderMaterial(id, vertexShader, fragmentShader, uniforms, options);
  }

  createPhongShader(
    id: string,
    color: THREE.ColorRepresentation = 0xffffff,
    options?: {
      transparent?: boolean;
      opacity?: number;
    }
  ): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 color;
      uniform vec3 lightPosition;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(lightPosition - vPosition);
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diff * color;
        gl_FragColor = vec4(diffuse, 1.0);
      }
    `;

    const uniforms = {
      color: { value: new THREE.Color(color) },
      lightPosition: { value: new THREE.Vector3(5, 5, 5) }
    };

    return this.createShaderMaterial(id, vertexShader, fragmentShader, uniforms, options);
  }

  createToonShader(
    id: string,
    color: THREE.ColorRepresentation = 0xffffff,
    options?: {
      transparent?: boolean;
      opacity?: number;
    }
  ): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 color;
      uniform vec3 lightPosition;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(lightPosition - vPosition);
        float diff = max(dot(normal, lightDir), 0.0);
        
        // Toon shading with hard steps
        float toon = floor(diff * 4.0) / 4.0;
        vec3 diffuse = toon * color;
        
        gl_FragColor = vec4(diffuse, 1.0);
      }
    `;

    const uniforms = {
      color: { value: new THREE.Color(color) },
      lightPosition: { value: new THREE.Vector3(5, 5, 5) }
    };

    return this.createShaderMaterial(id, vertexShader, fragmentShader, uniforms, options);
  }

  getShader(id: string): ShaderInfo | undefined {
    return this.shaders.get(id);
  }

  hasShader(id: string): boolean {
    return this.shaders.has(id);
  }

  removeShader(id: string): void {
    const shaderInfo = this.shaders.get(id);
    if (shaderInfo) {
      shaderInfo.material.dispose();
      this.shaders.delete(id);
      this.shaderRemoved.emit(id);
    }
  }

  updateShader(
    id: string,
    vertexShader?: string,
    fragmentShader?: string,
    uniforms?: { [key: string]: THREE.IUniform }
  ): void {
    const shaderInfo = this.shaders.get(id);
    if (shaderInfo) {
      if (vertexShader) {
        shaderInfo.vertexShader = vertexShader;
        shaderInfo.material.vertexShader = vertexShader;
      }
      if (fragmentShader) {
        shaderInfo.fragmentShader = fragmentShader;
        shaderInfo.material.fragmentShader = fragmentShader;
      }
      if (uniforms) {
        shaderInfo.uniforms = { ...shaderInfo.uniforms, ...uniforms };
        Object.assign(shaderInfo.material.uniforms, uniforms);
      }
      
      shaderInfo.material.needsUpdate = true;
      this.shaderUpdated.emit(shaderInfo);
    }
  }

  setUniform(id: string, name: string, value: unknown): void {
    const shaderInfo = this.shaders.get(id);
    if (shaderInfo && shaderInfo.material.uniforms[name]) {
      shaderInfo.material.uniforms[name].value = value;
    }
  }

  setShaderEnabled(id: string, enabled: boolean): void {
    const shaderInfo = this.shaders.get(id);
    if (shaderInfo) {
      shaderInfo.enabled = enabled;
      shaderInfo.material.visible = enabled;
    }
  }

  getAllShaders(): ShaderInfo[] {
    return Array.from(this.shaders.values());
  }

  getEnabledShaders(): ShaderInfo[] {
    return Array.from(this.shaders.values()).filter(shader => shader.enabled);
  }

  removeAllShaders(): void {
    this.shaders.forEach(shaderInfo => {
      shaderInfo.material.dispose();
    });
    this.shaders.clear();
  }
} 