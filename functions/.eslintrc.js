module.exports = {
  extends: '../.eslintrc',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  env: {
    node: true,
    commonjs: true,
  },
  rules: {
    'no-console': 'off',
  },
};
