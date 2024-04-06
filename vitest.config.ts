import { defineConfig } from "vitest/config";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [
      // all tests in tests/dom will run in jsdom
      ["src/**", "jsdom"],
    ],
    alias: {
      // @ts-expect-error - __dirname is not defined
      "@": path.resolve(__dirname, "./src"),
    },
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
