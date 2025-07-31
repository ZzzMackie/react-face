"use client";
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { useEffect } from 'react'
import { 
  useLoaderState, 
  useSceneModelRender, 
  useCanvasTexture, 
  useApplyTextureToScene, 
  useAnimationInfo 
} from './common/LoaderComponents'

interface GLTFModelProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  enableDraco?: boolean;
  dracoPath?: string;
  canvasTexture?: HTMLCanvasElement;
}

export default function GLTFModel({ 
  modelPath, 
  scale = 1, 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  enableDraco = true,
  dracoPath = '/draco/gltf/',
  canvasTexture
}: GLTFModelProps) {
  const { error, setError, isLoading, setIsLoading, modelRef } = useLoaderState()
  const textureRef = useCanvasTexture(canvasTexture)
  
  console.log('GLTFModel 开始加载，路径:', modelPath, '加载状态:', isLoading);
  
  const gltf = useLoader(
    GLTFLoader, 
    modelPath, 
    (loader) => {
      console.log('配置GLTF加载器，启用DRACO:', enableDraco);
      if (enableDraco) {
        try {
          const dracoLoader = new DRACOLoader()
          dracoLoader.setDecoderPath(dracoPath)
          loader.setDRACOLoader(dracoLoader)
          console.log('DRACO加载器配置成功')
        } catch (err) {
          console.error('DRACO加载器配置失败:', err)
          setError('DRACO加载器配置失败')
        }
      }
    }
  )
  
  // 应用纹理到场景
  useApplyTextureToScene(gltf?.scene, textureRef)
  
  // 处理动画信息
  useAnimationInfo(gltf?.animations, 'GLTF')
  
  useEffect(() => {
    console.log('GLTF useEffect 触发，gltf:', gltf, 'isLoading:', isLoading);
    if (gltf) {
      console.log('GLTF加载成功:', gltf)
      console.log('场景对象:', gltf.scene)
      setIsLoading(false)
    } else if (!isLoading) {
      console.log('GLTF数据为空，但加载状态为false，重置为true');
      setIsLoading(true);
    }
  }, [gltf, setIsLoading, isLoading])
  
  // 处理加载错误
  useEffect(() => {
    if (error) {
      console.error('GLTF加载错误:', error);
      setIsLoading(false);
    }
  }, [error, setIsLoading]);
  
  
  return useSceneModelRender(
    gltf,
    error,
    isLoading,
    modelRef,
    scale,
    position,
    rotation
  )
} 