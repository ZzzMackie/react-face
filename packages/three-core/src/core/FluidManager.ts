import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface FluidConfig {
  enableFluidSimulation?: boolean;
  enableParticles?: boolean;
  enableViscosity?: boolean;
  maxParticles?: number;
  // 新增 SPH 配置
  sphKernelRadius?: number;
  sphRestDensity?: number;
  sphPressureStiffness?: number;
  sphViscosityCoefficient?: number;
  sphParticleMass?: number;
  sphGravity?: { x: number; y: number; z: number };
  sphTimeStep?: number;
  sphIterations?: number;
}

export interface FluidInfo {
  id: string;
  type: string;
  enabled: boolean;
  config: unknown;
}

export interface SPHParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  force: THREE.Vector3;
  density: number;
  pressure: number;
  mass: number;
}

export interface SPHSimulationInfo extends FluidInfo {
  particles?: SPHParticle[];
  mesh?: THREE.Points;
  bounds?: {
    min: THREE.Vector3;
    max: THREE.Vector3;
  };
  grid?: Map<string, number[]>; // 空间哈希网格
}

/**
 * 流体管理器
 * 负责管理 Three.js 流体模拟
 */
export class FluidManager implements Manager {
  // Add test expected properties
  public readonly name = 'FluidManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private fluids: Map<string, FluidInfo> = new Map();
  private config: FluidConfig;
  // 新增 SPH 模拟相关
  private sphSimulations: Map<string, SPHSimulationInfo> = new Map();
  private gridCellSize: number = 0;

  // 信号系统
  public readonly fluidAdded = createSignal<FluidInfo | null>(null);
  public readonly fluidRemoved = createSignal<string | null>(null);
  public readonly fluidUpdated = createSignal<FluidInfo | null>(null);
  // 新增 SPH 相关信号
  public readonly sphSimulationUpdated = createSignal<SPHSimulationInfo | null>(null);
  public readonly sphSimulationStep = createSignal<string | null>(null);

  constructor(engine: unknown, config: FluidConfig = {}) {
    this.engine = engine;
    this.config = {
      enableFluidSimulation: false,
      enableParticles: true,
      enableViscosity: true,
      maxParticles: 10000,
      // 新增 SPH 默认配置
      sphKernelRadius: 0.1,
      sphRestDensity: 1000,
      sphPressureStiffness: 3,
      sphViscosityCoefficient: 0.01,
      sphParticleMass: 0.02,
      sphGravity: { x: 0, y: -9.8, z: 0 },
      sphTimeStep: 0.005,
      sphIterations: 3,
      ...config
    };
    
    // 设置网格单元大小为核半径的两倍
    this.gridCellSize = this.config.sphKernelRadius! * 2;
  }

  async initialize(): Promise<void> {
    // 初始化流体系统
    this.initialized = true;
    console.log('🌊 FluidManager initialized with config:', this.config);
  }

  dispose(): void {
    // 清理所有流体资源
    this.removeAllFluids();
    this.removeAllSPHSimulations();
    this.initialized = false;
  }

  // 新增 SPH 模拟方法
  createSPHSimulation(
    id: string,
    options?: {
      particleCount?: number;
      bounds?: {
        min: THREE.Vector3;
        max: THREE.Vector3;
      };
      kernelRadius?: number;
      restDensity?: number;
      pressureStiffness?: number;
      viscosityCoefficient?: number;
      particleMass?: number;
      gravity?: { x: number; y: number; z: number };
      timeStep?: number;
      iterations?: number;
      particleSize?: number;
      particleColor?: THREE.ColorRepresentation;
    }
  ): SPHSimulationInfo {
    // 创建 SPH 模拟信息
    const simulationInfo: SPHSimulationInfo = {
      id,
      type: 'sph',
      enabled: true,
      config: {
        particleCount: options?.particleCount ?? 1000,
        kernelRadius: options?.kernelRadius ?? this.config.sphKernelRadius,
        restDensity: options?.restDensity ?? this.config.sphRestDensity,
        pressureStiffness: options?.pressureStiffness ?? this.config.sphPressureStiffness,
        viscosityCoefficient: options?.viscosityCoefficient ?? this.config.sphViscosityCoefficient,
        particleMass: options?.particleMass ?? this.config.sphParticleMass,
        gravity: options?.gravity ?? this.config.sphGravity,
        timeStep: options?.timeStep ?? this.config.sphTimeStep,
        iterations: options?.iterations ?? this.config.sphIterations,
        particleSize: options?.particleSize ?? 0.05,
        particleColor: options?.particleColor ?? 0x0088ff
      },
      particles: [],
      bounds: options?.bounds ?? {
        min: new THREE.Vector3(-1, -1, -1),
        max: new THREE.Vector3(1, 1, 1)
      },
      grid: new Map()
    };
    
    // 初始化粒子
    this.initializeSPHParticles(simulationInfo);
    
    // 创建可视化网格
    this.createSPHVisualization(simulationInfo);
    
    // 存储模拟
    this.sphSimulations.set(id, simulationInfo);
    this.fluidAdded.emit(simulationInfo);
    
    return simulationInfo;
  }
  
  // 初始化 SPH 粒子
  private initializeSPHParticles(simulation: SPHSimulationInfo): void {
    const config = simulation.config as any;
    const particleCount = config.particleCount;
    const bounds = simulation.bounds!;
    const particleMass = config.particleMass;
    
    simulation.particles = [];
    
    // 计算容器体积和粒子间距
    const containerVolume = (bounds.max.x - bounds.min.x) * 
                           (bounds.max.y - bounds.min.y) * 
                           (bounds.max.z - bounds.min.z);
    
    const particleVolume = containerVolume / particleCount;
    const particleSpacing = Math.pow(particleVolume, 1/3) * 0.9; // 稍微紧凑一些
    
    // 计算每个维度的粒子数量
    const nx = Math.floor((bounds.max.x - bounds.min.x) / particleSpacing);
    const ny = Math.floor((bounds.max.y - bounds.min.y) / particleSpacing);
    const nz = Math.floor((bounds.max.z - bounds.min.z) / particleSpacing);
    
    // 创建规则网格中的粒子
    let count = 0;
    for (let i = 0; i < nx && count < particleCount; i++) {
      for (let j = 0; j < ny && count < particleCount; j++) {
        for (let k = 0; k < nz && count < particleCount; k++) {
          // 计算位置，稍微添加随机性
          const x = bounds.min.x + (i + 0.1 * Math.random()) * particleSpacing;
          const y = bounds.min.y + (j + 0.1 * Math.random()) * particleSpacing;
          const z = bounds.min.z + (k + 0.1 * Math.random()) * particleSpacing;
          
          // 创建粒子
          const particle: SPHParticle = {
            position: new THREE.Vector3(x, y, z),
            velocity: new THREE.Vector3(0, 0, 0),
            force: new THREE.Vector3(0, 0, 0),
            density: 0,
            pressure: 0,
            mass: particleMass
          };
          
          simulation.particles.push(particle);
          count++;
        }
      }
    }
    
    console.log(`🌊 Created ${simulation.particles.length} SPH particles`);
  }
  
  // 创建 SPH 可视化
  private createSPHVisualization(simulation: SPHSimulationInfo): void {
    const config = simulation.config as any;
    const particles = simulation.particles!;
    
    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particles.length * 3);
    
    // 设置初始位置
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // 创建粒子材质
    const material = new THREE.PointsMaterial({
      color: config.particleColor,
      size: config.particleSize,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    // 创建粒子系统
    const mesh = new THREE.Points(geometry, material);
    simulation.mesh = mesh;
    
    // 添加到场景
    const sceneManager = (this.engine as any).getManager?.('scene');
    if (sceneManager && typeof sceneManager.add === 'function') {
      sceneManager.add(mesh);
    }
  }
  
  // 更新 SPH 可视化
  private updateSPHVisualization(simulation: SPHSimulationInfo): void {
    if (!simulation.mesh) return;
    
    const particles = simulation.particles!;
    const positions = simulation.mesh.geometry.attributes.position.array as Float32Array;
    
    // 更新粒子位置
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
    }
    
    simulation.mesh.geometry.attributes.position.needsUpdate = true;
  }
  
  // 构建空间哈希网格
  private buildSpatialGrid(simulation: SPHSimulationInfo): void {
    const particles = simulation.particles!;
    const grid = new Map<string, number[]>();
    const cellSize = this.gridCellSize;
    
    // 清空现有网格
    simulation.grid = grid;
    
    // 将粒子添加到网格
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const cellX = Math.floor(particle.position.x / cellSize);
      const cellY = Math.floor(particle.position.y / cellSize);
      const cellZ = Math.floor(particle.position.z / cellSize);
      
      const cellKey = `${cellX},${cellY},${cellZ}`;
      
      if (!grid.has(cellKey)) {
        grid.set(cellKey, []);
      }
      
      grid.get(cellKey)!.push(i);
    }
  }
  
  // 获取粒子邻居
  private getNeighbors(simulation: SPHSimulationInfo, particleIndex: number): number[] {
    const particles = simulation.particles!;
    const grid = simulation.grid!;
    const particle = particles[particleIndex];
    const cellSize = this.gridCellSize;
    const kernelRadius = (simulation.config as any).kernelRadius;
    
    const neighbors: number[] = [];
    const cellX = Math.floor(particle.position.x / cellSize);
    const cellY = Math.floor(particle.position.y / cellSize);
    const cellZ = Math.floor(particle.position.z / cellSize);
    
    // 检查相邻的 27 个单元格（包括当前单元格）
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const cellKey = `${cellX + x},${cellY + y},${cellZ + z}`;
          const cellParticles = grid.get(cellKey);
          
          if (cellParticles) {
            for (const neighborIndex of cellParticles) {
              if (neighborIndex !== particleIndex) {
                const neighbor = particles[neighborIndex];
                const distance = particle.position.distanceTo(neighbor.position);
                
                if (distance < kernelRadius) {
                  neighbors.push(neighborIndex);
                }
              }
            }
          }
        }
      }
    }
    
    return neighbors;
  }
  
  // SPH 核函数
  private kernelPoly6(r: number, h: number): number {
    if (r > h) return 0;
    
    const h2 = h * h;
    const h9 = h2 * h2 * h2 * h2 * h;
    const coefficient = 315 / (64 * Math.PI * h9);
    const diff = h2 - r * r;
    
    return coefficient * diff * diff * diff;
  }
  
  // SPH 核函数梯度
  private kernelSpikyGradient(r: THREE.Vector3, h: number): THREE.Vector3 {
    const rLength = r.length();
    
    if (rLength > h || rLength < 0.0001) return new THREE.Vector3();
    
    const h6 = h * h * h * h * h * h;
    const coefficient = -45 / (Math.PI * h6);
    const diff = h - rLength;
    const factor = coefficient * diff * diff / rLength;
    
    return r.clone().multiplyScalar(factor);
  }
  
  // SPH 核函数拉普拉斯
  private kernelViscosityLaplacian(r: number, h: number): number {
    if (r > h) return 0;
    
    const h2 = h * h;
    const h6 = h2 * h2 * h2;
    const coefficient = 45 / (Math.PI * h6);
    
    return coefficient * (h - r);
  }
  
  // 计算密度和压力
  private computeDensityPressure(simulation: SPHSimulationInfo): void {
    const particles = simulation.particles!;
    const config = simulation.config as any;
    const kernelRadius = config.kernelRadius;
    const restDensity = config.restDensity;
    const pressureStiffness = config.pressureStiffness;
    
    // 构建空间哈希网格
    this.buildSpatialGrid(simulation);
    
    // 计算每个粒子的密度和压力
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const neighbors = this.getNeighbors(simulation, i);
      
      // 计算密度
      let density = 0;
      
      // 自身贡献
      density += particle.mass * this.kernelPoly6(0, kernelRadius);
      
      // 邻居贡献
      for (const j of neighbors) {
        const neighbor = particles[j];
        const distance = particle.position.distanceTo(neighbor.position);
        density += neighbor.mass * this.kernelPoly6(distance, kernelRadius);
      }
      
      particle.density = density;
      
      // 计算压力 (状态方程)
      particle.pressure = pressureStiffness * (density - restDensity);
      if (particle.pressure < 0) particle.pressure = 0; // 避免负压力
    }
  }
  
  // 计算力
  private computeForces(simulation: SPHSimulationInfo): void {
    const particles = simulation.particles!;
    const config = simulation.config as any;
    const kernelRadius = config.kernelRadius;
    const viscosityCoefficient = config.viscosityCoefficient;
    const gravity = new THREE.Vector3(config.gravity.x, config.gravity.y, config.gravity.z);
    
    // 计算每个粒子的力
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const neighbors = this.getNeighbors(simulation, i);
      
      // 重置力
      particle.force.copy(gravity).multiplyScalar(particle.mass);
      
      // 计算压力力和粘度力
      for (const j of neighbors) {
        const neighbor = particles[j];
        
        // 粒子间向量
        const direction = new THREE.Vector3().subVectors(particle.position, neighbor.position);
        const distance = direction.length();
        
        if (distance > 0.0001) {
          // 压力力
          const pressureForce = this.kernelSpikyGradient(direction, kernelRadius)
            .multiplyScalar(-(particle.pressure + neighbor.pressure) / (2 * neighbor.density));
          
          particle.force.addScaledVector(pressureForce, particle.mass * neighbor.mass);
          
          // 粘度力
          const relativeVelocity = new THREE.Vector3().subVectors(neighbor.velocity, particle.velocity);
          const viscosityForce = this.kernelViscosityLaplacian(distance, kernelRadius) * viscosityCoefficient;
          
          particle.force.addScaledVector(relativeVelocity, viscosityForce * particle.mass * neighbor.mass / neighbor.density);
        }
      }
    }
  }
  
  // 积分更新粒子位置和速度
  private integrate(simulation: SPHSimulationInfo): void {
    const particles = simulation.particles!;
    const config = simulation.config as any;
    const timeStep = config.timeStep;
    const bounds = simulation.bounds!;
    
    // 更新每个粒子的位置和速度
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      
      // 半隐式欧拉积分
      particle.velocity.addScaledVector(particle.force, timeStep / particle.density);
      particle.position.addScaledVector(particle.velocity, timeStep);
      
      // 边界碰撞处理
      this.handleBoundaryCollisions(particle, bounds, config);
    }
  }
  
  // 处理边界碰撞
  private handleBoundaryCollisions(particle: SPHParticle, bounds: { min: THREE.Vector3, max: THREE.Vector3 }, config: any): void {
    const damping = 0.5; // 碰撞阻尼
    
    // X轴边界
    if (particle.position.x < bounds.min.x) {
      particle.position.x = bounds.min.x;
      particle.velocity.x *= -damping;
    } else if (particle.position.x > bounds.max.x) {
      particle.position.x = bounds.max.x;
      particle.velocity.x *= -damping;
    }
    
    // Y轴边界
    if (particle.position.y < bounds.min.y) {
      particle.position.y = bounds.min.y;
      particle.velocity.y *= -damping;
    } else if (particle.position.y > bounds.max.y) {
      particle.position.y = bounds.max.y;
      particle.velocity.y *= -damping;
    }
    
    // Z轴边界
    if (particle.position.z < bounds.min.z) {
      particle.position.z = bounds.min.z;
      particle.velocity.z *= -damping;
    } else if (particle.position.z > bounds.max.z) {
      particle.position.z = bounds.max.z;
      particle.velocity.z *= -damping;
    }
  }
  
  // 模拟步进
  simulateSPHStep(id: string): void {
    const simulation = this.sphSimulations.get(id) as SPHSimulationInfo;
    if (!simulation || !simulation.enabled) return;
    
    const config = simulation.config as any;
    const iterations = config.iterations;
    
    // 执行多次迭代以提高稳定性
    for (let iter = 0; iter < iterations; iter++) {
      // 计算密度和压力
      this.computeDensityPressure(simulation);
      
      // 计算力
      this.computeForces(simulation);
      
      // 积分更新
      this.integrate(simulation);
    }
    
    // 更新可视化
    this.updateSPHVisualization(simulation);
    
    // 发送更新信号
    this.sphSimulationStep.emit(id);
  }
  
  // 设置 SPH 参数
  updateSPHConfig(id: string, config: Partial<{
    kernelRadius: number;
    restDensity: number;
    pressureStiffness: number;
    viscosityCoefficient: number;
    particleMass: number;
    gravity: { x: number; y: number; z: number };
    timeStep: number;
    iterations: number;
  }>): void {
    const simulation = this.sphSimulations.get(id);
    if (simulation) {
      simulation.config = { ...simulation.config as object, ...config };
      
      // 更新网格单元大小
      if (config.kernelRadius) {
        this.gridCellSize = config.kernelRadius * 2;
      }
      
      this.fluidUpdated.emit(simulation);
    }
  }
  
  // 获取 SPH 模拟
  getSPHSimulation(id: string): SPHSimulationInfo | undefined {
    return this.sphSimulations.get(id) as SPHSimulationInfo;
  }
  
  // 移除 SPH 模拟
  removeSPHSimulation(id: string): void {
    const simulation = this.sphSimulations.get(id);
    if (simulation) {
      // 从场景中移除可视化
      if (simulation.mesh) {
        const sceneManager = (this.engine as any).getManager?.('scene');
        if (sceneManager && typeof sceneManager.remove === 'function') {
          sceneManager.remove(simulation.mesh);
        }
        
        // 释放几何体和材质
        simulation.mesh.geometry.dispose();
        (simulation.mesh.material as THREE.Material).dispose();
      }
      
      this.sphSimulations.delete(id);
      this.fluidRemoved.emit(id);
    }
  }
  
  // 移除所有 SPH 模拟
  removeAllSPHSimulations(): void {
    this.sphSimulations.forEach((simulation, id) => {
      this.removeSPHSimulation(id);
    });
    this.sphSimulations.clear();
  }

  // 原有方法保持不变
  createFluidSimulation(
    id: string,
    options?: {
      resolution?: number;
      viscosity?: number;
      density?: number;
      pressure?: number;
    }
  ): void {
    const fluidInfo: FluidInfo = {
      id,
      type: 'simulation',
      enabled: true,
      config: {
        resolution: options?.resolution ?? 64,
        viscosity: options?.viscosity ?? 0.1,
        density: options?.density ?? 1.0,
        pressure: options?.pressure ?? 1.0
      }
    };

    this.fluids.set(id, fluidInfo);
    this.fluidAdded.emit(fluidInfo);
  }

  createFluidParticles(
    id: string,
    options?: {
      count?: number;
      size?: number;
      color?: THREE.ColorRepresentation;
    }
  ): void {
    const fluidInfo: FluidInfo = {
      id,
      type: 'particles',
      enabled: true,
      config: {
        count: options?.count ?? 1000,
        size: options?.size ?? 0.1,
        color: options?.color ?? 0x0088ff
      }
    };

    this.fluids.set(id, fluidInfo);
    this.fluidAdded.emit(fluidInfo);
  }

  getFluid(id: string): FluidInfo | undefined {
    return this.fluids.get(id);
  }

  hasFluid(id: string): boolean {
    return this.fluids.has(id);
  }

  removeFluid(id: string): void {
    const fluidInfo = this.fluids.get(id);
    if (fluidInfo) {
      this.fluids.delete(id);
      this.fluidRemoved.emit(id);
    }
  }

  setFluidEnabled(id: string, enabled: boolean): void {
    const fluidInfo = this.fluids.get(id);
    if (fluidInfo) {
      fluidInfo.enabled = enabled;
      this.fluidUpdated.emit(fluidInfo);
    }
  }

  updateFluid(
    id: string,
    config: unknown
  ): void {
    const fluidInfo = this.fluids.get(id);
    if (fluidInfo) {
      fluidInfo.config = config;
      this.fluidUpdated.emit(fluidInfo);
    }
  }

  getAllFluids(): FluidInfo[] {
    return Array.from(this.fluids.values());
  }

  getFluidsByType(type: string): FluidInfo[] {
    return Array.from(this.fluids.values()).filter(fluid => fluid.type === type);
  }

  getEnabledFluids(): FluidInfo[] {
    return Array.from(this.fluids.values()).filter(fluid => fluid.enabled);
  }

  removeAllFluids(): void {
    this.fluids.clear();
  }

  getConfig(): FluidConfig {
    return { ...this.config };
  }
}