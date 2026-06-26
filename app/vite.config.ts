import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // permite abrir a app no telemóvel pela mesma rede Wi-Fi
    port: 3005,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.jpg", "favicon.svg"],
      manifest: {
        name: "TotoGraça",
        short_name: "TotoGraça",
        description: "Palpites das Águias da Graça",
        lang: "pt-PT",
        theme_color: "#1a1a1a",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "logo.jpg", sizes: "192x192", type: "image/jpeg" },
          { src: "logo.jpg", sizes: "512x512", type: "image/jpeg" },
        ],
      },
    }),
  ],
});
