import RenderTool from "./renderTool";
import { CanvasToolbar } from "./toolbar";
import { useRef } from "react";
import { type KnifeRenderRef } from "./knifeRender";
// 在 knifeMain.tsx 中
import dynamic from 'next/dynamic';

const KnifeRender = dynamic(
  () => import('./knifeRender'),
  { ssr: false }
);

export default function KnifeMain() {
    const knifeRenderRef = useRef<KnifeRenderRef>(null);

    const handleAddLayer = (layerType: string) => {
        console.log('handleAddLayer called with:', layerType);
        console.log('knifeRenderRef.current:', knifeRenderRef.current);
        // 通过 ref 调用 KnifeRender 的添加图层方法
        if (knifeRenderRef.current?.handleAddLayer) {
            console.log('Calling handleAddLayer on KnifeRender');
            knifeRenderRef.current.handleAddLayer(layerType);
        } else {
            console.log('handleAddLayer method not found on KnifeRender');
        }
    };

    return (
        <div className="editor_canvas2D__knife_main flex h-full items-center gap-5 justify-start py-[50px] px-[100px]">
            <RenderTool />
            <KnifeRender ref={knifeRenderRef} />
            <CanvasToolbar onAddLayer={handleAddLayer} />
        </div>
    )
}