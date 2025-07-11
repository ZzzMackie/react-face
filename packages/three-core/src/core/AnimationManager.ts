import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface AnimationConfig {
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
}

export interface AnimationClip {
  id: string;
  clip: THREE.AnimationClip;
  mixer: THREE.AnimationMixer;
  action: THREE.AnimationAction;
}

/**
 * 动画管理器
 * 负责管理 Three.js 动画
 */
export class AnimationManager implements Manager {
  private engine: unknown;
  private animations: Map<string, AnimationClip> = new Map();
  private mixers: THREE.AnimationMixer[] = [];
  private clock: THREE.Clock;
  private config: AnimationConfig;

  // 信号系统
  public readonly animationAdded = createSignal<AnimationClip | null>(null);
  public readonly animationRemoved = createSignal<string | null>(null);
  public readonly animationStarted = createSignal<string | null>(null);
  public readonly animationStopped = createSignal<string | null>(null);
  public readonly animationCompleted = createSignal<string | null>(null);

  constructor(engine: unknown, config: AnimationConfig = {}) {
    this.engine = engine;
    this.config = {
      autoPlay: true,
      loop: true,
      speed: 1.0,
      ...config
    };
    this.clock = new THREE.Clock();
  }

  async initialize(): Promise<void> {
    this.clock.start();
  }

  dispose(): void {
    this.stopAllAnimations();
    this.animations.clear();
    this.mixers = [];
  }

  addAnimation(
    id: string,
    object: THREE.Object3D,
    clip: THREE.AnimationClip
  ): void {
    const mixer = new THREE.AnimationMixer(object);
    const action = mixer.clipAction(clip);

    const animationClip: AnimationClip = {
      id,
      clip,
      mixer,
      action
    };

    this.animations.set(id, animationClip);
    this.mixers.push(mixer);

    if (this.config.autoPlay) {
      this.playAnimation(id);
    }

    this.animationAdded.emit(animationClip);
  }

  removeAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.action.stop();
      animation.mixer.stopAllAction();
      
      const mixerIndex = this.mixers.indexOf(animation.mixer);
      if (mixerIndex > -1) {
        this.mixers.splice(mixerIndex, 1);
      }

      this.animations.delete(id);
      this.animationRemoved.emit(id);
    }
  }

  playAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.action.play();
      animation.action.setLoop(THREE.LoopRepeat, Infinity);
      animation.action.timeScale = this.config.speed!;
      this.animationStarted.emit(id);
    }
  }

  stopAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.action.stop();
      this.animationStopped.emit(id);
    }
  }

  pauseAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.action.paused = true;
    }
  }

  resumeAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.action.paused = false;
    }
  }

  setAnimationSpeed(id: string, speed: number): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.action.timeScale = speed;
    }
  }

  setAnimationLoop(id: string, loop: boolean): void {
    const animation = this.animations.get(id);
    if (animation) {
      if (loop) {
        animation.action.setLoop(THREE.LoopRepeat, Infinity);
      } else {
        animation.action.setLoop(THREE.LoopOnce, 1);
      }
    }
  }

  update(): void {
    const deltaTime = this.clock.getDelta();

    this.mixers.forEach(mixer => {
      mixer.update(deltaTime);
    });

    this.animations.forEach((animation, id) => {
      if (animation.action.isRunning() && animation.action.time >= animation.clip.duration) {
        this.animationCompleted.emit(id);
      }
    });
  }

  getAnimation(id: string): AnimationClip | undefined {
    return this.animations.get(id);
  }

  hasAnimation(id: string): boolean {
    return this.animations.has(id);
  }

  getAllAnimations(): AnimationClip[] {
    return Array.from(this.animations.values());
  }

  playAllAnimations(): void {
    this.animations.forEach((animation, id) => {
      this.playAnimation(id);
    });
  }

  stopAllAnimations(): void {
    this.animations.forEach((animation, id) => {
      this.stopAnimation(id);
    });
  }

  pauseAllAnimations(): void {
    this.animations.forEach((animation) => {
      animation.action.paused = true;
    });
  }

  resumeAllAnimations(): void {
    this.animations.forEach((animation) => {
      animation.action.paused = false;
    });
  }
}