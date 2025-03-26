import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import * as THREE from 'three';


export const canvasTexture: THREE.CanvasTexture;

// RGBELoader 和 TextureLoader 的实例声明
export const rgbeLoader: RGBELoader;
export const textureLoader: THREE.TextureLoader;

// TextureLoader 的封装函数声明
export function THREE_TextureLoader(path: string, _textureLoader?: THREE.TextureLoader): Promise<THREE.Texture>;

// RGBELoader 的封装函数声明
export function THREE_RGBELoader(path: string, pmremGenerator?: THREE.PMREMGenerator): Promise<THREE.Texture>;
