(function() {
    'use strict';
    
    var readStream      = require('fs').createReadStream,
        assert          = require('assert'),
        minify          = require('minify'),
        mellow          = require('mellow'),
        flop            = require('flop'),
        ashify          = require('ashify'),
        beautify        = require('beautifile');
    
    module.exports      = function(query, name, callback) {
        [query, name, callback].forEach(assert);
        
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
            ashify(readStream(name), {algorithm: 'sha1', encoding:'hex'}, callback);
            break;
        }
    };
})();
