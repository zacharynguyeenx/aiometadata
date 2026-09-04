export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export class InMemoryCacheStore implements CacheStore {
  private readonly entries = new Map<string, { value: string; expiresAt: number | null }>();

  async get(key: string): Promise<string | null> {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.entries.set(key, {
      value,
      expiresAt: ttlSeconds === undefined ? null : Date.now() + ttlSeconds * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key);
  }
}

export async function getOrSet<T>(
  store: CacheStore,
  key: string,
  loader: () => Promise<T>,
  ttlSeconds?: number,
): Promise<T> {
  const cached = await store.get(key);
  if (cached !== null) return JSON.parse(cached) as T;

  const value = await loader();
  await store.set(key, JSON.stringify(value), ttlSeconds);
  return value;
}
