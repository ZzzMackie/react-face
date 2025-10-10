import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Rect, Image as KonvaImage } from 'react-konva';
import { MaterialLayer } from '../../canvas3D/constant/MaterialData';
import Konva from 'konva';

// 锐化滤镜函数
function applySharpenFilter(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    
    // 锐化卷积核
    const kernel = [
        0, -intensity/100, 0,
        -intensity/100, 1 + 4 * intensity/100, -intensity/100,
        0, -intensity/100, 0
    ];
    
    const newData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) { // RGB channels
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                        sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                    }
                }
                const idx = (y * width + x) * 4 + c;
                newData[idx] = Math.max(0, Math.min(255, sum));
            }
        }
    }
    
    const newImageData = new ImageData(newData, width, height);
    ctx.putImageData(newImageData, 0, 0);
}

// 浮雕滤镜函数
function applyEmbossFilter(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    
    // 浮雕卷积核
    const kernel = [
        -2 * intensity/100, -intensity/100, 0,
        -intensity/100, 1, intensity/100,
        0, intensity/100, 2 * intensity/100
    ];
    
    const newData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) { // RGB channels
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                        sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                    }
                }
                const idx = (y * width + x) * 4 + c;
                newData[idx] = Math.max(0, Math.min(255, sum + 128));
            }
        }
    }
    
    const newImageData = new ImageData(newData, width, height);
    ctx.putImageData(newImageData, 0, 0);
}

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

// 滤镜缓存
const filterCache = new Map<string, HTMLImageElement>();

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
    const imageRef = useRef<Konva.Image>(null);
    const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(null);
    const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 生成滤镜缓存键
    const generateFilterKey = useCallback((imgLayer: any) => {
        return `${imgLayer.imageUrl}_${imgLayer.brightness ?? 100}_${imgLayer.contrast ?? 100}_${imgLayer.saturation ?? 100}_${imgLayer.hue ?? 0}_${imgLayer.blur ?? 0}_${imgLayer.flipHorizontal ?? false}_${imgLayer.flipVertical ?? false}_${imgLayer.sharpen ?? 0}_${imgLayer.shadowBlur ?? 0}_${imgLayer.shadowOffsetX ?? 0}_${imgLayer.shadowOffsetY ?? 0}_${imgLayer.shadowColor ?? '#000000'}_${imgLayer.emboss ?? 0}_${imgLayer.sepia ?? 0}_${imgLayer.invert ?? false}_${imgLayer.grayscale ?? false}_${JSON.stringify(imgLayer.crop)}`;
    }, []);

    // 防抖处理图片滤镜效果
    const processImageWithFilters = useCallback(() => {
        if (!imageElement || layer.type !== 'image') return;

        const imgLayer = layer as any;
        const filterKey = generateFilterKey(imgLayer);
        
        // 检查缓存
        if (filterCache.has(filterKey)) {
            setProcessedImage(filterCache.get(filterKey)!);
            return;
        }

        // 清除之前的定时器
        if (processingTimeoutRef.current) {
            clearTimeout(processingTimeoutRef.current);
        }

        // 防抖处理
        processingTimeoutRef.current = setTimeout(() => {
            const brightness = imgLayer.brightness ?? 100;
            const contrast = imgLayer.contrast ?? 100;
            const saturation = imgLayer.saturation ?? 100;
            const hue = imgLayer.hue ?? 0;
            const blur = imgLayer.blur ?? 0;
            const flipHorizontal = imgLayer.flipHorizontal ?? false;
            const flipVertical = imgLayer.flipVertical ?? false;
            const sharpen = imgLayer.sharpen ?? 0;
            const shadowBlur = imgLayer.shadowBlur ?? 0;
            const shadowOffsetX = imgLayer.shadowOffsetX ?? 0;
            const shadowOffsetY = imgLayer.shadowOffsetY ?? 0;
            const shadowColor = imgLayer.shadowColor ?? '#000000';
            const emboss = imgLayer.emboss ?? 0;
            const sepia = imgLayer.sepia ?? 0;
            const invert = imgLayer.invert ?? false;
            const grayscale = imgLayer.grayscale ?? false;
            const crop = imgLayer.crop;

        // 创建离屏 canvas 处理图片
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 处理裁切区域
        let sourceX = 0, sourceY = 0, sourceWidth = imageElement.width, sourceHeight = imageElement.height;
        if (crop) {
            sourceX = crop.x;
            sourceY = crop.y;
            sourceWidth = crop.width;
            sourceHeight = crop.height;
        }

        canvas.width = sourceWidth;
        canvas.height = sourceHeight;

        // 应用变换
        ctx.save();
        
        // 翻转处理
        if (flipHorizontal || flipVertical) {
            const scaleX = flipHorizontal ? -1 : 1;
            const scaleY = flipVertical ? -1 : 1;
            ctx.scale(scaleX, scaleY);
            ctx.translate(
                flipHorizontal ? -canvas.width : 0,
                flipVertical ? -canvas.height : 0
            );
        }

        // 绘制原始图片（支持裁切）
        ctx.drawImage(
            imageElement,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, canvas.width, canvas.height
        );

        // 应用基础滤镜
        const baseFilters = [
            `brightness(${brightness}%)`,
            `contrast(${contrast}%)`,
            `saturate(${saturation}%)`,
            `hue-rotate(${hue}deg)`,
            blur > 0 ? `blur(${blur}px)` : '',
            sepia > 0 ? `sepia(${sepia}%)` : '',
            invert ? 'invert(1)' : '',
            grayscale ? 'grayscale(1)' : '',
        ].filter(Boolean);

        if (baseFilters.length > 0) {
            ctx.filter = baseFilters.join(' ');
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(
                imageElement,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, canvas.width, canvas.height
            );
        }

        // 应用阴影效果
        if (shadowBlur > 0) {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            ctx.shadowOffsetX = shadowOffsetX;
            ctx.shadowOffsetY = shadowOffsetY;
            ctx.drawImage(
                imageElement,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, canvas.width, canvas.height
            );
        }

        // 应用锐化效果
        if (sharpen > 0) {
            applySharpenFilter(ctx, canvas, sharpen);
        }

        // 应用浮雕效果
        if (emboss > 0) {
            applyEmbossFilter(ctx, canvas, emboss);
        }

        ctx.restore();

            // 转换为图片
            const processedImg = new Image();
            processedImg.onload = () => {
                // 缓存处理后的图片
                filterCache.set(filterKey, processedImg);
                setProcessedImage(processedImg);
            };
            processedImg.src = canvas.toDataURL();
        }, 150); // 150ms 防抖延迟
    }, [imageElement, layer, generateFilterKey]);

    // 处理图片滤镜效果
    useEffect(() => {
        processImageWithFilters();
    }, [processImageWithFilters]);

    // 清理定时器
    useEffect(() => {
        return () => {
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }
        };
    }, []);

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
                draggable={!layer.locked}
                onClick={onClick}
            />
        );
    }

    // 使用处理后的图片或原始图片
    const displayImage = processedImage || imageElement;

    return (
        <KonvaImage
            ref={imageRef}
            key={layer.id}
            id={layer.id}
            name="layer-node"
            x={layer.position.x}
            y={layer.position.y}
            width={layer.size.width}
            height={layer.size.height}
            rotation={layer.rotation}
            image={displayImage}
            opacity={layer.opacity}
            draggable={!layer.locked}
            onClick={onClick}
            onTap={onTap}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
            cropX={0}
            cropY={0}
            cropWidth={displayImage?.width || 0}
            cropHeight={displayImage?.height || 0}
            offsetX={0}
            offsetY={0}
        />
    );
}