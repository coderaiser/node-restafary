(function() {
    'use strict';
    
    var DIR         = './',
        
        fs          = require('fs'),
        Util        = require('util-io'),
        
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
        
    /**
     * restafary
     *
     * @param request
     * @param response
     * @param callback
     */
    module.exports = function(options) {
        return middle.bind(null, options || {});
    };
    
    function middle(options, req, res, next) {
        var name, is, regExp,
            prefix  = options.prefix || '/fs',
            params  = {
                request : req,
                response: res
            };
        
        name    = ponse.getPathName(req);
        regExp  = new RegExp('^' + prefix),
        is      = regExp.test(name);
        
        if (!is) {
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
    
    function getMsg(name, req) {
        var msg,
            query   = ponse.getQuery(req),
            method  = req.method.toLowerCase();
            
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
                var str, 
                    options = {},
                    isFile  = error && error.code === 'ENOTDIR',
                    isStr   = Util.type.string(data),
                    params  = {
                        gzip: true,
                        name: path,
                        request: p.request,
                        response: p.response,
                    };
                
                if (isFile) {
                    fs.realpath(path, function(error, path) {
                        if (!error)
                            params.name = path;
                        
                        params.gzip = false;
                        ponse.sendFile(params);
                    });
                } else {
                    if (!error) {
                        data.path   = addSlashToEnd(p.name);
                        
                        options     = {
                            name    : p.name + '.json',
                            query   : query
                        };
                        
                        if (isStr)
                            str = data;
                        else
                            str = Util.json.stringify(data);
                    }
                    
                    callback(error, options, str);
                }
            });
            break;
        
        case 'DELETE':
            Fs.delete(query, path, p.request, function(error) {
                callback(error, optionsDefauls);
            });
            break;
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
