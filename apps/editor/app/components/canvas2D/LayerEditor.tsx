"use client";
import { useState, useCallback } from 'react';
import { MaterialLayer, MaterialData } from '../canvas3D/constant/MaterialData';

interface LayerEditorProps {
  materialData: MaterialData;
  selectedLayerId?: string;
  onLayerSelect: (layerId: string) => void;
  onLayerUpdate: (layer: MaterialLayer) => void;
  onLayerAdd: (layer: MaterialLayer) => void;
  onLayerDelete: (layerId: string) => void;
}

export default function LayerEditor({
  materialData,
  selectedLayerId,
  onLayerSelect,
  onLayerUpdate,
  onLayerAdd,
  onLayerDelete
}: LayerEditorProps) {
  const [newLayerType, setNewLayerType] = useState<'rectangle' | 'circle' | 'image' | 'text'>('rectangle');

  // 使用useCallback处理图层更新
  const handleLayerUpdate = useCallback((updatedLayer: MaterialLayer) => {
    onLayerUpdate(updatedLayer);
  }, [onLayerUpdate]);

  const handleAddLayer = () => {
    const newLayer: MaterialLayer = {
      id: `layer-${Date.now()}`,
      name: `新${newLayerType === 'rectangle' ? '矩形' : newLayerType === 'circle' ? '圆形' : newLayerType === 'image' ? '图片' : '文字'}`,
      type: newLayerType,
      position: { x: 100, y: 100 },
      size: { width: 100, height: 100 },
      rotation: 0,
      opacity: 1,
      visible: true,
      zIndex: materialData.layers.length + 1,
      ...(newLayerType === 'rectangle' || newLayerType === 'circle' ? {
        color: '#4a90e2',
        strokeColor: '#2c5aa0',
        strokeWidth: 2
      } : {}),
      ...(newLayerType === 'circle' ? {
        radius: 50
      } : {}),
      ...(newLayerType === 'image' ? {
        imageUrl: '/images/placeholder.jpg',
        fit: 'cover',
        borderColor: '#ffffff',
        borderWidth: 1,
        borderRadius: 4
      } : {}),
      ...(newLayerType === 'text' ? {
        text: '新文字',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#333333',
        backgroundColor: 'transparent',
        textAlign: 'left',
        verticalAlign: 'top',
        lineHeight: 1.2
      } : {})
    } as MaterialLayer;

    onLayerAdd(newLayer);
  };

  const handleLayerPropertyChange = (layerId: string, property: string, value: any) => {
    const layer = materialData.layers.find(l => l.id === layerId);
    if (layer) {
      const updatedLayer = { ...layer, [property]: value };
      handleLayerUpdate(updatedLayer);
    }
  };

  const renderLayerProperties = (layer: MaterialLayer) => {
    return (
      <div key={layer.id} className="w-full border rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={layer.name}
            onChange={(e) => handleLayerPropertyChange(layer.id, 'name', e.target.value)}
            className="text-sm font-medium bg-transparent border-none outline-none"
            placeholder="图层名称"
            aria-label="图层名称"
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={layer.visible}
              onChange={(e) => handleLayerPropertyChange(layer.id, 'visible', e.target.checked)}
              className="w-4 h-4"
              aria-label="图层可见性"
            />
            <button
              onClick={() => onLayerDelete(layer.id)}
              className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
              aria-label="删除图层"
            >
              删除
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* 通用属性 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor={`x-${layer.id}`} className="text-sm font-medium">X坐标</label>
              <input
                id={`x-${layer.id}`}
                type="number"
                value={layer.position.x}
                onChange={(e) => handleLayerPropertyChange(layer.id, 'position', { ...layer.position, x: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={`y-${layer.id}`} className="text-sm font-medium">Y坐标</label>
              <input
                id={`y-${layer.id}`}
                type="number"
                value={layer.position.y}
                onChange={(e) => handleLayerPropertyChange(layer.id, 'position', { ...layer.position, y: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={`width-${layer.id}`} className="text-sm font-medium">宽度</label>
              <input
                id={`width-${layer.id}`}
                type="number"
                value={layer.size.width}
                onChange={(e) => handleLayerPropertyChange(layer.id, 'size', { ...layer.size, width: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={`height-${layer.id}`} className="text-sm font-medium">高度</label>
              <input
                id={`height-${layer.id}`}
                type="number"
                value={layer.size.height}
                onChange={(e) => handleLayerPropertyChange(layer.id, 'size', { ...layer.size, height: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">透明度</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={layer.opacity}
              onChange={(e) => handleLayerPropertyChange(layer.id, 'opacity', Number(e.target.value))}
              className="w-full"
              aria-label="透明度"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor={`zindex-${layer.id}`} className="text-sm font-medium">层级</label>
            <input
              id={`zindex-${layer.id}`}
              type="number"
              value={layer.zIndex}
              onChange={(e) => handleLayerPropertyChange(layer.id, 'zIndex', Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* 几何图形属性 */}
          {(layer.type === 'rectangle' || layer.type === 'circle') && (
            <>
              <hr className="my-4" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor={`color-${layer.id}`} className="text-sm font-medium">填充颜色</label>
                  <input
                    id={`color-${layer.id}`}
                    type="color"
                    value={layer.color}
                    onChange={(e) => handleLayerPropertyChange(layer.id, 'color', e.target.value)}
                    className="w-full h-10 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor={`strokeColor-${layer.id}`} className="text-sm font-medium">边框颜色</label>
                  <input
                    id={`strokeColor-${layer.id}`}
                    type="color"
                    value={layer.strokeColor}
                    onChange={(e) => handleLayerPropertyChange(layer.id, 'strokeColor', e.target.value)}
                    className="w-full h-10 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor={`strokeWidth-${layer.id}`} className="text-sm font-medium">边框宽度</label>
                  <input
                    id={`strokeWidth-${layer.id}`}
                    type="number"
                    min={0}
                    value={layer.strokeWidth}
                    onChange={(e) => handleLayerPropertyChange(layer.id, 'strokeWidth', Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </>
          )}

          {/* 图片属性 */}
          {layer.type === 'image' && (
            <>
              <hr className="my-4" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor={`imageUrl-${layer.id}`} className="text-sm font-medium">图片URL</label>
                  <input
                    id={`imageUrl-${layer.id}`}
                    type="text"
                    value={layer.imageUrl}
                    onChange={(e) => handleLayerPropertyChange(layer.id, 'imageUrl', e.target.value)}
                    placeholder="输入图片URL"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor={`fit-${layer.id}`} className="text-sm font-medium">适应方式</label>
                  <select
                    id={`fit-${layer.id}`}
                    value={layer.fit}
                    onChange={(e) => handleLayerPropertyChange(layer.id, 'fit', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="cover">覆盖</option>
                    <option value="contain">包含</option>
                    <option value="fill">填充</option>
                    <option value="none">无</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor={`borderColor-${layer.id}`} className="text-sm font-medium">边框颜色</label>
                  <input
                    id={`borderColor-${layer.id}`}
                    type="color"
                    value={layer.borderColor || '#ffffff'}
                    onChange={(e) => handleLayerPropertyChange(layer.id, 'borderColor', e.target.value)}
                    className="w-full h-10 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor={`borderWidth-${layer.id}`} className="text-sm font-medium">边框宽度</label>
                  <input
                    id={`borderWidth-${layer.id}`}
                    type="number"
                    min={0}
                    value={layer.borderWidth || 0}
                    onChange={(e) => handleLayerPropertyChange(layer.id, 'borderWidth', Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </>
          )}

          {/* 文字属性 */}
          {layer.type === 'text' && (
            <>
              <hr className="my-4" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor={`text-${layer.id}`} className="text-sm font-medium">文字内容</label>
                  <textarea
                    id={`text-${layer.id}`}
                    value={layer.text}
                    onChange={(e) => handleLayerPropertyChange(layer.id, 'text', e.target.value)}
                    placeholder="输入文字内容"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor={`fontSize-${layer.id}`} className="text-sm font-medium">字体大小</label>
                    <input
                      id={`fontSize-${layer.id}`}
                      type="number"
                      value={layer.fontSize}
                      onChange={(e) => handleLayerPropertyChange(layer.id, 'fontSize', Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`textColor-${layer.id}`} className="text-sm font-medium">字体颜色</label>
                    <input
                      id={`textColor-${layer.id}`}
                      type="color"
                      value={layer.color}
                      onChange={(e) => handleLayerPropertyChange(layer.id, 'color', e.target.value)}
                      className="w-full h-10 border rounded-md"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor={`fontWeight-${layer.id}`} className="text-sm font-medium">字体粗细</label>
                  <select
                    id={`fontWeight-${layer.id}`}
                    value={layer.fontWeight}
                    onChange={(e) => handleLayerPropertyChange(layer.id, 'fontWeight', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="normal">正常</option>
                    <option value="bold">粗体</option>
                    <option value="lighter">细体</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor={`textAlign-${layer.id}`} className="text-sm font-medium">对齐方式</label>
                  <select
                    id={`textAlign-${layer.id}`}
                    value={layer.textAlign}
                    onChange={(e) => handleLayerPropertyChange(layer.id, 'textAlign', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="left">左对齐</option>
                    <option value="center">居中</option>
                    <option value="right">右对齐</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 bg-background border-l border-border p-4 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">图层编辑器</h3>
        
        {/* 添加新图层 */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <select
              value={newLayerType}
              onChange={(e) => setNewLayerType(e.target.value as any)}
              className="flex-1 px-3 py-2 border rounded-md"
              aria-label="选择图层类型"
            >
              <option value="rectangle">矩形</option>
              <option value="circle">圆形</option>
              <option value="image">图片</option>
              <option value="text">文字</option>
            </select>
            <button
              onClick={handleAddLayer}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              aria-label="添加新图层"
            >
              添加
            </button>
          </div>
        </div>
      </div>

      {/* 图层列表 */}
      <div className="space-y-3">
        {materialData?.layers
          .sort((a, b) => b.zIndex - a.zIndex) // 按层级倒序显示
          .map(layer => (
            <div
              key={layer.id}
              className={`cursor-pointer transition-all ${
                selectedLayerId === layer.id ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-border'
              }`}
              onClick={() => onLayerSelect(layer.id)}
            >
              {renderLayerProperties(layer)}
            </div>
          ))}
      </div>
    </div>
  );
} 