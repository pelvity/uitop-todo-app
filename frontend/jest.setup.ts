import '@testing-library/jest-dom';

// Configure act environment for React 19 tests
global.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Polyfill MessageChannel for antd Select in jsdom
if (typeof globalThis.MessageChannel === 'undefined') {
  globalThis.MessageChannel = class MessageChannel {
    readonly port1: MessagePort;
    readonly port2: MessagePort;
    constructor() {
      const channel = new (require('worker_threads').MessageChannel)();
      this.port1 = channel.port1 as unknown as MessagePort;
      this.port2 = channel.port2 as unknown as MessagePort;
    }
  } as unknown as typeof MessageChannel;
}

// Polyfill ResizeObserver for antd dropdown positioning in jsdom
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// Polyfill window.matchMedia for antd components in jsdom
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

