import path, {dirname} from 'node:path';
import {readFileSync} from 'node:fs';
import {env} from 'node:process';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dir = './client';
const isDev = env.NODE_ENV === 'development';

const dist = path.resolve(__dirname, 'dist');
const distDev = path.resolve(__dirname, 'dist-dev');
const devtool = isDev ? 'eval' : 'source-map';

const targets = readFileSync(`${__dirname}/.browserslistrc`, 'utf8')
    .split('\n')
    .filter(Boolean);

const notEmpty = (a) => a;
const clean = (array) => array.filter(notEmpty);

const rules = clean([
    !isDev && {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
            env: {
                targets,
            },
        },
    },
]);

export default {
    devtool,
    entry: {
        restafary: `${dir}/index.js`,
    },
    output: {
        library: {
            name: 'restafary',
            type: 'umd',
        },
        filename: '[name].js',
        path: isDev ? distDev : dist,
        pathinfo: isDev,
        devtoolModuleFilenameTemplate,
    },
    module: {
        rules,
    },
};

function devtoolModuleFilenameTemplate(info) {
    const resource = info.absoluteResourcePath.replace(__dirname + path.sep, '');
    return `file://restafary/${resource}`;
}
