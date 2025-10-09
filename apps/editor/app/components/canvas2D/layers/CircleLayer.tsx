import React from 'react';
import { Circle } from 'react-konva';
import { MaterialLayer } from '../../canvas3D/constant/MaterialData';

interface CircleLayerProps {
    layer: MaterialLayer;
    strokeColor?: string;
    strokeWidth?: number;
    onClick: (e: any) => void;
    onTap: (e: any) => void;
    onDragEnd: (e: any) => void;
    onTransformEnd: (e: any) => void;
}

export default function CircleLayer({
    layer,
    strokeColor,
    strokeWidth,
    onClick,
    onTap,
    onDragEnd,
    onTransformEnd,
}: CircleLayerProps) {
    return (
        <Circle
            key={layer.id}
            id={layer.id}
            name="layer-node"
            x={layer.position.x}
            y={layer.position.y}
            radius={(layer as any).radius || layer.size.width / 2}
            rotation={layer.rotation}
            fill={(layer as any).color}
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