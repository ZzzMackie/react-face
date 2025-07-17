// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface ErrorConfig {
  enableErrorHandling?: boolean;
  enableErrorReporting?: boolean;
  maxErrorHistory?: number;
  errorTimeout?: number;
}

export interface ErrorInfo {
  id: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  stack?: string;
  timestamp: number;
  context?: unknown;
}

/**
 * 错误管理�?
 * 负责管理 Three.js 错误和异�?
 */
export class ErrorManager implements Manager {
  // Add test expected properties
  public readonly name = 'ErrorManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private errors: Map<string, ErrorInfo> = new Map();
  private config: ErrorConfig;
  private errorCount: number = 0;

  // 信号系统
  public readonly errorCaptured = createSignal<ErrorInfo | null>(null);
  public readonly errorResolved = createSignal<string | null>(null);
  public readonly errorCleared = createSignal<string | null>(null);

  constructor(engine: unknown, config: ErrorConfig = {}) {
    this.engine = engine;
    this.config = {
      enableErrorHandling: true,
      enableErrorReporting: true,
      maxErrorHistory: 100,
      errorTimeout: 5000,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.config.enableErrorHandling) {
      this.setupGlobalErrorHandling();
    this.initialized = true;}
  }

  dispose(): void {
    this.clearAllErrors();
  this.initialized = false;}

  private setupGlobalErrorHandling(): void {
    // 捕获全局错误
    window.addEventListener('error', (event) => {
      this.captureError('global', 'error', event.error?.message || event.message, event.error?.stack);
    });

    // 捕获未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError('promise', 'error', event.reason?.message || 'Unhandled Promise Rejection', event.reason?.stack);
    });
  }

  captureError(
    id: string,
    type: 'warning' | 'error' | 'critical',
    message: string,
    stack?: string,
    context?: unknown
  ): void {
    const errorInfo: ErrorInfo = {
      id,
      type,
      message,
      stack,
      timestamp: Date.now(),
      context
    };

    this.errors.set(id, errorInfo);
    this.errorCount++;

    // 限制错误历史数量
    if (this.errors.size > this.config.maxErrorHistory!) {
      const firstKey = this.errors.keys().next().value;
      this.errors.delete(firstKey);
    }

    this.errorCaptured.emit(errorInfo);

    // 自动清理旧错�?
    if (this.config.errorTimeout) {
      setTimeout(() => {
        this.clearError(id);
      }, this.config.errorTimeout);
    }
  }

  captureWarning(id: string, message: string, context?: unknown): void {
    this.captureError(id, 'warning', message, undefined, context);
  }

  captureCriticalError(id: string, message: string, stack?: string, context?: unknown): void {
    this.captureError(id, 'critical', message, stack, context);
  }

  getError(id: string): ErrorInfo | undefined {
    return this.errors.get(id);
  }

  hasError(id: string): boolean {
    return this.errors.has(id);
  }

  clearError(id: string): void {
    if (this.errors.has(id)) {
      this.errors.delete(id);
      this.errorResolved.emit(id);
    }
  }

  clearAllErrors(): void {
    this.errors.clear();
    this.errorCount = 0;
  }

  getErrorsByType(type: 'warning' | 'error' | 'critical'): ErrorInfo[] {
    return Array.from(this.errors.values()).filter(error => error.type === type);
  }

  getRecentErrors(count: number = 10): ErrorInfo[] {
    const sortedErrors = Array.from(this.errors.values())
      .sort((a, b) => b.timestamp - a.timestamp);
    return sortedErrors.slice(0, count);
  }

  getErrorCount(): number {
    return this.errorCount;
  }

  getActiveErrorCount(): number {
    return this.errors.size;
  }

  getAllErrors(): ErrorInfo[] {
    return Array.from(this.errors.values());
  }

  resolveError(id: string): void {
    this.clearError(id);
  }

  getErrorReport(): {
    totalErrors: number;
    activeErrors: number;
    errorsByType: { warning: number; error: number; critical: number };
    recentErrors: ErrorInfo[];
  } {
    const errors = this.getAllErrors();
    const errorsByType = {
      warning: errors.filter(e => e.type === 'warning').length,
      error: errors.filter(e => e.type === 'error').length,
      critical: errors.filter(e => e.type === 'critical').length
    };

    return {
      totalErrors: this.errorCount,
      activeErrors: this.errors.size,
      errorsByType,
      recentErrors: this.getRecentErrors(5)
    };
  }

  enableErrorHandling(enabled: boolean): void {
    this.config.enableErrorHandling = enabled;
  }

  setMaxErrorHistory(max: number): void {
    this.config.maxErrorHistory = max;
  }

  setErrorTimeout(timeout: number): void {
    this.config.errorTimeout = timeout;
  }

  getConfig(): ErrorConfig {
    return { ...this.config };
  }
}