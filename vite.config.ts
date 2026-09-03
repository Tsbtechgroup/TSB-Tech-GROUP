import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "robots.txt",
        "sitemap.xml",
      ],

      manifest: {
        name: "TSB Tech Group",
        short_name: "TSB Tech",
        description:
          "TSB Tech Group — Une seule vision, des solutions illimitées.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#07111f",
        theme_color: "#07111f",
        lang: "fr",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/robots\.txt$/,
          /^\/sitemap\.xml$/,
          /^\/manifest\.webmanifest$/,
          /^\/sw\.js$/,
          /^\/registerSW\.js$/,
        ],
        cleanupOutdatedCaches: true,
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],
});
