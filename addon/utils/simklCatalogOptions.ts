import { applyDeterministicCatalogOrder } from './deterministicCatalogOrder.js';

const MAX_SIMKL_CATALOG_LIMIT = 20;

export type SimklCatalogSort = 'default' | 'home_release_date' | 'random';

function validDateMs(value: unknown): number | null {
  if (!value) return null;
  const time = new Date(String(value)).getTime();
  return Number.isFinite(time) ? time : null;
}

export function normalizeSimklCatalogLimit(value: unknown): number | undefined {
  const limit = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_SIMKL_CATALOG_LIMIT) return undefined;
  return limit;
}

export function applySimklCatalogOptions(
  metas: any[],
  options: { sort?: unknown; limit?: unknown; userUUID?: string; catalogId: string; day?: string },
): any[] {
  const sort = options.sort === 'home_release_date' || options.sort === 'random' ? options.sort : 'default';
  const limit = normalizeSimklCatalogLimit(options.limit);
  let ordered = metas.slice();

  if (sort === 'home_release_date') {
    ordered = ordered
      .map((meta, index) => ({ meta, index, date: validDateMs(meta?._releaseAvailability?.earliestHomeReleaseDate) }))
      .sort((a, b) => {
        if (a.date === null && b.date === null) return a.index - b.index;
        if (a.date === null) return 1;
        if (b.date === null) return -1;
        return b.date - a.date || a.index - b.index;
      })
      .map(({ meta }) => meta);
  } else if (sort === 'random') {
    ordered = applyDeterministicCatalogOrder(ordered, options);
  }

  return limit === undefined ? ordered : ordered.slice(0, limit);
}

export const SIMKL_CATALOG_PAGE_SIZE = 20;
