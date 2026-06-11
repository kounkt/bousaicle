import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages: https://<user>.github.io/bousaicle/
export default defineConfig({
  base: '/bousaicle/',
  plugins: [
    react(),
    tailwindcss(),
    // 災害時にオフラインでも備蓄リストを開けるようにする(PWA)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['chiero/*.webp', 'icons/*.png'],
      manifest: {
        name: 'ボウサイクル — チエロと3分、わが家の備え。',
        short_name: 'ボウサイクル',
        description: '家庭の防災備蓄を3分診断→リスト→ローリングストック管理。登録不要・無料。',
        lang: 'ja',
        theme_color: '#E60012',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/bousaicle/',
        scope: '/bousaicle/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,png,svg,ico}'],
      },
    }),
  ],
});
