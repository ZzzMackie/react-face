import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useState, useEffect, useRef, useMemo } from 'react'
import ModelLoader from './ModelLoader'
import Controls from './Controls'
import { LoadingPlaceholder } from './loaders/common/LoaderComponents'
import { useUndoRedoState } from '@/hooks/useGlobalUndoRedo'
import { MaterialData } from './constant/MaterialData'

interface RenderThreeProps {
  materialData?: MaterialData;
  canvasTexture?: HTMLCanvasElement | null;
  selectedMeshId?: string;
}

// 相机控制组件
function CameraControls() {
    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        </>
    )
}

// 全局模型加载状态，确保模型只加载一次
const globalModelState = {
    hasLoaded: false,
    isLoading: false
};

export default function RenderThree({ 
  materialData,
  canvasTexture,
  selectedMeshId 
}: RenderThreeProps) {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(!globalModelState.hasLoaded)
    const [showTexture, setShowTexture] = useState(true)
    const [forceReload, setForceReload] = useState(0) // 强制重新加载的计数器
    const containerRef = useRef<HTMLDivElement>(null)
    // 使用useUndoRedoState管理3D模型数据
    const { state: modelData, updateState } = useUndoRedoState(
        'render-three-model-data',
        materialData || {
            id: 'default',
            name: '默认3D模型',
            description: '默认3D模型数据',
            meshes: [],
            layers: [], // 添加缺失的layers属性
            model: {
                id: 'model-001',
                name: '默认模型',
                modelPath: '/exampleModel/XEP2DZRCDIT6W-3dSources.glb',
                uuid: 'uuid-001',
                scale: 1,
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                enableDraco: true,
                dracoPath: '/draco/gltf/',
                autoPlay: true
            },
            canvasSize: { width: 800, height: 600 },
            createdAt: new Date(),
            updatedAt: new Date()
        } as MaterialData,
        { debounceMs: 200 }
    );
    
    // 使用useMemo缓存ModelLoader组件，避免重复创建
    const cachedModelLoader = useMemo(() => {
        if (!modelData) {
            console.log('modelData未定义，跳过ModelLoader创建');
            return null;
        }
        
        return (
            <ModelLoader 
                key={`${modelData.model.modelPath}-${forceReload}`} // 添加key强制重新创建
                modelPath={modelData.model.modelPath}
                scale={modelData.model.scale}
                position={modelData.model.position}
                rotation={modelData.model.rotation}
                enableDraco={modelData.model.enableDraco}
                dracoPath={modelData.model.dracoPath}
                autoPlay={modelData.model.autoPlay}
                color={modelData.model.color}
                canvasTexture={showTexture && canvasTexture ? canvasTexture : undefined}
            />
        );
    }, [
        modelData?.model.modelPath,
        modelData?.model.scale,
        modelData?.model.position,
        modelData?.model.rotation,
        modelData?.model.enableDraco,
        modelData?.model.dracoPath,
        modelData?.model.autoPlay,
        modelData?.model.color,
        showTexture,
        // 移除canvasTexture依赖，避免纹理变化时重新创建组件
        forceReload
    ]);
    
    const threeRef = useRef(null)
    // 处理Canvas创建事件
    const handleCanvasCreated = (three: any) => {
        threeRef.current = three
        console.log('Canvas created, 全局状态:', globalModelState.hasLoaded);
        if (!globalModelState.hasLoaded) {
            globalModelState.hasLoaded = true;
            console.log('设置全局状态为已加载');
        }
        setIsLoading(false);
    }
    // 强制重新加载模型
    const handleForceReload = () => {
        console.log('强制重新加载模型');
        setForceReload(prev => prev + 1);
        globalModelState.hasLoaded = false;
        setIsLoading(true);
    }
    console.log(threeRef)
    // 组件挂载时的调试信息
    useEffect(() => {
        console.log('RenderThree 组件挂载，全局状态:', globalModelState.hasLoaded);
        console.log('初始加载状态:', isLoading);
        console.log('模型路径:', modelData?.model.modelPath);
    }, []);
    
    return (
        <div 
            ref={containerRef}
            className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden relative"
        >
            <div className="p-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">
                        {modelData?.name || '3D模型'} - 3D预览
                    </h3>
                    <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-1">
                            <input
                                type="checkbox"
                                checked={showTexture}
                                onChange={(e) => setShowTexture(e.target.checked)}
                                className="text-blue-500"
                            />
                            <span className="text-xs text-gray-600">显示刀版纹理</span>
                        </label>
                        <button
                            onClick={handleForceReload}
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                            重新加载
                        </button>
                        <div className="text-xs text-gray-500">
                            选中: {selectedMeshId || '无'}
                        </div>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-red-600 font-medium">加载失败</p>
                        <p className="text-sm text-red-500 mt-1">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
                        >
                            重试
                        </button>
                    </div>
                </div>
            ) : (
                <Canvas
                    camera={{ position: [5, 5, 5], fov: 75 }}
                    gl={{ antialias: true }}
                    onCreated={handleCanvasCreated}
                    onError={(event) => {
                        console.error('Canvas error:', event)
                        setError('Canvas渲染错误')
                    }}
                >
                    <Suspense fallback={<LoadingPlaceholder />}>
                        <CameraControls />
                        <Controls />
                        
                        {/* 使用缓存的ModelLoader组件 */}
                        {cachedModelLoader}
                    </Suspense>
                </Canvas>
            )}
        </div>
    )
}