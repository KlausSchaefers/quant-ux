module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'no-useless-escape': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    'no-async-promise-executor': 'off',
    'no-prototype-builtins': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-mutating-props': 'off'
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
