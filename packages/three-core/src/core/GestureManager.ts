import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface GestureConfig {
  enableGestures?: boolean;
  enablePinch?: boolean;
  enableRotate?: boolean;
  enablePan?: boolean;
  enableTap?: boolean;
  enableDoubleTap?: boolean;
  enableLongPress?: boolean;
  enableSwipe?: boolean;
  minPinchDistance?: number;
  maxPinchDistance?: number;
  rotationFactor?: number;
  panFactor?: number;
  doubleTapTimeThreshold?: number; // ms
  longPressTimeThreshold?: number; // ms
  swipeVelocityThreshold?: number;
  swipeDistanceThreshold?: number;
}

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  velocityX: number;
  velocityY: number;
  timestamp: number;
  startTimestamp: number;
}

export interface GestureEvent {
  type: string;
  center: { x: number; y: number };
  target: EventTarget | null;
  originalEvent: TouchEvent | MouseEvent;
  pointerCount: number;
  deltaX?: number;
  deltaY?: number;
  scale?: number;
  rotation?: number;
  velocity?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
}

/**
 * 手势管理器
 * 负责处理触摸手势识别和交互
 */
export class GestureManager implements Manager {
  // Add test expected properties
  public readonly name = 'GestureManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private config: GestureConfig;
  private element: HTMLElement | null = null;
  private touchPoints: Map<number, TouchPoint> = new Map();
  private lastTapTime: number = 0;
  private longPressTimer: number | null = null;
  private isLongPressing: boolean = false;
  private isPinching: boolean = false;
  private isRotating: boolean = false;
  private isPanning: boolean = false;
  private lastPinchDistance: number = 0;
  private lastRotation: number = 0;
  private enabled: boolean = true;

  // 信号系统
  public readonly tap = createSignal<GestureEvent | null>(null);
  public readonly doubleTap = createSignal<GestureEvent | null>(null);
  public readonly longPress = createSignal<GestureEvent | null>(null);
  public readonly longPressEnd = createSignal<GestureEvent | null>(null);
  public readonly pinchStart = createSignal<GestureEvent | null>(null);
  public readonly pinchMove = createSignal<GestureEvent | null>(null);
  public readonly pinchEnd = createSignal<GestureEvent | null>(null);
  public readonly rotateStart = createSignal<GestureEvent | null>(null);
  public readonly rotateMove = createSignal<GestureEvent | null>(null);
  public readonly rotateEnd = createSignal<GestureEvent | null>(null);
  public readonly panStart = createSignal<GestureEvent | null>(null);
  public readonly panMove = createSignal<GestureEvent | null>(null);
  public readonly panEnd = createSignal<GestureEvent | null>(null);
  public readonly swipe = createSignal<GestureEvent | null>(null);

  constructor(engine: unknown, config: GestureConfig = {}) {
    this.engine = engine;
    this.config = {
      enableGestures: true,
      enablePinch: true,
      enableRotate: true,
      enablePan: true,
      enableTap: true,
      enableDoubleTap: true,
      enableLongPress: true,
      enableSwipe: true,
      minPinchDistance: 1,
      maxPinchDistance: 1000,
      rotationFactor: 1.0,
      panFactor: 1.0,
      doubleTapTimeThreshold: 300,
      longPressTimeThreshold: 500,
      swipeVelocityThreshold: 0.3,
      swipeDistanceThreshold: 10,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化手势系统
    this.initialized = true;
    
    // 获取渲染器的DOM元素
    const renderManager = (this.engine as any).getManager?.('renderer');
    if (renderManager && renderManager.getRenderer) {
      const renderer = renderManager.getRenderer();
      if (renderer && renderer.domElement) {
        this.element = renderer.domElement;
        this.attachEventListeners();
        console.log('🖐️ GestureManager initialized on renderer DOM element');
      }
    }
    
    // 如果没有找到渲染器DOM元素，尝试使用配置中的容器
    if (!this.element && (this.engine as any).config?.container) {
      this.element = (this.engine as any).config.container;
      this.attachEventListeners();
      console.log('🖐️ GestureManager initialized on container element');
    }
    
    if (!this.element) {
      console.warn('⚠️ GestureManager: No DOM element found for gesture recognition');
    }
  }

  dispose(): void {
    // 清理事件监听器
    this.detachEventListeners();
    
    // 清理数据
    this.touchPoints.clear();
    this.cancelLongPressTimer();
    
    this.initialized = false;
  }

  // 附加事件监听器
  private attachEventListeners(): void {
    if (!this.element) return;
    
    // 触摸事件
    this.element.addEventListener('touchstart', this.handleTouchStart);
    this.element.addEventListener('touchmove', this.handleTouchMove);
    this.element.addEventListener('touchend', this.handleTouchEnd);
    this.element.addEventListener('touchcancel', this.handleTouchEnd);
    
    // 鼠标事件（用于桌面设备）
    this.element.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    
    console.log('🖐️ Gesture event listeners attached');
  }

  // 移除事件监听器
  private detachEventListeners(): void {
    if (!this.element) return;
    
    // 触摸事件
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchEnd);
    
    // 鼠标事件
    this.element.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    
    console.log('🖐️ Gesture event listeners detached');
  }

  // 触摸开始处理
  private handleTouchStart = (event: TouchEvent): void => {
    if (!this.enabled || !this.config.enableGestures) return;
    
    // 阻止默认行为（如滚动）
    event.preventDefault();
    
    // 记录新的触摸点
    const touches = event.changedTouches;
    const now = performance.now();
    
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      this.touchPoints.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        lastY: touch.clientY,
        velocityX: 0,
        velocityY: 0,
        timestamp: now,
        startTimestamp: now
      });
    }
    
    // 处理长按
    if (this.config.enableLongPress && this.touchPoints.size === 1) {
      this.startLongPressTimer(event);
    } else {
      this.cancelLongPressTimer();
    }
    
    // 处理多点触摸手势开始
    if (this.touchPoints.size === 2) {
      const points = Array.from(this.touchPoints.values());
      
      // 计算初始距离和角度，用于缩放和旋转
      const initialDistance = this.getDistance(points[0], points[1]);
      this.lastPinchDistance = initialDistance;
      
      const initialAngle = this.getAngle(points[0], points[1]);
      this.lastRotation = initialAngle;
      
      // 触发手势开始事件
      if (this.config.enablePinch) {
        this.isPinching = true;
        this.pinchStart.emit(this.createGestureEvent('pinchstart', event, {
          scale: 1,
          distance: initialDistance
        }));
      }
      
      if (this.config.enableRotate) {
        this.isRotating = true;
        this.rotateStart.emit(this.createGestureEvent('rotatestart', event, {
          rotation: 0
        }));
      }
    } else if (this.touchPoints.size === 1) {
      // 单点触摸，可能是平移开始
      if (this.config.enablePan) {
        this.isPanning = true;
        this.panStart.emit(this.createGestureEvent('panstart', event));
      }
    }
  };

  // 触摸移动处理
  private handleTouchMove = (event: TouchEvent): void => {
    if (!this.enabled || !this.config.enableGestures) return;
    
    // 阻止默认行为
    event.preventDefault();
    
    // 更新触摸点位置
    const touches = event.changedTouches;
    const now = performance.now();
    
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const point = this.touchPoints.get(touch.identifier);
      
      if (point) {
        // 计算速度
        const deltaTime = now - point.timestamp;
        if (deltaTime > 0) {
          point.velocityX = (touch.clientX - point.x) / deltaTime;
          point.velocityY = (touch.clientY - point.y) / deltaTime;
        }
        
        // 更新位置
        point.lastX = point.x;
        point.lastY = point.y;
        point.x = touch.clientX;
        point.y = touch.clientY;
        point.timestamp = now;
        
        // 如果移动距离足够大，取消长按
        const dx = point.x - point.startX;
        const dy = point.y - point.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
          this.cancelLongPressTimer();
        }
      }
    }
    
    // 处理多点触摸手势移动
    if (this.touchPoints.size === 2) {
      const points = Array.from(this.touchPoints.values());
      
      // 处理缩放
      if (this.config.enablePinch && this.isPinching) {
        const currentDistance = this.getDistance(points[0], points[1]);
        const scale = currentDistance / this.lastPinchDistance;
        
        this.pinchMove.emit(this.createGestureEvent('pinchmove', event, {
          scale: scale,
          distance: currentDistance
        }));
        
        this.lastPinchDistance = currentDistance;
      }
      
      // 处理旋转
      if (this.config.enableRotate && this.isRotating) {
        const currentAngle = this.getAngle(points[0], points[1]);
        let rotation = currentAngle - this.lastRotation;
        
        // 标准化旋转角度到 -180 到 180 之间
        if (rotation > 180) rotation -= 360;
        if (rotation < -180) rotation += 360;
        
        // 应用旋转因子
        rotation *= this.config.rotationFactor!;
        
        this.rotateMove.emit(this.createGestureEvent('rotatemove', event, {
          rotation: rotation
        }));
        
        this.lastRotation = currentAngle;
      }
    } else if (this.touchPoints.size === 1 && this.isPanning) {
      // 单点触摸，处理平移
      if (this.config.enablePan) {
        const point = Array.from(this.touchPoints.values())[0];
        const deltaX = (point.x - point.lastX) * this.config.panFactor!;
        const deltaY = (point.y - point.lastY) * this.config.panFactor!;
        
        this.panMove.emit(this.createGestureEvent('panmove', event, {
          deltaX: deltaX,
          deltaY: deltaY
        }));
      }
    }
  };

  // 触摸结束处理
  private handleTouchEnd = (event: TouchEvent): void => {
    if (!this.enabled) return;
    
    // 获取结束的触摸点
    const touches = event.changedTouches;
    const now = performance.now();
    
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const point = this.touchPoints.get(touch.identifier);
      
      if (point) {
        // 处理单点触摸结束
        if (this.touchPoints.size === 1) {
          // 检查是否是轻触
          const touchDuration = now - point.startTimestamp;
          const dx = touch.clientX - point.startX;
          const dy = touch.clientY - point.startY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // 处理轻触 (tap)
          if (this.config.enableTap && distance < 10 && touchDuration < 300 && !this.isLongPressing) {
            const tapEvent = this.createGestureEvent('tap', event);
            this.tap.emit(tapEvent);
            
            // 检查是否是双击
            if (this.config.enableDoubleTap && now - this.lastTapTime < this.config.doubleTapTimeThreshold!) {
              this.doubleTap.emit(this.createGestureEvent('doubletap', event));
            }
            
            this.lastTapTime = now;
          }
          
          // 处理滑动 (swipe)
          if (this.config.enableSwipe) {
            const velocity = Math.sqrt(point.velocityX * point.velocityX + point.velocityY * point.velocityY);
            
            if (velocity > this.config.swipeVelocityThreshold! && distance > this.config.swipeDistanceThreshold!) {
              // 确定滑动方向
              let direction: 'up' | 'down' | 'left' | 'right';
              
              if (Math.abs(dx) > Math.abs(dy)) {
                direction = dx > 0 ? 'right' : 'left';
              } else {
                direction = dy > 0 ? 'down' : 'up';
              }
              
              this.swipe.emit(this.createGestureEvent('swipe', event, {
                velocity: velocity,
                direction: direction,
                distance: distance
              }));
            }
          }
          
          // 处理平移结束
          if (this.isPanning && this.config.enablePan) {
            this.panEnd.emit(this.createGestureEvent('panend', event));
            this.isPanning = false;
          }
        }
        
        // 移除触摸点
        this.touchPoints.delete(touch.identifier);
      }
    }
    
    // 处理长按结束
    if (this.isLongPressing) {
      this.longPressEnd.emit(this.createGestureEvent('longpressend', event));
      this.isLongPressing = false;
    }
    
    // 取消长按计时器
    this.cancelLongPressTimer();
    
    // 处理多点触摸手势结束
    if (this.touchPoints.size < 2) {
      if (this.isPinching) {
        this.pinchEnd.emit(this.createGestureEvent('pinchend', event));
        this.isPinching = false;
      }
      
      if (this.isRotating) {
        this.rotateEnd.emit(this.createGestureEvent('rotateend', event));
        this.isRotating = false;
      }
    }
  };

  // 鼠标按下处理（模拟触摸）
  private handleMouseDown = (event: MouseEvent): void => {
    if (!this.enabled || !this.config.enableGestures) return;
    
    // 清除所有触摸点（确保没有残留的触摸点）
    this.touchPoints.clear();
    
    // 添加鼠标作为触摸点
    const now = performance.now();
    this.touchPoints.set(0, {
      id: 0,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      velocityX: 0,
      velocityY: 0,
      timestamp: now,
      startTimestamp: now
    });
    
    // 处理长按
    if (this.config.enableLongPress) {
      this.startLongPressTimer(event);
    }
    
    // 处理平移开始
    if (this.config.enablePan) {
      this.isPanning = true;
      this.panStart.emit(this.createGestureEvent('panstart', event));
    }
  };

  // 鼠标移动处理
  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.enabled || !this.config.enableGestures || this.touchPoints.size === 0) return;
    
    const point = this.touchPoints.get(0);
    if (!point) return;
    
    const now = performance.now();
    
    // 计算速度
    const deltaTime = now - point.timestamp;
    if (deltaTime > 0) {
      point.velocityX = (event.clientX - point.x) / deltaTime;
      point.velocityY = (event.clientY - point.y) / deltaTime;
    }
    
    // 更新位置
    point.lastX = point.x;
    point.lastY = point.y;
    point.x = event.clientX;
    point.y = event.clientY;
    point.timestamp = now;
    
    // 如果移动距离足够大，取消长按
    const dx = point.x - point.startX;
    const dy = point.y - point.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 10) {
      this.cancelLongPressTimer();
    }
    
    // 处理平移
    if (this.isPanning && this.config.enablePan) {
      const deltaX = (point.x - point.lastX) * this.config.panFactor!;
      const deltaY = (point.y - point.lastY) * this.config.panFactor!;
      
      this.panMove.emit(this.createGestureEvent('panmove', event, {
        deltaX: deltaX,
        deltaY: deltaY
      }));
    }
  };

  // 鼠标抬起处理
  private handleMouseUp = (event: MouseEvent): void => {
    if (!this.enabled || this.touchPoints.size === 0) return;
    
    const point = this.touchPoints.get(0);
    if (!point) return;
    
    const now = performance.now();
    
    // 处理轻触 (tap)
    const touchDuration = now - point.startTimestamp;
    const dx = event.clientX - point.startX;
    const dy = event.clientY - point.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (this.config.enableTap && distance < 10 && touchDuration < 300 && !this.isLongPressing) {
      const tapEvent = this.createGestureEvent('tap', event);
      this.tap.emit(tapEvent);
      
      // 检查是否是双击
      if (this.config.enableDoubleTap && now - this.lastTapTime < this.config.doubleTapTimeThreshold!) {
        this.doubleTap.emit(this.createGestureEvent('doubletap', event));
      }
      
      this.lastTapTime = now;
    }
    
    // 处理滑动 (swipe)
    if (this.config.enableSwipe) {
      const velocity = Math.sqrt(point.velocityX * point.velocityX + point.velocityY * point.velocityY);
      
      if (velocity > this.config.swipeVelocityThreshold! && distance > this.config.swipeDistanceThreshold!) {
        // 确定滑动方向
        let direction: 'up' | 'down' | 'left' | 'right';
        
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }
        
        this.swipe.emit(this.createGestureEvent('swipe', event, {
          velocity: velocity,
          direction: direction,
          distance: distance
        }));
      }
    }
    
    // 处理平移结束
    if (this.isPanning && this.config.enablePan) {
      this.panEnd.emit(this.createGestureEvent('panend', event));
      this.isPanning = false;
    }
    
    // 处理长按结束
    if (this.isLongPressing) {
      this.longPressEnd.emit(this.createGestureEvent('longpressend', event));
      this.isLongPressing = false;
    }
    
    // 清理
    this.touchPoints.clear();
    this.cancelLongPressTimer();
  };

  // 启动长按计时器
  private startLongPressTimer(event: TouchEvent | MouseEvent): void {
    this.cancelLongPressTimer();
    
    this.longPressTimer = window.setTimeout(() => {
      if (this.touchPoints.size > 0) {
        this.isLongPressing = true;
        this.longPress.emit(this.createGestureEvent('longpress', event));
      }
    }, this.config.longPressTimeThreshold);
  }

  // 取消长按计时器
  private cancelLongPressTimer(): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  // 计算两点之间的距离
  private getDistance(p1: TouchPoint, p2: TouchPoint): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 计算两点之间的角度（弧度）
  private getAngle(p1: TouchPoint, p2: TouchPoint): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  // 创建手势事件对象
  private createGestureEvent(type: string, originalEvent: TouchEvent | MouseEvent, additionalProps: any = {}): GestureEvent {
    // 计算中心点
    let centerX = 0;
    let centerY = 0;
    const points = Array.from(this.touchPoints.values());
    
    for (const point of points) {
      centerX += point.x;
      centerY += point.y;
    }
    
    centerX /= points.length;
    centerY /= points.length;
    
    // 创建基本事件对象
    const gestureEvent: GestureEvent = {
      type,
      center: { x: centerX, y: centerY },
      target: originalEvent.target,
      originalEvent,
      pointerCount: this.touchPoints.size,
      ...additionalProps
    };
    
    return gestureEvent;
  }

  // 公共方法 - 启用/禁用手势识别
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  // 公共方法 - 获取是否启用
  public isEnabled(): boolean {
    return this.enabled;
  }

  // 公共方法 - 更新配置
  public updateConfig(config: Partial<GestureConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 公共方法 - 获取配置
  public getConfig(): GestureConfig {
    return { ...this.config };
  }
} 