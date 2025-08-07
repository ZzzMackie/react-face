import { createGlobalState } from 'react-use';
import { useCallback, useRef, useEffect } from 'react';

// 单个状态条目
interface StateEntry {
  id: string;
  timestamp: number;
  state: any;
  description?: string;
}

// 全局状态 - 独立的undo栈和redo栈
interface GlobalUndoRedoState {
  undoStack: StateEntry[]; // 独立的undo栈
  redoStack: StateEntry[]; // 独立的redo栈
  currentStates: Record<string, any>; // 当前各ID的状态
}

const globalStateInitializedMap = new Map<string, boolean>();

// 创建全局状态
const useGlobalUndoRedoState = createGlobalState<GlobalUndoRedoState>({
  undoStack: [],
  redoStack: [],
  currentStates: {}
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
  
  // 获取当前状态 - 优先从全局状态获取
  const currentState = state.currentStates[id] !== undefined 
    ? (state.currentStates[id] as T) 
    : initialState;
  
  // 初始化：如果当前状态不存在，将初始状态添加到当前状态
  useEffect(() => {
    // 只有当全局状态中没有这个ID的数据，且传入了initialState时才初始化
    if (state.currentStates[id] === undefined && initialState !== undefined) {
      const newCurrentStates = { ...state.currentStates, [id]: initialState };
      
      setState({
        ...state,
        currentStates: newCurrentStates
      });
      
      globalStateInitializedMap.set(id, true);
    }
  }, [id, initialState, state.currentStates, setState]);
  
  // 更新状态 - 数据进入undo栈
  const updateState = useCallback((newState: T, description?: string) => {
    const currentState = state.currentStates[id];
    
    // 创建新的状态条目
    const newEntry: StateEntry = {
      id,
      timestamp: Date.now(),
      state: currentState, // 保存当前状态到undo栈
      description
    };
    
    // 将当前状态推入undo栈
    const newUndoStack = [...state.undoStack, newEntry];
    
    // 限制undo栈大小
    if (newUndoStack.length > maxHistory) {
      newUndoStack.splice(0, newUndoStack.length - maxHistory);
    }
    
    // 清空redo栈（因为有了新的操作）
    const newRedoStack: StateEntry[] = [];
    
    // 更新当前状态
    const newCurrentStates = { ...state.currentStates, [id]: newState };
    
    setState({
      undoStack: newUndoStack,
      redoStack: newRedoStack,
      currentStates: newCurrentStates
    });
  }, [state, id, maxHistory, setState]);
  
  // 防抖更新
  const updateStateDebounced = useCallback((newState: T, description?: string) => {
    if (debounceMs === 0) {
      updateState(newState, description);
      return;
    }
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      updateState(newState, description);
    }, debounceMs);
  }, [updateState, debounceMs]);
  
  // 撤销 - 从undo栈弹出，进入redo栈
  const undo = useCallback(() => {
    if (state.undoStack.length > 0) {
      const lastEntry = state.undoStack[state.undoStack.length - 1];
      
      // 如果最后一条记录是当前ID的
      if (lastEntry.id === id) {
        const currentState = state.currentStates[id];
        
        // 将当前状态推入redo栈
        const redoEntry: StateEntry = {
          id,
          timestamp: Date.now(),
          state: currentState,
          description: `重做: ${lastEntry.description || '无描述'}`
        };
        
        const newRedoStack = [...state.redoStack, redoEntry];
        
        // 从undo栈弹出
        const newUndoStack = state.undoStack.slice(0, -1);
        
        // 更新当前状态为undo栈中的状态
        const newCurrentStates = { ...state.currentStates, [id]: lastEntry.state };
        
        setState({
          undoStack: newUndoStack,
          redoStack: newRedoStack,
          currentStates: newCurrentStates
        });
      }
    }
  }, [state, id, setState]);
  
  // 重做 - 从redo栈弹出，进入undo栈
  const redo = useCallback(() => {
    if (state.redoStack.length > 0) {
      const lastRedoEntry = state.redoStack[state.redoStack.length - 1];
      
      // 如果最后一条redo记录是当前ID的
      if (lastRedoEntry.id === id) {
        const currentState = state.currentStates[id];
        
        // 将当前状态推入undo栈
        const undoEntry: StateEntry = {
          id,
          timestamp: Date.now(),
          state: currentState,
          description: `撤销: ${lastRedoEntry.description || '无描述'}`
        };
        
        const newUndoStack = [...state.undoStack, undoEntry];
        
        // 从redo栈弹出
        const newRedoStack = state.redoStack.slice(0, -1);
        
        // 更新当前状态为redo栈中的状态
        const newCurrentStates = { ...state.currentStates, [id]: lastRedoEntry.state };
        
        setState({
          undoStack: newUndoStack,
          redoStack: newRedoStack,
          currentStates: newCurrentStates
        });
      }
    }
  }, [state, id, setState]);
  
  // 检查是否可以撤销/重做
  const canUndo = state.undoStack.length > 0 && state.undoStack[state.undoStack.length - 1]?.id === id;
  const canRedo = state.redoStack.length > 0 && state.redoStack[state.redoStack.length - 1]?.id === id;
  
  return {
    state: currentState,
    updateState,
    updateStateDebounced,
    undo,
    redo,
    canUndo,
    canRedo,
    // 获取指定步骤的状态
    getStateAtStep: useCallback((stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < state.undoStack.length) {
        const entry = state.undoStack[stepIndex];
        return entry.id === id ? entry.state as T : null;
      }
      return null;
    }, [state.undoStack, id])
  };
}

// 全局操作函数
export function useGlobalUndoRedo() {
  const [state, setState] = useGlobalUndoRedoState();
  
  // 全局撤销 - 从undo栈弹出，进入redo栈
  const undo = useCallback(() => {
    if (state.undoStack.length > 0) {
      const lastEntry = state.undoStack[state.undoStack.length - 1];
      const currentState = state.currentStates[lastEntry.id];
      
      // 将当前状态推入redo栈
      const redoEntry: StateEntry = {
        id: lastEntry.id,
        timestamp: Date.now(),
        state: currentState,
        description: `全局重做: ${lastEntry.description || '无描述'}`
      };
      
      const newRedoStack = [...state.redoStack, redoEntry];
      
      // 从undo栈弹出
      const newUndoStack = state.undoStack.slice(0, -1);
      
      // 更新当前状态为undo栈中的状态
      const newCurrentStates = { ...state.currentStates, [lastEntry.id]: lastEntry.state };
      
      setState({
        undoStack: newUndoStack,
        redoStack: newRedoStack,
        currentStates: newCurrentStates
      });
    }
  }, [state, setState]);
  
  // 全局重做 - 从redo栈弹出，进入undo栈
  const redo = useCallback(() => {
    if (state.redoStack.length > 0) {
      const lastRedoEntry = state.redoStack[state.redoStack.length - 1];
      const currentState = state.currentStates[lastRedoEntry.id];
      
      // 将当前状态推入undo栈
      const undoEntry: StateEntry = {
        id: lastRedoEntry.id,
        timestamp: Date.now(),
        state: currentState,
        description: `全局撤销: ${lastRedoEntry.description || '无描述'}`
      };
      
      const newUndoStack = [...state.undoStack, undoEntry];
      
      // 从redo栈弹出
      const newRedoStack = state.redoStack.slice(0, -1);
      
      // 更新当前状态为redo栈中的状态
      const newCurrentStates = { ...state.currentStates, [lastRedoEntry.id]: lastRedoEntry.state };
      
      setState({
        undoStack: newUndoStack,
        redoStack: newRedoStack,
        currentStates: newCurrentStates
      });
    }
  }, [state, setState]);
  
  // 重置所有历史记录
  const reset = useCallback(() => {
    setState({
      undoStack: [],
      redoStack: [],
      currentStates: {}
    });
  }, [setState]);
  
  const canUndo = state.undoStack.length > 0;
  const canRedo = state.redoStack.length > 0;
  
  return {
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    undoStack: state.undoStack,
    redoStack: state.redoStack,
    currentStates: state.currentStates,
    // 获取所有ID的历史记录
    getIdHistories: () => state.currentStates
  };
} 