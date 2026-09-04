import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../addon/lib/redis-id-cache.js', () => ({ default: { searchByAnyId: vi.fn() } }));
import database from '../addon/lib/database';

describe('SQLite configuration persistence', () => {
  let directory: string;

  afterEach(async () => {
    await database.close();
    if (directory) await rm(directory, { recursive: true, force: true });
    delete process.env.DATABASE_URI;
  });

  it('persists a config, computes its hash, and verifies its password', async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), 'aiometadata-test-'));
    process.env.DATABASE_URI = `sqlite://${path.join(directory, 'config.sqlite')}`;

    await database.initialize();
    const saved = await database.saveUserConfig('user-1', 'password-hash', { catalogs: [{ id: 'tmdb', enabled: true }] });

    expect(saved.configHash).toMatch(/^[a-f0-9]{16}$/);
    await expect(database.getUserConfig('user-1')).resolves.toMatchObject({ catalogs: [{ id: 'tmdb', enabled: true }] });
    await expect(database.getUser('user-1')).resolves.toMatchObject({ user_uuid: 'user-1' });
    await expect(database.verifyPassword('user-1', 'wrong-password')).resolves.toBe(false);
  });
});
