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
  // Pas en dev : Vite y injecte un script inline (React Refresh) et du HMR.
  // vite preview reprend le proxy de server.
  preview: {
    headers: {
      "Content-Security-Policy": [
        "default-src 'self'",
        // Aucun script inline ni eval : un HTML piégé qui passerait les deux
        // nettoyages (API + DOMPurify) ne pourrait toujours rien exécuter
        "script-src 'self'",
        // sonner injecte sa feuille de style dans une balise <style>
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ].join("; "),
    },
  },
});
