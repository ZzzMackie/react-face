"use client";
import { useLoader } from '@react-three/fiber'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { useEffect } from 'react'
import { 
  useLoaderState, 
  useGeometryModelRender, 
  useCanvasTexture 
} from './common/LoaderComponents'

interface STLModelProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  canvasTexture?: HTMLCanvasElement;
  materialType?: 'standard' | 'basic' | 'phong' | 'lambert';
}

export default function STLModel({ 
  modelPath, 
  scale = 1, 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#cccccc',
  canvasTexture,
  materialType = 'standard'
}: STLModelProps) {
  const { error, setError, isLoading, setIsLoading, modelRef } = useLoaderState()
  const textureRef = useCanvasTexture(canvasTexture)
  
  const geometry = useLoader(STLLoader, modelPath)
  
  useEffect(() => {
    if (geometry) {
      console.log('STL加载成功:', geometry)
      setIsLoading(false)
    }
  }, [geometry, setIsLoading])
  
  return useGeometryModelRender(
    geometry,
    error,
    isLoading,
    modelRef,
    scale,
    position,
    rotation,
    color,
    textureRef.current,
    materialType
  )
} 