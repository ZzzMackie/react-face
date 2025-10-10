import React from 'react';
import { Text } from 'react-konva';
import { MaterialLayer } from '../../canvas3D/constant/MaterialData';

interface TextLayerProps {
    layer: MaterialLayer;
    onClick: (e: any) => void;
    onTap: (e: any) => void;
    onDragEnd: (e: any) => void;
    onTransformEnd: (e: any) => void;
}

export default function TextLayer({
    layer,
    onClick,
    onTap,
    onDragEnd,
    onTransformEnd,
}: TextLayerProps) {
    return (
        <Text
            key={layer.id}
            id={layer.id}
            name="layer-node"
            x={layer.position.x}
            y={layer.position.y}
            width={layer.size.width}
            height={layer.size.height}
            rotation={layer.rotation}
            text={(layer as any).text}
            fontSize={(layer as any).fontSize}
            fontFamily={(layer as any).fontFamily}
            fontWeight={(layer as any).fontWeight}
            fontStyle={(layer as any).fontStyle}
            fill={(layer as any).color}
            stroke={(layer as any).strokeColor}
            strokeWidth={(layer as any).strokeWidth}
            align={(layer as any).textAlign}
            verticalAlign={(layer as any).verticalAlign}
            lineHeight={(layer as any).lineHeight}
            letterSpacing={(layer as any).letterSpacing}
            opacity={layer.opacity}
            draggable={!layer.locked}
            onClick={onClick}
            onTap={onTap}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
        />
    );
}