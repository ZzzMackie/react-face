export const proxyOptions = (object: Record<string, unknown>, proxyObject: Record<string, unknown>) => {
  Object.keys(proxyObject).forEach(key => {
    Object.defineProperty(object, key, {
      get() { return proxyObject[key]; },
      set(val) { proxyObject[key] = val; }
    });
  });
};

export const createReadOnlyProxy = <T extends Record<string, unknown>>(object: T): T => {
  return new Proxy(object, {
    get(target, prop) { return target[prop as keyof T]; },
    set() { console.warn('Attempting to modify read-only object'); return false; }
  });
};
