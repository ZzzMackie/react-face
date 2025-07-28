import RenderTool from "./renderTool";
// 在 knifeMain.tsx 中
import dynamic from 'next/dynamic';

const KnifeRender = dynamic(
  () => import('./knifeRender'),
  { ssr: false }
);
export default function KnifeMain() {
    return (
        <div className="editor_canvas2D__knife_main flex h-full items-center gap-5 justify-center py-[50px] px-[100px]">
            <RenderTool />
            <KnifeRender />
        </div>
    )
}