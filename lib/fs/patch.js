(function() {
    'use strict';
    
    var assert      = require('assert'),
        pipe        = require('pipe-io'),
        patch       = require('patchfile');
        
    module.exports  = function(name, readStream, options, callback) {
        if (!callback)
            callback = options;
        
        [name, readStream, callback].forEach(assert);
        
        pipe.getBody(readStream, function(error, data) {
            if (error)
                callback(error);
            else
                patch(name, data, options, callback);
        });
    };
})();
