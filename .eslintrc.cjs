module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  plugins: ['preact', '@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:preact/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': ['warn'],
    'no-unused-vars': 'error',
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-restricted-imports': [
      'error',
      {
        paths: ['react', 'react-dom'],
        patterns: ['react/*', 'react-dom/*'],
      },
    ],
  },
};
