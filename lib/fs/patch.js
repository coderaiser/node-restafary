(function() {
    'use strict';
    
    var DIR         = '../',
        
        check        = require('checkup'),
        pipe        = require('pipe-io'),
        
        patch       = require(DIR + 'patch');
        
    module.exports  = function(name, readStream, options, callback) {
        if (!callback)
            callback = options;
        
        check(arguments, ['name', 'readStream', 'callback']);
        
        pipe.getBody(readStream, function(error, data) {
            patch(name, data, options, callback);
        });
    };
})();
