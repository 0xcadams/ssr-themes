export class AsyncLocalStorage<T = unknown> {
  disable() {}

  enterWith(_store: T) {}

  getStore(): T | undefined {
    return undefined;
  }

  run<R>(
    _store: T,
    callback: (...args: unknown[]) => R,
    ...args: unknown[]
  ): R {
    return callback(...args);
  }
}
