import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath, URL } from "url";
import { resolve } from "path";
import typescript from "@rollup/plugin-typescript";

// Convert import.meta.url to a file path
const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    // typescript({
    //   path: [resolve(__dirname, "tsconfig.package.json")],
    // }),

    typescript({
      compilerOptions: {
        lib: ["ESNext", "DOM", "DOM.Iterable"],
        target: "ES2018",
        module: "ESNext",
        outDir: "./dist",
        declaration: true,
        declarationMap: true,
        noEmit: false,
        baseUrl: "./",
        paths: {
          "@components/*": ["src/components/*"],
          "@components": ["src/components"],
          "@lib/*": ["src/lib/*"],
          "@lib": ["src/lib"],
          "@utils/*": ["src/utils/*"],
          "@demo/components/*": ["demo/components/*"],
          "@demo/utils/*": ["demo/utils/*"],
          "@cache/*": ["src/*"],
          "@cache": ["src"],
          "@demo/*": ["demo/*"],
        },
      },
      include: ["./src/**/*"],
      exclude: [
        "node_modules",
        "dist",
        "dist-demo",
        "demo",
        "./**/*.spec.*",
        "./src/__mocks__",
      ],
    }),
    tsconfigPaths({
      projects: [resolve(__dirname, "tsconfig.package.json")],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"), // Adjust this to the entry point of your library
      name: "ImageCacheReact",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      input: {
        main: resolve(__dirname, "src/index.ts"),
      },
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    outDir: "dist",
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
