"use client";
import { useGlobalUndoRedo } from '../../../hooks/useGlobalUndoRedo';

export default function GlobalUndoRedoTest() {
  const { undo, redo, reset, canUndo, canRedo, history, currentStep } = useGlobalUndoRedo();

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="text-lg font-semibold mb-2">全局 Undo/Redo 测试</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            console.log('全局撤销');
            undo();
          }}
          disabled={!canUndo}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          全局撤销
        </button>
        <button
          onClick={() => {
            console.log('全局重做');
            redo();
          }}
          disabled={!canRedo}
          className="px-3 py-1 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          全局重做
        </button>
        <button
          onClick={() => {
            console.log('重置所有');
            reset();
          }}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          重置所有
        </button>
      </div>
      
      <div className="text-sm space-y-1">
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