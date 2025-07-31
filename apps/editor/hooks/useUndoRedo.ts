import { useState, useRef, useCallback } from 'react';

interface UseUndoRedoOptions {
  maxHistory?: number; // 最大历史记录数量
  debounceMs?: number; // 防抖延迟时间
}

export function useUndoRedo<T>(
  initialState: T,
  options: UseUndoRedoOptions = {}
) {
  const { maxHistory = 50, debounceMs = 0 } = options;
  
  const [currentState, setCurrentState] = useState<T>(initialState);
  const history = useRef<T[]>([initialState]);
  const historyStep = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 检查是否可以撤销
  const canUndo = historyStep.current > 0;
  
  // 检查是否可以重做
  const canRedo = historyStep.current < history.current.length - 1;

  // 更新状态并记录历史
  const updateState = useCallback((newState: T) => {
    // 清除当前步骤之后的历史
    history.current = history.current.slice(0, historyStep.current + 1);
    
    // 添加新状态到历史
    history.current.push(newState);
    historyStep.current += 1;
    
    // 限制历史记录数量
    if (history.current.length > maxHistory) {
      history.current = history.current.slice(-maxHistory);
      historyStep.current = Math.min(historyStep.current, maxHistory - 1);
    }
    
    setCurrentState(newState);
  }, [maxHistory]);

  // 防抖更新状态
  const updateStateDebounced = useCallback((newState: T) => {
    if (debounceMs === 0) {
      // 如果debounceMs为0，直接更新，不使用setTimeout
      updateState(newState);
      return;
    }
    
    // 清除之前的定时器
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // 设置新的定时器
    debounceTimer.current = setTimeout(() => {
      updateState(newState);
    }, debounceMs);
  }, [updateState, debounceMs]);

  // 撤销
  const undo = useCallback(() => {
    if (!canUndo) return;
    
    historyStep.current -= 1;
    const previousState = history.current[historyStep.current];
    setCurrentState(previousState);
  }, [canUndo]);

  // 重做
  const redo = useCallback(() => {
    if (!canRedo) return;
    
    historyStep.current += 1;
    const nextState = history.current[historyStep.current];
    setCurrentState(nextState);
  }, [canRedo]);

  // 重置历史
  const reset = useCallback((newInitialState?: T) => {
    const initialState = newInitialState !== undefined ? newInitialState : currentState;
    history.current = [initialState];
    historyStep.current = 0;
    setCurrentState(initialState);
  }, [currentState]);

  // 获取历史信息
  const getHistoryInfo = useCallback(() => ({
    currentStep: historyStep.current,
    totalSteps: history.current.length,
    canUndo,
    canRedo,
    history: [...history.current] // 返回副本
  }), [canUndo, canRedo]);

  return {
    state: currentState,
    updateState,
    updateStateDebounced,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    getHistoryInfo
  };
} 