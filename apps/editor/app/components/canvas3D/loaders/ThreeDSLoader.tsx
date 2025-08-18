"use client";
import { useLoader } from '@react-three/fiber'
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';
import { useEffect } from 'react'
import { 
  useLoaderState, 
  useGroupModelRender, 
  useCanvasTexture, 
  useApplyTextureToGroup, 
  useAnimationInfo 
} from './common/LoaderComponents'

interface ThreeDSModelProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoPlay?: boolean;
  canvasTexture?: HTMLCanvasElement;
  onModelLoaded?: (root: any) => void;
}

export default function ThreeDSModel({ 
  modelPath, 
  scale = 1, 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoPlay = false,
  canvasTexture,
  onModelLoaded
}: ThreeDSModelProps) {
  const { error, setError, isLoading, setIsLoading, modelRef } = useLoaderState()
  const textureRef = useCanvasTexture(canvasTexture)
  
  const tds = useLoader(TDSLoader, modelPath)
  
  // 应用纹理到Group
  useApplyTextureToGroup(tds, textureRef)
  
  // 处理动画信息
  useAnimationInfo(tds?.animations, '3DS')
  
  useEffect(() => {
    if (tds) {
      console.log('3DS加载成功:', tds)
      setIsLoading(false)
      if (onModelLoaded) onModelLoaded(tds)
    }
  }, [tds, setIsLoading])
  
  return useGroupModelRender(
    tds,
    error,
    isLoading,
    modelRef,
    scale,
    position,
    rotation
  )
} 