import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      // OneDrive locks files and crashes native fs.watch with EBUSY
      usePolling: true,
      interval: 1000,
    },
  },
  publicDir: 'public',
});
