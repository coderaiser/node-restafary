(function() {
    'use strict';
    
    var readStream      = require('fs').createReadStream,
        check           = require ('checkup'),
        minify          = require('minify'),
        flop            = require('flop'),
        ashify          = require('ashify'),
        beautify        = require('beautifile');
    
    module.exports      = function(query, name, callback) {
        check
            .type('name', name, 'string')
            .type('callback', callback, 'function')
            .check({
                query: query
            });
        
        switch (query) {
        default:
            flop.read(name, callback);
            break;
        
        case 'size':
            flop.read(name, 'size', callback);
            break;
            
        case 'time':
            flop.read(name, 'time raw', callback);
            break;
        
        case 'beautify':
            beautify(name, callback);
            break;
        
        case 'minify':
            minify(name, callback);
            break;
        
        case 'hash':
            ashify(readStream(name), {algorithm: 'sha1', encoding: 'hex'}, callback);
            break;
        }
    };
})();
