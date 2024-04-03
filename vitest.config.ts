import { defineConfig } from "vitest/config"; 

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [
      // all tests in tests/dom will run in jsdom
      ["src/**", "jsdom"],  
    ]
  },
});
