import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {
    basename,
    extname,
    join,
    dirname,
} from 'node:path';
import {webToWin} from 'mellow';
import ponse from 'ponse';
import currify from 'currify';
import {tryToCatch as _tryToCatch} from 'try-to-catch';
import pipe from 'pipe-io';
import {contentType} from 'mime-types';
import {fileTypeStream} from 'file-type';
import {handleDotFolder} from './handle-dot-dir.js';
import {get} from './fs/get.js';
import {put} from './fs/put.js';
import {patch} from './fs/patch.js';
import {remove} from './fs/remove.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isUndefined = (a) => typeof a === 'undefined';
const isFn = (a) => typeof a === 'function';
const WIN = process.platform === 'win32';
const CWD = process.cwd();

const Fs = {
    get,
    put,
    patch,
    remove,
};

const isDev = process.env.NODE_ENV === 'development';

export const restafary = currify(async (options, request, response, next) => {
    const req = request;
    const res = response;
    const isFile = /^\/restafary\.js(\.map)?$/.test(req.url);
    
    const {
        prefix = '/fs',
        root = '/',
        tryToCatch = _tryToCatch,
        read,
    } = options;
    
    const params = {
        root,
        request,
        response,
        tryToCatch,
        read,
    };
    
    let name = ponse.getPathName(req);
    const is = !name.indexOf(prefix);
    
    if (isFile)
        return sendFile(req, res);
    
    if (!is)
        return next();
    
    name = name.replace(prefix, '') || '/';
    params.name = name;
    
    await onFS(params, (error, options, data) => {
        options = options || {};
        params.gzip = !error;
        
        if (options.name)
            params.name = options.name;
        
        if (!isUndefined(options.gzip))
            params.gzip = options.gzip;
        
        if (options.query)
            params.query = options.query;
        
        if (error)
            return ponse.sendError(error, params);
        
        if (!data)
            data = getMsg(name, req);
        
        ponse.send(data, params);
    });
});

function sendFile(request, response) {
    const dist = !isDev ? 'dist' : 'dist-dev';
    
    request.url = join(__dirname, '..', dist, request.url);
    
    const gzip = true;
    const name = request.url;
    
    ponse.sendFile({
        name,
        gzip,
        request,
        response,
    });
}

function getMsg(name, req) {
    let msg;
    const query = ponse.getQuery(req);
    const method = req.method.toLowerCase();
    
    name = basename(name);
    
    if (method !== 'put')
        msg = method;
    else if (query === 'dir')
        msg = 'make dir';
    else
        msg = 'save';
    
    msg = format(msg, name);
    
    return msg;
}

function checkPath(name, root) {
    const [, drive] = name.split('/');
    const isRoot = root === '/';
    const isDrive = /^[a-z]$/i.test(drive);
    
    return !WIN || !isRoot || isDrive;
}

async function onFS(params, callback) {
    const {tryToCatch, read} = params;
    const pathError = 'Could not write file/create directory in root on windows!';
    const p = params;
    const {name} = p;
    const query = ponse.getQuery(p.request);
    
    const optionsDefaults = {
        gzip: false,
        name: '.txt',
    };
    
    let root;
    
    if (isFn(params.root))
        root = params.root();
    else
        ({root} = params);
    
    root = handleDotFolder(root, CWD);
    const rootWin = root.replace('/', '\\');
    const pathOS = webToWin(name, root);
    const pathWeb = join(root, name);
    
    if (WIN && pathWeb.indexOf(rootWin) || !WIN && pathWeb.indexOf(root))
        return callback(Error('Path ' + pathWeb + ' beyond root ' + root + '!'), optionsDefaults);
    
    const {method} = p.request;
    
    switch(method) {
    case 'OPTIONS':
        p.response.setHeader('Access-Control-Allow-Origin', '*');
        p.response.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
        return callback(null, optionsDefaults);
    
    case 'PUT':
        if (!checkPath(name, root))
            return callback(pathError, optionsDefaults);
        
        return Fs.put(query, pathOS, p.request, (error) => {
            callback(error, optionsDefaults);
        });
    
    case 'PATCH':
        return Fs.patch(pathOS, p.request, (error) => {
            callback(error, optionsDefaults);
        });
    
    case 'DELETE': {
        const [error] = await tryToCatch(Fs.remove, query, pathOS, p.request);
        
        callback(error, optionsDefaults);
        return;
    }
    
    case 'HEAD':
    case 'GET': {
        const [error, stream] = await tryToCatch(Fs.get, {
            query,
            path: pathOS,
            root,
            read,
        });
        
        if (error)
            return ponse.sendError(error, params);
        
        const {type, contentLength} = stream;
        
        const [streamError, fileStream, contentType] = await getContentType({
            type,
            pathWeb,
            stream,
            tryToCatch,
        });
        
        if (streamError)
            return ponse.sendError(error, params);
        
        ponse.setHeader(p);
        p.response.setHeader('Content-Type', contentType);
        p.response.setHeader('Content-Length', contentLength);
        
        if (method === 'HEAD')
            return p.response.end();
        
        await pipe([
            fileStream,
            p.response,
        ]);
    }
    }
}

function format(msg, name) {
    const status = 'ok';
    
    if (name)
        name = `("${name}")`;
    
    return `${msg}: ${status}${name}`;
}

async function getContentType({type, pathWeb, stream, tryToCatch}) {
    if (!type)
        return [null, stream, 'text/plain'];
    
    if (type === 'directory')
        return [null, stream, 'application/json'];
    
    const ext = extname(pathWeb);
    
    if (ext && type === 'file')
        return [null, stream, contentType(ext)];
    
    const [error, typeStream] = await tryToCatch(fileTypeStream, stream);
    
    if (error)
        return [error];
    
    const {fileType} = typeStream;
    
    if (!fileType)
        return [null, typeStream, 'text/plain'];
    
    const {mime} = fileType;
    
    return [null, typeStream, mime];
}
