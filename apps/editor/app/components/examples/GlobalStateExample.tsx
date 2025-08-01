"use client";
import { useState } from 'react';
import { 
  useGlobalState, 
  useGlobalStateValue, 
  useGlobalStateSetter, 
  useGlobalStateExists,
  useGlobalStateRemove,
  useGlobalStateClear,
  useGlobalStateKeys,
  useGlobalStateAll
} from '../../../hooks/useGlobalState';

export default function GlobalStateExample() {
  const [inputKey, setInputKey] = useState('user');
  const [inputValue, setInputValue] = useState('John Doe');
  const [newKey, setNewKey] = useState('');

  // 使用全局状态
  const [user, setUser] = useGlobalState('user', 'John Doe');
  const [count, setCount] = useGlobalState('count', 0);
  const [theme, setTheme] = useGlobalState('theme', 'light');

  // 只读状态
  const currentUser = useGlobalStateValue('user', 'Default User');
  const currentCount = useGlobalStateValue('count', 0);

  // 只写状态
  const updateUser = useGlobalStateSetter('user');
  const updateCount = useGlobalStateSetter('count');

  // 检查状态是否存在
  const userExists = useGlobalStateExists('user');
  const countExists = useGlobalStateExists('count');

  // 删除状态
  const removeUser = useGlobalStateRemove('user');
  const removeCount = useGlobalStateRemove('count');

  // 清空所有状态
  const clearAll = useGlobalStateClear();

  // 获取所有状态键
  const allKeys = useGlobalStateKeys();

  // 获取所有状态
  const allState = useGlobalStateAll();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">全局状态管理示例</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本使用 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">基本使用</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">用户信息</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="输入用户名"
                />
                <button
                  onClick={() => setUser('重置用户')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  重置
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">计数器</label>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">{count}</span>
                <button
                  onClick={() => setCount(count + 1)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  +1
                </button>
                <button
                  onClick={() => setCount(count - 1)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  -1
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">主题</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-4 py-2 rounded ${theme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  浅色
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  深色
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 高级功能 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">高级功能</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">动态设置状态</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="状态键名"
                />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="状态值"
                />
                <button
                  onClick={() => updateUser(inputValue)}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  设置 {inputKey}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">状态检查</label>
              <div className="space-y-2 text-sm">
                <div>用户状态存在: <span className={userExists ? 'text-green-600' : 'text-red-600'}>{userExists ? '是' : '否'}</span></div>
                <div>计数状态存在: <span className={countExists ? 'text-green-600' : 'text-red-600'}>{countExists ? '是' : '否'}</span></div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">删除状态</label>
              <div className="flex gap-2">
                <button
                  onClick={removeUser}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  删除用户
                </button>
                <button
                  onClick={removeCount}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  删除计数
                </button>
              </div>
            </div>

            <div>
              <button
                onClick={clearAll}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                清空所有状态
              </button>
            </div>
          </div>
        </div>

        {/* 状态监控 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">状态监控</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">所有状态键</label>
              <div className="p-3 bg-gray-100 rounded text-sm">
                {allKeys.length > 0 ? allKeys.join(', ') : '无状态键'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">所有状态值</label>
              <div className="p-3 bg-gray-100 rounded text-sm">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(allState, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">当前状态值</label>
              <div className="space-y-2 text-sm">
                <div>用户: <span className="font-mono">{currentUser}</span></div>
                <div>计数: <span className="font-mono">{currentCount}</span></div>
                <div>主题: <span className="font-mono">{theme}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">使用说明</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-medium">基本用法:</h3>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                const [value, setValue] = useGlobalState('key', defaultValue);
              </code>
            </div>
            
            <div>
              <h3 className="font-medium">只读状态:</h3>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                const value = useGlobalStateValue('key', defaultValue);
              </code>
            </div>
            
            <div>
              <h3 className="font-medium">只写状态:</h3>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                const setValue = useGlobalStateSetter('key');
              </code>
            </div>
            
            <div>
              <h3 className="font-medium">检查存在:</h3>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                const exists = useGlobalStateExists('key');
              </code>
            </div>
            
            <div>
              <h3 className="font-medium">删除状态:</h3>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                const remove = useGlobalStateRemove('key');
              </code>
            </div>
            
            <div>
              <h3 className="font-medium">清空所有:</h3>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                const clear = useGlobalStateClear();
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 