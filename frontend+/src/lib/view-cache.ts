type CacheEnvelope<T> = {
  expiresAt: number;
  value: T;
};

function storage() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function readViewCache<T>(key: string): T | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed || typeof parsed.expiresAt !== "number") return null;
    if (parsed.expiresAt < Date.now()) {
      store.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

export function writeViewCache<T>(key: string, value: T, ttlMs = 60_000) {
  const store = storage();
  if (!store) return;
  try {
    const payload: CacheEnvelope<T> = {
      expiresAt: Date.now() + ttlMs,
      value,
    };
    store.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore quota and serialization errors.
  }
}

