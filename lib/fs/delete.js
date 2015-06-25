(function() {
    'use strict';
    
    var check       = require('checkup'),
        pipe        = require('pipe-io'),
        tryCatch    = require('try-catch'),
        flop        = require('flop');
    
    module.exports  = function(query, name, readStream, callback) {
        check
            .type('name', name, 'string')
            .type('readStream', readStream, 'object')
            .type('callback', callback, 'function')
            .check({
                query: query
            });
        
        getBody(readStream, function(error, files) {
            switch(query) {
                default:
                    flop.delete(name, callback);
                    break;
                    
                case 'files':
                    flop.delete(name, files, callback);
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
})();
