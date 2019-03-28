'use strict';

const check = require('checkup');
const flop = require('flop');
const {
    promisify,
    callbackify,
} = require('util');

const pullout = require('pullout');
const remove = promisify(flop.remove);

module.exports = callbackify(async (query, name, readStream) => {
    check
        .type('name', name, 'string')
        .type('readStream', readStream, 'object')
        .check({query});
    
    if (query !== 'files')
        return await remove(name);
    
    const files = await getBody(readStream);
    
    await remove(name, files);
});

async function getBody(readStream) {
    const data = await pullout(readStream, 'string');
    const json = JSON.parse(data);
    
    return json;
}

