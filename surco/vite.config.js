import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// En desarrollo, /api va al servidor PHP local (php -S 127.0.0.1:8091)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5197,
    strictPort: true,
    proxy: { '/api': { target: 'http://127.0.0.1:8091', changeOrigin: false } },
  },
});
