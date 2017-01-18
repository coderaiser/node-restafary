'use strict';

const check = require('checkup');
const flop = require('flop');
const promisify = require('es6-promisify');
const pullout = promisify(require('pullout/legacy'));
const good = (fn) => (a) => fn(null, a);

module.exports = (query, name, readStream, callback) => {
    check
        .type('name', name, 'string')
        .type('readStream', readStream, 'object')
        .type('callback', callback, 'function')
        .check({query});
        
    if (query !== 'files')
        return flop.delete(name, callback);
    
    getBody(readStream, (error, files) => {
        if (error)
            return callback(error);
        
        flop.delete(name, files, callback);
    });
};

function getBody(readStream, callback) {
    pullout(readStream, 'string')
        .then(JSON.parse)
        .then(good(callback))
        .catch(callback);
}

