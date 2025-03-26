import { BufferGeometry } from 'three';
import { ThreeEngine } from '../main';

declare class Geometry {
  threeEngine: ThreeEngine;
  renderModelMap: Map<string, object>;
  geometries: Map<string, BufferGeometry>;

  constructor(threeEngine: ThreeEngine);

  // 设置模型的旋转、位移、缩放
  setModelGeometryTransform({ uuid, position, type }: { uuid: string; position: { x?: number; y?: number; z?: number; }; type?: 'translate' | 'scale' | 'rotation' }): void;

  removeGeometry(geometry: BufferGeometry): void;

  addGeometry(geometry: BufferGeometry): void;

  setGeometryName(geometry: BufferGeometry, name: string): void;
}
