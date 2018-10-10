'use strict';

const {
    promisify,
    callbackify,
} = require('util');

const querystring = require('querystring');
const readStream = require('fs').createReadStream;
const check = require ('checkup');
const minify = promisify(require('minify'));
const flop = require('flop');
const ashify = promisify(require('ashify'));
const beautify = promisify(require('beautifile'));

const read = promisify(flop.read);

module.exports = callbackify(async (query, name) => {
    check
        .type('name', name, 'string')
        .check({query});
    
    if (/^(sort|order)/.test(query)) {
        const parsed = querystring.parse(query);
        const sort = parsed.sort;
        const order = parsed.order || 'asc';
        
        return read(name, {sort, order});
    }
    
    switch (query) {
    default:
        return read(name);
    
    case 'raw':
        return read(name, 'raw');
    
    case 'size':
        return read(name, 'size');
        
    case 'time':
        return read(name, 'time raw');
    
    case 'beautify':
        return beautify(name);
    
    case 'minify':
        return minify(name);
    
    case 'hash':
        return ashify(readStream(name), {algorithm: 'sha1', encoding: 'hex'});
    }
});

