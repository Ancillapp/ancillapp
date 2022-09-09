module.exports = {
  extends: '../.eslintrc',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  env: {
    browser: true,
    worker: true,
    serviceworker: true,
  },
  overrides: [
    {
      files: ['webpack/**/*.ts'],
      env: {
        node: true,
        commonjs: true,
      },
    },
  ],
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
};
