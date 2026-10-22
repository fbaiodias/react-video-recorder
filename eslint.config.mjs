import { neostandard, resolveIgnoresFromGitignore } from 'neostandard'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import vitest from '@vitest/eslint-plugin'

export default [
  // Global ignores, so they cover the configs added below neostandard's too.
  { ignores: resolveIgnoresFromGitignore() },
  ...neostandard({
    ts: true,
    env: ['browser']
  }),
  // neostandard leaves out React's logic rules for now, so add them back.
  {
    ...react.configs.flat.recommended,
    files: ['**/*.{js,jsx,ts,tsx}'],
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      // TypeScript checks props.
      'react/prop-types': 'off'
    }
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended
  },
  {
    files: ['test/unit/**/*.js', 'test/package/**/*.js'],
    ...vitest.configs.recommended
  },
  {
    files: ['**/*.config.{js,mjs}', 'test/**/*.mjs'],
    languageOptions: { globals: { process: 'readonly' } }
  }
]
