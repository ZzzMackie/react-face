import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface MorphConfig {
  enableMorphing?: boolean;
  enableBlendShapes?: boolean;
  enableAnimation?: boolean;
  // 新增高级混合选项
  enableAdvancedBlending?: boolean;
  enableSequencing?: boolean;
  enableLipSync?: boolean;
  defaultEasing?: 'linear' | 'quad' | 'cubic' | 'quart' | 'quint' | 'sine' | 'expo' | 'circ' | 'elastic' | 'bounce' | 'back';
}

export interface MorphInfo {
  id: string;
  type: string;
  enabled: boolean;
  config: unknown;
  // 新增动画相关属性
  animation?: {
    isPlaying?: boolean;
    startTime?: number;
    duration?: number;
    startValue?: number;
    targetValue?: number;
    easing?: string;
    loop?: boolean;
    yoyo?: boolean;
    onComplete?: () => void;
  };
  // 新增混合相关属性
  blending?: {
    influences?: Map<string, number>;
    targets?: string[];
    blendMode?: 'additive' | 'override' | 'multiply';
    priority?: number;
  };
}

export interface MorphTarget {
  name: string;
  index: number;
  weight: number;
  defaultWeight: number;
  minWeight: number;
  maxWeight: number;
  category?: string;
  isVisible?: boolean;
  isMirrored?: boolean;
  mirrorTarget?: string;
}

export interface MorphSequence {
  id: string;
  name: string;
  targets: string[];
  keyframes: Array<{
    time: number;
    weights: Record<string, number>;
    easing?: string;
  }>;
  duration: number;
  loop?: boolean;
  yoyo?: boolean;
  autoplay?: boolean;
}

/**
 * 变形管理器
 * 负责管理 Three.js 变形动画
 */
export class MorphManager implements Manager {
  // Add test expected properties
  public readonly name = 'MorphManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private morphs: Map<string, MorphInfo> = new Map();
  private config: MorphConfig;
  // 新增属性
  private targets: Map<string, MorphTarget> = new Map();
  private sequences: Map<string, MorphSequence> = new Map();
  private meshes: Map<string, THREE.Mesh> = new Map();
  private activeAnimations: Set<string> = new Set();
  private animationFrameId: number | null = null;
  private lastUpdateTime: number = 0;

  // 信号系统
  public readonly morphAdded = createSignal<MorphInfo | null>(null);
  public readonly morphRemoved = createSignal<string | null>(null);
  public readonly morphUpdated = createSignal<MorphInfo | null>(null);
  // 新增信号
  public readonly morphAnimationStarted = createSignal<string | null>(null);
  public readonly morphAnimationCompleted = createSignal<string | null>(null);
  public readonly morphSequenceStarted = createSignal<string | null>(null);
  public readonly morphSequenceCompleted = createSignal<string | null>(null);
  public readonly morphTargetAdded = createSignal<MorphTarget | null>(null);
  public readonly morphTargetRemoved = createSignal<string | null>(null);

  constructor(engine: unknown, config: MorphConfig = {}) {
    this.engine = engine;
    this.config = {
      enableMorphing: true,
      enableBlendShapes: true,
      enableAnimation: true,
      // 新增高级混合默认配置
      enableAdvancedBlending: true,
      enableSequencing: true,
      enableLipSync: false,
      defaultEasing: 'cubic',
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化变形系统
    this.initialized = true;
    console.log('🎭 MorphManager initialized with config:', this.config);
    
    // 启动动画循环
    if (this.config.enableAnimation) {
      this.startAnimationLoop();
    }
  }

  dispose(): void {
    // 停止动画循环
    this.stopAnimationLoop();
    
    // 清理资源
    this.removeAllMorphs();
    this.targets.clear();
    this.sequences.clear();
    this.meshes.clear();
    this.activeAnimations.clear();
    
    this.initialized = false;
  }

  // 动画循环
  private startAnimationLoop(): void {
    if (this.animationFrameId !== null) return;
    
    const animate = (time: number) => {
      // 计算时间增量
      const deltaTime = this.lastUpdateTime === 0 ? 0 : (time - this.lastUpdateTime) / 1000;
      this.lastUpdateTime = time;
      
      // 更新所有活动动画
      this.updateAnimations(time, deltaTime);
      
      // 继续循环
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
    console.log('🎬 MorphManager animation loop started');
  }
  
  private stopAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      this.lastUpdateTime = 0;
      console.log('⏹️ MorphManager animation loop stopped');
    }
  }
  
  // 更新动画
  private updateAnimations(time: number, deltaTime: number): void {
    // 更新所有活动动画
    this.morphs.forEach((morph, id) => {
      if (morph.animation && morph.animation.isPlaying && this.activeAnimations.has(id)) {
        this.updateMorphAnimation(id, morph, time);
      }
    });
    
    // 更新所有序列
    this.sequences.forEach((sequence, id) => {
      if (sequence.autoplay) {
        this.updateSequence(id, sequence, time, deltaTime);
      }
    });
  }
  
  // 更新单个变形动画
  private updateMorphAnimation(id: string, morph: MorphInfo, currentTime: number): void {
    const animation = morph.animation!;
    if (!animation.startTime) {
      animation.startTime = currentTime;
    }
    
    // 计算进度
    const elapsed = currentTime - animation.startTime;
    let progress = Math.min(elapsed / animation.duration!, 1);
    
    // 应用缓动函数
    progress = this.applyEasing(progress, animation.easing || this.config.defaultEasing!);
    
    // 计算当前权重
    const currentWeight = animation.startValue! + (animation.targetValue! - animation.startValue!) * progress;
    
    // 更新权重
    this.setMorphWeight(id, currentWeight);
    
    // 检查是否完成
    if (progress >= 1) {
      // 处理循环
      if (animation.loop) {
        animation.startTime = currentTime;
        // 如果是 yoyo 模式，交换起始值和目标值
        if (animation.yoyo) {
          const temp = animation.startValue;
          animation.startValue = animation.targetValue;
          animation.targetValue = temp;
        }
      } else {
        // 完成动画
        animation.isPlaying = false;
        this.activeAnimations.delete(id);
        this.morphAnimationCompleted.emit(id);
        
        // 调用完成回调
        if (animation.onComplete) {
          animation.onComplete();
        }
      }
    }
  }
  
  // 更新序列
  private updateSequence(id: string, sequence: MorphSequence, time: number, deltaTime: number): void {
    // 待实现：序列动画更新逻辑
  }
  
  // 应用缓动函数
  private applyEasing(t: number, easingType: string): number {
    // 基本缓动函数
    switch (easingType) {
      case 'linear': return t;
      case 'quad': return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'cubic': return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      case 'quart': return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
      case 'quint': return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
      case 'sine': return -(Math.cos(Math.PI * t) - 1) / 2;
      case 'expo': return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
      case 'circ': return t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
      case 'elastic': {
        const c5 = (2 * Math.PI) / 4.5;
        return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
          ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
          : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
      }
      case 'bounce': {
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
      }
      case 'back': {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return t < 0.5
          ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
          : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
      }
      default: return t; // 默认线性
    }
  }

  // 注册网格
  registerMesh(id: string, mesh: THREE.Mesh): void {
    if (!mesh.morphTargetInfluences || mesh.morphTargetInfluences.length === 0) {
      console.warn(`Mesh ${id} does not have morph targets`);
      return;
    }
    
    this.meshes.set(id, mesh);
    
    // 自动注册所有变形目标
    if (mesh.morphTargetDictionary) {
      Object.entries(mesh.morphTargetDictionary).forEach(([name, index]) => {
        const targetId = `${id}_${name}`;
        const weight = mesh.morphTargetInfluences[index];
        
        this.registerMorphTarget(targetId, {
          name,
          index,
          weight,
          defaultWeight: weight,
          minWeight: 0,
          maxWeight: 1,
          isVisible: true
        });
      });
    }
    
    console.log(`🎭 Registered mesh ${id} with ${mesh.morphTargetInfluences.length} morph targets`);
  }
  
  // 注册变形目标
  registerMorphTarget(id: string, target: Partial<MorphTarget>): void {
    const fullTarget: MorphTarget = {
      name: target.name || id,
      index: target.index || 0,
      weight: target.weight !== undefined ? target.weight : 0,
      defaultWeight: target.defaultWeight !== undefined ? target.defaultWeight : 0,
      minWeight: target.minWeight !== undefined ? target.minWeight : 0,
      maxWeight: target.maxWeight !== undefined ? target.maxWeight : 1,
      category: target.category,
      isVisible: target.isVisible !== undefined ? target.isVisible : true,
      isMirrored: target.isMirrored || false,
      mirrorTarget: target.mirrorTarget
    };
    
    this.targets.set(id, fullTarget);
    this.morphTargetAdded.emit(fullTarget);
  }
  
  // 设置变形目标权重
  setMorphWeight(id: string, weight: number): void {
    const morph = this.morphs.get(id);
    if (morph) {
      // 更新变形信息
      if (morph.type === 'morphTarget') {
        (morph.config as any).weight = weight;
        this.morphUpdated.emit(morph);
      }
    }
    
    // 如果是目标ID，直接设置目标权重
    const target = this.targets.get(id);
    if (target) {
      // 限制权重范围
      target.weight = Math.max(target.minWeight, Math.min(target.maxWeight, weight));
      
      // 查找包含此目标的所有网格
      this.meshes.forEach((mesh, meshId) => {
        if (mesh.morphTargetDictionary && mesh.morphTargetDictionary[target.name] !== undefined) {
          const index = mesh.morphTargetDictionary[target.name];
          mesh.morphTargetInfluences![index] = target.weight;
        }
      });
      
      // 如果有镜像目标，也更新它
      if (target.isMirrored && target.mirrorTarget) {
        this.setMorphWeight(target.mirrorTarget, weight);
      }
    }
  }
  
  // 创建变形序列
  createMorphSequence(id: string, options: {
    name?: string;
    targets: string[];
    keyframes: Array<{
      time: number;
      weights: Record<string, number>;
      easing?: string;
    }>;
    duration?: number;
    loop?: boolean;
    yoyo?: boolean;
    autoplay?: boolean;
  }): MorphSequence {
    const sequence: MorphSequence = {
      id,
      name: options.name || id,
      targets: options.targets,
      keyframes: options.keyframes,
      duration: options.duration || 1.0,
      loop: options.loop !== undefined ? options.loop : false,
      yoyo: options.yoyo !== undefined ? options.yoyo : false,
      autoplay: options.autoplay !== undefined ? options.autoplay : false
    };
    
    this.sequences.set(id, sequence);
    
    // 如果设置了自动播放，触发序列开始信号
    if (sequence.autoplay) {
      this.morphSequenceStarted.emit(id);
    }
    
    return sequence;
  }
  
  // 播放变形序列
  playSequence(id: string, options?: {
    duration?: number;
    loop?: boolean;
    yoyo?: boolean;
  }): void {
    const sequence = this.sequences.get(id);
    if (!sequence) return;
    
    // 更新选项
    if (options) {
      if (options.duration !== undefined) sequence.duration = options.duration;
      if (options.loop !== undefined) sequence.loop = options.loop;
      if (options.yoyo !== undefined) sequence.yoyo = options.yoyo;
    }
    
    sequence.autoplay = true;
    this.morphSequenceStarted.emit(id);
  }
  
  // 停止变形序列
  stopSequence(id: string): void {
    const sequence = this.sequences.get(id);
    if (!sequence) return;
    
    sequence.autoplay = false;
  }
  
  // 创建变形目标动画
  animateMorphTarget(
    id: string,
    targetWeight: number,
    options?: {
      duration?: number;
      easing?: string;
      loop?: boolean;
      yoyo?: boolean;
      onComplete?: () => void;
    }
  ): void {
    // 获取当前权重
    let currentWeight = 0;
    const morph = this.morphs.get(id);
    const target = this.targets.get(id);
    
    if (morph && morph.type === 'morphTarget') {
      currentWeight = (morph.config as any).weight || 0;
    } else if (target) {
      currentWeight = target.weight;
    } else {
      console.warn(`Morph target ${id} not found`);
      return;
    }
    
    // 创建或更新动画配置
    if (!morph) {
      this.createMorphTarget(id, {
        weight: currentWeight
      });
    }
    
    const updatedMorph = this.morphs.get(id)!;
    
    // 设置动画参数
    updatedMorph.animation = {
      isPlaying: true,
      startTime: undefined, // 将在下一帧设置
      duration: options?.duration || 1.0,
      startValue: currentWeight,
      targetValue: targetWeight,
      easing: options?.easing || this.config.defaultEasing,
      loop: options?.loop || false,
      yoyo: options?.yoyo || false,
      onComplete: options?.onComplete
    };
    
    // 添加到活动动画
    this.activeAnimations.add(id);
    
    // 发送信号
    this.morphAnimationStarted.emit(id);
  }
  
  // 停止变形目标动画
  stopMorphAnimation(id: string): void {
    const morph = this.morphs.get(id);
    if (morph && morph.animation) {
      morph.animation.isPlaying = false;
      this.activeAnimations.delete(id);
    }
  }
  
  // 创建表情混合组
  createExpressionGroup(
    id: string,
    options: {
      targets: Record<string, number>;
      blendMode?: 'additive' | 'override' | 'multiply';
      priority?: number;
    }
  ): void {
    const morphInfo: MorphInfo = {
      id,
      type: 'expressionGroup',
      enabled: true,
      config: {
        targets: options.targets
      },
      blending: {
        influences: new Map(Object.entries(options.targets)),
        targets: Object.keys(options.targets),
        blendMode: options.blendMode || 'additive',
        priority: options.priority || 0
      }
    };
    
    this.morphs.set(id, morphInfo);
    this.morphAdded.emit(morphInfo);
    
    // 立即应用表情
    this.applyExpressionGroup(id);
  }
  
  // 应用表情混合组
  applyExpressionGroup(id: string): void {
    const morph = this.morphs.get(id);
    if (!morph || morph.type !== 'expressionGroup' || !morph.blending) return;
    
    const { influences, blendMode } = morph.blending;
    
    // 应用每个目标的权重
    influences!.forEach((weight, targetId) => {
      // 根据混合模式应用权重
      if (blendMode === 'override') {
        // 直接设置权重
        this.setMorphWeight(targetId, weight);
      } else if (blendMode === 'additive') {
        // 添加到当前权重
        const target = this.targets.get(targetId);
        const currentWeight = target ? target.weight : 0;
        this.setMorphWeight(targetId, currentWeight + weight);
      } else if (blendMode === 'multiply') {
        // 与当前权重相乘
        const target = this.targets.get(targetId);
        const currentWeight = target ? target.weight : 0;
        this.setMorphWeight(targetId, currentWeight * weight);
      }
    });
  }

  // 原有方法增强
  createMorphTarget(
    id: string,
    options?: {
      weight?: number;
      duration?: number;
      easing?: string;
      category?: string;
      minWeight?: number;
      maxWeight?: number;
    }
  ): void {
    const morphInfo: MorphInfo = {
      id,
      type: 'morphTarget',
      enabled: true,
      config: {
        weight: options?.weight ?? 0.0,
        duration: options?.duration ?? 1.0,
        easing: options?.easing ?? this.config.defaultEasing,
        category: options?.category,
        minWeight: options?.minWeight ?? 0.0,
        maxWeight: options?.maxWeight ?? 1.0
      }
    };

    this.morphs.set(id, morphInfo);
    this.morphAdded.emit(morphInfo);
    
    // 如果提供了初始权重，立即应用
    if (options?.weight !== undefined) {
      this.setMorphWeight(id, options.weight);
    }
  }

  createBlendShape(
    id: string,
    options?: {
      influence?: number;
      morphTargetIndex?: number;
      category?: string;
      mirrorBlendShape?: string;
    }
  ): void {
    const morphInfo: MorphInfo = {
      id,
      type: 'blendShape',
      enabled: true,
      config: {
        influence: options?.influence ?? 1.0,
        morphTargetIndex: options?.morphTargetIndex ?? 0,
        category: options?.category,
        mirrorBlendShape: options?.mirrorBlendShape
      }
    };

    this.morphs.set(id, morphInfo);
    this.morphAdded.emit(morphInfo);
    
    // 如果提供了镜像混合形状，建立关联
    if (options?.mirrorBlendShape) {
      // 注册为镜像目标
      this.registerMorphTarget(id, {
        name: id,
        index: options.morphTargetIndex || 0,
        weight: options.influence || 0,
        isMirrored: true,
        mirrorTarget: options.mirrorBlendShape
      });
    }
  }

  getMorph(id: string): MorphInfo | undefined {
    return this.morphs.get(id);
  }

  hasMorph(id: string): boolean {
    return this.morphs.has(id);
  }

  removeMorph(id: string): void {
    const morphInfo = this.morphs.get(id);
    if (morphInfo) {
      // 停止相关动画
      this.stopMorphAnimation(id);
      
      // 从活动动画中移除
      this.activeAnimations.delete(id);
      
      // 移除变形信息
      this.morphs.delete(id);
      this.morphRemoved.emit(id);
      
      // 如果是目标，也移除目标
      if (this.targets.has(id)) {
        this.targets.delete(id);
        this.morphTargetRemoved.emit(id);
      }
    }
  }

  setMorphEnabled(id: string, enabled: boolean): void {
    const morphInfo = this.morphs.get(id);
    if (morphInfo) {
      morphInfo.enabled = enabled;
      
      // 如果禁用，停止相关动画
      if (!enabled) {
        this.stopMorphAnimation(id);
      }
      
      this.morphUpdated.emit(morphInfo);
    }
  }

  updateMorph(
    id: string,
    config: unknown
  ): void {
    const morphInfo = this.morphs.get(id);
    if (morphInfo) {
      morphInfo.config = { ...morphInfo.config as object, ...config };
      this.morphUpdated.emit(morphInfo);
      
      // 如果更新了权重，应用它
      if (morphInfo.type === 'morphTarget' && (config as any).weight !== undefined) {
        this.setMorphWeight(id, (config as any).weight);
      }
    }
  }

  getAllMorphs(): MorphInfo[] {
    return Array.from(this.morphs.values());
  }

  getMorphsByType(type: string): MorphInfo[] {
    return Array.from(this.morphs.values()).filter(morph => morph.type === type);
  }

  getEnabledMorphs(): MorphInfo[] {
    return Array.from(this.morphs.values()).filter(morph => morph.enabled);
  }

  removeAllMorphs(): void {
    // 停止所有动画
    this.activeAnimations.clear();
    
    // 清理所有变形
    this.morphs.clear();
  }

  getConfig(): MorphConfig {
    return { ...this.config };
  }
  
  // 新增方法 - 获取所有变形目标
  getAllMorphTargets(): MorphTarget[] {
    return Array.from(this.targets.values());
  }
  
  // 新增方法 - 获取所有序列
  getAllSequences(): MorphSequence[] {
    return Array.from(this.sequences.values());
  }
  
  // 新增方法 - 重置所有变形目标到默认值
  resetAllMorphTargets(): void {
    this.targets.forEach((target, id) => {
      this.setMorphWeight(id, target.defaultWeight);
    });
  }
  
  // 新增方法 - 按类别获取变形目标
  getMorphTargetsByCategory(category: string): MorphTarget[] {
    return Array.from(this.targets.values()).filter(target => target.category === category);
  }
}