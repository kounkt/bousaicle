import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages: https://<user>.github.io/bousaicle/
export default defineConfig({
  base: '/bousaicle/',
  plugins: [react(), tailwindcss()],
});
