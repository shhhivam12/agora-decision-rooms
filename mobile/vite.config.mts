import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(import.meta.dirname, 'web'),
  plugins: [react()],
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: [
      {
        find: 'react-native-safe-area-context',
        replacement: resolve(import.meta.dirname, 'web/safe-area-context.tsx'),
      },
      {
        find: /^react-native$/,
        replacement: resolve(import.meta.dirname, 'node_modules/react-native-web'),
      },
    ],
  },
  server: { host: '127.0.0.1', port: 5173 },
  build: {
    outDir: resolve(import.meta.dirname, 'dist-web'),
    emptyOutDir: true,
  },
});
