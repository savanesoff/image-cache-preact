// image-cache-react/vitest.config.ts
import { defineConfig } from "file:///home/sam/Projects/savanesoff/image-cache-react/node_modules/.pnpm/vite@5.2.8_@types+node@20.12.12/node_modules/vite/dist/node/index.js";
import react from "file:///home/sam/Projects/savanesoff/image-cache-react/node_modules/.pnpm/@vitejs+plugin-react-swc@3.6.0_vite@5.2.8/node_modules/@vitejs/plugin-react-swc/index.mjs";
import tsconfigPaths from "file:///home/sam/Projects/savanesoff/image-cache-react/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.4.2_vite@5.2.8/node_modules/vite-tsconfig-paths/dist/index.mjs";
import { fileURLToPath, URL } from "url";
import { resolve } from "path";
import typescript from "file:///home/sam/Projects/savanesoff/image-cache-react/node_modules/.pnpm/@rollup+plugin-typescript@11.1.6_typescript@5.4.2/node_modules/@rollup/plugin-typescript/dist/es/index.js";
var __vite_injected_original_import_meta_url = "file:///home/sam/Projects/savanesoff/image-cache-react/vitest.config.ts";
var __dirname = fileURLToPath(new URL(".", __vite_injected_original_import_meta_url));
var vitest_config_default = defineConfig({
  plugins: [
    react(),
    // typescript({
    //   path: [resolve(__dirname, "tsconfig.package.json")],
    // }),
    typescript({
      tsconfig: "./tsconfig.package.json"
    }),
    tsconfigPaths()
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      // Adjust this to the entry point of your library
      name: "ImageCacheReact",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "cjs"]
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      input: {
        main: resolve(__dirname, "src/index.ts")
      },
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
        }
      }
    },
    outDir: "dist",
    sourcemap: true
  },
  test: {
    globals: true,
    environment: "jsdom"
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiaW1hZ2UtY2FjaGUtcmVhY3Qvdml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3NhbS9Qcm9qZWN0cy9zYXZhbmVzb2ZmL2ltYWdlLWNhY2hlLXJlYWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9zYW0vUHJvamVjdHMvc2F2YW5lc29mZi9pbWFnZS1jYWNoZS1yZWFjdC92aXRlc3QuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3NhbS9Qcm9qZWN0cy9zYXZhbmVzb2ZmL2ltYWdlLWNhY2hlLXJlYWN0L3ZpdGVzdC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tIFwidXJsXCI7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB0eXBlc2NyaXB0IGZyb20gXCJAcm9sbHVwL3BsdWdpbi10eXBlc2NyaXB0XCI7XG4vLyBDb252ZXJ0IGltcG9ydC5tZXRhLnVybCB0byBhIGZpbGUgcGF0aFxuY29uc3QgX19kaXJuYW1lID0gZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLlwiLCBpbXBvcnQubWV0YS51cmwpKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgLy8gdHlwZXNjcmlwdCh7XG4gICAgLy8gICBwYXRoOiBbcmVzb2x2ZShfX2Rpcm5hbWUsIFwidHNjb25maWcucGFja2FnZS5qc29uXCIpXSxcbiAgICAvLyB9KSxcblxuICAgIHR5cGVzY3JpcHQoe1xuICAgICAgdHNjb25maWc6IFwiLi90c2NvbmZpZy5wYWNrYWdlLmpzb25cIixcbiAgICB9KSxcbiAgICB0c2NvbmZpZ1BhdGhzKCksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL2luZGV4LnRzXCIpLCAvLyBBZGp1c3QgdGhpcyB0byB0aGUgZW50cnkgcG9pbnQgb2YgeW91ciBsaWJyYXJ5XG4gICAgICBuYW1lOiBcIkltYWdlQ2FjaGVSZWFjdFwiLFxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBpbmRleC4ke2Zvcm1hdH0uanNgLFxuICAgICAgZm9ybWF0czogW1wiZXNcIiwgXCJjanNcIl0sXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sXG4gICAgICBpbnB1dDoge1xuICAgICAgICBtYWluOiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvaW5kZXgudHNcIiksXG4gICAgICB9LFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICByZWFjdDogXCJSZWFjdFwiLFxuICAgICAgICAgIFwicmVhY3QtZG9tXCI6IFwiUmVhY3RET01cIixcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBvdXREaXI6IFwiZGlzdFwiLFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgfSxcbiAgdGVzdDoge1xuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6IFwianNkb21cIixcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVSxTQUFTLG9CQUFvQjtBQUNoVyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxtQkFBbUI7QUFDMUIsU0FBUyxlQUFlLFdBQVc7QUFDbkMsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sZ0JBQWdCO0FBTGlMLElBQU0sMkNBQTJDO0FBT3pQLElBQU0sWUFBWSxjQUFjLElBQUksSUFBSSxLQUFLLHdDQUFlLENBQUM7QUFFN0QsSUFBTyx3QkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS04sV0FBVztBQUFBLE1BQ1QsVUFBVTtBQUFBLElBQ1osQ0FBQztBQUFBLElBQ0QsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxLQUFLO0FBQUEsTUFDSCxPQUFPLFFBQVEsV0FBVyxjQUFjO0FBQUE7QUFBQSxNQUN4QyxNQUFNO0FBQUEsTUFDTixVQUFVLENBQUMsV0FBVyxTQUFTLE1BQU07QUFBQSxNQUNyQyxTQUFTLENBQUMsTUFBTSxLQUFLO0FBQUEsSUFDdkI7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxTQUFTLFdBQVc7QUFBQSxNQUMvQixPQUFPO0FBQUEsUUFDTCxNQUFNLFFBQVEsV0FBVyxjQUFjO0FBQUEsTUFDekM7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLFNBQVM7QUFBQSxVQUNQLE9BQU87QUFBQSxVQUNQLGFBQWE7QUFBQSxRQUNmO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDSixTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsRUFDZjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
