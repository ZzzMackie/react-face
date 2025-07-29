"use client"; 
import styles from '../../assets/css/canvas.module.css';
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
        <div ref={renderRef} className={`aspect-square bg-white ${styles.canvas2d_min_height} min-h-[600px]`}>
            <Stage className={styles.canvas_container} width={renderSize.width} height={renderSize.height}>
                <Layer >
                    <Rect draggable x={0} y={0} width={100} height={100} fill="red" />
                </Layer>
            </Stage>
        </div>
    )
}