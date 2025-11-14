export function createEventBus() {
  const listeners = new Map();

  function on(eventName, handler) {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, new Set());
    }
    listeners.get(eventName).add(handler);
    return () => off(eventName, handler);
  }

  function off(eventName, handler) {
    const handlers = listeners.get(eventName);
    if (!handlers) {
      return;
    }
    handlers.delete(handler);
    if (handlers.size === 0) {
      listeners.delete(eventName);
    }
  }

  function emit(eventName, detail) {
    const handlers = listeners.get(eventName);
    if (!handlers) {
      return;
    }
    handlers.forEach(handler => {
      try {
        handler(detail);
      } catch (error) {
        console.error(`Event handler for "${eventName}" failed:`, error);
      }
    });
  }

  return { on, off, emit };
}
