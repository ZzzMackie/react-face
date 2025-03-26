import { ViewHelper as ViewHelperBase } from 'three/examples/jsm/helpers/ViewHelper.js';
import { PerspectiveCamera } from 'three';

/**
 * 自定义 ViewHelper 类，继承自 three.js 的 ViewHelperBase 类
 * 添加了对 pointerup 和 pointerdown 事件的监听，并自定义了 handleClick 方法的行为
 */
export class ViewHelper extends ViewHelperBase {
  /**
   * 构造函数
   * @param camera - 用于设置视图的相机对象
   * @param containerDom - 包含相机的 DOM 元素
   * @param viewHelperDom - 用于显示视图帮助信息的 DOM 元素
   */
  constructor(camera: PerspectiveCamera, containerDom: HTMLElement, viewHelperDom: HTMLElement);

  /**
   * 设置视图帮助信息的可见性
   * @param value - 布尔值，表示视图帮助信息是否可见
   */
  setViewHelperVisible(value: boolean): void;
}
