module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    'jest/globals': true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended', 'plugin:jest/recommended'],
  plugins: ['prettier', 'jest'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {},
};
