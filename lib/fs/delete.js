(function() {
    'use strict';
    
    var assert      = require('assert'),
        pipe        = require('pipe-io'),
        tryCatch    = require('try-catch'),
        flop        = require('flop');
    
    module.exports  = function(query, name, readStream, callback) {
        [query, name, readStream, callback].forEach(assert);
        
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
