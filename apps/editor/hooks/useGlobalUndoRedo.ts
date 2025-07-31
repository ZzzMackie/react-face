import { createGlobalState } from 'react-use';
import { useCallback, useRef, useEffect } from 'react';

interface HistoryEntry {
  id: string;
  timestamp: number;
  state: any;
  description?: string;
}

interface GlobalUndoRedoState {
  history: HistoryEntry[];
  currentStep: number;
}

// 创建全局状态
const useGlobalUndoRedoState = createGlobalState<GlobalUndoRedoState>({
  history: [],
  currentStep: -1
});

// 便捷的hooks
export function useUndoRedoState<T>(
  id: string,
  initialState?: T,
  options: {
    debounceMs?: number;
    maxHistory?: number;
  } = {}
) {
  const { debounceMs = 0, maxHistory = 50 } = options;
  const [state, setState] = useGlobalUndoRedoState();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);
  
  // 获取当前状态
  const getCurrentState = useCallback((targetId: string) => {
    const { history, currentStep } = state;
    if (currentStep >= 0 && currentStep < history.length) {
      const entry = history[currentStep];
      return entry.id === targetId ? entry.state : null;
    }
    return null;
  }, [state]);
  
  const currentState = getCurrentState(id) as T || initialState;
  
  // 初始化：如果当前状态不存在，将初始状态添加到历史记录
  useEffect(() => {
    if (!isInitialized.current && getCurrentState(id) === null) {
      const { history, currentStep } = state;
      
      // 添加初始状态到历史记录
      const newEntry: HistoryEntry = {
        id,
        timestamp: Date.now(),
        state: initialState,
        description: '初始状态'
      };
      
      const newHistory = [...history, newEntry];
      
      setState({
        history: newHistory,
        currentStep: newHistory.length - 1
      });
      
      isInitialized.current = true;
    }
  }, [id, initialState, state, setState, getCurrentState]);
  
  // 更新状态
  const updateState = useCallback((newState: T, description?: string) => {
    const { history, currentStep } = state;
    
    // 移除当前步骤之后的历史
    const newHistory = history.slice(0, currentStep + 1);
    
    // 添加新状态
    const newEntry: HistoryEntry = {
      id,
      timestamp: Date.now(),
      state: newState,
      description
    };
    
    newHistory.push(newEntry);
    
    // 限制历史记录数量
    if (newHistory.length > maxHistory) {
      newHistory.splice(0, newHistory.length - maxHistory);
    }
    
    setState({
      history: newHistory,
      currentStep: newHistory.length - 1
    });
  }, [state, id, maxHistory, setState]);
  
  // 防抖更新
  const updateStateDebounced = useCallback((newState: T, description?: string) => {
    if (debounceMs === 0) {
      // 如果debounceMs为0，直接更新，不使用setTimeout
      updateState(newState, description);
      return;
    }
    
    // 清除之前的定时器
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // 设置新的定时器
    debounceTimer.current = setTimeout(() => {
      updateState(newState, description);
    }, debounceMs);
  }, [updateState, debounceMs]);
  
  // 撤销
  const undo = useCallback(() => {
    const { history, currentStep } = state;
    if (currentStep > 0) {
      setState({
        ...state,
        currentStep: currentStep - 1
      });
    }
  }, [state, setState]);
  
  // 重做
  const redo = useCallback(() => {
    const { history, currentStep } = state;
    if (currentStep < history.length - 1) {
      setState({
        ...state,
        currentStep: currentStep + 1
      });
    }
  }, [state, setState]);
  
  // 检查是否可以撤销/重做
  const canUndo = state.currentStep > 0;
  const canRedo = state.currentStep < state.history.length - 1;
  
  return {
    state: currentState,
    updateState,
    updateStateDebounced,
    undo,
    redo,
    canUndo,
    canRedo
  };
}

// 全局操作函数
export function useGlobalUndoRedo() {
  const [state, setState] = useGlobalUndoRedoState();
  
  const undo = useCallback(() => {
    const { history, currentStep } = state;
    if (currentStep > 0) {
      setState({
        ...state,
        currentStep: currentStep - 1
      });
    }
  }, [state, setState]);
  
  const redo = useCallback(() => {
    const { history, currentStep } = state;
    if (currentStep < history.length - 1) {
      setState({
        ...state,
        currentStep: currentStep + 1
      });
    }
  }, [state, setState]);
  
  const reset = useCallback(() => {
    setState({
      history: [],
      currentStep: -1
    });
  }, [setState]);
  
  const canUndo = state.currentStep > 0;
  const canRedo = state.currentStep < state.history.length - 1;
  
  return {
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    history: state.history,
    currentStep: state.currentStep
  };
} 