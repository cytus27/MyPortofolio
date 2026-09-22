import { defineConfig } from 'vite';
import path from 'path';
import os from 'os';

export default defineConfig({
  base: '/MyPortofolio/',
  build: {
    outDir: 'dist',
  },
  cacheDir: path.join(os.tmpdir(), 'vite-cache-myportofolio'),
});
