"use client";
import { useState } from 'react';
import { useUndoRedo } from '../../../hooks/useUndoRedo';
import { useUndoRedoState, useGlobalUndoRedo } from '../../../hooks/useGlobalUndoRedo';

// 示例1: 使用独立的undo/redo hooks
function PositionExample() {
  const { state, updateState, updateStateDebounced, undo, redo, canUndo, canRedo } = useUndoRedo(
    { x: 20, y: 20 },
    { maxHistory: 20, debounceMs: 100 }
  );

  const handleDragEnd = (e: any) => {
    const newPosition = {
      x: e.target.x(),
      y: e.target.y(),
    };
    updateState(newPosition); // 立即更新
  };

  const handleMouseMove = (e: any) => {
    const newPosition = {
      x: e.target.x(),
      y: e.target.y(),
    };
    updateStateDebounced(newPosition); // 防抖更新
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">位置控制示例</h3>
      <div className="flex gap-2 mb-4">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          撤销
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="px-3 py-1 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          重做
        </button>
      </div>
      <div className="text-sm text-gray-600">
        当前位置: ({state.x}, {state.y})
      </div>
      <div className="text-xs text-gray-500 mt-2">
        使用 updateState 立即更新，使用 updateStateDebounced 防抖更新
      </div>
    </div>
  );
}

// 示例2: 使用全局undo/redo
function GlobalUndoRedoExample() {
  const [text, setText] = useState("Hello World");
  
  const { state, updateState, updateStateDebounced, undo, redo, canUndo, canRedo } = useUndoRedoState(
    'text-editor',
    text,
    { debounceMs: 500 }
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    updateState(newText, `编辑文本: "${newText.substring(0, 20)}..."`); // 立即更新
  };

  const handleFastTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    updateStateDebounced(newText, `快速输入: "${newText.substring(0, 20)}..."`); // 防抖更新
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">全局文本编辑器</h3>
      <div className="flex gap-2 mb-4">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          撤销
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="px-3 py-1 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          重做
        </button>
      </div>
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium mb-1">立即更新:</label>
          <textarea
            value={text}
            onChange={handleTextChange}
            className="w-full h-20 p-2 border rounded"
            placeholder="输入文本..."
            aria-label="文本编辑器-立即更新"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">防抖更新 (500ms):</label>
          <textarea
            value={text}
            onChange={handleFastTyping}
            className="w-full h-20 p-2 border rounded"
            placeholder="快速输入..."
            aria-label="文本编辑器-防抖更新"
          />
        </div>
      </div>
    </div>
  );
}

// 示例3: 多个状态管理
function MultiStateExample() {
  const [color, setColor] = useState("#ff0000");
  const [size, setSize] = useState(100);

  const colorUndoRedo = useUndoRedoState('color', color, { debounceMs: 0 }); // 无防抖
  const sizeUndoRedo = useUndoRedoState('size', size, { debounceMs: 200 }); // 200ms防抖

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    colorUndoRedo.updateState(newColor, `颜色改为: ${newColor}`); // 立即更新
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    setSize(newSize);
    sizeUndoRedo.updateStateDebounced(newSize, `大小改为: ${newSize}px`); // 防抖更新
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">多状态管理</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">颜色 (立即更新，无防抖)</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="w-12 h-8"
            aria-label="选择颜色"
          />
          <button
            onClick={colorUndoRedo.undo}
            disabled={!colorUndoRedo.canUndo}
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-gray-300"
          >
            撤销颜色
          </button>
          <button
            onClick={colorUndoRedo.redo}
            disabled={!colorUndoRedo.canRedo}
            className="px-2 py-1 bg-green-500 text-white rounded text-sm disabled:bg-gray-300"
          >
            重做颜色
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">大小 (200ms防抖更新)</label>
        <div className="flex gap-2 items-center">
          <input
            type="range"
            min="50"
            max="200"
            value={size}
            onChange={handleSizeChange}
            className="flex-1"
            aria-label="调整大小"
          />
          <span className="text-sm w-12">{size}px</span>
          <button
            onClick={sizeUndoRedo.undo}
            disabled={!sizeUndoRedo.canUndo}
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-gray-300"
          >
            撤销大小
          </button>
          <button
            onClick={sizeUndoRedo.redo}
            disabled={!sizeUndoRedo.canRedo}
            className="px-2 py-1 bg-green-500 text-white rounded text-sm disabled:bg-gray-300"
          >
            重做大小
          </button>
        </div>
      </div>

      <div 
        className="border rounded"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: color 
        }}
      />
    </div>
  );
}

// 示例4: 全局控制面板
function GlobalControlPanel() {
  const { undo, redo, reset, canUndo, canRedo, history, currentStep } = useGlobalUndoRedo();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">全局控制面板</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          全局撤销
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="px-3 py-1 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          全局重做
        </button>
        <button
          onClick={reset}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          重置所有
        </button>
      </div>
      
      <div className="text-sm text-gray-600 space-y-1">
        <div>历史记录数量: {history.length}</div>
        <div>当前步骤: {currentStep + 1}</div>
        <div>可以撤销: {canUndo ? '是' : '否'}</div>
        <div>可以重做: {canRedo ? '是' : '否'}</div>
      </div>
      
      {history.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">历史记录:</h4>
          <div className="max-h-32 overflow-y-auto text-xs space-y-1">
            {history.map((entry, index) => (
              <div 
                key={index}
                className={`p-2 rounded ${
                  index === currentStep 
                    ? 'bg-blue-100 border border-blue-300' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="font-medium">{entry.id}</div>
                <div className="text-gray-600">
                  {entry.description || '无描述'}
                </div>
                <div className="text-gray-500 text-xs">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UndoRedoExample() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Undo/Redo 示例</h2>
      
      <PositionExample />
      <GlobalUndoRedoExample />
      <MultiStateExample />
      <GlobalControlPanel />
    </div>
  );
} 