import Image from 'next/image'
import { Separator } from "@/components/ui/separator"
import { Button } from '@/components/ui/button';
import { useGlobalUndoRedo } from '@/hooks/useGlobalUndoRedo';
export default function ToolBar() {
    const { undo, redo, canUndo, canRedo, reset } = useGlobalUndoRedo();
    return (
      <section className="editor_toolbar__wrapper h-full">
        <div className="editor_toolbar__wrapper_inner flex items-center gap-4 h-full">
          <div>
              <Image src="/next.svg" alt="next" width={40} height={40} />
          </div>
          <Separator orientation="vertical" />
          <div className="editor_toolbar__wrapper_inner_button flex items-center gap-2">
            <Button variant="outline" className="font-medium cursor-pointer" onClick={undo} disabled={!canUndo}>
              <span>
                Undo
              </span>
            </Button>
            <Button variant="outline" className="font-medium cursor-pointer" onClick={redo} disabled={!canRedo}>
              <span>
                Redo
              </span>
            </Button>
            <Button variant="outline" className="font-medium cursor-pointer" onClick={reset}>
              <span>
              Reset
              </span>
            </Button>
          </div>
        </div>
      </section>
    );
  }
  