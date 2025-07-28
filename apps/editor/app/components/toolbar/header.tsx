import Menu from "./menu";
import ToolBar from "./toolbar";

export default function Header() {
  return (
    <header className="editor_header__wrapper flex 
    justify-between px-8 h-[60px] py-[12px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 
    shadow-md
    items-center">
      <div className="editor_header__toolbar h-full">
        <ToolBar />
      </div>
      <div className="editor_header__menu">
        <Menu />
      </div>
    </header>
  );
}
