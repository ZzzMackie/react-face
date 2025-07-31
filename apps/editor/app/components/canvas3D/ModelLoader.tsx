"use client";
import { useEffect, useRef, useState } from 'react'
import { Group } from 'three'
import GLTFModel from './loaders/GLTFLoader'
import OBJModel from './loaders/OBJLoader'
import FBXModel from './loaders/FBXLoader'
import STLModel from './loaders/STLLoader'
import PLYModel from './loaders/PLYLoader'
import DAEModel from './loaders/DAELoader'
import ThreeDSModel from './loaders/ThreeDSLoader'

interface ModelLoaderProps {
  modelPath: string;
  materialPath?: string; // 用于OBJ格式的材质文件
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  enableDraco?: boolean;
  dracoPath?: string;
  autoPlay?: boolean; // 用于FBX/DAE/3DS格式的动画自动播放
  color?: string; // 用于STL/PLY格式的颜色
  canvasTexture?: HTMLCanvasElement; // 新增：CanvasTexture支持
  materialType?: 'standard' | 'basic' | 'phong' | 'lambert'; // 新增：材质类型选择
}

// 加载中的占位几何体
function LoadingPlaceholder() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  )
}

// 错误状态的占位几何体
function ErrorPlaceholder() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}

// 通用模型加载器
export default function ModelLoader(props: ModelLoaderProps) {
  const { modelPath } = props
  
  // 根据文件扩展名决定使用哪个加载器
  const getFileExtension = (path: string) => {
    return path.split('.').pop()?.toLowerCase()
  }
  
  const fileExtension = getFileExtension(modelPath)
  
  switch (fileExtension) {
    case 'glb':
    case 'gltf':
      return <GLTFModel {...props} />
    
    case 'obj':
      return <OBJModel {...props} />
    
    case 'fbx':
      return <FBXModel {...props} />
    
    case 'stl':
      return <STLModel {...props} />
    
    case 'ply':
      return <PLYModel {...props} />
    
    case 'dae':
      return <DAEModel {...props} />
    
    case '3ds':
      return <ThreeDSModel {...props} />
    
    // 可以在这里添加其他格式的支持
    // case 'max':
    //   return <MaxModel {...props} />
    // case 'blend':
    //   return <BlendModel {...props} />
    // case 'c4d':
    //   return <C4DModel {...props} />
    
    default:
      console.error('不支持的文件格式:', fileExtension)
      return <ErrorPlaceholder />
  }
} 