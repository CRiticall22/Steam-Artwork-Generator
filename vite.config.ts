import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    // Chunk gif.js separately - it's only needed on the export path, not the
    // initial editor load.
    rollupOptions: {
      output: {
        manualChunks: {
          gif: ['gif.js'],
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
