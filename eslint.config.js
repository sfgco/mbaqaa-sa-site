import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'frontend', 'backend', 'playwright-report', 'test-results', '.vercel'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/(^|\\s)-?(ml|mr|pl|pr|left|right)-[\\w\\[]/]',
          message: 'Use logical classes (ms-/me-/ps-/pe-/start-/end-) — RTL-first site.',
        },
      ],
    },
  },
  {
    // shadcn-owned generated components
    files: ['src/components/ui/**'],
    rules: { 'jsx-a11y/heading-has-content': 'off', 'jsx-a11y/anchor-has-content': 'off', 'no-restricted-syntax': 'off' },
  },
)
