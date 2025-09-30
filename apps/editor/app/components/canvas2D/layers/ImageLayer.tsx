import React from 'react';
import { Rect, Image as KonvaImage } from 'react-konva';
import { MaterialLayer } from '../../canvas3D/constant/MaterialData';

interface ImageLayerProps {
    layer: MaterialLayer;
    strokeColor?: string;
    strokeWidth?: number;
    imageElement?: HTMLImageElement;
    onClick: (e: any) => void;
    onTap: (e: any) => void;
    onDragEnd: (e: any) => void;
    onTransformEnd: (e: any) => void;
}

export default function ImageLayer({
    layer,
    strokeColor,
    strokeWidth,
    imageElement,
    onClick,
    onTap,
    onDragEnd,
    onTransformEnd,
}: ImageLayerProps) {
    if (!imageElement) {
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
                fill="#cccccc"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                opacity={layer.opacity}
                onClick={onClick}
            />
        );
    }

    return (
        <KonvaImage
            key={layer.id}
            id={layer.id}
            name="layer-node"
            x={layer.position.x}
            y={layer.position.y}
            width={layer.size.width}
            height={layer.size.height}
            rotation={layer.rotation}
            image={imageElement}
            opacity={layer.opacity}
            draggable
            onClick={onClick}
            onTap={onTap}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
        />
    );
}