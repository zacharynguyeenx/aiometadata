import { describe, expect, it, vi } from 'vitest';

const { httpGet } = vi.hoisted(() => ({
  httpGet: vi.fn(async () => ({ data: { username: 'tester', private: false, name: 'Test User', vip: false, vip_ep: false } })),
}));

vi.mock('../addon/utils/httpClient', () => ({
  httpGet,
  httpPost: vi.fn(async () => ({ data: { access_token: 'access', refresh_token: 'refresh', expires_in: 3600, scope: 'likes', token_type: 'bearer' } })),
}));
vi.mock('../addon/utils/traktUtils', () => ({ traktDispatcher: undefined }));

import { TraktClient } from '../addon/lib/trakt';

describe('Trakt adapter', () => {
  it('maps token and user fixtures into domain shapes', async () => {
    const client = new TraktClient('client', 'secret', 'https://example.test/callback');
    await expect(client.exchangeCodeForToken('code')).resolves.toMatchObject({
      access_token: 'access', refresh_token: 'refresh', scope: 'likes', token_type: 'bearer',
    });
    await expect(client.getMe('access')).resolves.toEqual({
      username: 'tester', private: false, name: 'Test User', vip: false, vip_ep: false,
    });
  });

  it('builds an encoded authorization URL', () => {
    const client = new TraktClient('client id', 'secret', 'https://example.test/callback');
    expect(client.getAuthorizationUrl('state')).toContain('client_id=client+id');
    expect(client.getAuthorizationUrl('state')).toContain('state=state');
  });

  it('returns an empty list for malformed list data and surfaces transport failures', async () => {
    const client = new TraktClient('client', 'secret', 'https://example.test/callback');
    httpGet.mockResolvedValueOnce({ data: { unexpected: true } } as never);
    await expect(client.getUserLists('tester')).resolves.toEqual([]);
    httpGet.mockRejectedValueOnce(new Error('timeout'));
    await expect(client.getUserLists('tester')).rejects.toThrow('timeout');
  });
});
