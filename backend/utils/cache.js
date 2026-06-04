const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

class Cache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  set(key, value) {
    this.store.set(key, {
      value,
      expiry: Date.now() + CACHE_TTL_MS
    });
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

export const agentCache = new Cache();
