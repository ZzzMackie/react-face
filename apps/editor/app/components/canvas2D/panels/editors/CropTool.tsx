import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Move, RotateCcw } from 'lucide-react';

interface CropToolProps {
  imageUrl: string;
  onCrop: (crop: { x: number; y: number; width: number; height: number }) => void;
  onClose: () => void;
}

type DragMode = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | 'resize-n' | 'resize-s' | 'resize-w' | 'resize-e' | null;

export default function CropTool({ imageUrl, onCrop, onClose }: CropToolProps) {
  const [cropArea, setCropArea] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; cropX: number; cropY: number; cropWidth: number; cropHeight: number } | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imageDragStart, setImageDragStart] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算显示尺寸
  const calculateDisplaySize = useCallback((imgWidth: number, imgHeight: number, containerWidth: number, containerHeight: number) => {
    const maxWidth = Math.min(containerWidth - 40, 800);
    const maxHeight = Math.min(containerHeight - 200, 600);
    
    const scaleX = maxWidth / imgWidth;
    const scaleY = maxHeight / imgHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    return {
      width: imgWidth * scale,
      height: imgHeight * scale
    };
  }, []);

  // 加载图片并获取尺寸
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      
      // 计算显示尺寸
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;
      const display = calculateDisplaySize(img.width, img.height, containerWidth, containerHeight);
      setDisplaySize(display);
      
      // 设置默认裁切区域为图片中心
      const defaultSize = Math.min(display.width, display.height) * 0.6;
      setCropArea({
        x: (display.width - defaultSize) / 2,
        y: (display.height - defaultSize) / 2,
        width: defaultSize,
        height: defaultSize
      });
    };
    img.src = imageUrl;
    imageRef.current = img;
  }, [imageUrl, calculateDisplaySize]);

  // 绘制裁切界面
  const drawCropInterface = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current || !cropArea) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 计算缩放后的图片尺寸
    const scaledWidth = displaySize.width * scale;
    const scaledHeight = displaySize.height * scale;
    
    // 计算图片在canvas中的偏移（居中显示 + 用户拖拽偏移）
    const centerOffsetX = (displaySize.width - scaledWidth) / 2;
    const centerOffsetY = (displaySize.height - scaledHeight) / 2;
    const offsetX = centerOffsetX + imageOffset.x;
    const offsetY = centerOffsetY + imageOffset.y;

    // 设置canvas尺寸为显示尺寸
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    // 绘制缩放后的图片
    ctx.drawImage(imageRef.current, offsetX, offsetY, scaledWidth, scaledHeight);

    // 保存当前状态
    ctx.save();
    
    // 设置裁切路径
    ctx.beginPath();
    ctx.rect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    ctx.clip();
    
    // 在裁切区域内绘制缩放后的原图
    ctx.drawImage(imageRef.current, offsetX, offsetY, scaledWidth, scaledHeight);
    
    // 恢复状态
    ctx.restore();
    
    // 绘制遮罩（排除裁切区域）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 再次绘制裁切区域内的缩放图片
    ctx.save();
    ctx.beginPath();
    ctx.rect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    ctx.clip();
    ctx.drawImage(imageRef.current, offsetX, offsetY, scaledWidth, scaledHeight);
    ctx.restore();

    // 绘制裁切框
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // 绘制控制点
    const controlSize = 8;
    ctx.fillStyle = '#3b82f6';
    
    // 四个角控制点
    ctx.fillRect(cropArea.x - controlSize/2, cropArea.y - controlSize/2, controlSize, controlSize);
    ctx.fillRect(cropArea.x + cropArea.width - controlSize/2, cropArea.y - controlSize/2, controlSize, controlSize);
    ctx.fillRect(cropArea.x - controlSize/2, cropArea.y + cropArea.height - controlSize/2, controlSize, controlSize);
    ctx.fillRect(cropArea.x + cropArea.width - controlSize/2, cropArea.y + cropArea.height - controlSize/2, controlSize, controlSize);

    // 边中点控制点
    ctx.fillRect(cropArea.x + cropArea.width/2 - controlSize/2, cropArea.y - controlSize/2, controlSize, controlSize);
    ctx.fillRect(cropArea.x + cropArea.width/2 - controlSize/2, cropArea.y + cropArea.height - controlSize/2, controlSize, controlSize);
    ctx.fillRect(cropArea.x - controlSize/2, cropArea.y + cropArea.height/2 - controlSize/2, controlSize, controlSize);
    ctx.fillRect(cropArea.x + cropArea.width - controlSize/2, cropArea.y + cropArea.height/2 - controlSize/2, controlSize, controlSize);
  }, [cropArea, displaySize, scale, imageOffset]);

  // 检测鼠标位置对应的拖拽模式
  const getDragMode = useCallback((x: number, y: number): DragMode => {
    if (!cropArea) return null;
    
    const controlSize = 8;
    const tolerance = 12;
    
    // 检查是否在控制点范围内
    const positions = [
      { x: cropArea.x, y: cropArea.y, mode: 'resize-nw' as DragMode },
      { x: cropArea.x + cropArea.width, y: cropArea.y, mode: 'resize-ne' as DragMode },
      { x: cropArea.x, y: cropArea.y + cropArea.height, mode: 'resize-sw' as DragMode },
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height, mode: 'resize-se' as DragMode },
      { x: cropArea.x + cropArea.width/2, y: cropArea.y, mode: 'resize-n' as DragMode },
      { x: cropArea.x + cropArea.width/2, y: cropArea.y + cropArea.height, mode: 'resize-s' as DragMode },
      { x: cropArea.x, y: cropArea.y + cropArea.height/2, mode: 'resize-w' as DragMode },
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height/2, mode: 'resize-e' as DragMode },
    ];
    
    for (const pos of positions) {
      if (Math.abs(x - pos.x) <= tolerance && Math.abs(y - pos.y) <= tolerance) {
        return pos.mode;
      }
    }
    
    // 检查是否在裁切区域内
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      return 'move';
    }
    
    return null;
  }, [cropArea]);

  // 检测是否点击在图片上（而非裁切区域）
  const isClickOnImage = useCallback((x: number, y: number) => {
    if (!cropArea) return false;
    
    // 计算缩放后的图片尺寸和位置
    const scaledWidth = displaySize.width * scale;
    const scaledHeight = displaySize.height * scale;
    const centerOffsetX = (displaySize.width - scaledWidth) / 2;
    const centerOffsetY = (displaySize.height - scaledHeight) / 2;
    const offsetX = centerOffsetX + imageOffset.x;
    const offsetY = centerOffsetY + imageOffset.y;
    
    // 检查是否在图片范围内
    const isInImage = x >= offsetX && x <= offsetX + scaledWidth &&
                     y >= offsetY && y <= offsetY + scaledHeight;
    
    // 检查是否在裁切区域内
    const isInCrop = x >= cropArea.x && x <= cropArea.x + cropArea.width &&
                    y >= cropArea.y && y <= cropArea.y + cropArea.height;
    
    // 检查是否在控制点附近
    const tolerance = 12;
    const positions = [
      { x: cropArea.x, y: cropArea.y },
      { x: cropArea.x + cropArea.width, y: cropArea.y },
      { x: cropArea.x, y: cropArea.y + cropArea.height },
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
      { x: cropArea.x + cropArea.width/2, y: cropArea.y },
      { x: cropArea.x + cropArea.width/2, y: cropArea.y + cropArea.height },
      { x: cropArea.x, y: cropArea.y + cropArea.height/2 },
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height/2 },
    ];
    
    const isNearControlPoint = positions.some(pos => 
      Math.abs(x - pos.x) <= tolerance && Math.abs(y - pos.y) <= tolerance
    );
    
    // 在图片范围内，但不在裁切区域内，且不在控制点附近
    return isInImage && !isInCrop && !isNearControlPoint;
  }, [cropArea, displaySize, scale, imageOffset]);

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cropArea) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否点击在图片上（而非裁切区域）
    if (isClickOnImage(x, y)) {
      setIsDraggingImage(true);
      setImageDragStart({ x, y });
      return;
    }

    const mode = getDragMode(x, y);
    if (mode) {
      setIsDragging(true);
      setDragMode(mode);
      setDragStart({ 
        x, 
        y, 
        cropX: cropArea.x, 
        cropY: cropArea.y, 
        cropWidth: cropArea.width, 
        cropHeight: cropArea.height 
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // 处理图片拖拽
    if (isDraggingImage && imageDragStart) {
      const deltaX = currentX - imageDragStart.x;
      const deltaY = currentY - imageDragStart.y;
      
      setImageOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setImageDragStart({ x: currentX, y: currentY });
      return;
    }

    // 处理裁切区域拖拽
    if (!isDragging || !cropArea || !dragStart || !dragMode) return;

    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    let newCropArea = { ...cropArea };

    switch (dragMode) {
      case 'move':
        newCropArea.x = Math.max(0, Math.min(dragStart.cropX + deltaX, displaySize.width - cropArea.width));
        newCropArea.y = Math.max(0, Math.min(dragStart.cropY + deltaY, displaySize.height - cropArea.height));
        break;
        
      case 'resize-nw':
        newCropArea.x = Math.max(0, Math.min(dragStart.cropX + deltaX, dragStart.cropX + dragStart.cropWidth - 20));
        newCropArea.y = Math.max(0, Math.min(dragStart.cropY + deltaY, dragStart.cropY + dragStart.cropHeight - 20));
        newCropArea.width = dragStart.cropX + dragStart.cropWidth - newCropArea.x;
        newCropArea.height = dragStart.cropY + dragStart.cropHeight - newCropArea.y;
        break;
        
      case 'resize-ne':
        newCropArea.y = Math.max(0, Math.min(dragStart.cropY + deltaY, dragStart.cropY + dragStart.cropHeight - 20));
        newCropArea.width = Math.max(20, Math.min(dragStart.cropWidth + deltaX, displaySize.width - dragStart.cropX));
        newCropArea.height = dragStart.cropY + dragStart.cropHeight - newCropArea.y;
        break;
        
      case 'resize-sw':
        newCropArea.x = Math.max(0, Math.min(dragStart.cropX + deltaX, dragStart.cropX + dragStart.cropWidth - 20));
        newCropArea.width = dragStart.cropX + dragStart.cropWidth - newCropArea.x;
        newCropArea.height = Math.max(20, Math.min(dragStart.cropHeight + deltaY, displaySize.height - dragStart.cropY));
        break;
        
      case 'resize-se':
        newCropArea.width = Math.max(20, Math.min(dragStart.cropWidth + deltaX, displaySize.width - dragStart.cropX));
        newCropArea.height = Math.max(20, Math.min(dragStart.cropHeight + deltaY, displaySize.height - dragStart.cropY));
        break;
        
      case 'resize-n':
        newCropArea.y = Math.max(0, Math.min(dragStart.cropY + deltaY, dragStart.cropY + dragStart.cropHeight - 20));
        newCropArea.height = dragStart.cropY + dragStart.cropHeight - newCropArea.y;
        break;
        
      case 'resize-s':
        newCropArea.height = Math.max(20, Math.min(dragStart.cropHeight + deltaY, displaySize.height - dragStart.cropY));
        break;
        
      case 'resize-w':
        newCropArea.x = Math.max(0, Math.min(dragStart.cropX + deltaX, dragStart.cropX + dragStart.cropWidth - 20));
        newCropArea.width = dragStart.cropX + dragStart.cropWidth - newCropArea.x;
        break;
        
      case 'resize-e':
        newCropArea.width = Math.max(20, Math.min(dragStart.cropWidth + deltaX, displaySize.width - dragStart.cropX));
        break;
    }

    setCropArea(newCropArea);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
    setDragStart(null);
    setIsDraggingImage(false);
    setImageDragStart(null);
  };

  // 鼠标滚轮缩放图片
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // 缩放因子
    const minScale = 0.1;
    const maxScale = 5;
    
    // 计算新的缩放比例
    const newScale = Math.max(minScale, Math.min(maxScale, scale * delta));
    setScale(newScale);
  };

  // 重绘界面
  useEffect(() => {
    drawCropInterface();
  }, [drawCropInterface]);

  // 将显示坐标转换为原始图片坐标
  const convertToOriginalCoordinates = useCallback((displayCrop: typeof cropArea) => {
    if (!displayCrop || !imageSize.width || !displaySize.width) return null;
    
    // 计算缩放后的图片尺寸
    const scaledWidth = displaySize.width * scale;
    const scaledHeight = displaySize.height * scale;
    
    // 计算图片在canvas中的偏移（居中显示 + 用户拖拽偏移）
    const centerOffsetX = (displaySize.width - scaledWidth) / 2;
    const centerOffsetY = (displaySize.height - scaledHeight) / 2;
    const offsetX = centerOffsetX + imageOffset.x;
    const offsetY = centerOffsetY + imageOffset.y;
    
    // 将裁切区域坐标转换为相对于缩放图片的坐标
    const relativeX = displayCrop.x - offsetX;
    const relativeY = displayCrop.y - offsetY;
    
    // 转换为原始图片坐标
    const scaleX = imageSize.width / scaledWidth;
    const scaleY = imageSize.height / scaledHeight;
    
    return {
      x: Math.round(Math.max(0, relativeX * scaleX)),
      y: Math.round(Math.max(0, relativeY * scaleY)),
      width: Math.round(displayCrop.width * scaleX),
      height: Math.round(displayCrop.height * scaleY)
    };
  }, [imageSize, displaySize, scale, imageOffset]);

  const handleApplyCrop = () => {
    if (cropArea) {
      const originalCrop = convertToOriginalCoordinates(cropArea);
      if (originalCrop) {
        onCrop(originalCrop);
        onClose();
      }
    }
  };

  const handleResetCrop = () => {
    if (imageRef.current && displaySize.width > 0) {
      const defaultSize = Math.min(displaySize.width, displaySize.height) * 0.6;
      setCropArea({
        x: (displaySize.width - defaultSize) / 2,
        y: (displaySize.height - defaultSize) / 2,
        width: defaultSize,
        height: defaultSize
      });
      // 同时重置图片偏移和缩放
      setImageOffset({ x: 0, y: 0 });
      setScale(1);
    }
  };

  // 获取鼠标样式
  const getCursorStyle = useCallback((x: number, y: number) => {
    // 检查是否在图片上
    if (isClickOnImage(x, y)) {
      return 'move';
    }
    
    const mode = getDragMode(x, y);
    switch (mode) {
      case 'move': return 'move';
      case 'resize-nw': return 'nw-resize';
      case 'resize-ne': return 'ne-resize';
      case 'resize-sw': return 'sw-resize';
      case 'resize-se': return 'se-resize';
      case 'resize-n': return 'n-resize';
      case 'resize-s': return 's-resize';
      case 'resize-w': return 'w-resize';
      case 'resize-e': return 'e-resize';
      default: return 'default';
    }
  }, [getDragMode, isClickOnImage]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">图片裁切</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            拖拽图片移动位置，拖拽裁切框调整区域，拖拽控制点调整大小，鼠标滚轮缩放图片
          </div>

          <div className="flex justify-center">
            <div ref={containerRef} className="relative">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 rounded"
                style={{ 
                  width: displaySize.width,
                  height: displaySize.height,
                  cursor: isDragging || isDraggingImage ? 'move' : 'default'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={(e) => {
                  if (!isDragging && !isDraggingImage) {
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (rect) {
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const cursor = getCursorStyle(x, y);
                      if (canvasRef.current) {
                        canvasRef.current.style.cursor = cursor;
                      }
                    }
                  }
                  handleMouseMove(e);
                }}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-600 text-left">
              裁切区域: {cropArea ? `${Math.round(cropArea.width)} × ${Math.round(cropArea.height)}` : '0 × 0'}
            </div>
            
            <div className="text-sm text-gray-600 text-left">
              缩放: {Math.round(scale * 100)}%
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleResetCrop}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  重置
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onClose}>
                  取消
                </Button>
                <Button onClick={handleApplyCrop}>
                  应用裁切
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
