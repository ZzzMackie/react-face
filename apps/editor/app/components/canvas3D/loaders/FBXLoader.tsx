"use client";
import { useLoader } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { useEffect } from 'react'
import { 
  useLoaderState, 
  useGroupModelRender, 
  useCanvasTexture, 
  useApplyTextureToGroup, 
  useAnimationInfo 
} from './common/LoaderComponents'

interface FBXModelProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoPlay?: boolean;
  canvasTexture?: HTMLCanvasElement;
}

export default function FBXModel({ 
  modelPath, 
  scale = 1, 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoPlay = false,
  canvasTexture
}: FBXModelProps) {
  const { error, setError, isLoading, setIsLoading, modelRef } = useLoaderState()
  const textureRef = useCanvasTexture(canvasTexture)
  
  const fbx = useLoader(FBXLoader, modelPath)
  
  // 应用纹理到Group
  useApplyTextureToGroup(fbx, textureRef)
  
  // 处理动画信息
  useAnimationInfo(fbx?.animations, 'FBX')
  
  useEffect(() => {
    if (fbx) {
      console.log('FBX加载成功:', fbx)
      setIsLoading(false)
    }
  }, [fbx, setIsLoading])
  
  return useGroupModelRender(
    fbx,
    error,
    isLoading,
    modelRef,
    scale,
    position,
    rotation
  )
} 