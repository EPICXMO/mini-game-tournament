export default {
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'comma-dangle': ['error', 'never'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always']
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.min.js'
  ]
};