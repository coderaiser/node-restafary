(function() {
    'use strict';
    
    var fs              = require('fs'),
        path            = require('path'),
        
        exec            = require('execon'),
        tryRequire      = require('tryrequire'),
        beautify        = require('js-beautify'),
        
        DIR             = __dirname + '/../',
        HOME_WIN        = process.env.HOMEPATH,
        HOME_UNIX       = process.env.HOME,
        HOME            = (HOME_UNIX || HOME_WIN) + path.sep,
        
        EXT             = ['js', 'css', 'html'],
        ConfigPath      = DIR   + 'json/beautify',
        ConfigHome      = HOME  + '.beautify',
        
        config          =
            tryRequire(ConfigHome) ||
            tryRequire(ConfigPath, {log: true}) || {};
    
    module.exports  = function(name, callback) {
        var ext     = path
                .extname(name)
                .slice(1),
            
            is      = ~EXT.indexOf(ext);
        
        if (!is)
            callback(erorMsg(ext));
        else
            fs.readFile(name, 'utf8', function(error, data) {
                var result;
                
                if (!error)
                    error = exec.try(function() {
                        result = beautify[ext](data, config);
                    });
                    
                
                callback(error, result);
            });
    };
    
    function erorMsg(ext) {
        var error = Error('File type " ' + ext + ' "not supported.');
        
        return error;
    }
    
})();
