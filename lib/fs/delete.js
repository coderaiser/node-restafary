(function() {
    'use strict';
    
    var check       = require('checkup'),
        pipe        = require('pipe-io'),
        tryCatch    = require('try-catch'),
        flop        = require('flop');
    
    module.exports  = function(query, name, readStream, callback) {
        check
            .type('query', query, 'string')
            .type('name', name, 'string')
            .type('readStream', readStream, 'object')
            .type('callback', callback, 'function');
        
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
                error = tryCatch(function() {
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
