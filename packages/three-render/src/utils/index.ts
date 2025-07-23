import {
  Texture,
  Material,
  BufferGeometry,
  Object3D,
  Scene,
  Vector3,
  Quaternion,
  Euler,
  Color,
  Box3,
  Sphere
} from 'three';
import { Vector3Tuple, ColorValue } from '../types';

/**
 * 检查浏览器是否支持WebGPU
 * @returns Promise<boolean> 是否支持WebGPU
 */
export const isWebGPUSupported = async (): Promise<boolean> => {
  if (!navigator.gpu) {
    return false;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('WebGPU support check failed:', error);
    return false;
  }
};

/**
 * 释放Three.js对象及其子对象
 * @param object Three.js对象
 */
export const disposeObject = (object: Object3D): void => {
  // 遍历子对象
  object.traverse((child) => {
    // 释放几何体
    if ((child as any).geometry) {
      (child as any).geometry.dispose();
    }

    // 释放材质
    if ((child as any).material) {
      disposeMaterial((child as any).material);
    }
  });

  // 从父对象中移除
  if (object.parent) {
    object.parent.remove(object);
  }
};

/**
 * 释放材质及其纹理
 * @param material Three.js材质
 */
export const disposeMaterial = (material: Material | Material[]): void => {
  if (Array.isArray(material)) {
    // 处理材质数组
    material.forEach(disposeMaterial);
    return;
  }

  // 释放纹理
  Object.keys(material).forEach((key) => {
    const value = (material as any)[key];
    if (value && value.isTexture) {
      value.dispose();
    }
  });

  // 释放材质
  material.dispose();
};

/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: number | null = null;
  return (...args: Parameters<T>) => {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param limit 限制时间（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
};

/**
 * 简单对象池
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  /**
   * 创建对象池
   * @param createFn 创建对象的函数
   * @param resetFn 重置对象的函数
   * @param initialSize 初始大小
   * @param maxSize 最大大小
   */
  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize = 0,
    maxSize = 100
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;

    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  /**
   * 从对象池获取对象
   * @returns 对象
   */
  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop() as T;
    }
    return this.createFn();
  }

  /**
   * 将对象归还到对象池
   * @param obj 要归还的对象
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool = [];
  }

  /**
   * 获取对象池大小
   * @returns 对象池大小
   */
  size(): number {
    return this.pool.length;
  }
}

/**
 * 生成UUID
 * @returns UUID字符串
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 检测WebWorker支持
 * @returns 是否支持WebWorker
 */
export const isWebWorkerSupported = (): boolean => {
  return typeof Worker !== 'undefined';
};

/**
 * 检测WebAssembly支持
 * @returns 是否支持WebAssembly
 */
export const isWebAssemblySupported = (): boolean => {
  return typeof WebAssembly === 'object' && 
    typeof WebAssembly.compile === 'function' &&
    typeof WebAssembly.instantiate === 'function';
};

/**
 * 检测SharedArrayBuffer支持
 * @returns 是否支持SharedArrayBuffer
 */
export const isSharedArrayBufferSupported = (): boolean => {
  return typeof SharedArrayBuffer !== 'undefined';
};

/**
 * 获取设备性能级别（简单估计）
 * @returns 性能级别：'low' | 'medium' | 'high'
 */
export const getDevicePerformanceLevel = (): 'low' | 'medium' | 'high' => {
  // 检查硬件并发数
  const concurrency = navigator.hardwareConcurrency || 1;
  
  // 检查设备内存（如果可用）
  const memory = (navigator as any).deviceMemory || 4;
  
  if (concurrency >= 8 && memory >= 8) {
    return 'high';
  } else if (concurrency >= 4 && memory >= 4) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * 根据性能级别获取推荐的渲染质量设置
 * @param performanceLevel 性能级别
 * @returns 渲染质量设置
 */
export const getRenderQualitySettings = (performanceLevel: 'low' | 'medium' | 'high') => {
  switch (performanceLevel) {
    case 'high':
      return {
        shadows: true,
        shadowMapSize: 2048,
        antialias: true,
        physicallyCorrectLights: true,
        maxLights: 8,
        particleCount: 10000,
        textureSize: 2048,
        geometryDetail: 'high',
        postProcessing: true
      };
    case 'medium':
      return {
        shadows: true,
        shadowMapSize: 1024,
        antialias: true,
        physicallyCorrectLights: false,
        maxLights: 4,
        particleCount: 5000,
        textureSize: 1024,
        geometryDetail: 'medium',
        postProcessing: true
      };
    case 'low':
    default:
      return {
        shadows: false,
        shadowMapSize: 512,
        antialias: false,
        physicallyCorrectLights: false,
        maxLights: 2,
        particleCount: 1000,
        textureSize: 512,
        geometryDetail: 'low',
        postProcessing: false
      };
  }
};

/**
 * 将十六进制颜色转换为RGB数组
 * @param hex 十六进制颜色
 * @returns RGB数组 [r, g, b]，范围0-1
 */
export const hexToRgb = (hex: number): [number, number, number] => {
  const r = ((hex >> 16) & 255) / 255;
  const g = ((hex >> 8) & 255) / 255;
  const b = (hex & 255) / 255;
  return [r, g, b];
};

/**
 * 将RGB数组转换为十六进制颜色
 * @param rgb RGB数组 [r, g, b]，范围0-1
 * @returns 十六进制颜色
 */
export const rgbToHex = (rgb: [number, number, number]): number => {
  const r = Math.round(rgb[0] * 255);
  const g = Math.round(rgb[1] * 255);
  const b = Math.round(rgb[2] * 255);
  return (r << 16) + (g << 8) + b;
};

/**
 * 线性插值
 * @param a 起始值
 * @param b 结束值
 * @param t 插值因子（0-1）
 * @returns 插值结果
 */
export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

/**
 * 夹紧值到指定范围
 * @param value 要夹紧的值
 * @param min 最小值
 * @param max 最大值
 * @returns 夹紧后的值
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * 将角度从弧度转换为度
 * @param radians 弧度
 * @returns 度
 */
export const radiansToDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

/**
 * 将角度从度转换为弧度
 * @param degrees 度
 * @returns 弧度
 */
export const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * 将数组转换为Vector3
 * @param arr 数组[x, y, z]
 * @returns Vector3
 */
export function arrayToVector3(arr?: Vector3Tuple | number[]): Vector3 {
  if (!arr) return new Vector3();
  return new Vector3(arr[0], arr[1], arr[2]);
}

/**
 * 将数组转换为Quaternion
 * @param arr 数组[x, y, z, w]
 * @returns Quaternion
 */
export function arrayToQuaternion(arr?: [number, number, number, number]): Quaternion {
  if (!arr) return new Quaternion();
  return new Quaternion(arr[0], arr[1], arr[2], arr[3]);
}

/**
 * 将数组转换为Euler
 * @param arr 数组[x, y, z]
 * @returns Euler
 */
export function arrayToEuler(arr?: Vector3Tuple): Euler {
  if (!arr) return new Euler();
  return new Euler(arr[0], arr[1], arr[2]);
}

/**
 * 将颜色值转换为Color
 * @param color 颜色值
 * @returns Color
 */
export function toColor(color?: ColorValue): Color {
  return new Color(color);
}

/**
 * 计算对象的包围盒
 * @param object 对象
 * @returns 包围盒
 */
export function computeBoundingBox(object: Object3D): Box3 {
  const box = new Box3().setFromObject(object);
  return box;
}

/**
 * 计算对象的包围球
 * @param object 对象
 * @returns 包围球
 */
export function computeBoundingSphere(object: Object3D): Sphere {
  const box = computeBoundingBox(object);
  const sphere = new Sphere();
  box.getBoundingSphere(sphere);
  return sphere;
} 