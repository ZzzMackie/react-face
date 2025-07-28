"use client"; 
import { Layer, Rect, Stage } from 'react-konva';
import { useEffect, useRef, useState  } from 'react';
export default function KnifeRender() {
    const renderRef = useRef(null);
    const [renderSize, setRenderSize] = useState({width: 0, height: 0});
    useEffect(() => {
        if (renderRef.current) {
            const rect:DOMRect = renderRef.current.getBoundingClientRect();
            setRenderSize({
                width: rect.width,
                height: rect.height
            });
        }
    }, []);
    return (
        <div ref={renderRef} className="editor_canvas2D__knife_render min-h-[600px] bg-white aspect-square h-[min(90%,calc(100vw*(1000/1920)))]">
            <Stage width={renderSize.width} height={renderSize.height}>
                <Layer>
                    <Rect draggable x={0} y={0} width={100} height={100} fill="red" />
                </Layer>
            </Stage>
        </div>
    )
}