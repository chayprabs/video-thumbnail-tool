import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['apps/worker/src/api.integration.test.ts'],
    testTimeout: 120000,
  },
});
