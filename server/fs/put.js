'use strict';

const {
    callbackify,
    promisify,
} = require('util');

const check = require('checkup');
const create = promisify(require('flop').create);
const pipeFiles = promisify(require('files-io').pipe);

module.exports = callbackify(async (query, name, readStream) => {
    check
        .type('name', name, 'string')
        .type('readStream', readStream, 'object')
        .check({query});
    
    switch(query) {
    default:
        return pipeFiles(readStream, name);
    
    case 'dir':
        return create(name);
    
    case 'unzip':
        return pipeFiles(readStream, name, {gunzip: true});
    }
});

