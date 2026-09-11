import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5191,
    strictPort: true,
    // en desarrollo el cliente habla con la API en otro puerto; el proxy
    // hace que para el navegador sea el mismo origen, así las cookies de
    // sesión viajan sin configurar CORS ni SameSite=None
    proxy: { "/api": { target: "http://localhost:5190", changeOrigin: true } },
  },
});
