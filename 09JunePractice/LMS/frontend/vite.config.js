import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND = 'http://localhost:5000/api';
const proxy = (target = BACKEND) => ({ target, changeOrigin: true });

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Phase 1 routes
      '/auth':      proxy(),
      '/courses':   proxy(),
      '/topics':    proxy(),
      '/modules':   proxy(),
      '/resources': proxy(),
      // Phase 2 routes
      '/announcements':  proxy(),
      '/assignments':    proxy(),
      '/submissions':    proxy(),
      '/doubts':         proxy(),
      '/quiz-feedback':  proxy(),
      '/attempts':       proxy(),
      '/gamification':   proxy(),
      '/uploads':        proxy(),
      // v1 aliases
      '/v1': proxy(),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
