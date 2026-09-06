import { describe, expect, it } from 'vitest';

import {
  buildSimklStatusIndex,
  canApplySimklStatusFilter,
  filterMetasBySimklStatus,
  normalizeSimklStatusFilter,
} from '../addon/utils/simklStatusFilter';

describe('Simkl status filters', () => {
  it('normalizes, deduplicates, and drops unsupported statuses', () => {
    expect(normalizeSimklStatusFilter(['watching', 'watching', 'invalid', 1])).toEqual(['watching']);
    expect(normalizeSimklStatusFilter([])).toBeUndefined();
  });

  it('fails open when Simkl is unavailable without a cached index', () => {
    expect(canApplySimklStatusFilter(true, false)).toBe(false);
    expect(canApplySimklStatusFilter(true, true)).toBe(true);
    expect(canApplySimklStatusFilter(false, false)).toBe(true);
  });

  it('matches any selected status through shared identities', () => {
    const index = buildSimklStatusIndex({
      watching: [{ movie: { ids: { imdb: 'tt123' } } }],
      completed: [{ show: { ids: { tmdb: 42 } } }],
    });
    const result = filterMetasBySimklStatus([
      { id: 'tt123', type: 'movie' },
      { id: 'tmdb:42', type: 'series' },
      { id: 'tt999', type: 'movie' },
    ], ['watching', 'completed'], index);

    expect(result.metas).toHaveLength(2);
    expect(result.matched).toBe(2);
    expect(result.unmatched).toBe(1);
  });

  it('matches anime identities directly', () => {
    const index = buildSimklStatusIndex({ watching: [{ show: { ids: { mal: 7 } } }] });
    expect(filterMetasBySimklStatus([{ id: 'mal:7' }], ['watching'], index).metas).toHaveLength(1);
  });
});
