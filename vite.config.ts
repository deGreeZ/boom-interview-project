import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    RubyPlugin(),
    react(),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app/javascript'),
    },
  },
  server: {
    cors: true,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
  },
})
