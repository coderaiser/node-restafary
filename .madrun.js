'use strict';

const {run} = require('madrun');

module.exports = {
    'test': () => 'tape \'client/**/*.spec.js\' \'test/*.js\'',
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    'coverage': () => 'nyc npm test',
    'watch:test': async () => await run('watcher', await run('test')),
    'watch:lint': async () => await run('watcher', await run('lint')),
    'watcher': () => 'nodemon -w test -w server --exec',
    'build-progress': () => 'webpack --progress',
    'build:client': () => run('build-progress', '--mode production'),
    'build:client:dev': async () => `NODE_ENV=development ${await run('build-progress', '--mode development')}`,
    'build': () => run(['clean', 'build:*']),
    'wisdom': () => run('build'),
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
    'clean': () => 'rimraf dist*',
};

