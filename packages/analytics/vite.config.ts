// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 4000,
  },
  build: {
    target: 'esnext',
  },
});
