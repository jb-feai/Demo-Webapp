import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During dev, proxy API calls to the Laravel server so the SPA can use
// same-origin "/api" paths without CORS headaches.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
