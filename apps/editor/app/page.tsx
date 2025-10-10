"use client";
import Header from "./components/toolbar/header";
import KnifeMain from "./components/canvas2D/knifeMain";
import ViewPanel from "./components/panel/viewPanel";
import { sampleMaterials, sampleModels } from "./components/canvas3D/constant/MaterialData";
import { useEditorData } from "@/hooks/useEditorData";
import { EditorLayout } from "./components/layout/EditorLayout";
import { EditorErrorBoundary } from "./components/common/EditorErrorBoundary";
import { EditorDataProvider } from "./components/providers/EditorDataProvider";

/**
 * 编辑器主页面组件
 * 遵循单一职责原则 (SRP) - 只负责组合和渲染
 */
function EditorContent() {
  // 使用自定义Hook管理编辑器数据
  const editorData = useEditorData(sampleModels, sampleMaterials);
  
  // 如果初始化失败，显示错误信息
  if (editorData.error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">编辑器初始化失败</h2>
          <p className="text-gray-600 mb-4">{editorData.error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }
  
  // 如果正在初始化，显示加载状态
  if (!editorData.isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在初始化编辑器...</p>
        </div>
      </div>
    );
  }
  
  return (
    <EditorErrorBoundary>
      <EditorLayout>
        <section className="editor_index__header">
          <Header />
        </section>
        <section className="editor_index__container flex">
          <div className="editor_index__container_left">
          </div>
          <div className="editor_index__container_center bg-stone-100 h-[calc(100vh-60px)] flex-1">
            <KnifeMain />
          </div>
          <div className="relative">
            <ViewPanel />
          </div>
        </section>
      </EditorLayout>
    </EditorErrorBoundary>
  );
}

export default function Home() {
  return (
    <EditorDataProvider 
      initialModels={sampleModels} 
      initialMaterials={sampleMaterials}
    >
      <EditorContent />
    </EditorDataProvider>
  );
}
