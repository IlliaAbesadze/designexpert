import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import handlebars from './build/vite-plugin-handlebars.js';

const root = resolve(import.meta.dirname, 'src');

export default defineConfig({
  root,
  publicDir: resolve(import.meta.dirname, 'public'),
  plugins: [
    handlebars({
      partialsDir: resolve(root, 'partials'),
      contentFile: resolve(root, 'content/en.json'),
    }),
  ],
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        loadPaths: [resolve(root, 'styles')],
      },
    },
  },
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    target: 'es2022',
    cssCodeSplit: false,
    assetsInlineLimit: 0,
  },
  server: { port: 5173 },
});
