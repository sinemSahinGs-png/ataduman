import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  base: '/legacy/',
  publicDir: false,
  build: {
    outDir: path.resolve(__dirname, '../public/legacy'),
    emptyOutDir: true,
  },
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
