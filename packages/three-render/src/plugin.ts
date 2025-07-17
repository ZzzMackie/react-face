import type { App } from 'vue';
import * as components from './components';

export interface ThreeRenderOptions {
  /**
   * 是否自动注册所有组件
   * @default true
   */
  registerComponents?: boolean;
  
  /**
   * 是否使用前缀注册组件
   * @default true
   */
  usePrefix?: boolean;
  
  /**
   * 组件前缀
   * @default 'Three'
   */
  prefix?: string;
  
  /**
   * 全局配置选项
   */
  config?: {
    /**
     * 是否启用抗锯齿
     * @default true
     */
    antialias?: boolean;
    
    /**
     * 是否启用阴影
     * @default true
     */
    shadows?: boolean;
    
    /**
     * 是否启用自动渲染
     * @default true
     */
    autoRender?: boolean;
    
    /**
     * 是否启用性能监控
     * @default false
     */
    stats?: boolean;
    
    /**
     * 默认像素比
     * @default window.devicePixelRatio
     */
    pixelRatio?: number;
  }
}

/**
 * Three-Render Vue 插件
 */
export const ThreeRenderPlugin = {
  install(app: App, options: ThreeRenderOptions = {}) {
    // 默认选项
    const defaultOptions: ThreeRenderOptions = {
      registerComponents: true,
      usePrefix: true,
      prefix: 'Three',
      config: {
        antialias: true,
        shadows: true,
        autoRender: true,
        stats: false,
        pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
      }
    };
    
    // 合并选项
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      config: {
        ...defaultOptions.config,
        ...options.config
      }
    };
    
    // 注册全局配置
    app.provide('threeRenderConfig', mergedOptions.config);
    
    // 注册所有组件
    if (mergedOptions.registerComponents) {
      Object.entries(components).forEach(([componentName, component]) => {
        if (mergedOptions.usePrefix && !componentName.startsWith(mergedOptions.prefix!)) {
          // 如果使用前缀且组件名不以前缀开头，则添加前缀
          app.component(`${mergedOptions.prefix}${componentName}`, component);
        } else {
          // 否则直接注册组件
          app.component(componentName, component);
        }
      });
    }
    
    // 注册全局属性
    app.config.globalProperties.$threeRender = {
      version: '0.1.0',
      config: mergedOptions.config
    };
    
    console.log('🎮 Three-Render 插件已安装');
  }
}; 