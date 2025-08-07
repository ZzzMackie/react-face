"use client";
import { useEffect } from "react";
import Header from "./components/toolbar/header";
import KnifeMain from "./components/canvas2D/knifeMain";
import ViewPanel from "./components/panel/viewPanel";
import { sampleMaterials, sampleModels } from "./components/canvas3D/constant/MaterialData";
import { useUndoRedoState } from "@/hooks/useGlobalUndoRedo";
import { useGlobalState } from "@/hooks/useGlobalState";

export default function Home() {
  // 使用全局状态管理数据
  const [modelList, setModelList] = useGlobalState('model-list', sampleModels);
  const [materialList, setMaterialList] = useGlobalState('material-list', sampleMaterials);
  
  const materialData = sampleMaterials[0];
  const modelData = sampleModels.find(model => model.id === materialData.modelId);
  
  // 使用useUndoRedoState管理状态 - 会自动初始化
  const { state: currentModelData } = useUndoRedoState('current-model-data', modelData);
  const { state: currentMaterialData } = useUndoRedoState('current-material-data', materialData);
  const { state: currentMaterial } = useUndoRedoState('current-material', materialData.id);
  const { state: currentModel } = useUndoRedoState('current-model', materialData.modelId);
  
  // 初始化数据 - 只在组件挂载时执行一次
  useEffect(() => {
    // 初始化全局状态
    if (!modelList) {
      setModelList(sampleModels);
    }
    if (!materialList) {
      setMaterialList(sampleMaterials);
    }
  }, []);
  
  return (
    <div className="editor_index__wrapper flex flex-col h-screen">
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
    </div>
  );
}
