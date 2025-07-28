import Image from 'next/image'
import { Separator } from "@/components/ui/separator"
import { Button } from '@/components/ui/button';
export default function ToolBar() {
    return (
      <section className="editor_toolbar__wrapper h-full">
        <div className="editor_toolbar__wrapper_inner flex items-center gap-4 h-full">
          <div>
              <Image src="/next.svg" alt="next" width={40} height={40} />
          </div>
          <Separator orientation="vertical" />
          <div className="editor_toolbar__wrapper_inner_button flex items-center gap-2">
            <Button variant="outline" className="font-medium cursor-pointer">
              <span>
                Undo
              </span>
            </Button>
            <Button variant="outline" className="font-medium cursor-pointer">
              <span>
                Redo
              </span>
            </Button>
            <Button variant="outline" className="font-medium cursor-pointer">
              <span>
                Clear
              </span>
            </Button>
          </div>
        </div>
      </section>
    );
  }
  