import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  server: {
    // xfwd : transmet l'IP du navigateur, sinon le rate limit du login voit
    // toutes les requêtes venir du conteneur dashboard
    proxy: { "/api": { target: "http://api:3000", xfwd: true } },
  },
});
