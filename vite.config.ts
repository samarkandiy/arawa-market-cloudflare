import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'client',
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
    allowedHosts: [
      'workplace-closest-timer-flu.trycloudflare.com',
      'workplace-closest-timer-flu.trycloudflare.com.',
      '.trycloudflare.com'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
