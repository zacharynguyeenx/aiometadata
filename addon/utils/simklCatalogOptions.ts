import crypto from 'node:crypto';

const MAX_SIMKL_CATALOG_LIMIT = 20;

export type SimklCatalogSort = 'default' | 'home_release_date' | 'random';

function validDateMs(value: unknown): number | null {
  if (!value) return null;
  const time = new Date(String(value)).getTime();
  return Number.isFinite(time) ? time : null;
}

function stableHash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function itemIdentity(meta: any, index: number): string {
  return String(meta?.id || meta?.imdb_id || meta?.name || `index:${index}`);
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
    const day = options.day || new Date().toISOString().slice(0, 10);
    const seed = `${options.userUUID || ''}:${options.catalogId}:${day}`;
    ordered = ordered
      .map((meta, index) => ({ meta, index, key: stableHash(`${seed}:${itemIdentity(meta, index)}`) }))
      .sort((a, b) => a.key.localeCompare(b.key) || a.index - b.index)
      .map(({ meta }) => meta);
  }

  return limit === undefined ? ordered : ordered.slice(0, limit);
}

export const SIMKL_CATALOG_PAGE_SIZE = 20;
