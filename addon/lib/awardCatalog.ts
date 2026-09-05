import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import consola from 'consola';
import { cacheWrapMetaSmart } from './getCache.js';
import { getMeta } from './getMeta.js';
import { mapWithLimit } from '../utils/concurrency.js';
import type { UserConfig } from '../types/index.js';
import { AWARD_RULES, extractAwardIds, type AwardRule } from './awardRules.js';

const logger = consola.withTag('Awards');
const DATASET_BASE = 'https://raw.githubusercontent.com/Kometa-Team/IMDb-Awards/master';
const CACHE_DIR = path.join(process.cwd(), 'addon', 'data', 'awards');
const refreshIntervalMs = 24 * 60 * 60 * 1000;
const snapshots = new Map<string, { loadedAt: number; data: any }>();
const refreshes = new Map<string, Promise<any>>();

function ruleFor(id: string): AwardRule | undefined {
  return AWARD_RULES.find(rule => rule.id === id);
}

async function readSnapshot(eventId: string): Promise<any | null> {
  const cached = snapshots.get(eventId);
  if (cached && Date.now() - cached.loadedAt < refreshIntervalMs) return cached.data;

  const refresh = refreshes.get(eventId) || (async () => {
    const filePath = path.join(CACHE_DIR, `${eventId}.yml`);
    try {
      const response = await fetch(`${DATASET_BASE}/events/${eventId}.yml`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      await fs.mkdir(CACHE_DIR, { recursive: true });
      await fs.writeFile(filePath, text, 'utf8');
      const data = YAML.parse(text);
      snapshots.set(eventId, { loadedAt: Date.now(), data });
      return data;
    } catch (error: any) {
      logger.warn({ eventId, error: error.message }, 'Award dataset refresh failed');
      try {
        const text = await fs.readFile(filePath, 'utf8');
        const data = YAML.parse(text);
        snapshots.set(eventId, { loadedAt: Date.now(), data });
        return data;
      } catch {
        return null;
      }
    } finally {
      refreshes.delete(eventId);
    }
  })();
  refreshes.set(eventId, refresh);
  return refresh;
}

export async function getAwardIds(ruleIds: string[]): Promise<string[]> {
  const ids = new Set<string>();
  for (const ruleId of ruleIds) {
    const rule = ruleFor(ruleId);
    if (!rule) continue;
    const snapshot = await readSnapshot(rule.eventId);
    for (const id of extractAwardIds(snapshot, rule)) ids.add(id);
  }
  return [...ids];
}

export async function getAwardCatalog(
  type: string,
  page: number,
  config: UserConfig,
  userUUID: string,
  includeVideos: boolean,
  ruleIds: string[],
): Promise<any[]> {
  if (type !== 'movie') return [];
  const ids = await getAwardIds(ruleIds);
  const pageSize = parseInt(process.env.CATALOG_LIST_ITEMS_SIZE || '20', 10);
  const metas = await mapWithLimit(ids, async id => {
    try {
      const result = await cacheWrapMetaSmart(userUUID, id, () => getMeta('movie', config.language || 'en-US', id, config, userUUID, includeVideos), undefined, { enableErrorCaching: true, maxRetries: 2, config }, 'movie', includeVideos);
      return result?.meta || null;
    } catch (error: any) {
      logger.warn({ imdbId: id, error: error.message }, 'Skipping unresolved award ID');
      return null;
    }
  });
  const sorted = metas.filter(Boolean).sort((a, b) => {
    const left = Date.parse(a.released || '') || 0;
    const right = Date.parse(b.released || '') || 0;
    return right - left;
  });
  return sorted.slice(Math.max(0, (page - 1) * pageSize), page * pageSize);
}
