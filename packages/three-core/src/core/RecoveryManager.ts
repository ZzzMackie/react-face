import * as THREE from 'three';
import type { Manager } from '@react-face/shared-types';
import { createSignal } from './Signal';

export interface ErrorContext {
  manager: string;
  operation: string;
  timestamp: number;
  error: Error;
  stack?: string;
}

export interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'ignore' | 'restart';
  maxRetries?: number;
  retryDelay?: number;
  fallbackAction?: string;
}

export interface RecoveryConfig {
  enabled?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  autoRecovery?: boolean;
  logToConsole?: boolean;
  strategies?: Map<string, RecoveryStrategy>;
}

export interface RecoveryResult {
  success: boolean;
  strategy: string;
  retries: number;
  error?: Error;
  recovered: boolean;
}

export class RecoveryManager implements Manager {
  private engine: any;
  private config: RecoveryConfig;
  private errorHistory: ErrorContext[] = [];
  private recoveryHistory: RecoveryResult[] = [];
  private retryCounts: Map<string, number> = new Map();

  // 信号
  public readonly errorOccurred = createSignal<ErrorContext | null>(null);
  public readonly recoveryAttempted = createSignal<RecoveryResult | null>(null);
  public readonly recoverySucceeded = createSignal<string>('');
  public readonly recoveryFailed = createSignal<ErrorContext | null>(null);
  public readonly systemStabilized = createSignal<void>(undefined);

  constructor(engine: any, config: RecoveryConfig = {}) {
    this.engine = engine;
    this.config = {
      enabled: true,
      maxRetries: 3,
      retryDelay: 1000,
      autoRecovery: true,
      logToConsole: false,
      strategies: new Map(),
      ...config
    };

    this.setupDefaultStrategies();
  }

  async initialize(): Promise<void> {
    console.log('🔄 RecoveryManager initialized');
    
    if (this.config.enabled) {
      this.setupErrorHandling();
    }
  }

  dispose(): void {
    this.errorHistory = [];
    this.recoveryHistory = [];
    this.retryCounts.clear();
    // Signal不需要手动dispose，会自动清理
  }

  // 设置默认恢复策略
  private setupDefaultStrategies(): void {
    const strategies = this.config.strategies!;

    // 渲染错误策略
    strategies.set('render', {
      type: 'retry',
      maxRetries: 2,
      retryDelay: 100
    });

    // 加载错误策略
    strategies.set('load', {
      type: 'retry',
      maxRetries: 3,
      retryDelay: 2000
    });

    // 内存错误策略
    strategies.set('memory', {
      type: 'fallback',
      fallbackAction: 'cleanup'
    });

    // 管理器错误策略
    strategies.set('manager', {
      type: 'restart',
      maxRetries: 1,
      retryDelay: 5000
    });
  }

  // 设置错误处理
  private setupErrorHandling(): void {
    // 监听全局错误
    window.addEventListener('error', (event) => {
      this.handleError('global', 'runtime', event.error);
    });

    // 监听未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError('global', 'promise', event.reason);
    });

    // 监听WebGL上下文丢失
    const renderer = this.engine.getManager('renderer')?.instance?.renderer;
    if (renderer) {
      renderer.domElement.addEventListener('webglcontextlost', (event) => {
        this.handleError('renderer', 'context_lost', new Error('WebGL context lost'));
      });
    }
  }

  // 处理错误
  handleError(manager: string, operation: string, error: Error): void {
    const errorContext: ErrorContext = {
      manager,
      operation,
      timestamp: Date.now(),
      error,
      stack: error.stack
    };

    this.errorHistory.push(errorContext);
    
    // 限制历史记录数量
    if (this.errorHistory.length > 100) {
      this.errorHistory.shift();
    }

    this.errorOccurred.emit(errorContext);

    if (this.config.logToConsole) {
      console.error('❌ Error occurred:', errorContext);
    }

    // 自动恢复
    if (this.config.autoRecovery) {
      this.attemptRecovery(errorContext);
    }
  }

  // 尝试恢复
  async attemptRecovery(errorContext: ErrorContext): Promise<RecoveryResult> {
    const strategy = this.getStrategy(errorContext.manager, errorContext.operation);
    const retryKey = `${errorContext.manager}_${errorContext.operation}`;
    const currentRetries = this.retryCounts.get(retryKey) || 0;

    const result: RecoveryResult = {
      success: false,
      strategy: strategy.type,
      retries: currentRetries,
      error: errorContext.error,
      recovered: false
    };

    try {
      switch (strategy.type) {
        case 'retry':
          result.recovered = await this.retryOperation(errorContext, strategy);
          break;
        case 'fallback':
          result.recovered = await this.fallbackOperation(errorContext, strategy);
          break;
        case 'restart':
          result.recovered = await this.restartManager(errorContext, strategy);
          break;
        case 'ignore':
          result.recovered = true; // 忽略错误
          break;
      }

      if (result.recovered) {
        this.retryCounts.delete(retryKey);
        this.recoverySucceeded.emit(`${errorContext.manager}.${errorContext.operation}`);
      } else {
        this.retryCounts.set(retryKey, currentRetries + 1);
        this.recoveryFailed.emit(errorContext);
      }

    } catch (recoveryError) {
      result.error = recoveryError as Error;
      this.recoveryFailed.emit(errorContext);
    }

    this.recoveryHistory.push(result);
    this.recoveryAttempted.emit(result);

    if (this.config.logToConsole) {
      if (result.recovered) {
        console.log('✅ Recovery succeeded:', result);
      } else {
        console.error('❌ Recovery failed:', result);
      }
    }

    return result;
  }

  // 重试操作
  private async retryOperation(errorContext: ErrorContext, strategy: RecoveryStrategy): Promise<boolean> {
    const maxRetries = strategy.maxRetries || this.config.maxRetries!;
    const retryKey = `${errorContext.manager}_${errorContext.operation}`;
    const currentRetries = this.retryCounts.get(retryKey) || 0;

    if (currentRetries >= maxRetries) {
      return false;
    }

    // 等待重试延迟
    await this.delay(strategy.retryDelay || this.config.retryDelay!);

    try {
      // 根据操作类型执行重试
      switch (errorContext.operation) {
        case 'render':
          return await this.retryRender();
        case 'load':
          return await this.retryLoad(errorContext);
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  // 回退操作
  private async fallbackOperation(errorContext: ErrorContext, strategy: RecoveryStrategy): Promise<boolean> {
    const fallbackAction = strategy.fallbackAction;
    
    switch (fallbackAction) {
      case 'cleanup':
        return await this.cleanupResources();
      case 'reset':
        return await this.resetManager(errorContext.manager);
      case 'disable':
        return await this.disableManager(errorContext.manager);
      default:
        return false;
    }
  }

  // 重启管理器
  private async restartManager(errorContext: ErrorContext, strategy: RecoveryStrategy): Promise<boolean> {
    try {
      const manager = this.engine.getManager(errorContext.manager);
      if (manager) {
        // 销毁管理器
        manager.dispose();
        
        // 等待重启延迟
        await this.delay(strategy.retryDelay || this.config.retryDelay!);
        
        // 重新初始化管理器
        await manager.initialize();
        
        return true;
      }
    } catch (error) {
      console.error('Failed to restart manager:', error);
    }
    
    return false;
  }

  // 重试渲染
  private async retryRender(): Promise<boolean> {
    try {
      const renderManager = this.engine.getManager('renderer');
      if (renderManager) {
        // 尝试重新渲染
        renderManager.render();
        return true;
      }
    } catch (error) {
      console.error('Render retry failed:', error);
    }
    
    return false;
  }

  // 重试加载
  private async retryLoad(errorContext: ErrorContext): Promise<boolean> {
    try {
      const loaderManager = this.engine.getManager('loader');
      if (loaderManager) {
        // 这里需要根据具体错误上下文来重试加载
        // 暂时返回false，需要更具体的实现
        return false;
      }
    } catch (error) {
      console.error('Load retry failed:', error);
    }
    
    return false;
  }

  // 清理资源
  private async cleanupResources(): Promise<boolean> {
    try {
      const memoryManager = this.engine.getManager('memory');
      if (memoryManager) {
        const result = memoryManager.forceCleanup();
        return result.cleaned > 0;
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
    
    return false;
  }

  // 重置管理器
  private async resetManager(managerName: string): Promise<boolean> {
    try {
      const manager = this.engine.getManager(managerName);
      if (manager) {
        manager.dispose();
        await manager.initialize();
        return true;
      }
    } catch (error) {
      console.error('Reset manager failed:', error);
    }
    
    return false;
  }

  // 禁用管理器
  private async disableManager(managerName: string): Promise<boolean> {
    try {
      const manager = this.engine.getManager(managerName);
      if (manager) {
        manager.dispose();
        return true;
      }
    } catch (error) {
      console.error('Disable manager failed:', error);
    }
    
    return false;
  }

  // 获取策略
  private getStrategy(manager: string, operation: string): RecoveryStrategy {
    const strategies = this.config.strategies!;
    
    // 尝试获取特定操作策略
    const specificStrategy = strategies.get(`${manager}_${operation}`);
    if (specificStrategy) {
      return specificStrategy;
    }
    
    // 尝试获取管理器策略
    const managerStrategy = strategies.get(manager);
    if (managerStrategy) {
      return managerStrategy;
    }
    
    // 默认策略
    return {
      type: 'ignore',
      maxRetries: 0
    };
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 检查系统稳定性
  checkSystemStability(): boolean {
    const recentErrors = this.errorHistory.filter(
      error => Date.now() - error.timestamp < 60000 // 最近1分钟的错误
    );
    
    const recentRecoveries = this.recoveryHistory.filter(
      recovery => Date.now() - recovery.timestamp < 60000
    );
    
    // 如果错误率过高，系统不稳定
    if (recentErrors.length > 10) {
      return false;
    }
    
    // 如果恢复失败率过高，系统不稳定
    const failedRecoveries = recentRecoveries.filter(r => !r.recovered);
    if (failedRecoveries.length > 5) {
      return false;
    }
    
    return true;
  }

  // 获取错误历史
  getErrorHistory(): ErrorContext[] {
    return [...this.errorHistory];
  }

  // 获取恢复历史
  getRecoveryHistory(): RecoveryResult[] {
    return [...this.recoveryHistory];
  }

  // 获取最新错误
  getLatestError(): ErrorContext | null {
    return this.errorHistory[this.errorHistory.length - 1] || null;
  }

  // 获取错误统计
  getErrorStats(): {
    total: number;
    byManager: Map<string, number>;
    byOperation: Map<string, number>;
    recentErrors: number;
  } {
    const byManager = new Map<string, number>();
    const byOperation = new Map<string, number>();
    
    this.errorHistory.forEach(error => {
      byManager.set(error.manager, (byManager.get(error.manager) || 0) + 1);
      byOperation.set(error.operation, (byOperation.get(error.operation) || 0) + 1);
    });
    
    const recentErrors = this.errorHistory.filter(
      error => Date.now() - error.timestamp < 60000
    ).length;
    
    return {
      total: this.errorHistory.length,
      byManager,
      byOperation,
      recentErrors
    };
  }

  // 设置配置
  setConfig(config: Partial<RecoveryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 获取配置
  getConfig(): RecoveryConfig {
    return { ...this.config };
  }

  // 添加恢复策略
  addStrategy(key: string, strategy: RecoveryStrategy): void {
    this.config.strategies!.set(key, strategy);
  }

  // 移除恢复策略
  removeStrategy(key: string): void {
    this.config.strategies!.delete(key);
  }

  // 清理历史记录
  clearHistory(): void {
    this.errorHistory = [];
    this.recoveryHistory = [];
    this.retryCounts.clear();
  }
} 