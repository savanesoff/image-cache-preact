module.exports = {
  env: { browser: true, es2020: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["react-refresh", "@typescript-eslint", "import"],
  rules: {
    "react-refresh/only-export-components": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": "warn",
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "import/no-cycle": [2, { "maxDepth": "∞" }]
    // "import/extensions": [
    //   "error",
    //   "ignorePackages",
    //   {
    //     ts: "never",
    //     tsx: "never",
    //     js: "always",
    //     jsx: "always",
    //   },
    // ],
    // "import/no-unresolved": [
    //   "error",
    //   {
    //     commonjs: true,
    //     caseSensitive: true,
    //   },
    // ],
    // "no-restricted-imports": [
    //   "error",
    //   {
    //     patterns: ["*.ts", "!*.d.ts"],
    //   },
    // ],
    // "import/order": [
    //   "error",
    //   {
    //     groups: [["builtin", "external", "internal"]],
    //     "newlines-between": "always",
    //     alphabetize: { order: "asc", caseInsensitive: true },
    //   },
    // ],
  },
  settings: {
    // "import/parsers": {
    //   "@typescript-eslint/parser": [".ts", ".tsx"],
    // },
    // "import/resolver": {
    //   typescript: {
    //     alwaysTryTypes: true,
    //     project: "./tsconfig.json",
    //   },
    //   node: {
    //     extensions: [".js", ".jsx", ".ts", ".tsx"],
    //   },
    // },
  },
};
