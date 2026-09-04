import { describe, expect, it, vi } from 'vitest';
import { InMemoryCacheStore, getOrSet } from '../addon/lib/cacheStore';

describe('cache store seam', () => {
  it('returns cached values and avoids repeating the loader', async () => {
    const store = new InMemoryCacheStore();
    const loader = vi.fn(async () => ({ title: 'Dune' }));
    await expect(getOrSet(store, 'movie:1', loader)).resolves.toEqual({ title: 'Dune' });
    await expect(getOrSet(store, 'movie:1', loader)).resolves.toEqual({ title: 'Dune' });
    expect(loader).toHaveBeenCalledOnce();
  });

  it('expires entries using the supplied TTL', async () => {
    vi.useFakeTimers();
    const store = new InMemoryCacheStore();
    await store.set('key', 'value', 10);
    vi.advanceTimersByTime(10_001);
    await expect(store.get('key')).resolves.toBeNull();
    vi.useRealTimers();
  });
});
