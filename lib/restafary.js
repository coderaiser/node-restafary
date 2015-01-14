(function() {
    'use strict';
    
    var DIR         = './',
        
        fs          = require('fs'),
        path        = require('path'),
        tryCatch    = require('try-catch'),
        mellow      = require('mellow'),
        ponse       = require('ponse'),
        
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
            params  = {
                request : req,
                response: res
            };
        
        name    = ponse.getPathName(req);
        is      = !name.indexOf(prefix);
        
        if (isFile)
            sendFile(req, res);
        else if (!is) {
            next();
        } else {
            name        =
            params.name = name.replace(prefix, '') || '/';
            
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
        var msg,
            query   = ponse.getQuery(req),
            method  = req.method.toLowerCase();
        
        name        = path.basename(name);
        
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
    
    function onFS(params, callback) {
        var path,
            p               = params,
            query           = ponse.getQuery(p.request),
            optionsDefauls  = {
                gzip: false, 
                name:'.txt'
            };
        
        path    = mellow.convertPath(p.name);
        
        switch (p.request.method) {
        case 'PUT':
            Fs.put(query, path, p.request, function(error) {
                callback(error, optionsDefauls);
            });
            break;
        
         case 'PATCH':
            Fs.patch(path, p.request, function(error) {
                callback(error, optionsDefauls);
            });
            break;
        
        case 'GET':
            Fs.get(query, path, function(error, data) {
                onGet({
                    error: error,
                    name: p.name,
                    path: path,
                    query: query,
                    request: p.request,
                    response: p.response,
                    data: data
                }, callback);
            });
            break;
        
        case 'DELETE':
            Fs.delete(query, path, p.request, function(error) {
                callback(error, optionsDefauls);
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
                if (p.query) {
                    str = p.data;
                } else {
                    p.data.path   = addSlashToEnd(p.name);
                    
                    if (p.name === '/')
                        p.name += 'fs';
                    
                    options     = {
                        name    : p.name + '.json',
                        query   : p.query
                    };
                    
                    if (isStr)
                        str = p.data;
                    else
                        tryCatch(function() {
                            str = JSON.stringify(p.data, null, 4);
                        });
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
    
})();
