import { BufferGeometry } from 'three';
import { ThreeEngine } from '../main';

type UUID = string;
interface GeometryTransform {
  uuid: UUID;
  position: { x?: number; y?: number; z?: number; }; 
  type?: 'translate' | 'scale' | 'rotation'
}
declare class Geometry {
  threeEngine: ThreeEngine;
  renderModelMap: Map<string, object>;
  geometries: Map<string, BufferGeometry>;

  constructor(threeEngine: ThreeEngine);

  // 设置模型的旋转、位移、缩放
  setModelGeometryTransform({ uuid, position, type }: GeometryTransform): void;

  removeGeometry(geometry: BufferGeometry): void;

  addGeometry(geometry: BufferGeometry): void;

  setGeometryName(geometry: BufferGeometry, name: string): void;
}
