import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import unicornPlugin from 'eslint-plugin-unicorn';
import promisePlugin from 'eslint-plugin-promise';
import stylistic from '@stylistic/eslint-plugin';

export default [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      unicorn: unicornPlugin,
      promise: promisePlugin,
      '@stylistic': stylistic,
    },
    rules: {
      // --- Stylistic Defaults ---
      ...stylistic.configs['recommended-flat'].rules,
      // --- Enforce readability and maintainability jS---
      'max-len': ['error', { code: 350, ignoreUrls: true }], // Limit line length for readability
      'no-multiple-empty-lines': ['error', { max: 1 }], // Avoid excessive empty lines
      'newline-before-return': 'error', // Add newline before return statements
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'block-like', next: 'return' },
        { blankLine: 'always', prev: '*', next: ['const', 'let', 'var'] },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
      ],

      // --- TypeScript Specific Rules ---
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ], // Allow unused vars prefixed with _
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'], // Prefer `type` over `interface`
      '@typescript-eslint/member-ordering': 'error', // Enforce ordering of class members
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: false,
          allowHigherOrderFunctions: false,
          allowTypedFunctionExpressions: true,
          allowIIFEs: false,
        },
      ],
      '@typescript-eslint/prefer-optional-chain': 'error', // Prefer `?.` over longer forms
      '@typescript-eslint/strict-boolean-expressions': [
        'off',
        {
          allowNullableObject: false,
          allowNullableString: false,
          allowNullableBoolean: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error', // Disallow `any` usage

      // --- Promises ---
      '@typescript-eslint/require-await': 'error', // Catch unhandled promises
      'promise/always-return': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-return-wrap': 'error',
      'promise/prefer-await-to-then': 'warn', // Prefer async/await over `.then`

      // --- Unicorn Rules ---
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: false,
            camelCase: true,
            pascalCase: false,
          },
        },
      ],
      'unicorn/no-abusive-eslint-disable': 'error', // Avoid overly broad ESLint disables
      'unicorn/prefer-top-level-await': 'warn',
      'unicorn/no-array-push-push': 'error', // Avoid consecutive `.push` calls

      // --- Core ESLint Rules ---
      'no-var': 'error', // Modern `let` and `const` over `var`
      'prefer-const': 'error', // Use `const` when variables are not reassigned
      eqeqeq: ['error', 'always'], // Enforce `===` and `!==` over `==` and `!=`
      'prefer-template': 'error', // Enforce template literals over string concatenation
      'no-duplicate-imports': 'error', // Avoid duplicate imports
    },
  },
  {
    // --- Override for the "commands" directory ---
    files: ['src/commands/**/*', 'build/commands/**/*'],
    rules: {
      'unicorn/filename-case': 'off', // Disable filename case checks
    },
  },
];
