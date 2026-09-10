import { describe, expect, it } from 'vitest';
import { AWARD_RULES, extractAwardIds } from '../addon/lib/awardRules';
import { filterAndPaginateAwardMetas, paginateAwardMetas } from '../addon/lib/awardPagination';
import { applyAwardCatalogSort, normalizeAwardCatalogSort } from '../addon/utils/awardCatalogOptions';

describe('award catalog extraction', () => {
  it('selects winners, applies historical category filters, and deduplicates IDs', () => {
    const snapshot = {
      '2024': {
        'Golden Globe': {
          'Best Motion Picture - Drama': { winner: ['tt100', 'tt100'], nominee: ['tt200'] },
          'Best Director - Motion Picture': { winner: ['tt300'] },
          'Best TV Series': { winner: ['tt400'] },
        },
      },
    };

    expect(extractAwardIds(snapshot, AWARD_RULES[1])).toEqual(['tt100']);
    expect(extractAwardIds(snapshot, AWARD_RULES[2])).toEqual(['tt300']);
  });

  it('matches Cannes by award heading and only accepts IMDb title IDs', () => {
    const snapshot = {
      '2024': {
        "Palme d'Or": {
          "Palme d'Or": { winner: ['tt500', 'nm123'] },
        },
      },
    };

    expect(extractAwardIds(snapshot, AWARD_RULES[0])).toEqual(['tt500']);
  });

  it('paginates after filtering by taking the complete source set first', () => {
    const allWinners = [
      { id: 'tt1', simkl_status: 'completed' },
      { id: 'tt2', simkl_status: 'watching' },
      { id: 'tt3', simkl_status: 'completed' },
    ];
    expect(filterAndPaginateAwardMetas(allWinners, meta => meta.simkl_status === 'completed', 0, 1))
      .toEqual([{ id: 'tt1', simkl_status: 'completed' }]);
    expect(filterAndPaginateAwardMetas(allWinners, meta => meta.simkl_status === 'completed', 1, 1))
      .toEqual([{ id: 'tt3', simkl_status: 'completed' }]);
    expect(paginateAwardMetas(allWinners, 2, 1)).toEqual([{ id: 'tt2', simkl_status: 'watching' }]);
  });

  it('normalizes unknown sort values to release-date ordering', () => {
    expect(normalizeAwardCatalogSort(undefined)).toBe('default');
    expect(normalizeAwardCatalogSort('home_release_date')).toBe('default');
    expect(normalizeAwardCatalogSort('random')).toBe('random');
  });

  it('orders the filtered award set deterministically before pagination', () => {
    const eligible = [{ id: 'tt1' }, { id: 'tt2' }, { id: 'tt3' }, { id: 'tt4' }];
    const ordered = applyAwardCatalogSort(eligible, 'random', 'user-1', 'awards.imdb.catalog', '2026-09-10');

    expect(ordered.map(meta => meta.id)).toEqual(['tt2', 'tt1', 'tt4', 'tt3']);
    expect(eligible).toEqual([{ id: 'tt1' }, { id: 'tt2' }, { id: 'tt3' }, { id: 'tt4' }]);
  });

  it('copies the award set without changing release-date order for the default sort', () => {
    const eligible = [{ id: 'tt1', released: '2020-01-01' }, { id: 'tt2', released: '2024-01-01' }];
    const ordered = applyAwardCatalogSort(eligible, undefined, 'user-1', 'awards.imdb.catalog');

    expect(ordered).toEqual(eligible);
    expect(ordered).not.toBe(eligible);
  });
});
