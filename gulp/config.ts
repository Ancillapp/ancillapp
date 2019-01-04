/* tslint:disable:no-implicit-dependencies object-literal-sort-keys */
/// <reference types="../typings" />

import { writeFile } from 'fs';
import { parallel, series, src, task } from 'gulp';
import htmllint from 'gulp-htmllint';
import stylelint from 'gulp-stylelint';
import tslint from 'gulp-tslint';
import { resolve as resolvePath } from 'path';
import { ConfigHelper } from './helpers';
import { exec } from 'child_process';

/* LINTING TASKS */
task('lint:scripts', () =>
  src(['typings/**/*.d.ts', 'src/**/*.ts'])
    .pipe(tslint({
      formatter: 'verbose',
    }))
    .pipe(tslint.report({
      summarizeFailureOutput: true,
    })));

task('lint:styles', () =>
  src('src/**/*.s[ac]ss')
    .pipe(stylelint({
      failAfterError: true,
      reporters: [{
        formatter: 'string',
        console: true,
      }],
    })));

task('lint:templates', () =>
  src('src/**/*.ejs')
    .pipe(htmllint({
      failOnError: true,
    })));

task('lint', parallel('lint:scripts', 'lint:styles', 'lint:templates'));

/* BUILDING TASKS */
const configHelper = new ConfigHelper();

task('build:es5', () =>
  configHelper.createBuild('es5', 'ie > 9'));

task('build:es6', () =>
  configHelper.createBuild('es6', 'edge > 12', ['es2015']));

task('build:server', () => new Promise((resolve, reject) =>
  // tslint:disable-next-line:max-line-length
  exec('yarn server build', (err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  })));

task('write-polymer-config', (cb) =>
  writeFile(resolvePath(__dirname, '../server/build/polymer.json'), configHelper.output, cb));

task('build', parallel(
  'build:server',
  series(
    parallel('build:es5', 'build:es6'),
    'write-polymer-config',
  ),
));
