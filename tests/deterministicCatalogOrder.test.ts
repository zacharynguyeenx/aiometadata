import { describe, expect, it } from 'vitest';
import { applyDeterministicCatalogOrder } from '../addon/utils/deterministicCatalogOrder';

describe('deterministic catalog ordering', () => {
  const metas = [{ id: 'tt1' }, { id: 'tt2' }, { id: 'tt3' }, { id: 'tt4' }];

  it('keeps the same order for the same user, catalog, and day', () => {
    const options = { userUUID: 'user-1', catalogId: 'awards.imdb.catalog', day: '2026-09-10' };

    expect(applyDeterministicCatalogOrder(metas, options)).toEqual(
      applyDeterministicCatalogOrder(metas, options),
    );
  });

  it('changes the order when the day changes and does not mutate the input', () => {
    const first = applyDeterministicCatalogOrder(metas, {
      userUUID: 'user-1',
      catalogId: 'awards.imdb.catalog',
      day: '2026-09-10',
    });
    const second = applyDeterministicCatalogOrder(metas, {
      userUUID: 'user-1',
      catalogId: 'awards.imdb.catalog',
      day: '2026-09-11',
    });

    expect(second).not.toEqual(first);
    expect(metas).toEqual([{ id: 'tt1' }, { id: 'tt2' }, { id: 'tt3' }, { id: 'tt4' }]);
  });

  it('uses the existing metadata identity precedence', () => {
    const items = [
      { id: 'id' },
      { imdb_id: 'imdb' },
      { name: 'name' },
      {},
    ];

    expect(applyDeterministicCatalogOrder(items, {
      catalogId: 'catalog',
      day: '2026-09-10',
    })).toHaveLength(4);
  });
});
