const { defineConfig, globalIgnores } = require('eslint/config');

const globals = require('globals');

const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat');

const babelParser = require('@babel/eslint-parser');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.meteor,
      },

      parser: babelParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },

        requireConfigFile: false,

        babelOptions: {
          presets: ['@babel/preset-react'],
        },
      },
    },

    extends: fixupConfigRules(
      compat.extends(
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
      )
    ),

    plugins: {
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
    },

    rules: {
      indent: [
        'error',
        2,
        {
          SwitchCase: 1,
        },
      ],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },

    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  globalIgnores(['**/node_modules', '**/.meteor', '**/public']),
]);
