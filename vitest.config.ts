import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  define: { 'process.env.VITEST': JSON.stringify('true') },
  resolve: {
    alias: { '@': path.resolve(__dirname, './configure/src') },
  },
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      thresholds: {
        lines: 34.89,
        statements: 33.23,
        functions: 35.65,
        branches: 20.08,
        'addon/lib/cacheStore.ts': {
          lines: 92.85,
          statements: 93.75,
          functions: 75,
          branches: 100,
        },
      },
    },
  },
});
