import express, { type Express } from 'express';
import { buildInstallUrl } from './lib/installUrl.js';

export function createTestApp(options: { version?: string } = {}): Express {
  const app = express();
  const version = options.version ?? 'test';

  app.use(express.json());
  app.get('/health/live', (_req, res) => res.status(200).json({ status: 'alive', version }));
  app.get('/api/config', (_req, res) => res.json({ addonVersion: version, maxCatalogs: null }));
  app.post('/api/config/save', (req, res) => {
    if (!req.body?.config || typeof req.body.config !== 'object') {
      return res.status(400).json({ error: 'config is required' });
    }
    if (typeof req.body.password !== 'string' || req.body.password.length < 6) {
      return res.status(401).json({ error: 'password is required' });
    }
    return res.status(201).json({
      userUUID: 'test-user',
      installUrl: buildInstallUrl('https://example.test', 'example.test', 'test-user'),
    });
  });

  return app;
}
