'use strict';

const {callbackify} = require('node:util');
const check = require('checkup');
const {remove} = require('flop');

const pullout = require('pullout');

module.exports = callbackify(async (query, name, readStream) => {
    check
        .type('name', name, 'string')
        .type('readStream', readStream, 'object')
        .check({
            query,
        });
    
    if (query !== 'files')
        return await remove(name);
    
    const files = await getBody(readStream);
    
    await remove(name, files);
});

async function getBody(readStream) {
    const data = await pullout(readStream, 'string');
    
    return JSON.parse(data);
}
