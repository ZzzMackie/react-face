import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface AudioConfig {
  enableSpatialAudio?: boolean;
  defaultVolume?: number;
  defaultLoop?: boolean;
  listener?: THREE.AudioListener;
}

export interface AudioInfo {
  id: string;
  sound: THREE.Audio | THREE.PositionalAudio;
  type: 'audio' | 'positional';
  loaded: boolean;
  playing: boolean;
  volume: number;
  loop: boolean;
}

/**
 * 音频管理�?
 * 负责管理 Three.js 音频
 */
export class AudioManager implements Manager {
  // Add test expected properties
  public readonly name = 'AudioManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private sounds: Map<string, AudioInfo> = new Map();
  private listener: THREE.AudioListener;
  private config: AudioConfig;

  // 信号系统
  public readonly audioLoaded = createSignal<AudioInfo | null>(null);
  public readonly audioError = createSignal<{ id: string; error: Error } | null>(null);
  public readonly audioPlayed = createSignal<string | null>(null);
  public readonly audioStopped = createSignal<string | null>(null);
  public readonly audioPaused = createSignal<string | null>(null);

  constructor(engine: unknown, config: AudioConfig = {}) {
    this.engine = engine;
    this.config = {
      enableSpatialAudio: true,
      defaultVolume: 1.0,
      defaultLoop: false,
      ...config
    };
    this.listener = this.config.listener || new THREE.AudioListener();
  }

  async initialize(): Promise<void> {
    // 初始化音频系�?
  this.initialized = true;}

  dispose(): void {
    this.removeAllSounds();
  this.initialized = false;}

  async loadAudio(
    id: string,
    url: string,
    options?: {
      volume?: number;
      loop?: boolean;
      autoplay?: boolean;
    }
  ): Promise<THREE.Audio> {
    try {
      const sound = new THREE.Audio(this.listener);
      const audioLoader = new THREE.AudioLoader();

      const buffer = await new Promise<AudioBuffer>((resolve, reject) => {
        audioLoader.load(url, resolve, undefined, reject);
      });

      sound.setBuffer(buffer);
      sound.setVolume(options?.volume ?? this.config.defaultVolume!);
      sound.setLoop(options?.loop ?? this.config.defaultLoop!);

      const audioInfo: AudioInfo = {
        id,
        sound,
        type: 'audio',
        loaded: true,
        playing: false,
        volume: options?.volume ?? this.config.defaultVolume!,
        loop: options?.loop ?? this.config.defaultLoop!
      };

      this.sounds.set(id, audioInfo);
      this.audioLoaded.emit(audioInfo);

      if (options?.autoplay) {
        this.playAudio(id);
      }

      return sound;
    } catch (error) {
      const errorInfo = { id, error: error as Error };
      this.audioError.emit(errorInfo);
      throw error;
    }
  }

  async loadPositionalAudio(
    id: string,
    url: string,
    position: THREE.Vector3,
    options?: {
      volume?: number;
      loop?: boolean;
      autoplay?: boolean;
      refDistance?: number;
      rolloffFactor?: number;
      maxDistance?: number;
    }
  ): Promise<THREE.PositionalAudio> {
    try {
      const sound = new THREE.PositionalAudio(this.listener);
      const audioLoader = new THREE.AudioLoader();

      const buffer = await new Promise<AudioBuffer>((resolve, reject) => {
        audioLoader.load(url, resolve, undefined, reject);
      });

      sound.setBuffer(buffer);
      sound.setVolume(options?.volume ?? this.config.defaultVolume!);
      sound.setLoop(options?.loop ?? this.config.defaultLoop!);
      sound.setRefDistance(options?.refDistance ?? 1);
      sound.setRolloffFactor(options?.rolloffFactor ?? 1);
      sound.setMaxDistance(options?.maxDistance ?? 10000);
      sound.position.copy(position);

      const audioInfo: AudioInfo = {
        id,
        sound,
        type: 'positional',
        loaded: true,
        playing: false,
        volume: options?.volume ?? this.config.defaultVolume!,
        loop: options?.loop ?? this.config.defaultLoop!
      };

      this.sounds.set(id, audioInfo);
      this.audioLoaded.emit(audioInfo);

      if (options?.autoplay) {
        this.playAudio(id);
      }

      return sound;
    } catch (error) {
      const errorInfo = { id, error: error as Error };
      this.audioError.emit(errorInfo);
      throw error;
    }
  }

  getAudio(id: string): AudioInfo | undefined {
    return this.sounds.get(id);
  }

  hasAudio(id: string): boolean {
    return this.sounds.has(id);
  }

  removeAudio(id: string): void {
    const audioInfo = this.sounds.get(id);
    if (audioInfo) {
      audioInfo.sound.stop();
      this.sounds.delete(id);
    }
  }

  playAudio(id: string): void {
    const audioInfo = this.sounds.get(id);
    if (audioInfo && audioInfo.loaded) {
      audioInfo.sound.play();
      audioInfo.playing = true;
      this.audioPlayed.emit(id);
    }
  }

  stopAudio(id: string): void {
    const audioInfo = this.sounds.get(id);
    if (audioInfo) {
      audioInfo.sound.stop();
      audioInfo.playing = false;
      this.audioStopped.emit(id);
    }
  }

  pauseAudio(id: string): void {
    const audioInfo = this.sounds.get(id);
    if (audioInfo && audioInfo.playing) {
      audioInfo.sound.pause();
      audioInfo.playing = false;
      this.audioPaused.emit(id);
    }
  }

  setAudioVolume(id: string, volume: number): void {
    const audioInfo = this.sounds.get(id);
    if (audioInfo) {
      audioInfo.sound.setVolume(volume);
      audioInfo.volume = volume;
    }
  }

  setAudioLoop(id: string, loop: boolean): void {
    const audioInfo = this.sounds.get(id);
    if (audioInfo) {
      audioInfo.sound.setLoop(loop);
      audioInfo.loop = loop;
    }
  }

  setAudioPosition(id: string, position: THREE.Vector3): void {
    const audioInfo = this.sounds.get(id);
    if (audioInfo && audioInfo.type === 'positional') {
      (audioInfo.sound as THREE.PositionalAudio).position.copy(position);
    }
  }

  setListenerPosition(position: THREE.Vector3): void {
    this.listener.position.copy(position);
  }

  setListenerOrientation(forward: THREE.Vector3, up: THREE.Vector3): void {
    this.listener.setOrientation(
      forward.x, forward.y, forward.z,
      up.x, up.y, up.z
    );
  }

  getAllAudio(): AudioInfo[] {
    return Array.from(this.sounds.values());
  }

  getAudioByType(type: 'audio' | 'positional'): AudioInfo[] {
    return Array.from(this.sounds.values()).filter(audio => audio.type === type);
  }

  getPlayingAudio(): AudioInfo[] {
    return Array.from(this.sounds.values()).filter(audio => audio.playing);
  }

  getLoadedAudio(): AudioInfo[] {
    return Array.from(this.sounds.values()).filter(audio => audio.loaded);
  }

  removeAllSounds(): void {
    this.sounds.forEach(audioInfo => {
      audioInfo.sound.stop();
    });
    this.sounds.clear();
  }

  pauseAllAudio(): void {
    this.sounds.forEach(audioInfo => {
      if (audioInfo.playing) {
        audioInfo.sound.pause();
        audioInfo.playing = false;
      }
    });
  }

  resumeAllAudio(): void {
    this.sounds.forEach(audioInfo => {
      if (audioInfo.loaded && !audioInfo.playing) {
        audioInfo.sound.play();
        audioInfo.playing = true;
      }
    });
  }
}