module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'no-useless-escape': 'off',
    'no-mixed-spaces-and-tabs': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
