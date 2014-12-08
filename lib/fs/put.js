(function() {
    'use strict';
    
    var check       = require('checkup'),
        packer      = require('jag'),
        flop        = require('flop'),
        files       = require('files-io');
        
    module.exports  = function(query, name, readStream, callback) {
        check(arguments, ['query', 'name', 'readStream', 'callback']);
        
        switch(query) {
        default:
            files.pipe(readStream, name, callback);
            break;
        
        case 'dir':
            flop.create(name, 'dir', callback);
            break;
        
        case 'unzip':
            packer.unpack(readStream, name, callback);
            break;
        }
    };
})();
