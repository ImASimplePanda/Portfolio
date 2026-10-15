import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// En desarrollo, /api va al servidor PHP local (php -S 127.0.0.1:8094)
// Precarga las dos fuentes latinas (la del titular decide cuándo se pinta la portada)
let base = '/';
const precargarFuentes = {
  name: 'precargar-fuentes',
  configResolved(c) { base = c.base; },
  transformIndexHtml(html, ctx) {
    const fuentes = Object.keys(ctx.bundle || {}).filter((f) => /(big-shoulders-display|schibsted-grotesk)-latin-wght-normal.*\.woff2$/.test(f));
    return { html, tags: fuentes.map((f) => ({ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: base + f }, injectTo: 'head' })) };
  },
};

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss(), command === 'build' ? precargarFuentes : null],
  server: {
    port: 5198,
    strictPort: true,
    proxy: { '/api': { target: 'http://127.0.0.1:8094', changeOrigin: false } },
  },
  build: {
    chunkSizeWarningLimit: 1100,
    manifest: true, // public/index.php lo usa para precargar el código de cada página
  },
}));
