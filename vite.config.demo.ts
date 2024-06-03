import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import preact from '@preact/preset-vite';

export default defineConfig({
  build: {
    sourcemap: false, // Enable source maps
    outDir: 'dist-demo',
  },
  plugins: [preact(), tsconfigPaths()],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
});
