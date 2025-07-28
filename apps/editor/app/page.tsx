"use client";
import Header from "./components/toolbar/header";
import KnifeMain from "./components/canvas2D/knifeMain";
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
        <div className="editor_index__container_right"></div>
      </section>
    </div>
  );
}
