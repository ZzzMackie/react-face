"use client";
import { useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { useEffect } from 'react'
import { 
  useLoaderState, 
  useGroupModelRender, 
  useCanvasTexture, 
  useApplyTextureToGroup 
} from './common/LoaderComponents'

interface OBJModelProps {
  modelPath: string;
  materialPath?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  canvasTexture?: HTMLCanvasElement;
  onModelLoaded?: (root: any) => void;
}

export default function OBJModel({ 
  modelPath, 
  materialPath,
  scale = 1, 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  canvasTexture,
  onModelLoaded
}: OBJModelProps) {
  const { error, setError, isLoading, setIsLoading, modelRef } = useLoaderState()
  const textureRef = useCanvasTexture(canvasTexture)
  
  // 加载OBJ模型
  const obj = useLoader(OBJLoader, modelPath)
  
  // 如果有材质文件，加载材质
  const materials = materialPath ? useLoader(MTLLoader, materialPath) : null
  
  // 应用纹理到Group
  useApplyTextureToGroup(obj, textureRef)
  
  // 应用材质和纹理
  useEffect(() => {
    if (obj) {
      if (materials) {
        materials.preload()
        obj.traverse((child: any) => {
          if (child.isMesh) {
            child.material = materials.create(child.material.name)
          }
        })
      }
      
      console.log('OBJ加载成功:', obj)
      setIsLoading(false)
      if (onModelLoaded) onModelLoaded(obj)
    }
  }, [obj, materials, setIsLoading])
  
  return useGroupModelRender(
    obj,
    error,
    isLoading,
    modelRef,
    scale,
    position,
    rotation
  )
} 