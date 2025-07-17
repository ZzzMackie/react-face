export type SignalCallback<T = unknown> = (value: T, oldValue: T) => void;
export type ComputedCallback<T = unknown> = () => T;

export interface SignalOptions<T = unknown> {
  readonly?: boolean;
  equals?: (a: T, b: T) => boolean;
  onChanged?: SignalCallback<T>;
}

export class Signal<T = unknown> {
  private _value: T;
  private _subscribers: Set<SignalCallback<T>> = new Set();
  private readonly _options: SignalOptions<T>;

  constructor(initialValue: T, options: SignalOptions<T> = {}) {
    this._value = initialValue;
    this._options = options;
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    const oldValue = this._value;
    if (newValue === oldValue) return;
    this._value = newValue;
    this._subscribers.forEach(callback => callback(newValue, oldValue));
  }

  subscribe(callback: SignalCallback<T>): () => void {
    this._subscribers.add(callback);
    return () => this._subscribers.delete(callback);
  }

  emit(value: T): void {
    this.value = value;
  }

  dispose(): void {
    this._subscribers.clear();
  }
}

export function createSignal<T = unknown>(initialValue: T): Signal<T> {
  return new Signal(initialValue);
} 