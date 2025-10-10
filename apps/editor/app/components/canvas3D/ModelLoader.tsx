"use client";
import { useEffect, useRef, useState } from 'react'
import { Group } from 'three'
import { ModelLoaderFactory } from '@/lib/strategies/ModelLoaderFactory'
import { LoadOptions, ModelLoadError } from '@/lib/strategies/ModelLoaderStrategy'

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
  onModelLoaded?: (root: any) => void; // 新增：模型加载完成回调
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
function ErrorPlaceholder({ error }: { error: string }) {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}

// 重构后的通用模型加载器
export default function ModelLoader(props: ModelLoaderProps) {
  const { modelPath, onModelLoaded, ...options } = props
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadedGroup, setLoadedGroup] = useState<Group | null>(null)
  const loadingRef = useRef(false)
  
  // 根据文件扩展名决定使用哪个加载器
  const getFileExtension = (path: string) => {
    return path.split('.').pop()?.toLowerCase()
  }
  
  const fileExtension = getFileExtension(modelPath)
  
  useEffect(() => {
    if (!fileExtension || loadingRef.current) return
    
    loadingRef.current = true
    setLoading(true)
    setError(null)
    
    // 检查是否支持该格式
    if (!ModelLoaderFactory.isSupported(fileExtension)) {
      const errorMsg = `不支持的文件格式: ${fileExtension}`
      setError(errorMsg)
      setLoading(false)
      loadingRef.current = false
      return
    }
    
    // 使用工厂模式获取加载策略
    const loader = ModelLoaderFactory.getLoader(fileExtension)
    
    // 构建加载选项
    const loadOptions: LoadOptions = {
      scale: options.scale,
      position: options.position,
      rotation: options.rotation,
      enableDraco: options.enableDraco,
      dracoPath: options.dracoPath,
      autoPlay: options.autoPlay,
      color: options.color,
      canvasTexture: options.canvasTexture,
      materialType: options.materialType
    }
    
    // 异步加载模型
    loader.load(modelPath, loadOptions)
      .then((result) => {
        setLoadedGroup(result.group)
        setLoading(false)
        
        // 调用回调函数
        if (onModelLoaded) {
          onModelLoaded(result.group)
        }
      })
      .catch((err) => {
        setError(err instanceof ModelLoadError ? err.message : '模型加载失败')
        setLoading(false)
      })
      .finally(() => {
        loadingRef.current = false
      })
  }, [modelPath, fileExtension, onModelLoaded])
  
  // 如果正在加载，显示加载占位符
  if (loading) {
    return <LoadingPlaceholder />
  }
  
  // 如果加载失败，显示错误占位符
  if (error) {
    return <ErrorPlaceholder error={error} />
  }
  
  // 如果成功加载，渲染模型
  if (loadedGroup) {
    return (
      <primitive object={loadedGroup} />
    )
  }
  
  // 默认情况
  return <LoadingPlaceholder />
} 