'use strict';

const {callbackify} = require('util');

const check = require('checkup');
const {write} = require('redzip');

module.exports = callbackify(async (query, name, readStream) => {
    check
        .type('name', name, 'string')
        .type('readStream', readStream, 'object')
        .check({
            query,
        });
    
    switch(query) {
    default:
        return await write(name, readStream);
    
    case 'dir':
        return await write(name);
    
    case 'unzip':
        return await write(name, readStream, {
            unzip: true,
        });
    }
});
