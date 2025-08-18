"use client";
import { useRef, useEffect, useState } from 'react'
import { Group, Mesh, CanvasTexture, MeshStandardMaterial } from 'three'
import { ReactElement, RefObject } from 'react'
import { useFrame } from '@react-three/fiber'

// 加载中的占位组件 - 旋转的八面体
export function LoadingPlaceholder() {
  const meshRef = useRef<Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.5
    }
  })
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial 
        color="#888888" 
        transparent 
        opacity={0.7}
        wireframe
      />
    </mesh>
  )
}

// 错误状态的占位组件 - 红色球体
export function ErrorPlaceholder() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}

// 通用的加载器状态管理Hook
export function useLoaderState() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const modelRef = useRef<Group | null>(null)
  
  return {
    error,
    setError,
    isLoading,
    setIsLoading,
    modelRef
  }
}

// 通用的CanvasTexture管理Hook
export function useCanvasTexture(canvasTexture?: HTMLCanvasElement) {
  const textureRef = useRef<CanvasTexture | null>(null)
  
  // 创建CanvasTexture
  useEffect(() => {
    if (canvasTexture) {
      const newTexture = new CanvasTexture(canvasTexture);
      newTexture.needsUpdate = true;
      textureRef.current = newTexture;

      // 监听刀版内容变化的函数
      const updateTexture = () => {
        if (textureRef.current) {
          textureRef.current.needsUpdate = true;
          console.log('刀版内容变化，更新纹理');
        }
      };

      // 监听自定义事件 - 刀版内容变化时触发
      const handleKnifeUpdate = (event: CustomEvent) => {
        console.log('收到刀版更新事件:', event.detail);
        updateTexture();
      };

      // 添加事件监听器
      window.addEventListener('knife-content-updated', handleKnifeUpdate as EventListener);

      // 设置定时器作为备用方案，检查canvas内容是否变化
      let lastImageData: string | null = null;
      const checkContentChange = () => {
        try {
          const context = canvasTexture.getContext('2d');
          if (context) {
            const imageData = context.getImageData(0, 0, canvasTexture.width, canvasTexture.height);
            const currentData = JSON.stringify(imageData.data.slice(0, 100)); // 只比较前100个像素
            if (lastImageData !== null && lastImageData !== currentData) {
              updateTexture();
            }
            lastImageData = currentData;
          }
        } catch (error) {
          // 忽略错误，继续检查
        }
      };

      const updateInterval = setInterval(checkContentChange, 1000); // 每1秒检查一次

      return () => {
        window.removeEventListener('knife-content-updated', handleKnifeUpdate as EventListener);
        clearInterval(updateInterval);
        newTexture.dispose();
      };
    }
  }, [canvasTexture]);
  
  return textureRef
}

// 通用的纹理应用Hook - 用于有scene属性的模型（GLTF、DAE等）
export function useApplyTextureToScene(scene: any, textureRef: React.RefObject<CanvasTexture | null>) {
  useEffect(() => {
    if (scene && textureRef.current) {
      scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material: any) => {
              // 支持所有有map属性的材质类型
              if (material && typeof material.map !== 'undefined') {
                material.map = textureRef.current;
                material.needsUpdate = true;
              }
            });
          } else if (child.material && typeof child.material.map !== 'undefined') {
            // 支持所有有map属性的材质类型
            child.material.map = textureRef.current;
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [scene, textureRef.current]);
}

// 通用的纹理应用Hook - 用于Group模型（OBJ、FBX、3DS等）
export function useApplyTextureToGroup(group: any, textureRef: React.RefObject<CanvasTexture | null>) {
  useEffect(() => {
    if (group && textureRef.current) {
      group.traverse((child: any) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material: any) => {
              // 支持所有有map属性的材质类型
              if (material && typeof material.map !== 'undefined') {
                material.map = textureRef.current;
                material.needsUpdate = true;
              }
            });
          } else if (child.material && typeof child.material.map !== 'undefined') {
            // 支持所有有map属性的材质类型
            child.material.map = textureRef.current;
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [group, textureRef.current]);
}

// 通用的动画信息Hook
export function useAnimationInfo(animations: any[] | undefined, modelName: string) {
  useEffect(() => {
    if (animations && animations.length > 0) {
      console.log(`发现${modelName}动画:`, animations.length, '个动画')
      animations.forEach((anim, index) => {
        console.log(`动画 ${index}:`, anim.name, '时长:', anim.duration)
      })
    }
  }, [animations, modelName]);
}

// 通用的加载完成Hook
export function useLoaderComplete<T>(
  loadedData: T | null,
  onComplete?: (data: T) => void
) {
  useEffect(() => {
    if (loadedData && onComplete) {
      onComplete(loadedData)
    }
  }, [loadedData, onComplete])
}

// 通用的加载器渲染Hook
export function useLoaderRender<T>(
  data: T | null,
  error: string | null,
  isLoading: boolean,
  renderComponent: (data: T) => ReactElement
) {
  if (error) {
    console.error('模型加载错误:', error)
    return <ErrorPlaceholder />
  }
  
  if (isLoading) {
    console.log('模型加载中...')
    return <LoadingPlaceholder />
  }
  
  if (!data) {
    console.log('模型数据未加载')
    return <LoadingPlaceholder />
  }
  
  console.log('渲染模型:', data)
  return renderComponent(data)
}

// 通用的场景模型渲染Hook (用于GLTF等有scene属性的格式)
export function useSceneModelRender<T extends { scene?: any }>(
  data: T | null,
  error: string | null,
  isLoading: boolean,
  modelRef: RefObject<Group | null>,
  scale: number,
  position: [number, number, number],
  rotation: [number, number, number]
) {
  return useLoaderRender(
    data,
    error,
    isLoading,
    (data) => (
      <primitive 
        ref={modelRef}
        object={data.scene} 
        scale={scale}
        position={position}
        rotation={rotation}
      />
    )
  )
}

// 通用的Group模型渲染Hook (用于OBJ、FBX、3DS等直接返回Group的格式)
export function useGroupModelRender(
  group: Group | null,
  error: string | null,
  isLoading: boolean,
  modelRef: RefObject<Group | null>,
  scale: number,
  position: [number, number, number],
  rotation: [number, number, number]
) {
  return useLoaderRender(
    group,
    error,
    isLoading,
    (group) => (
      <primitive 
        ref={modelRef}
        object={group} 
        scale={scale}
        position={position}
        rotation={rotation}
      />
    )
  )
}

// 通用的几何体模型渲染Hook (用于STL、PLY等几何体格式)
export function useGeometryModelRender(
  geometry: any,
  error: string | null,
  isLoading: boolean,
  modelRef: RefObject<Group | null>,
  scale: number,
  position: [number, number, number],
  rotation: [number, number, number],
  color: string = '#888888',
  texture?: CanvasTexture | null,
  materialType: 'standard' | 'basic' | 'phong' | 'lambert' = 'standard'
) {
  return useLoaderRender(
    geometry,
    error,
    isLoading,
    (geometry) => {
      const materialProps = {
        color,
        map: texture as any,
        ...(materialType === 'basic' ? { transparent: true, opacity: 0.9 } : {}),
        ...(materialType === 'phong' ? { shininess: 30 } : {}),
        ...(materialType === 'lambert' ? { emissive: '#222222' } : {})
      };

      return (
        <mesh 
          ref={modelRef}
          geometry={geometry as any}
          scale={scale}
          position={position}
          rotation={rotation}
        >
          {materialType === 'basic' && <meshBasicMaterial {...materialProps} />}
          {materialType === 'phong' && <meshPhongMaterial {...materialProps} />}
          {materialType === 'lambert' && <meshLambertMaterial {...materialProps} />}
          {materialType === 'standard' && <meshStandardMaterial {...materialProps} />}
        </mesh>
      );
    }
  )
} 