"use client";
import { useState } from 'react';
import { useUndoRedoState, useGlobalUndoRedo } from '../../../hooks/useGlobalUndoRedo';

export default function SimpleUndoRedoExample() {
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
      <h3 className="text-lg font-semibold mb-2">简单文本编辑器</h3>
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

// 全局控制面板
function GlobalControlPanel() {
  const { undo, redo, reset, canUndo, canRedo, undoStack, redoStack, currentStates } = useGlobalUndoRedo();

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
        <div>Undo栈数量: {undoStack.length}</div>
        <div>Redo栈数量: {redoStack.length}</div>
        <div>可以撤销: {canUndo ? '是' : '否'}</div>
        <div>可以重做: {canRedo ? '是' : '否'}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Undo栈:</h4>
          <div className="max-h-32 overflow-y-auto text-xs space-y-1">
            {undoStack.map((entry, index) => (
              <div 
                key={index}
                className="p-2 rounded bg-gray-50"
              >
                <div className="font-medium">步骤 {undoStack.length - index}</div>
                <div className="text-gray-600">
                  {entry.description || '无描述'}
                </div>
                <div className="text-gray-500 text-xs">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-gray-400 text-xs">
                  ID: {entry.id}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Redo栈:</h4>
          <div className="max-h-32 overflow-y-auto text-xs space-y-1">
            {redoStack.map((entry, index) => (
              <div 
                key={index}
                className="p-2 rounded bg-gray-50"
              >
                <div className="font-medium">步骤 {redoStack.length - index}</div>
                <div className="text-gray-600">
                  {entry.description || '无描述'}
                </div>
                <div className="text-gray-500 text-xs">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-gray-400 text-xs">
                  ID: {entry.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 