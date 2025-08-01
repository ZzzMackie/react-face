# 全局状态管理 Hooks

本项目提供了两套全局状态管理方案：

## 1. useGlobalState - 简单全局状态

基于 `react-use` 的 `createGlobalState` 实现，提供简单的全局状态管理功能。

### 基本用法

```typescript
import { useGlobalState } from '@/hooks/useGlobalState';

// 在组件中使用
const [value, setValue] = useGlobalState('key', defaultValue);
```

### 可用函数

#### useGlobalState(key, defaultValue)
- **功能**: 获取和设置全局状态
- **参数**: 
  - `key`: 状态键名
  - `defaultValue`: 默认值
- **返回**: `[value, setValue]` 元组

#### useGlobalStateValue(key, defaultValue)
- **功能**: 只读获取全局状态值
- **参数**: 
  - `key`: 状态键名
  - `defaultValue`: 默认值
- **返回**: 状态值

#### useGlobalStateSetter(key)
- **功能**: 只写设置全局状态
- **参数**: 
  - `key`: 状态键名
- **返回**: 设置函数

#### useGlobalStateExists(key)
- **功能**: 检查状态是否存在
- **参数**: 
  - `key`: 状态键名
- **返回**: 布尔值

#### useGlobalStateRemove(key)
- **功能**: 删除指定状态
- **参数**: 
  - `key`: 状态键名
- **返回**: 删除函数

#### useGlobalStateClear()
- **功能**: 清空所有状态
- **返回**: 清空函数

#### useGlobalStateKeys()
- **功能**: 获取所有状态键
- **返回**: 字符串数组

#### useGlobalStateAll()
- **功能**: 获取所有状态
- **返回**: 状态对象

### 使用示例

```typescript
import { 
  useGlobalState, 
  useGlobalStateValue, 
  useGlobalStateSetter 
} from '@/hooks/useGlobalState';

function MyComponent() {
  // 基本使用
  const [user, setUser] = useGlobalState('user', 'John Doe');
  const [count, setCount] = useGlobalState('count', 0);

  // 只读状态
  const currentUser = useGlobalStateValue('user', 'Default User');

  // 只写状态
  const updateUser = useGlobalStateSetter('user');

  return (
    <div>
      <p>用户: {user}</p>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => updateUser('New User')}>更新用户</button>
    </div>
  );
}
```

## 2. useGlobalUndoRedo - 带撤销重做功能的全局状态

基于 `react-use` 的 `createGlobalState` 实现，提供带撤销重做功能的全局状态管理。

### 基本用法

```typescript
import { useUndoRedoState } from '@/hooks/useGlobalUndoRedo';

// 在组件中使用
const { 
  state, 
  updateState, 
  updateStateDebounced,
  undo, 
  redo, 
  canUndo, 
  canRedo,
  clearHistory 
} = useUndoRedoState('key', defaultValue, { debounceMs: 200 });
```

### 主要功能

- **状态管理**: 基本的全局状态存储和更新
- **撤销重做**: 支持撤销和重做操作
- **防抖更新**: 支持防抖更新，避免频繁操作
- **历史记录**: 自动维护操作历史
- **状态检查**: 检查是否可以撤销或重做

### 使用示例

```typescript
import { useUndoRedoState } from '@/hooks/useGlobalUndoRedo';

function MyComponent() {
  const { 
    state, 
    updateState, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useUndoRedoState('my-data', { value: 0 }, { debounceMs: 200 });

  return (
    <div>
      <p>当前值: {state.value}</p>
      <button onClick={() => updateState({ value: state.value + 1 })}>
        增加
      </button>
      <button onClick={undo} disabled={!canUndo}>
        撤销
      </button>
      <button onClick={redo} disabled={!canRedo}>
        重做
      </button>
    </div>
  );
}
```

## 选择建议

- **使用 useGlobalState**: 当只需要简单的全局状态管理，不需要撤销重做功能时
- **使用 useGlobalUndoRedo**: 当需要撤销重做功能，或者需要防抖更新时

## 注意事项

1. 全局状态会在整个应用生命周期内保持
2. 状态键名应该是唯一的，避免冲突
3. 建议在组件卸载时清理不需要的全局状态
4. 对于大量数据或频繁更新的状态，考虑使用本地状态管理 