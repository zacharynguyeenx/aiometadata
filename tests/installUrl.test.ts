import { describe, expect, it } from 'vitest';
import { baseUrlFrom, buildInstallUrl } from '../addon/lib/installUrl.js';

describe('install URL generation', () => {
  it('normalizes configured hosts and falls back to the request host', () => {
    expect(baseUrlFrom('addon.example.test', 'ignored.test')).toBe('https://addon.example.test');
    expect(baseUrlFrom('', 'request.example.test')).toBe('https://request.example.test');
    expect(buildInstallUrl('https://addon.example.test', 'ignored.test', 'abc')).toBe(
      'https://addon.example.test/stremio/abc/manifest.json',
    );
  });
});
