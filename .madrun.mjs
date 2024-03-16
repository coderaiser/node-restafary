import {run, cutEnv} from 'madrun';

const env = {
    SUPERTAPE_TIMEOUT: 7000,
};

export default {
    'test': () => [env, `tape '{client,server}/**/*.spec.js' 'test/*.js'`],
    'report': () => 'c8 report --reporter=lcov',
    'coverage': async () => [env, `c8 ${await cutEnv('test')}`],
    'watch:test': async () => [env, await run('watcher', await cutEnv('test'))],
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
