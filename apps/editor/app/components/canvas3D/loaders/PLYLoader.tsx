"use client";
import { useLoader } from '@react-three/fiber'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { useEffect } from 'react'
import { 
  useLoaderState, 
  useGeometryModelRender, 
  useCanvasTexture 
} from './common/LoaderComponents'

interface PLYModelProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  canvasTexture?: HTMLCanvasElement;
  materialType?: 'standard' | 'basic' | 'phong' | 'lambert';
}

export default function PLYModel({ 
  modelPath, 
  scale = 1, 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#cccccc',
  canvasTexture,
  materialType = 'standard'
}: PLYModelProps) {
  const { error, setError, isLoading, setIsLoading, modelRef } = useLoaderState()
  const textureRef = useCanvasTexture(canvasTexture)
  
  const geometry = useLoader(PLYLoader, modelPath)
  
  useEffect(() => {
    if (geometry) {
      console.log('PLY加载成功:', geometry)
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