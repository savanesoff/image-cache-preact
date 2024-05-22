import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import typescript from "@rollup/plugin-typescript";
import { fileURLToPath } from "url";
import tsconfigPaths from "vite-tsconfig-paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "ImageCacheReact",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: ["react", "react-dom", "tslib"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          tslib: "tslib",
        },
      },
      plugins: [
        typescript({
          tsconfig: path.resolve(__dirname, "tsconfig.package.json"),
          declaration: true,
          declarationDir: path.resolve(__dirname, "dist/types"),
          rootDir: path.resolve(__dirname, "src"),
          sourceMap: true,
          inlineSources: true,
        }),
      ],
    },
  },
  plugins: [react(), tsconfigPaths()],
});
