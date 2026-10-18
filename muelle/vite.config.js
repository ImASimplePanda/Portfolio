import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// En desarrollo, /api va al servidor PHP local (php -S 127.0.0.1:8096)
// Precarga las fuentes latinas del titular y del texto (la del titular decide cuándo se pinta la portada)
let base = '/';
const precargarFuentes = {
  name: 'precargar-fuentes',
  configResolved(c) { base = c.base; },
  transformIndexHtml(html, ctx) {
    const fuentes = Object.keys(ctx.bundle || {}).filter((f) => /(chakra-petch-latin-600-normal|hanken-grotesk-latin-wght-normal).*\.woff2$/.test(f));
    return { html, tags: fuentes.map((f) => ({ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: base + f }, injectTo: 'head' })) };
  },
};

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss(), command === 'build' ? precargarFuentes : null],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 5199,
    strictPort: true,
    proxy: { '/api': { target: 'http://127.0.0.1:8096', changeOrigin: false } },
  },
  build: {
    chunkSizeWarningLimit: 1100,
    assetsInlineLimit: 0, // nada incrustado en data: (la CSP solo permite fuentes e imágenes del propio sitio)
    manifest: true, // public/index.php lo usa para precargar el código de cada página
  },
}));
