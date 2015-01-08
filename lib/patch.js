(function() {
    'use strict';
    
    var DIR         = './',
        
        fs          = require('fs'),
        
        exec        = require('execon'),
        check       = require('checkup'),
        
        diffPatch   = require('diff-match-patch').diff_match_patch,
        diff        = new (require(DIR + 'diff').DiffProto)(diffPatch),
        
        flop        = require('flop'),
        
        ERROR_MSG   = 'File is to big. '          +
                      'Could not patch files '    +
                      'bigger then ';
    
    module.exports = function(name, patch, options, callback) {
        check(arguments, ['name', 'patch', 'callback']);
        
        if (!callback) {
            callback    = options;
            options     = {};
        }
        
        flop.read(name, 'size raw', function(error, size) {
            if (!error)
                if (isNaN(options.size) || size < options.size)
                    patchFile(name, patch, callback);
                else
                    error = {
                        message: ERROR_MSG + options.size
                    };
            
            if (error)
                callback(error);
        });
    };
    
    function patchFile(name, patch, callback) {
        fs.readFile(name, 'utf8', function read(error, data) {
            var diffResult;
            
            if (error) {
                callback(error);
            } else {
                error   = exec.try(function() {
                    diffResult = diff.applyPatch(data, patch);
                });
                
                if (error)
                    callback(error);
                else
                    fs.writeFile(name, diffResult, callback);
            }
        });
    }
})();
