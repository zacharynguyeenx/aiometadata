import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp } from '../addon/testApp';

describe('public HTTP contracts', () => {
  const app = createTestApp({ version: '2.0.0-test' });

  it('returns a health response without starting a server', async () => {
    const response = await request(app).get('/health/live');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'alive', version: '2.0.0-test' });
  });

  it('rejects malformed configuration saves and accepts valid saves', async () => {
    await request(app).post('/api/config/save').send({}).expect(400);
    const response = await request(app)
      .post('/api/config/save')
      .send({ config: { catalogs: [] }, password: 'secret1' })
      .expect(201);
    expect(response.body.installUrl).toContain('/stremio/test-user/manifest.json');
  });
});
