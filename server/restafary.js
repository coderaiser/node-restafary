'use strict';

const DIR = './';
const fs = require('fs');
const path = require('path');
const jonny = require('jonny');
const mellow = require('mellow');
const ponse = require('ponse');
const WIN = process.platform === 'win32';
const CWD = process.cwd();
const Fs = {};

[
    'get',
    'put',
    'patch',
    'delete',
].forEach((name) => {
    Fs[name] = require(DIR + 'fs/' + name);
});

const isDev = process.env.NODE_ENV === 'development';

module.exports = (options) => middle.bind(null, options || {});

function middle(options, request, response, next) {
    const req = request;
    const res = response;
    const isFile = /^\/restafary\.js(\.map)?$/.test(req.url);
    const prefix = options.prefix || '/fs';
    const root = options.root || '/';
    
    const params = {
        root,
        request,
        response,
    };
    
    let name = ponse.getPathName(req);
    const is = !name.indexOf(prefix);
    
    if (isFile)
        return sendFile(req, res);
    
    if (!is)
        return next();
    
    name = name.replace(prefix, '') || '/';
    params.name = name;
    
    onFS(params, (error, options, data) => {
        params.gzip = !error;
        
        if (options.name)
            params.name = options.name;
        
        if (options.gzip !== undefined)
            params.gzip = options.gzip;
        
        if (options.query)
            params.query = options.query;
        
        if (error)
            return ponse.sendError(error, params);
        
        if (!data)
            data = getMsg(name, req);
        
        ponse.send(data, params);
    });
}

function sendFile(request, response) {
    const dist = !isDev ? 'dist' : 'dist-dev';
    request.url = path.join(__dirname, '..', dist, request.url);
    
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
    
    name = path.basename(name);
    
    if (method !== 'put') {
        msg = method;
    } else {
        if (query === 'dir')
            msg = 'make dir';
        else
            msg = 'save';
    }
    
    msg = format(msg, name);
    
    return msg;
}

function checkPath(name, root) {
    const drive = name.split('/')[1];
    const isRoot = root === '/';
    const isDrive = /^[a-z]$/i.test(drive);
    
    const ok = !WIN || !isRoot || isDrive;
    
    return ok;
}

function onFS(params, callback) {
    const pathError = 'Could not write file/create directory in root on windows!';
    const p = params;
    const {name} = p;
    const query = ponse.getQuery(p.request);
    
    const optionsDefaults = {
        gzip: false,
        name: '.txt',
    };
    
    let root;
    if (typeof params.root === 'function')
        root = params.root();
    else
        root = params.root;
    
    root = handleDotFolder(root);
    const rootWin = root.replace('/', '\\');
    const pathOS = mellow.pathToWin(name, root);
    const pathWeb = path.join(root, name);
    
    if (WIN && pathWeb.indexOf(rootWin) || !WIN && pathWeb.indexOf(root))
        return callback(Error('Path ' + pathWeb + ' beyond root ' + root + '!'), optionsDefaults);
    
    switch(p.request.method) {
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
        return Fs.patch(path, p.request, (error) => {
            callback(error, optionsDefaults);
        });
    
    case 'GET':
        return Fs.get(query, pathOS, (error, data) => {
            onGet({
                error,
                name: p.name,
                path: pathOS,
                query,
                request: p.request,
                response: p.response,
                data,
            }, callback);
        });
    
    case 'DELETE':
        return Fs.delete(query, pathOS, p.request, (error) => {
            callback(error, optionsDefaults);
        });
    }
}

function onGet(p, callback) {
    let options = {};
    const isFile = p.error && p.error.code === 'ENOTDIR';
    const isStr = typeof p.data === 'string';
    
    const params = {
        gzip: true,
        name: p.path,
        request: p.request,
        response: p.response,
    };
    
    if (isFile)
        return fs.realpath(p.path, (error, path) => {
            if (!error)
                params.name = path;
            
            params.gzip = false;
            ponse.sendFile(params);
        });
    
    if (p.error)
        return callback(p.error, options);
    
    if (/^(size|time|hash)$/.test(p.query))
        return callback(p.error, options, String(p.data));
    
    p.data.path = addSlashToEnd(p.name);
    
    if (p.name === '/')
        p.name += 'fs';
    
    options = {
        name    : p.name + 'fs.json',
        query   : p.query,
    };
    
    let str;
    if (isStr)
        str = p.data;
    else
        str = jonny.stringify(p.data, null, 4);
    
    callback(p.error, options, str);
}

function format(msg, name) {
    const status = 'ok';
    
    if (name)
        name = '("' + name + '")';
    
    return msg + ': ' + status + name;
}

function addSlashToEnd(path) {
    if (!path)
        return path;
    
    const length = path.length - 1;
    const isSlash = path[length] === '/';
    
    if (!isSlash)
        path += '/';
    
    return path;
}

function handleDotFolder(root) {
    return root.replace(/^\.(\/|\\|$)/, CWD);
}

