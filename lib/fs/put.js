(function() {
    'use strict';
    
    var check       = require('checkup'),
        flop        = require('flop'),
        files       = require('files-io');
        
    module.exports  = function(query, name, readStream, callback) {
        check
            .type('name', name, 'string')
            .type('readStream', readStream, 'object')
            .type('callback', callback, 'function')
            .check({
                query: query
            });
        
        switch(query) {
        default:
            files.pipe(readStream, name, callback);
            break;
        
        case 'dir':
            flop.create(name, callback);
            break;
        
        case 'unzip':
            files.pipe(readStream, name, {gunzip: true}, callback);
            break;
        }
    };
})();
