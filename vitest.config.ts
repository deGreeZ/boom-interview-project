import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './app/javascript/__tests__/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['app/javascript/**/*.{ts,tsx}'],
      exclude: [
        'app/javascript/**/*.test.{ts,tsx}',
        'app/javascript/__tests__/**',
        'app/javascript/entrypoints/**',
        'app/javascript/global.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app/javascript'),
    },
  },
})
