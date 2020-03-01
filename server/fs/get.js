'use strict';

const {callbackify} = require('util');

const {parse} = require('querystring');
const readStream = require('fs').createReadStream;
const check = require ('checkup');
const {read} = require('flop');
const ashify = require('ashify');

module.exports = callbackify(async (query, name) => {
    check
        .type('name', name, 'string')
        .check({query});
    
    if (/^(sort|order)/.test(query)) {
        const {
            sort,
            order = 'asc',
        } = parse(query);
        
        return read(name, {sort, order});
    }
    
    switch(query) {
    default:
        return read(name);
    
    case 'raw':
        return read(name, 'raw');
    
    case 'size':
        return read(name, 'size');
    
    case 'time':
        return read(name, 'time raw');
    
    case 'hash':
        return ashify(readStream(name), {algorithm: 'sha1', encoding: 'hex'});
    }
});

