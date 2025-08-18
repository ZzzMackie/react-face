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
  onModelLoaded?: (root: any) => void;
}

export default function GLTFModel({ 
  modelPath, 
  scale = 1, 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  enableDraco = true,
  dracoPath = '/draco/gltf/',
  canvasTexture,
  onModelLoaded
}: GLTFModelProps) {
  const { error, setError, isLoading, setIsLoading, modelRef } = useLoaderState()
  const textureRef = useCanvasTexture(canvasTexture)
  
  console.log('GLTFModel 开始加载，路径:', modelPath, '加载状态:', isLoading, '纹理:', canvasTexture);
  
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
  
  // 监听纹理变化，实时更新
  useEffect(() => {
    if (gltf?.scene && textureRef.current) {
      console.log('纹理更新，重新应用纹理到场景');
      gltf.scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material: any) => {
              if (material && typeof material.map !== 'undefined') {
                material.map = textureRef.current;
                material.needsUpdate = true;
              }
            });
          } else if (child.material && typeof child.material.map !== 'undefined') {
            child.material.map = textureRef.current;
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [textureRef.current, gltf?.scene]);
  
  useEffect(() => {
    console.log('GLTF useEffect 触发，gltf:', gltf, 'isLoading:', isLoading);
    if (gltf) {
      console.log('GLTF加载成功:', gltf)
      console.log('场景对象:', gltf.scene)
      setIsLoading(false)
      // 模型加载完成时触发回调，传递真实场景对象
      if (onModelLoaded) {
        onModelLoaded(gltf.scene)
      }
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