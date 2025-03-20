export class Geometry {
  constructor(threeEngine) {
    this.threeEngine = threeEngine;
    this.renderModelMap = new Map();
    this.geometries = new Map();
  }

  // 设置模型的旋转、位移、缩放
  setModelGeometryTransform({ uuid, position, type = 'translate' }) {
    let geometry = this.geometries.get(uuid);
    const { x, y, z } = position;
    switch (type) {
      case 'scale':
      case 'translate':
        if (x !== undefined && y !== undefined && z !== undefined) {
          geometry?.[type](x, y, z);
        }
        break;
      case 'rotation':
        if (x !== undefined && y !== undefined && z !== undefined) {
          geometry.rotateX(x);
          geometry.rotateY(y);
          geometry.rotateZ(z);
          // rx rz 0-2Math.PI ry 0-Math.PI
        }
        break;
      default:
        break;
    }
  }

  removeGeometry(geometry) {
    geometry.dispose();
    this.geometries.delete(geometry.uuid);
  }

  addGeometry(geometry) {
    this.geometries.set(geometry.uuid, geometry);
  }

  setGeometryName(geometry, name) {
    geometry.name = name;
  }
}
