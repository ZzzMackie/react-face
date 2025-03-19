// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const proxyOptions = (object: Record<string, any>, proxyObject: Record<string, any>) => {
  // 代理options属性到对象
  Object.keys(proxyObject).forEach(key => {
    Object.defineProperty(object, key, {
      get() {
        return proxyObject[key];
      },
      set(val) {
        proxyObject[key] = val;
      }
    });
  });
};
