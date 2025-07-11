import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface MaterialConfig {
  defaultColor?: THREE.ColorRepresentation;
  defaultOpacity?: number;
  enableTransparency?: boolean;
}

export interface MaterialInfo {
  id: string;
  material: THREE.Material;
  type: string;
  visible: boolean;
}

/**
 * 材质管理器
 * 负责管理 Three.js 材质
 */
export class MaterialManager implements Manager {
  private engine: unknown;
  private materials: Map<string, MaterialInfo> = new Map();
  private config: MaterialConfig;

  // 信号系统
  public readonly materialCreated = createSignal<MaterialInfo | null>(null);
  public readonly materialRemoved = createSignal<string | null>(null);
  public readonly materialUpdated = createSignal<MaterialInfo | null>(null);

  constructor(engine: unknown, config: MaterialConfig = {}) {
    this.engine = engine;
    this.config = {
      defaultColor: 0xffffff,
      defaultOpacity: 1.0,
      enableTransparency: true,
      ...config
    };
  }

  init(): void {
    // 初始化材质系统
  }

  destroy(): void {
    this.removeAllMaterials();
  }

  createBasicMaterial(
    id: string,
    color: THREE.ColorRepresentation = this.config.defaultColor!,
    opacity: number = this.config.defaultOpacity!
  ): THREE.MeshBasicMaterial {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: this.config.enableTransparency && opacity < 1,
      opacity
    });

    const materialInfo: MaterialInfo = {
      id,
      material,
      type: 'basic',
      visible: true
    };

    this.materials.set(id, materialInfo);
    this.materialCreated.emit(materialInfo);

    return material;
  }

  createLambertMaterial(
    id: string,
    color: THREE.ColorRepresentation = this.config.defaultColor!,
    opacity: number = this.config.defaultOpacity!
  ): THREE.MeshLambertMaterial {
    const material = new THREE.MeshLambertMaterial({
      color,
      transparent: this.config.enableTransparency && opacity < 1,
      opacity
    });

    const materialInfo: MaterialInfo = {
      id,
      material,
      type: 'lambert',
      visible: true
    };

    this.materials.set(id, materialInfo);
    this.materialCreated.emit(materialInfo);

    return material;
  }

  createPhongMaterial(
    id: string,
    color: THREE.ColorRepresentation = this.config.defaultColor!,
    opacity: number = this.config.defaultOpacity!,
    shininess: number = 30
  ): THREE.MeshPhongMaterial {
    const material = new THREE.MeshPhongMaterial({
      color,
      transparent: this.config.enableTransparency && opacity < 1,
      opacity,
      shininess
    });

    const materialInfo: MaterialInfo = {
      id,
      material,
      type: 'phong',
      visible: true
    };

    this.materials.set(id, materialInfo);
    this.materialCreated.emit(materialInfo);

    return material;
  }

  createStandardMaterial(
    id: string,
    color: THREE.ColorRepresentation = this.config.defaultColor!,
    opacity: number = this.config.defaultOpacity!,
    metalness: number = 0.5,
    roughness: number = 0.5
  ): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({
      color,
      transparent: this.config.enableTransparency && opacity < 1,
      opacity,
      metalness,
      roughness
    });

    const materialInfo: MaterialInfo = {
      id,
      material,
      type: 'standard',
      visible: true
    };

    this.materials.set(id, materialInfo);
    this.materialCreated.emit(materialInfo);

    return material;
  }

  createPhysicalMaterial(
    id: string,
    color: THREE.ColorRepresentation = this.config.defaultColor!,
    opacity: number = this.config.defaultOpacity!,
    metalness: number = 0.5,
    roughness: number = 0.5,
    clearcoat: number = 0.0,
    clearcoatRoughness: number = 0.0
  ): THREE.MeshPhysicalMaterial {
    const material = new THREE.MeshPhysicalMaterial({
      color,
      transparent: this.config.enableTransparency && opacity < 1,
      opacity,
      metalness,
      roughness,
      clearcoat,
      clearcoatRoughness
    });

    const materialInfo: MaterialInfo = {
      id,
      material,
      type: 'physical',
      visible: true
    };

    this.materials.set(id, materialInfo);
    this.materialCreated.emit(materialInfo);

    return material;
  }

  createShaderMaterial(
    id: string,
    vertexShader: string,
    fragmentShader: string,
    uniforms?: { [key: string]: THREE.IUniform }
  ): THREE.ShaderMaterial {
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms
    });

    const materialInfo: MaterialInfo = {
      id,
      material,
      type: 'shader',
      visible: true
    };

    this.materials.set(id, materialInfo);
    this.materialCreated.emit(materialInfo);

    return material;
  }

  getMaterial(id: string): MaterialInfo | undefined {
    return this.materials.get(id);
  }

  hasMaterial(id: string): boolean {
    return this.materials.has(id);
  }

  removeMaterial(id: string): void {
    const materialInfo = this.materials.get(id);
    if (materialInfo) {
      materialInfo.material.dispose();
      this.materials.delete(id);
      this.materialRemoved.emit(id);
    }
  }

  setMaterialColor(id: string, color: THREE.ColorRepresentation): void {
    const materialInfo = this.materials.get(id);
    if (materialInfo) {
      materialInfo.material.color.set(color);
      this.materialUpdated.emit(materialInfo);
    }
  }

  setMaterialOpacity(id: string, opacity: number): void {
    const materialInfo = this.materials.get(id);
    if (materialInfo) {
      materialInfo.material.opacity = opacity;
      materialInfo.material.transparent = this.config.enableTransparency && opacity < 1;
      this.materialUpdated.emit(materialInfo);
    }
  }

  setMaterialVisible(id: string, visible: boolean): void {
    const materialInfo = this.materials.get(id);
    if (materialInfo) {
      materialInfo.visible = visible;
      materialInfo.material.visible = visible;
      this.materialUpdated.emit(materialInfo);
    }
  }

  cloneMaterial(id: string, newId: string): MaterialInfo | undefined {
    const materialInfo = this.materials.get(id);
    if (materialInfo) {
      const clonedMaterial = materialInfo.material.clone();
      const clonedInfo: MaterialInfo = {
        id: newId,
        material: clonedMaterial,
        type: materialInfo.type,
        visible: materialInfo.visible
      };

      this.materials.set(newId, clonedInfo);
      this.materialCreated.emit(clonedInfo);

      return clonedInfo;
    }
    return undefined;
  }

  getAllMaterials(): MaterialInfo[] {
    return Array.from(this.materials.values());
  }

  getMaterialsByType(type: string): MaterialInfo[] {
    return Array.from(this.materials.values()).filter(material => material.type === type);
  }

  getVisibleMaterials(): MaterialInfo[] {
    return Array.from(this.materials.values()).filter(material => material.visible);
  }

  removeAllMaterials(): void {
    this.materials.forEach(materialInfo => {
      materialInfo.material.dispose();
    });
    this.materials.clear();
  }
} 