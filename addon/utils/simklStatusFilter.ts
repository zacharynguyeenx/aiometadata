export const SIMKL_LIST_STATUSES = ['plantowatch', 'watching', 'hold', 'completed', 'dropped'] as const;

export type SimklListStatus = typeof SIMKL_LIST_STATUSES[number];

export const SIMKL_STATUS_LABELS: Record<SimklListStatus, string> = {
  plantowatch: 'Plan to Watch',
  watching: 'Watching',
  hold: 'On Hold',
  completed: 'Completed',
  dropped: 'Dropped',
};

export function normalizeSimklStatusFilter(value: unknown): SimklListStatus[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const statuses = [...new Set(value.filter((entry): entry is string => typeof entry === 'string'))]
    .filter((entry): entry is SimklListStatus => (SIMKL_LIST_STATUSES as readonly string[]).includes(entry));
  return statuses.length > 0 ? statuses : undefined;
}

function identityKeys(value: any): string[] {
  if (!value || typeof value !== 'object') return [];
  const ids = value.ids || value;
  const keys: string[] = [];
  for (const [name, raw] of Object.entries(ids)) {
    if (raw === undefined || raw === null || raw === '') continue;
    const normalized = String(raw).trim();
    if (!normalized) continue;
    keys.push(`${name}:${normalized.toLowerCase()}`);
    if (name === 'imdb' && !normalized.toLowerCase().startsWith('tt')) keys.push(`imdb:tt${normalized}`);
  }
  try {
    const idMapper = require('../lib/id-mapper');
    const mappings = [
      ids.mal && idMapper.getMappingByMalId(ids.mal),
      ids.anilist && idMapper.getMappingByAnilistId(ids.anilist),
      ids.kitsu && idMapper.getMappingByKitsuId(ids.kitsu),
      ids.anidb && idMapper.getMappingByAnidbId(ids.anidb),
    ].filter(Boolean);
    for (const mapping of mappings) {
      for (const [name, raw] of Object.entries(mapping)) {
        if (['mal_id', 'anilist_id', 'kitsu_id', 'anidb_id', 'imdb_id', 'themoviedb_id', 'tvdb_id', 'simkl_id'].includes(name) && raw !== null && raw !== undefined) {
          const keyName = name === 'themoviedb_id' ? 'tmdb' : name.replace('_id', '');
          keys.push(`${keyName}:${String(raw).toLowerCase()}`);
        }
      }
    }
  } catch {}
  return keys;
}

export function simklStatusIdentityKeys(meta: any): string[] {
  const keys = identityKeys(meta);
  const id = typeof meta?.id === 'string' ? meta.id : '';
  if (id) {
    const [prefix, value] = id.split(':', 2);
    if (value) keys.push(`${prefix.toLowerCase()}:${value.toLowerCase()}`);
    else if (id.startsWith('tt')) keys.push(`imdb:${id.toLowerCase()}`);
  }
  return [...new Set(keys)];
}

export type SimklStatusIndex = Map<string, SimklListStatus>;

export function canApplySimklStatusFilter(providerFailure: boolean, cacheHit: boolean): boolean {
  return !providerFailure || cacheHit;
}

export function buildSimklStatusIndex(itemsByStatus: Partial<Record<SimklListStatus, any[]>>): SimklStatusIndex {
  const index: SimklStatusIndex = new Map();
  for (const status of SIMKL_LIST_STATUSES) {
    for (const item of itemsByStatus[status] || []) {
      const media = item?.movie || item?.show || item;
      for (const key of identityKeys(media)) index.set(key, status);
    }
  }
  return index;
}

export function filterMetasBySimklStatus(
  metas: any[],
  selectedStatuses: SimklListStatus[],
  index: SimklStatusIndex
): { metas: any[]; matched: number; unmatched: number } {
  const allowed = new Set(selectedStatuses);
  let matched = 0;
  let unmatched = 0;
  const filtered = metas.filter(meta => {
    const status = simklStatusIdentityKeys(meta).map(key => index.get(key)).find(Boolean);
    if (status && allowed.has(status)) {
      matched++;
      return true;
    }
    unmatched++;
    return false;
  });
  return { metas: filtered, matched, unmatched };
}
