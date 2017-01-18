'use strict';

const check = require('checkup');
const pullout = require('pullout/legacy');
const patch = require('patchfile');

module.exports = (name, readStream, options, callback) => {
    if (!callback)
        callback = options;
    
    check
        .type('name', name, 'string')
        .type('readStream', readStream, 'object')
        .type('callback', callback, 'function');
    
    pullout(readStream, 'string', (error, data) => {
        if (error)
            return callback(error);
        
        patch(name, data, options, callback);
    });
};

