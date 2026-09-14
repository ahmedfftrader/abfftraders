/**
 * Non-blocking, debounced background storage utility.
 * Prevents synchronous localStorage.setItem() calls from freezing the browser UI
 * during rapid user interactions, clicks, and keypresses.
 */

type StoragePayload = unknown;

const pendingWrites = new Map<string, StoragePayload>();
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Flush any pending write for a specific key immediately.
 */
export function flushPendingStorageWrite(key: string): void {
  const timer = pendingTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    pendingTimers.delete(key);
  }

  if (pendingWrites.has(key)) {
    const data = pendingWrites.get(key);
    pendingWrites.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (err) {
      console.warn('[AsyncStorage] Flush error for key:', key, err);
    }
  }
}

/**
 * Flush all pending storage writes immediately (e.g., before page unload).
 */
export function flushAllPendingStorageWrites(): void {
  for (const key of Array.from(pendingWrites.keys())) {
    flushPendingStorageWrite(key);
  }
}

/**
 * Schedule a background, non-blocking localStorage.setItem with 300ms debounce
 * and requestIdleCallback. Does not block the main UI thread or drop clicks.
 */
export function scheduleAsyncStorageWrite(key: string, data: StoragePayload, delayMs: number = 300): void {
  // Update in-memory pending write payload immediately
  pendingWrites.set(key, data);

  // Clear existing timer for this key
  const existingTimer = pendingTimers.get(key);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    pendingTimers.delete(key);

    const executeWrite = () => {
      if (!pendingWrites.has(key)) return;
      const payload = pendingWrites.get(key);
      pendingWrites.delete(key);

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, JSON.stringify(payload));
        }
      } catch (err) {
        console.warn('[AsyncStorage] Background write error for key:', key, err);
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback(
        executeWrite,
        { timeout: 1000 }
      );
    } else {
      setTimeout(executeWrite, 0);
    }
  }, delayMs);

  pendingTimers.set(key, timer);
}

/**
 * Read from pending queue or fallback to localStorage
 */
export function getStoredItemOrPending<T = unknown>(key: string): T | null {
  if (pendingWrites.has(key)) {
    return pendingWrites.get(key) as T;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    }
  } catch (err) {
    console.warn('[AsyncStorage] Read error for key:', key, err);
  }
  return null;
}

// Auto-flush when user closes tab or changes visibility
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushAllPendingStorageWrites();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushAllPendingStorageWrites();
    }
  });
}
