import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@shared': path.resolve(__dirname, './shared'), '@': path.resolve(__dirname, './src') } },
  test: {
    include: ['tests/server/**/*.test.ts', 'tests/unit/**/*.test.ts'],
    environment: 'node',
    globalSetup: ['tests/server/globalSetup.ts'],
    setupFiles: ['tests/server/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 120000,
    fileParallelism: false,
  },
})
