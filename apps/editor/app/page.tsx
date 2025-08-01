"use client";
import Header from "./components/toolbar/header";
import KnifeMain from "./components/canvas2D/knifeMain";
import ViewPanel from "./components/panel/viewPanel";
import { sampleMaterials } from "./components/canvas3D/constant/MaterialData";
import { useUndoRedoState } from "@/hooks/useGlobalUndoRedo";
const initData = () => {
  const materialData = sampleMaterials[0];
  useUndoRedoState('material-list', sampleMaterials);
  useUndoRedoState('current-material', materialData.id);
  useUndoRedoState('current-material-data', materialData);
  return materialData;
}
export default function Home() {
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
