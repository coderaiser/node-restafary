(function() {
    'use strict';
    
    var 
        DIR             = '../',
        
        check           = require('checkup'),
        minify          = require('minify'),
        
        mellow          = require('mellow'),
        flop            = require('flop'),
        files           = require('files-io'),
        
        hash            = require(DIR + 'hash'),
        beautify        = require(DIR + 'beautify');
    
    module.exports      = function(query, name, callback) {
        var hashStream, error;
        
        check(arguments, ['query', 'name', 'callback']);
        
        switch (query) {
        default:
            mellow.read(name, callback);
            break;
        
        case 'size':
            flop.read(name, 'size', callback);
            break;
            
        case 'time':
            flop.read(name, 'time', callback);
            break;
        
        case 'beautify':
            beautify(name, callback);
            break;
        
        case 'minify':
            minify(name, callback);
            break;
        
        case 'hash':
            hashStream = hash();
            
            if (!hashStream) {
                error   = 'hash: not suported, try update node';
                callback(Error(error));
            } else
                files.pipe(name, hashStream, function (error) {
                    var hex;
                    
                    if (!error)
                        hex = hashStream.get();
                    
                    callback(error, hex);
                });
            
            break;
        }
    };
})();
