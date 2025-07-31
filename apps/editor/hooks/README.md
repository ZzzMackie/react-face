# Undo/Redo Hooks

这个项目提供了两个强大的undo/redo hooks，可以用于任何React状态管理。

## 1. useUndoRedo - 独立状态管理

用于单个组件的状态撤销/重做功能。

### 基本用法

```typescript
import { useUndoRedo } from './hooks/useUndoRedo';

function MyComponent() {
  const { state, updateState, updateStateDebounced, undo, redo, canUndo, canRedo } = useUndoRedo(
    { x: 20, y: 20 }, // 初始状态
    { maxHistory: 50, debounceMs: 100 } // 可选配置
  );

  const handlePositionChange = (newPosition) => {
    updateState(newPosition); // 立即更新
  };

  const handleDragEnd = (newPosition) => {
    updateStateDebounced(newPosition); // 防抖更新
  };

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>撤销</button>
      <button onClick={redo} disabled={!canRedo}>重做</button>
      <div>当前位置: ({state.x}, {state.y})</div>
    </div>
  );
}
```

### 配置选项

- `maxHistory`: 最大历史记录数量 (默认: 50)
- `debounceMs`: 防抖延迟时间 (默认: 0)
  - 当设置为 0 时，`updateStateDebounced` 会直接调用 `updateState`，不使用 `setTimeout`
  - 当设置大于 0 时，会使用防抖机制延迟更新

### 返回值

```typescript
{
  state: T,                    // 当前状态
  updateState: (newState: T) => void,           // 立即更新
  updateStateDebounced: (newState: T) => void,  // 防抖更新（当debounceMs=0时等同于立即更新）
  undo: () => void,           // 撤销
  redo: () => void,           // 重做
  reset: (newState?: T) => void, // 重置
  canUndo: boolean,           // 是否可以撤销
  canRedo: boolean,           // 是否可以重做
  getHistoryInfo: () => HistoryInfo // 获取历史信息
}
```

## 2. useGlobalUndoRedo - 全局状态管理

基于react-use的`createGlobalState`的全局撤销/重做功能，支持跨组件共享。

### 基本用法

```typescript
import { useUndoRedoState, useGlobalUndoRedo } from './hooks/useGlobalUndoRedo';

// 单个状态管理
function TextEditor() {
  const { state, updateState, updateStateDebounced, undo, redo, canUndo, canRedo } = useUndoRedoState(
    'text-editor',
    'Hello World',
    { debounceMs: 500 }
  );

  const handleTextChange = (e) => {
    const newText = e.target.value;
    updateState(newText, '编辑文本'); // 立即更新
  };

  const handleFastTyping = (e) => {
    const newText = e.target.value;
    updateStateDebounced(newText, '快速输入'); // 防抖更新
  };

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>撤销</button>
      <button onClick={redo} disabled={!canRedo}>重做</button>
      <textarea value={state} onChange={handleTextChange} />
    </div>
  );
}

// 全局控制面板
function GlobalControlPanel() {
  const { undo, redo, reset, canUndo, canRedo, history, currentStep } = useGlobalUndoRedo();

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>全局撤销</button>
      <button onClick={redo} disabled={!canRedo}>全局重做</button>
      <button onClick={reset}>重置所有</button>
      <div>历史记录: {history.length}</div>
      <div>当前步骤: {currentStep + 1}</div>
    </div>
  );
}
```

### 多状态管理

```typescript
function MultiStateComponent() {
  const colorUndoRedo = useUndoRedoState('color', '#ff0000');
  const sizeUndoRedo = useUndoRedoState('size', 100);

  return (
    <div>
      {/* 颜色控制 */}
      <input 
        type="color" 
        value={colorUndoRedo.state}
        onChange={(e) => colorUndoRedo.updateState(e.target.value, '改变颜色')}
      />
      <button onClick={colorUndoRedo.undo}>撤销颜色</button>
      
      {/* 大小控制 */}
      <input 
        type="range"
        value={sizeUndoRedo.state}
        onChange={(e) => sizeUndoRedo.updateStateDebounced(parseInt(e.target.value), '调整大小')}
      />
      <button onClick={sizeUndoRedo.undo}>撤销大小</button>
    </div>
  );
}
```

### useUndoRedoState 返回值

```typescript
{
  state: T,                    // 当前状态
  updateState: (newState: T, description?: string) => void,           // 立即更新
  updateStateDebounced: (newState: T, description?: string) => void,  // 防抖更新（当debounceMs=0时等同于立即更新）
  undo: () => void,           // 撤销
  redo: () => void,           // 重做
  canUndo: boolean,           // 是否可以撤销
  canRedo: boolean,           // 是否可以重做
}
```

### useGlobalUndoRedo 返回值

```typescript
{
  undo: () => void,           // 全局撤销
  redo: () => void,           // 全局重做
  reset: () => void,          // 重置所有
  canUndo: boolean,           // 是否可以撤销
  canRedo: boolean,           // 是否可以重做
  history: HistoryEntry[],    // 历史记录
  currentStep: number,        // 当前步骤
}
```

## 3. 与Konva集成示例

```typescript
import { useUndoRedo } from './hooks/useUndoRedo';

function DraggableShape() {
  const { state, updateState, undo, redo, canUndo, canRedo } = useUndoRedo(
    { x: 20, y: 20 }
  );

  const handleDragEnd = (e) => {
    const newPosition = {
      x: e.target.x(),
      y: e.target.y(),
    };
    updateState(newPosition);
  };

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>撤销</button>
      <button onClick={redo} disabled={!canRedo}>重做</button>
      
      <Stage>
        <Layer>
          <Rect
            x={state.x}
            y={state.y}
            width={100}
            height={100}
            fill="red"
            draggable
            onDragEnd={handleDragEnd}
          />
        </Layer>
      </Stage>
    </div>
  );
}
```

## 4. 键盘快捷键支持

```typescript
import { useEffect } from 'react';

function useKeyboardShortcuts(undo, redo) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'z' && e.shiftKey) {
          e.preventDefault();
          redo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
}
```

## 5. 特性对比

| 特性 | useUndoRedo | useGlobalUndoRedo |
|------|-------------|-------------------|
| 作用域 | 组件级别 | 全局级别 |
| 状态管理 | 本地状态 | React-Use全局状态 |
| 多状态支持 | ❌ | ✅ |
| 跨组件共享 | ❌ | ✅ |
| 防抖更新 | ✅ | ✅ |
| 性能 | 更好 | 好 |
| 复杂度 | 简单 | 简单 |
| 依赖 | 无 | React-Use |

## 6. 最佳实践

1. **选择合适的hooks**:
   - 单个组件用`useUndoRedo`
   - 跨组件用`useGlobalUndoRedo`
2. **合理设置历史记录数量**: 避免内存泄漏
3. **使用防抖**: 对于频繁更新的状态使用`updateStateDebounced`
4. **添加描述**: 为重要的状态变更添加描述信息
5. **键盘快捷键**: 提供更好的用户体验
6. **性能优化**: 当不需要防抖时，设置`debounceMs: 0`可以避免不必要的`setTimeout`调用

## 7. 注意事项

- 状态必须是可序列化的
- 避免在历史记录中存储过大的数据
- 定期清理不需要的历史记录
- 考虑添加状态变更的验证逻辑
- 当`debounceMs`为0时，`updateStateDebounced`等同于`updateState`，性能更好 