import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:5000/api',
        changeOrigin: true
      },
      '/courses': {
        target: 'http://localhost:5000/api',
        changeOrigin: true
      },
      '/topics': {
        target: 'http://localhost:5000/api',
        changeOrigin: true
      },
      '/modules': {
        target: 'http://localhost:5000/api',
        changeOrigin: true
      },
      '/resources': {
        target: 'http://localhost:5000/api',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts'
  }
});
