(function() {
    'use strict';
    
    var check       = require('checkup'),
        pipe        = require('pipe-io'),
        patch       = require('patchfile');
        
    module.exports  = function(name, readStream, options, callback) {
        if (!callback)
            callback = options;
        
        check
            .type('name', name, 'string')
            .type('readStream', readStream, 'object')
            .type('callback', callback, 'function');
        
        pipe.getBody(readStream, function(error, data) {
            if (error)
                callback(error);
            else
                patch(name, data, options, callback);
        });
    };
})();
