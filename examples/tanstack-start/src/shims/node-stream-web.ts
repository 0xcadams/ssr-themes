export const ReadableStream =
  globalThis.ReadableStream ??
  class ReadableStream {
    constructor() {
      throw new Error('ReadableStream is not available in the browser.');
    }
  };
