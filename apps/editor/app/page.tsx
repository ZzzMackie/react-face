import Header from "./components/toolbar/header";

export default function Home() {
  return (
    <div className="editor_index__wrapper flex flex-col h-screen">
      <section className="editor_index__header">
      <Header />
      </section>
      <section className="editor_index__container flex">
        <div className="editor_index__container_left flex-2/12">
        </div>
        <div className="editor_index__container_center flex-9/12">
        sss
        </div>
        <div className="editor_index__container_right flex-1/12"></div>
      </section>
    </div>
  );
}
