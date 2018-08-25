/* eslint-env node, es6 */

const { task, src, dest, series, parallel } = require('gulp');
const { spawn } = require('child_process');
const eslint = require('gulp-eslint');
const stylelint = require('gulp-stylelint');
const htmllint = require('gulp-htmllint');
const del = require('del');

task('lint:scripts', () =>
  src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError()));

task('lint:styles', () =>
  src('src/**/*.s[ac]ss')
    .pipe(stylelint({
      failAfterError: true,
      reporters: [{
        formatter: 'string',
        console: true,
      }],
    })));

// TODO: find a way to lint the HTML inside JS template literals, as currently we are linting only index.html
task('lint:templates', () =>
  src('src/**/*.html')
    .pipe(htmllint({
      failOnError: true,
    })));

task('lint', parallel('lint:scripts', 'lint:styles', 'lint:templates'));

task('build', () => new Promise((resolve, reject) => {
  const buildProc = spawn('yarn', ['run', 'build'], {
    stdio: 'inherit',
  });
  buildProc.on('error', reject);
  buildProc.on('close', resolve);
}));

task('clean:build', () => del('build'));

task('clean:app-engine', () => del('server/build'));

task('copy:app-engine', () =>
  src('build/**/*')
    .pipe(dest('server/build')));

task('build:app-engine', series(parallel('build', 'clean:app-engine'), 'copy:app-engine', 'clean:build'));
