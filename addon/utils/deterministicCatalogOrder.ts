import crypto from 'node:crypto';

function stableHash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function itemIdentity(meta: any, index: number): string {
  return String(meta?.id || meta?.imdb_id || meta?.name || `index:${index}`);
}

export interface DeterministicCatalogOrderOptions {
  userUUID?: string;
  catalogId: string;
  day?: string;
}

export function applyDeterministicCatalogOrder<T>(
  metas: T[],
  options: DeterministicCatalogOrderOptions,
): T[] {
  const day = options.day || new Date().toISOString().slice(0, 10);
  const seed = `${options.userUUID || ''}:${options.catalogId}:${day}`;

  return metas
    .slice()
    .map((meta, index) => ({ meta, index, key: stableHash(`${seed}:${itemIdentity(meta, index)}`) }))
    .sort((a, b) => a.key.localeCompare(b.key) || a.index - b.index)
    .map(({ meta }) => meta);
}
