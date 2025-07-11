import { createSignal, createComputed, batchUpdateSignals } from '../../src/core/Signal';

describe('Signal', () => {
  describe('createSignal', () => {
    test('应该创建信号并设置初始值', () => {
      const signal = createSignal(42);
      expect(signal.value).toBe(42);
    });

    test('应该更新信号值', () => {
      const signal = createSignal(0);
      signal.value = 100;
      expect(signal.value).toBe(100);
    });

    test('应该通知订阅者', () => {
      const signal = createSignal(0);
      const mockCallback = jest.fn();
      
      signal.subscribe(mockCallback);
      signal.value = 50;
      
      expect(mockCallback).toHaveBeenCalledWith(50);
    });

    test('应该通知多个订阅者', () => {
      const signal = createSignal(0);
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();
      
      signal.subscribe(mockCallback1);
      signal.subscribe(mockCallback2);
      signal.value = 25;
      
      expect(mockCallback1).toHaveBeenCalledWith(25);
      expect(mockCallback2).toHaveBeenCalledWith(25);
    });

    test('应该取消订阅', () => {
      const signal = createSignal(0);
      const mockCallback = jest.fn();
      
      const unsubscribe = signal.subscribe(mockCallback);
      signal.value = 10;
      unsubscribe();
      signal.value = 20;
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(10);
    });

    test('应该处理复杂对象', () => {
      const obj = { name: 'test', value: 42 };
      const signal = createSignal(obj);
      
      expect(signal.value).toEqual(obj);
      
      const newObj = { name: 'updated', value: 100 };
      signal.value = newObj;
      
      expect(signal.value).toEqual(newObj);
    });

    test('应该处理数组', () => {
      const arr = [1, 2, 3];
      const signal = createSignal(arr);
      
      expect(signal.value).toEqual(arr);
      
      const newArr = [4, 5, 6];
      signal.value = newArr;
      
      expect(signal.value).toEqual(newArr);
    });
  });

  describe('createComputed', () => {
    test('应该创建计算信号', () => {
      const a = createSignal(5);
      const b = createSignal(3);
      const computed = createComputed(() => a.value + b.value);
      
      expect(computed.value).toBe(8);
    });

    test('应该自动更新计算信号', () => {
      const a = createSignal(5);
      const b = createSignal(3);
      const computed = createComputed(() => a.value + b.value);
      
      expect(computed.value).toBe(8);
      
      a.value = 10;
      expect(computed.value).toBe(13);
      
      b.value = 7;
      expect(computed.value).toBe(17);
    });

    test('应该通知计算信号的订阅者', () => {
      const a = createSignal(5);
      const b = createSignal(3);
      const computed = createComputed(() => a.value + b.value);
      const mockCallback = jest.fn();
      
      computed.subscribe(mockCallback);
      a.value = 10;
      
      expect(mockCallback).toHaveBeenCalledWith(13);
    });

    test('应该处理嵌套计算', () => {
      const a = createSignal(2);
      const b = createSignal(3);
      const c = createSignal(4);
      
      const sum = createComputed(() => a.value + b.value);
      const product = createComputed(() => sum.value * c.value);
      
      expect(product.value).toBe(20);
      
      a.value = 5;
      expect(product.value).toBe(32);
    });

    test('应该处理条件计算', () => {
      const condition = createSignal(true);
      const a = createSignal(10);
      const b = createSignal(20);
      
      const result = createComputed(() => 
        condition.value ? a.value : b.value
      );
      
      expect(result.value).toBe(10);
      
      condition.value = false;
      expect(result.value).toBe(20);
    });
  });

  describe('batchUpdateSignals', () => {
    test('应该批量更新信号', () => {
      const a = createSignal(0);
      const b = createSignal(0);
      const computed = createComputed(() => a.value + b.value);
      const mockCallback = jest.fn();
      
      computed.subscribe(mockCallback);
      
      batchUpdateSignals(() => {
        a.value = 10;
        b.value = 20;
      });
      
      expect(computed.value).toBe(30);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(30);
    });

    test('应该避免中间更新', () => {
      const a = createSignal(0);
      const b = createSignal(0);
      const computed = createComputed(() => a.value + b.value);
      const mockCallback = jest.fn();
      
      computed.subscribe(mockCallback);
      
      batchUpdateSignals(() => {
        a.value = 5;
        b.value = 15;
        a.value = 10;
      });
      
      expect(computed.value).toBe(25);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(25);
    });
  });

  describe('信号链', () => {
    test('应该处理信号链', () => {
      const input = createSignal('');
      const length = createComputed(() => input.value.length);
      const isValid = createComputed(() => length.value > 0);
      const message = createComputed(() => 
        isValid.value ? `Length: ${length.value}` : 'Empty'
      );
      
      expect(message.value).toBe('Empty');
      
      input.value = 'hello';
      expect(message.value).toBe('Length: 5');
      
      input.value = 'world';
      expect(message.value).toBe('Length: 5');
      
      input.value = '';
      expect(message.value).toBe('Empty');
    });
  });

  describe('错误处理', () => {
    test('应该处理计算中的错误', () => {
      const a = createSignal(0);
      const computed = createComputed(() => {
        if (a.value === 0) {
          throw new Error('Division by zero');
        }
        return 10 / a.value;
      });
      
      expect(() => computed.value).toThrow('Division by zero');
      
      a.value = 2;
      expect(computed.value).toBe(5);
    });
  });

  describe('性能', () => {
    test('应该避免不必要的重新计算', () => {
      let computeCount = 0;
      const a = createSignal(1);
      const b = createSignal(2);
      const c = createSignal(3);
      
      const computed = createComputed(() => {
        computeCount++;
        return a.value + b.value;
      });
      
      expect(computed.value).toBe(3);
      expect(computeCount).toBe(1);
      
      // 更新不相关的信号
      c.value = 4;
      expect(computed.value).toBe(3);
      expect(computeCount).toBe(1);
      
      // 更新相关信号
      a.value = 5;
      expect(computed.value).toBe(7);
      expect(computeCount).toBe(2);
    });
  });

  describe('dispose', () => {
    test('应该正确清理信号', () => {
      const signal = createSignal(0);
      const mockCallback = jest.fn();
      
      signal.subscribe(mockCallback);
      signal.dispose();
      
      signal.value = 100;
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('应该清理计算信号', () => {
      const a = createSignal(1);
      const computed = createComputed(() => a.value * 2);
      const mockCallback = jest.fn();
      
      computed.subscribe(mockCallback);
      computed.dispose();
      
      a.value = 5;
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
}); 