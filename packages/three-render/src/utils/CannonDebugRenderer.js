/**
 * 基于cannon.js的调试渲染器，用于可视化物理世界
 * 修改自cannon.js官方示例
 */
class CannonDebugRenderer {
  /**
   * 构造函数
   * @param {THREE.Scene} scene Three.js场景
   * @param {CANNON.World} world Cannon.js物理世界
   * @param {Object} THREE Three.js库
   * @param {Object} options 选项
   */
  constructor(scene, world, THREE, options = {}) {
    this.scene = scene;
    this.world = world;
    this.THREE = THREE;
    
    this.options = Object.assign({
      color: 0x00ff00,
      scale: 1,
      sphereRadius: 0.2,
      boxWidth: 1,
      boxHeight: 1,
      boxDepth: 1,
      planeSize: 10,
      cylinderRadiusTop: 0.2,
      cylinderRadiusBottom: 0.2,
      cylinderHeight: 1,
      cylinderNumSegments: 8
    }, options);
    
    this._meshes = [];
    this._material = new THREE.MeshBasicMaterial({
      color: this.options.color,
      wireframe: true
    });
    
    this._sphereGeometry = new THREE.SphereGeometry(1);
    this._boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this._planeGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);
    this._cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 8);
  }
  
  /**
   * 更新调试渲染器
   */
  update() {
    // 移除所有调试网格
    this._meshes.forEach(mesh => {
      this.scene.remove(mesh);
    });
    
    this._meshes = [];
    
    // 为每个物体创建调试网格
    this.world.bodies.forEach(body => {
      body.shapes.forEach((shape, shapeIndex) => {
        this._updateMesh(body, shape, shapeIndex);
      });
    });
  }
  
  /**
   * 更新单个物体的调试网格
   * @param {CANNON.Body} body 物理物体
   * @param {CANNON.Shape} shape 物理形状
   * @param {Number} shapeIndex 形状索引
   */
  _updateMesh(body, shape, shapeIndex) {
    let mesh = this._createMesh(shape);
    if (!mesh) return;
    
    // 设置网格位置和旋转
    mesh.position.copy(this._getBodyPosition(body));
    mesh.quaternion.copy(this._getBodyQuaternion(body));
    
    // 应用形状偏移
    if (shape.offset) {
      mesh.position.vadd(shape.offset, mesh.position);
    }
    if (shape.orientation) {
      mesh.quaternion.mult(shape.orientation, mesh.quaternion);
    }
    
    // 添加到场景
    this.scene.add(mesh);
    this._meshes.push(mesh);
  }
  
  /**
   * 创建调试网格
   * @param {CANNON.Shape} shape 物理形状
   * @returns {THREE.Mesh} 调试网格
   */
  _createMesh(shape) {
    let mesh = null;
    const THREE = this.THREE;
    const options = this.options;
    
    switch (shape.type) {
      case 'Sphere':
        mesh = new THREE.Mesh(
          this._sphereGeometry,
          this._material
        );
        mesh.scale.set(
          shape.radius * options.scale,
          shape.radius * options.scale,
          shape.radius * options.scale
        );
        break;
        
      case 'Box':
        mesh = new THREE.Mesh(
          this._boxGeometry,
          this._material
        );
        mesh.scale.set(
          shape.halfExtents.x * 2 * options.scale,
          shape.halfExtents.y * 2 * options.scale,
          shape.halfExtents.z * 2 * options.scale
        );
        break;
        
      case 'Plane':
        mesh = new THREE.Mesh(
          this._planeGeometry,
          this._material
        );
        mesh.scale.set(
          options.planeSize * options.scale,
          options.planeSize * options.scale,
          1
        );
        break;
        
      case 'Cylinder':
        mesh = new THREE.Mesh(
          this._cylinderGeometry,
          this._material
        );
        mesh.scale.set(
          shape.radiusTop * options.scale,
          shape.height * options.scale,
          shape.radiusTop * options.scale
        );
        break;
        
      default:
        // 不支持的形状类型
        return null;
    }
    
    return mesh;
  }
  
  /**
   * 获取物体位置
   * @param {CANNON.Body} body 物理物体
   * @returns {THREE.Vector3} 位置向量
   */
  _getBodyPosition(body) {
    const THREE = this.THREE;
    return new THREE.Vector3(
      body.position.x,
      body.position.y,
      body.position.z
    );
  }
  
  /**
   * 获取物体旋转
   * @param {CANNON.Body} body 物理物体
   * @returns {THREE.Quaternion} 旋转四元数
   */
  _getBodyQuaternion(body) {
    const THREE = this.THREE;
    return new THREE.Quaternion(
      body.quaternion.x,
      body.quaternion.y,
      body.quaternion.z,
      body.quaternion.w
    );
  }
  
  /**
   * 释放资源
   */
  dispose() {
    // 移除所有调试网格
    this._meshes.forEach(mesh => {
      this.scene.remove(mesh);
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        mesh.material.dispose();
      }
    });
    
    this._meshes = [];
    
    // 释放几何体
    this._sphereGeometry.dispose();
    this._boxGeometry.dispose();
    this._planeGeometry.dispose();
    this._cylinderGeometry.dispose();
    
    // 释放材质
    this._material.dispose();
  }
}

export default CannonDebugRenderer; 