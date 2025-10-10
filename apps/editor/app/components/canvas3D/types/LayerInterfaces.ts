/**
 * 图层相关接口
 * 遵循接口隔离原则 (ISP) - 分离不同类型的图层接口
 */
import { BaseEntity, Transform2D, Visibility, BaseStyle } from './BaseInterfaces';

/**
 * 基础图层接口
 * 包含所有图层共有的属性
 */
export interface BaseLayer extends BaseEntity, Transform2D, Visibility {
  type: 'rectangle' | 'circle' | 'polygon' | 'image' | 'text';
}

/**
 * 几何图形图层接口
 * 专门用于几何图形图层
 */
export interface GeometryLayer extends BaseLayer, BaseStyle {
  type: 'rectangle' | 'circle' | 'polygon';
  points?: Array<{ x: number; y: number }>; // 用于多边形
  radius?: number; // 用于圆形
}

/**
 * 图片图层接口
 * 专门用于图片图层
 */
export interface ImageLayer extends BaseLayer {
  type: 'image';
  imageUrl: string;
  imageData?: string; // base64数据
  fit: 'cover' | 'contain' | 'fill' | 'none';
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

/**
 * 文字图层接口
 * 专门用于文字图层
 */
export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  color: string;
  backgroundColor?: string;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
  letterSpacing?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

/**
 * 统一图层类型
 */
export type MaterialLayer = GeometryLayer | ImageLayer | TextLayer;