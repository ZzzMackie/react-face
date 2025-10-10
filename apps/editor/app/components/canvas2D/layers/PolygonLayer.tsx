import React from 'react';
import { Line } from 'react-konva';
import { MaterialLayer } from '../../canvas3D/constant/MaterialData';

interface PolygonLayerProps {
    layer: MaterialLayer;
    strokeColor?: string;
    strokeWidth?: number;
    onClick: (e: any) => void;
    onTap: (e: any) => void;
    onDragEnd: (e: any) => void;
    onTransformEnd: (e: any) => void;
}

export default function PolygonLayer({
    layer,
    strokeColor,
    strokeWidth,
    onClick,
    onTap,
    onDragEnd,
    onTransformEnd,
}: PolygonLayerProps) {
    if (!(layer as any).points) {
        return null;
    }

    const flatPoints = (layer as any).points.flatMap((p: any) => [p.x, p.y]);

    return (
        <Line
            key={layer.id}
            id={layer.id}
            name="layer-node"
            points={flatPoints}
            rotation={layer.rotation}
            fill={(layer as any).color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            opacity={layer.opacity}
            closed
            draggable={!layer.locked}
            onClick={onClick}
            onTap={onTap}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
        />
    );
}