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
            text={layer.text}
            fontSize={layer.fontSize}
            fontFamily={layer.fontFamily}
            fontWeight={layer.fontWeight}
            fontStyle={layer.fontStyle}
            fill={layer.color}
            stroke={layer.strokeColor}
            strokeWidth={layer.strokeWidth}
            align={layer.textAlign}
            verticalAlign={layer.verticalAlign}
            lineHeight={layer.lineHeight}
            letterSpacing={layer.letterSpacing}
            opacity={layer.opacity}
            draggable
            onClick={onClick}
            onTap={onTap}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
        />
    );
}