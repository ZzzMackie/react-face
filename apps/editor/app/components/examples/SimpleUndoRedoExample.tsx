"use client";
import { useState } from 'react';
import { useUndoRedo } from '../../../hooks/useUndoRedo';
import { useUndoRedoState, useGlobalUndoRedo } from '../../../hooks/useGlobalUndoRedo';

// 简单的文本编辑器示例
function TextEditor() {
  const [text, setText] = useState("Hello World");
  
  const { state, updateState, updateStateDebounced, undo, redo, canUndo, canRedo } = useUndoRedoState(
    'text-editor',
    text,
    { debounceMs: 300 }
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    updateState(newText, `编辑文本`); // 立即更新
  };

  const handleFastTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    updateStateDebounced(newText, `快速输入`); // 防抖更新
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">文本编辑器</h3>
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
          <label className="block text-sm font-medium mb-1">防抖更新:</label>
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
function GlobalControl() {
  const { undo, redo, reset, canUndo, canRedo, history, currentStep } = useGlobalUndoRedo();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">全局控制</h3>
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
          重置
        </button>
      </div>
      <div className="text-sm text-gray-600">
        <div>历史记录: {history.length}</div>
        <div>当前步骤: {currentStep + 1}</div>
      </div>
    </div>
  );
}

export default function SimpleUndoRedoExample() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">简单 Undo/Redo 示例</h2>
      <TextEditor />
      <GlobalControl />
    </div>
  );
} 