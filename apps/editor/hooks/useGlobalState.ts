import { createGlobalState } from 'react-use';

// 全局状态类型定义
export interface GlobalState {
  [key: string]: any;
}

// 创建全局状态实例
const useGlobalStateInstance = createGlobalState<GlobalState>({});

/**
 * 全局状态管理Hook
 * 基于react-use的createGlobalState实现
 * 
 * @param key 状态键名
 * @param defaultValue 默认值
 * @returns [state, setState] 状态和更新函数
 */
export function useGlobalState<T = any>(key: string, defaultValue?: T): [T, (value: T) => void] {
  const [globalState, setGlobalState] = useGlobalStateInstance();
  
  // 获取当前状态值
  const currentValue = globalState[key] !== undefined ? globalState[key] : defaultValue;
  
  // 更新状态
  const setValue = (value: T) => {
    setGlobalState(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  return [currentValue, setValue];
}

/**
 * 获取全局状态值（只读）
 * 
 * @param key 状态键名
 * @param defaultValue 默认值
 * @returns 状态值
 */
export function useGlobalStateValue<T = any>(key: string, defaultValue?: T): T {
  const [value] = useGlobalState(key, defaultValue);
  return value;
}

/**
 * 设置全局状态值（只写）
 * 
 * @param key 状态键名
 * @returns 设置函数
 */
export function useGlobalStateSetter<T = any>(key: string): (value: T) => void {
  const [, setValue] = useGlobalState(key);
  return setValue;
}

/**
 * 检查全局状态是否存在
 * 
 * @param key 状态键名
 * @returns 是否存在
 */
export function useGlobalStateExists(key: string): boolean {
  const [globalState] = useGlobalStateInstance();
  return key in globalState;
}

/**
 * 删除全局状态
 * 
 * @param key 状态键名
 * @returns 删除函数
 */
export function useGlobalStateRemove(key: string): () => void {
  const [, setGlobalState] = useGlobalStateInstance();
  
  return () => {
    setGlobalState(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };
}

/**
 * 清空所有全局状态
 * 
 * @returns 清空函数
 */
export function useGlobalStateClear(): () => void {
  const [, setGlobalState] = useGlobalStateInstance();
  
  return () => {
    setGlobalState({});
  };
}

/**
 * 获取所有全局状态键
 * 
 * @returns 所有状态键
 */
export function useGlobalStateKeys(): string[] {
  const [globalState] = useGlobalStateInstance();
  return Object.keys(globalState);
}

/**
 * 获取所有全局状态
 * 
 * @returns 所有状态
 */
export function useGlobalStateAll(): GlobalState {
  const [globalState] = useGlobalStateInstance();
  return globalState;
} 