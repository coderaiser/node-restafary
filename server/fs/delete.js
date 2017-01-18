'use strict';

const check = require('checkup');
const pullout = require('pullout/legacy');
const tryCatch = require('try-catch');
const flop = require('flop');

module.exports = (query, name, readStream, callback) => {
    check
        .type('name', name, 'string')
        .type('readStream', readStream, 'object')
        .type('callback', callback, 'function')
        .check({query});
    
    getBody(readStream, (error, files) => {
        if (query !== 'files')
            return flop.delete(name, callback);
        
        flop.delete(name, files, callback);
    });
};

function getBody(readStream, callback) {
    pullout(readStream, 'string', (error, body) => {
        let obj;
        
        if (!error)
            error = tryCatch(function() {
                obj = JSON.parse(body);
            });
        
        callback(error, obj);
    });
}
