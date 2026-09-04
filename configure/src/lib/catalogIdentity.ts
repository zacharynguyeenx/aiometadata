import type { CatalogConfig } from '@/contexts/config';

export function catalogIdentityKey(catalog: Pick<CatalogConfig, 'id' | 'type' | 'instanceId'>): string {
  return `${catalog.id}-${catalog.type}-${catalog.instanceId || 'canonical'}`;
}

export function newCatalogInstanceId(existing: CatalogConfig[]): string {
  const used = new Set(existing.map(c => c.instanceId).filter(Boolean));
  let instanceId = crypto.randomUUID();
  while (used.has(instanceId)) instanceId = crypto.randomUUID();
  return instanceId;
}

export function duplicateCatalogName(source: CatalogConfig, existing: CatalogConfig[]): string {
  const base = source.name.replace(/ \d+$/, '');
  const names = new Set(existing.map(c => c.name));
  let suffix = 2;
  while (names.has(`${base} ${suffix}`)) suffix += 1;
  return `${base} ${suffix}`;
}
