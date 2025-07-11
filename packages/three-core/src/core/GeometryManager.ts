import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface GeometryConfig {
  defaultSegments?: number;
  enableCaching?: boolean;
}

export interface GeometryInfo {
  id: string;
  geometry: THREE.BufferGeometry;
  type: string;
  vertexCount: number;
  faceCount: number;
}

/**
 * 几何体管理器
 * 负责管理 Three.js 几何体
 */
export class GeometryManager implements Manager {
  private engine: unknown;
  private geometries: Map<string, GeometryInfo> = new Map();
  private config: GeometryConfig;

  // 信号系统
  public readonly geometryCreated = createSignal<GeometryInfo | null>(null);
  public readonly geometryRemoved = createSignal<string | null>(null);
  public readonly geometryUpdated = createSignal<GeometryInfo | null>(null);

  constructor(engine: unknown, config: GeometryConfig = {}) {
    this.engine = engine;
    this.config = {
      defaultSegments: 32,
      enableCaching: true,
      ...config
    };
  }

  init(): void {
    // 初始化几何体系统
  }

  destroy(): void {
    this.removeAllGeometries();
  }

  createBoxGeometry(
    id: string,
    width: number = 1,
    height: number = 1,
    depth: number = 1,
    widthSegments: number = 1,
    heightSegments: number = 1,
    depthSegments: number = 1
  ): THREE.BoxGeometry {
    const geometry = new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
    
    const geometryInfo: GeometryInfo = {
      id,
      geometry,
      type: 'box',
      vertexCount: geometry.attributes.position.count,
      faceCount: geometry.index ? geometry.index.count / 3 : 0
    };

    this.geometries.set(id, geometryInfo);
    this.geometryCreated.emit(geometryInfo);

    return geometry;
  }

  createSphereGeometry(
    id: string,
    radius: number = 1,
    widthSegments: number = this.config.defaultSegments!,
    heightSegments: number = this.config.defaultSegments!
  ): THREE.SphereGeometry {
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    
    const geometryInfo: GeometryInfo = {
      id,
      geometry,
      type: 'sphere',
      vertexCount: geometry.attributes.position.count,
      faceCount: geometry.index ? geometry.index.count / 3 : 0
    };

    this.geometries.set(id, geometryInfo);
    this.geometryCreated.emit(geometryInfo);

    return geometry;
  }

  createCylinderGeometry(
    id: string,
    radiusTop: number = 1,
    radiusBottom: number = 1,
    height: number = 1,
    radialSegments: number = this.config.defaultSegments!,
    heightSegments: number = 1,
    openEnded: boolean = false,
    thetaStart: number = 0,
    thetaLength: number = Math.PI * 2
  ): THREE.CylinderGeometry {
    const geometry = new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      height,
      radialSegments,
      heightSegments,
      openEnded,
      thetaStart,
      thetaLength
    );
    
    const geometryInfo: GeometryInfo = {
      id,
      geometry,
      type: 'cylinder',
      vertexCount: geometry.attributes.position.count,
      faceCount: geometry.index ? geometry.index.count / 3 : 0
    };

    this.geometries.set(id, geometryInfo);
    this.geometryCreated.emit(geometryInfo);

    return geometry;
  }

  createConeGeometry(
    id: string,
    radius: number = 1,
    height: number = 1,
    radialSegments: number = this.config.defaultSegments!,
    heightSegments: number = 1,
    openEnded: boolean = false,
    thetaStart: number = 0,
    thetaLength: number = Math.PI * 2
  ): THREE.ConeGeometry {
    const geometry = new THREE.ConeGeometry(
      radius,
      height,
      radialSegments,
      heightSegments,
      openEnded,
      thetaStart,
      thetaLength
    );
    
    const geometryInfo: GeometryInfo = {
      id,
      geometry,
      type: 'cone',
      vertexCount: geometry.attributes.position.count,
      faceCount: geometry.index ? geometry.index.count / 3 : 0
    };

    this.geometries.set(id, geometryInfo);
    this.geometryCreated.emit(geometryInfo);

    return geometry;
  }

  createPlaneGeometry(
    id: string,
    width: number = 1,
    height: number = 1,
    widthSegments: number = 1,
    heightSegments: number = 1
  ): THREE.PlaneGeometry {
    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
    
    const geometryInfo: GeometryInfo = {
      id,
      geometry,
      type: 'plane',
      vertexCount: geometry.attributes.position.count,
      faceCount: geometry.index ? geometry.index.count / 3 : 0
    };

    this.geometries.set(id, geometryInfo);
    this.geometryCreated.emit(geometryInfo);

    return geometry;
  }

  createRingGeometry(
    id: string,
    innerRadius: number = 0.5,
    outerRadius: number = 1,
    thetaSegments: number = this.config.defaultSegments!,
    phiSegments: number = 1,
    thetaStart: number = 0,
    thetaLength: number = Math.PI * 2
  ): THREE.RingGeometry {
    const geometry = new THREE.RingGeometry(
      innerRadius,
      outerRadius,
      thetaSegments,
      phiSegments,
      thetaStart,
      thetaLength
    );
    
    const geometryInfo: GeometryInfo = {
      id,
      geometry,
      type: 'ring',
      vertexCount: geometry.attributes.position.count,
      faceCount: geometry.index ? geometry.index.count / 3 : 0
    };

    this.geometries.set(id, geometryInfo);
    this.geometryCreated.emit(geometryInfo);

    return geometry;
  }

  createTorusGeometry(
    id: string,
    radius: number = 1,
    tube: number = 0.4,
    radialSegments: number = this.config.defaultSegments!,
    tubularSegments: number = this.config.defaultSegments!,
    arc: number = Math.PI * 2
  ): THREE.TorusGeometry {
    const geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
    
    const geometryInfo: GeometryInfo = {
      id,
      geometry,
      type: 'torus',
      vertexCount: geometry.attributes.position.count,
      faceCount: geometry.index ? geometry.index.count / 3 : 0
    };

    this.geometries.set(id, geometryInfo);
    this.geometryCreated.emit(geometryInfo);

    return geometry;
  }

  createCustomGeometry(
    id: string,
    vertices: Float32Array,
    indices?: Uint16Array | Uint32Array,
    normals?: Float32Array,
    uvs?: Float32Array
  ): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
    if (indices) {
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    }
    
    if (normals) {
      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    } else {
      geometry.computeVertexNormals();
    }
    
    if (uvs) {
      geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    }
    
    const geometryInfo: GeometryInfo = {
      id,
      geometry,
      type: 'custom',
      vertexCount: geometry.attributes.position.count,
      faceCount: geometry.index ? geometry.index.count / 3 : 0
    };

    this.geometries.set(id, geometryInfo);
    this.geometryCreated.emit(geometryInfo);

    return geometry;
  }

  getGeometry(id: string): GeometryInfo | undefined {
    return this.geometries.get(id);
  }

  hasGeometry(id: string): boolean {
    return this.geometries.has(id);
  }

  removeGeometry(id: string): void {
    const geometryInfo = this.geometries.get(id);
    if (geometryInfo) {
      geometryInfo.geometry.dispose();
      this.geometries.delete(id);
      this.geometryRemoved.emit(id);
    }
  }

  cloneGeometry(id: string, newId: string): GeometryInfo | undefined {
    const geometryInfo = this.geometries.get(id);
    if (geometryInfo) {
      const clonedGeometry = geometryInfo.geometry.clone();
      const clonedInfo: GeometryInfo = {
        id: newId,
        geometry: clonedGeometry,
        type: geometryInfo.type,
        vertexCount: geometryInfo.vertexCount,
        faceCount: geometryInfo.faceCount
      };

      this.geometries.set(newId, clonedInfo);
      this.geometryCreated.emit(clonedInfo);

      return clonedInfo;
    }
    return undefined;
  }

  getAllGeometries(): GeometryInfo[] {
    return Array.from(this.geometries.values());
  }

  getGeometriesByType(type: string): GeometryInfo[] {
    return Array.from(this.geometries.values()).filter(geometry => geometry.type === type);
  }

  removeAllGeometries(): void {
    this.geometries.forEach(geometryInfo => {
      geometryInfo.geometry.dispose();
    });
    this.geometries.clear();
  }
} 