import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Prefer single quotes
      quotes: ['error', 'single', { avoidEscape: true }],

      // Require semicolons
      semi: ['error', 'always'],

      // Consistent spacing
      indent: ['error', 2, { SwitchCase: 1 }],

      // Trailing commas
      'comma-dangle': ['error', 'es5'],

      // Object spacing
      'object-curly-spacing': ['error', 'always'],

      // Array spacing
      'array-bracket-spacing': ['error', 'never'],

      // No multiple empty lines
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],

      // Prefer const
      'prefer-const': 'error',

      // No unused variables
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // React specific
      'react/jsx-quotes': ['error', 'prefer-single'],
      'react/jsx-curly-spacing': ['error', { when: 'never' }],
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-wrap-multilines': [
        'error',
        {
          declaration: 'parens-new-line',
          assignment: 'parens-new-line',
          return: 'parens-new-line',
          arrow: 'parens-new-line',
          condition: 'parens-new-line',
          logical: 'parens-new-line',
          prop: 'parens-new-line',
        },
      ],

      // Next.js specific
      '@next/next/no-html-link-for-pages': 'off',

      // Import ordering
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
];

export default eslintConfig;
