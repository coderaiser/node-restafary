(function() {
    'use strict';
    
    var assert      = require('assert'),
        packer      = require('jag'),
        flop        = require('flop'),
        files       = require('files-io');
        
    module.exports  = function(query, name, readStream, callback) {
        [query, name, readStream, callback].forEach(assert);
        
        switch(query) {
        default:
            files.pipe(readStream, name, callback);
            break;
        
        case 'dir':
            flop.create(name, callback);
            break;
        
        case 'unzip':
            packer.unpack(readStream, name, callback);
            break;
        }
    };
})();
