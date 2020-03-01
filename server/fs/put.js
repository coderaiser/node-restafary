'use strict';

const {callbackify} = require('util');

const check = require('checkup');
const {create} = require('flop');
const files = require('files-io');

module.exports = callbackify(async (query, name, readStream) => {
    check
        .type('name', name, 'string')
        .type('readStream', readStream, 'object')
        .check({query});
    
    switch(query) {
    default:
        return files.pipe(readStream, name);
    
    case 'dir':
        return create(name);
    
    case 'unzip':
        return files.pipe(readStream, name, {
            gunzip: true,
        });
    }
});

