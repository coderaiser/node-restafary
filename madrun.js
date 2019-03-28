'use strict';

const {
    series,
    run,
} = require('madrun');

module.exports = {
    'test': () => 'tape \'client/**/*.spec.js\' \'test/*.js\'',
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    'coverage': () => 'nyc npm test',
    'watch:test': () => run('watcher', run('test')),
    'watch:lint': () => run('watcher', run('lint')),
    'watcher': () => 'nodemon -w test -w server --exec',
    'compile:client': () => 'babel client -d legacy/client',
    'build-progress': () => 'webpack --progress',
    'build:client': () => run('build-progress', '--mode production'),
    'build:client:dev': () => `NODE_ENV=development ${run('build-progress', '--mode development')}`,
    'build': () => series(['clean', 'legacy:*', 'compile:*', 'build:*']),
    'wisdom': () => series(['build', 'compile:*']),
    'lint': () => series(['putout', 'lint:*']),
    'fix:lint': () => series(['putout', 'lint:*'], '--fix'),
    'putout': () => 'putout client server test',
    'lint:client': () => 'eslint --env browser client',
    'lint:server': () => 'eslint -c .eslint-server.json server test madrun.js webpack.config.js',
    'clean': () => 'rimraf dist* legacy',
    'legacy:dir': () => 'mkdirp legacy/client',
    'legacy:index': () => 'echo "module.exports = require(\'./restafary\')" > legacy/client/index.js',
};

