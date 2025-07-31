"use client";
import { useLoader } from '@react-three/fiber'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { useEffect } from 'react'
import { 
  useLoaderState, 
  useSceneModelRender, 
  useCanvasTexture, 
  useApplyTextureToScene, 
  useAnimationInfo 
} from './common/LoaderComponents'

interface DAEModelProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoPlay?: boolean;
  canvasTexture?: HTMLCanvasElement;
}

export default function DAEModel({ 
  modelPath, 
  scale = 1, 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoPlay = false,
  canvasTexture
}: DAEModelProps) {
  const { error, setError, isLoading, setIsLoading, modelRef } = useLoaderState()
  const textureRef = useCanvasTexture(canvasTexture)
  
  const collada = useLoader(ColladaLoader, modelPath)
  
  // 应用纹理到场景
  useApplyTextureToScene(collada?.scene, textureRef)
  
  // 处理动画信息
  useAnimationInfo((collada as any)?.animations, 'DAE')
  
  useEffect(() => {
    if (collada) {
      console.log('DAE加载成功:', collada)
      setIsLoading(false)
    }
  }, [collada, setIsLoading])
  
  return useSceneModelRender(
    collada,
    error,
    isLoading,
    modelRef,
    scale,
    position,
    rotation
  )
} 