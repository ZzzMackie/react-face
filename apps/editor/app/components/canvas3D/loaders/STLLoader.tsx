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
  onModelLoaded?: (root: any) => void;
}

export default function STLModel({ 
  modelPath, 
  scale = 1, 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#cccccc',
  canvasTexture,
  materialType = 'standard',
  onModelLoaded
}: STLModelProps) {
  const { error, setError, isLoading, setIsLoading, modelRef } = useLoaderState()
  const textureRef = useCanvasTexture(canvasTexture)
  
  const geometry = useLoader(STLLoader, modelPath)
  
  useEffect(() => {
    if (geometry) {
      console.log('STL加载成功:', geometry)
      setIsLoading(false)
      // 以一个临时Group作为root，包含单个Mesh（几何体）
      if (onModelLoaded) {
        const root = {
          children: [],
          traverse: (fn: any) => fn({ isMesh: true, geometry })
        } as any
        onModelLoaded(root)
      }
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