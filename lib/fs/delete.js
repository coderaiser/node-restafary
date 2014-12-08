(function() {
    'use strict';
    
    var check       = require('checkup'),
        pipe        = require('pipe-io'),
        exec        = require('execon'),
        flop        = require('flop');
    
    module.exports  = function(query, name, readStream, callback) {
        check(arguments, ['query', 'name', 'readStream', 'callback']);
        
        getBody(readStream, function(error, files) {
            switch(query) {
                default:
                    flop.delete(name, callback);
                    break;
                    
                case 'files':
                    deleteFiles(name, files, callback);
                    break;
                }
        });
    };
    
    function getBody(readStream, callback) {
        pipe.getBody(readStream, function(error, body) {
            var obj;
            
            if (!error)
                error = exec.try(function() {
                    obj = JSON.parse(body);
                });
            
            callback(error, obj);
        });
    }
    
    function deleteFiles(from, names, callback) {
        var name,
            isLast = true;
        
        isLast  = !names.length;
        name    = names.shift();
        
        if (isLast)
            callback(null);
        else
            flop.delete(from + name, function(error) {
                if (error)
                    callback(error);
                else
                    deleteFiles(from, names, callback);
            });
    }
})();
