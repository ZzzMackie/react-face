import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface EventConfig {
  enableMouseEvents?: boolean;
  enableKeyboardEvents?: boolean;
  enableTouchEvents?: boolean;
  enableWheelEvents?: boolean;
}

export interface EventHandler {
  id: string;
  type: string;
  handler: (event: Event) => void;
  target?: EventTarget;
  options?: AddEventListenerOptions;
}

/**
 * 事件管理�?
 * 负责管理 DOM 事件和自定义事件
 */
export class EventManager implements Manager {
  private engine: unknown;
  private handlers: Map<string, EventHandler> = new Map();
  private config: EventConfig;

  // 信号系统
  public readonly eventRegistered = createSignal<EventHandler | null>(null);
  public readonly eventUnregistered = createSignal<string | null>(null);
  public readonly eventTriggered = createSignal<{ type: string; data: unknown } | null>(null);

  constructor(engine: unknown, config: EventConfig = {}) {
    this.engine = engine;
    this.config = {
      enableMouseEvents: true,
      enableKeyboardEvents: true,
      enableTouchEvents: true,
      enableWheelEvents: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    // 初始化事件系�?
  }

  dispose(): void {
    this.removeAllHandlers();
  }

  addHandler(
    id: string,
    type: string,
    handler: (event: Event) => void,
    target?: EventTarget,
    options?: AddEventListenerOptions
  ): void {
    const eventHandler: EventHandler = {
      id,
      type,
      handler,
      target,
      options
    };

    this.handlers.set(id, eventHandler);

    if (target) {
      target.addEventListener(type, handler, options);
    }

    this.eventRegistered.emit(eventHandler);
  }

  removeHandler(id: string): void {
    const handler = this.handlers.get(id);
    if (handler) {
      if (handler.target) {
        handler.target.removeEventListener(handler.type, handler.handler, handler.options);
      }
      this.handlers.delete(id);
      this.eventUnregistered.emit(id);
    }
  }

  removeAllHandlers(): void {
    this.handlers.forEach(handler => {
      if (handler.target) {
        handler.target.removeEventListener(handler.type, handler.handler, handler.options);
      }
    });
    this.handlers.clear();
  }

  getHandler(id: string): EventHandler | undefined {
    return this.handlers.get(id);
  }

  hasHandler(id: string): boolean {
    return this.handlers.has(id);
  }

  getHandlersByType(type: string): EventHandler[] {
    return Array.from(this.handlers.values()).filter(handler => handler.type === type);
  }

  triggerEvent(type: string, data: unknown = null): void {
    this.eventTriggered.emit({ type, data });
  }

  addMouseHandler(
    id: string,
    type: 'click' | 'dblclick' | 'mousedown' | 'mouseup' | 'mousemove' | 'mouseenter' | 'mouseleave',
    handler: (event: MouseEvent) => void,
    target?: EventTarget,
    options?: AddEventListenerOptions
  ): void {
    this.addHandler(id, type, handler as (event: Event) => void, target, options);
  }

  addKeyboardHandler(
    id: string,
    type: 'keydown' | 'keyup' | 'keypress',
    handler: (event: KeyboardEvent) => void,
    target?: EventTarget,
    options?: AddEventListenerOptions
  ): void {
    this.addHandler(id, type, handler as (event: Event) => void, target, options);
  }

  addTouchHandler(
    id: string,
    type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
    handler: (event: TouchEvent) => void,
    target?: EventTarget,
    options?: AddEventListenerOptions
  ): void {
    this.addHandler(id, type, handler as (event: Event) => void, target, options);
  }

  addWheelHandler(
    id: string,
    handler: (event: WheelEvent) => void,
    target?: EventTarget,
    options?: AddEventListenerOptions
  ): void {
    this.addHandler(id, 'wheel', handler as (event: Event) => void, target, options);
  }
}
