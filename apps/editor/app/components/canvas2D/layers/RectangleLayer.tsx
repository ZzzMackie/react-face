import React from 'react';
import { Rect } from 'react-konva';
import { MaterialLayer } from '../../canvas3D/constant/MaterialData';

interface RectangleLayerProps {
    layer: MaterialLayer;
    strokeColor?: string;
    strokeWidth?: number;
    onClick: (e: any) => void;
    onTap: (e: any) => void;
    onDragEnd: (e: any) => void;
    onTransformEnd: (e: any) => void;
}

export default function RectangleLayer({
    layer,
    strokeColor,
    strokeWidth,
    onClick,
    onTap,
    onDragEnd,
    onTransformEnd,
}: RectangleLayerProps) {
    return (
        <Rect
            key={layer.id}
            id={layer.id}
            name="layer-node"
            x={layer.position.x}
            y={layer.position.y}
            width={layer.size.width}
            height={layer.size.height}
            rotation={layer.rotation}
            // fill={layer.color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            opacity={layer.opacity}
            draggable
            onClick={onClick}
            onTap={onTap}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
        />
    );
}