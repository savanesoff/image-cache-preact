import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
// import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [preact(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
});
