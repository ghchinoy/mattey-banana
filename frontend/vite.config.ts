import { defineConfig } from 'vite';

export default defineConfig({
  // Set base to repository name for GitHub Pages
  base: '/mattey-banana/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
