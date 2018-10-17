'use strict';

const {
    promisify,
    callbackify,
} = require('util');

const check = require('checkup');
const pullout = promisify(require('pullout'));
const patch = require('patchfile');

module.exports = callbackify(async (name, readStream, options) => {
    check
        .type('name', name, 'string')
        .type('readStream', readStream, 'object')
    
    const data = await pullout(readStream, 'string');
    
    return patch(name, data, options);
});

