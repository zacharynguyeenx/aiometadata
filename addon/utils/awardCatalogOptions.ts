import { applyDeterministicCatalogOrder } from './deterministicCatalogOrder.js';

export function normalizeAwardCatalogSort(value: unknown): 'default' | 'random' {
  return value === 'random' ? 'random' : 'default';
}

export function applyAwardCatalogSort(metas: any[], sort: unknown, userUUID: string, catalogId: string, day?: string): any[] {
  if (normalizeAwardCatalogSort(sort) !== 'random') return metas.slice();
  return applyDeterministicCatalogOrder(metas, { userUUID, catalogId, day });
}
