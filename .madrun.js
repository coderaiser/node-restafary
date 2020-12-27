'use strict';

const {run} = require('madrun');

module.exports = {
    'test': () => 'tape \'client/**/*.spec.js\' \'test/*.js\'',
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    'coverage': () => 'nyc npm test',
    'watch:test': () => run('watcher', run('test')),
    'watch:lint': () => run('watcher', run('lint')),
    'watcher': () => 'nodemon -w test -w server --exec',
    'build-progress': () => 'webpack --progress',
    'build:client': () => run('build-progress', '--mode production'),
    'build:client:dev': async () => `NODE_ENV=development ${await run('build-progress', '--mode development')}`,
    'build': () => run(['clean', 'build:*']),
    'wisdom': () => run('build'),
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
    'clean': () => 'rimraf dist*',
};

