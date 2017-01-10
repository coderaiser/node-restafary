'use strict';

var DIR         = './',
    
    fs          = require('fs'),
    path        = require('path'),
    jonny       = require('jonny'),
    mellow      = require('mellow'),
    ponse       = require('ponse'),
    WIN         = process.platform === 'win32',
    CWD         = process.cwd(),
    
    Fs          = {};
    
    [
        'get',
        'put',
        'patch',
        'delete'
    ].forEach(function(name) {
        Fs[name] = require(DIR + 'fs/' + name);
    });

module.exports = function(options) {
    return middle.bind(null, options || {});
};

function middle(options, req, res, next) {
    var name, is,
        isFile  = req.url === '/restafary.js',
        prefix  = options.prefix || '/fs',
        root    = options.root || '/',
        
        params  = {
            request : req,
            response: res,
            root    : root
        };
    
    name    = ponse.getPathName(req);
    is      = !name.indexOf(prefix);
    
    if (isFile)
        sendFile(req, res);
    else if (!is) {
        next();
    } else {
        name = name.replace(prefix, '') || '/';
        
        params.name = name;
        
        onFS(params, function(error, options, data) {
            params.gzip = !error;
            
            if (options.name)
                params.name = options.name;
            
            if (options.gzip !== undefined)
                params.gzip = options.gzip;
            
            if (options.query)
                params.query = options.query;
            
            if (error) {
                ponse.sendError(error, params);
            } else {
                if (!data)
                    data = getMsg(name, req);
                
                ponse.send(data, params);
            }
        });
    }
}

function sendFile(req, res) {
    var name = __dirname + '/client.js';
    
    ponse.sendFile({
        name: name,
        gzip: true,
        request: req,
        response: res
    });
}

function getMsg(name, req) {
    var msg;
    var query = ponse.getQuery(req);
    var method = req.method.toLowerCase();
    
    name = path.basename(name);
    
    if (method !== 'put') {
        msg     = method;
    } else {
        if (query === 'dir')
            msg = 'make dir';
        else
            msg = 'save';
    }
    
    msg     = format(msg, name);
    
    return msg;
}

function checkPath(name, root) {
    var ok,
        drive   = name.split('/')[1],
        isRoot  = root === '/',
        isDrive = /^[a-z]$/i.test(drive);
    
    ok = !WIN || !isRoot || isDrive;
    
    return ok;
}

function onFS(params, callback) {
    var root,
        rootWin,
        pathOS,
        pathWeb,
        pathError       = 'Could not write file/create directory in root on windows!',
        p               = params,
        name            = p.name,
        query           = ponse.getQuery(p.request),
        optionsDefaults  = {
            gzip: false,
            name: '.txt'
        };
    
    if (typeof params.root === 'function')
        root = params.root();
    else
        root = params.root;
    
    root = handleDotFolder(root);
    rootWin = root.replace('/', '\\');
    pathOS  = mellow.pathToWin(name, root);
    pathWeb = path.join(root, name);
    
    if (WIN && pathWeb.indexOf(rootWin) || !WIN && pathWeb.indexOf(root))
        return callback(Error('Path ' + pathWeb + ' beyond root ' + root + '!'), optionsDefaults);
    
    switch (p.request.method) {
    case 'PUT':
        if (!checkPath(name, root))
            callback(pathError, optionsDefaults);
        else
            Fs.put(query, pathOS, p.request, function(error) {
                callback(error, optionsDefaults);
            });
        break;
    
     case 'PATCH':
        Fs.patch(path, p.request, function(error) {
            callback(error, optionsDefaults);
        });
        break;
    
    case 'GET':
        Fs.get(query, pathOS, function(error, data) {
            onGet({
                error: error,
                name: p.name,
                path: pathOS,
                query: query,
                request: p.request,
                response: p.response,
                data: data
            }, callback);
        });
        break;
    
    case 'DELETE':
        Fs.delete(query, pathOS, p.request, function(error) {
            callback(error, optionsDefaults);
        });
        break;
    }
}

function onGet(p, callback) {
    var str,
        options = {},
        isFile  = p.error && p.error.code === 'ENOTDIR',
        isStr   = typeof p.data === 'string',
        params  = {
            gzip: true,
            name: p.path,
            request: p.request,
            response: p.response,
        };
    
    if (isFile) {
        fs.realpath(p.path, function(error, path) {
            if (!error)
                params.name = path;
            
            params.gzip = false;
            ponse.sendFile(params);
        });
    } else {
        if (!p.error)
            if (/^(size|time|hash|beautify|minify)$/.test(p.query)) {
                str = String(p.data);
            } else {
                p.data.path   = addSlashToEnd(p.name);
                
                if (p.name === '/')
                    p.name += 'fs';
                
                options     = {
                    name    : p.name + 'fs.json',
                    query   : p.query
                };
                
                if (isStr)
                    str = p.data;
                else
                    str = jonny.stringify(p.data, null, 4);
            }
        
        callback(p.error, options, str);
    }
}

function format(msg, name) {
    var status = 'ok';
    
    if (name)
        name = '("' + name + '")';
    
    msg = msg + ': ' + status + name;
    
    return msg;
}

function addSlashToEnd(path) {
    var length, isSlash;
    
    if (path) {
        length  = path.length - 1;
        isSlash = path[length] === '/';
        
        if (!isSlash)
            path += '/';
    }
    
    return path;
}

function handleDotFolder(root) {
    return root.replace(/^\.(\/|\\|$)/, CWD);
}

