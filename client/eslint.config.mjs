import globals from 'globals';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react,
    },
    rules: {
      indent: ['error', 2],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    ...prettier,
    files: ['**/*.{js,jsx,ts,tsx,json,css,scss,html}'],
  },
];
