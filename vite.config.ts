import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Quiz polizia',
        short_name: 'Quiz',
        start_url: '.',
        display: 'standalone',
        background_color: '#fef5f8',
        theme_color: '#6A82AB',
        icons: [
          {
            src: 'assets/icon.png',
            type: 'image/png',
          }
        ],
      },
    }),
  ],
});
