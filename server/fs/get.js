'use strict';

const readStream = require('fs').createReadStream;
const check = require ('checkup');
const minify = require('minify');
const flop = require('flop');
const ashify = require('ashify');
const beautify = require('beautifile');

module.exports = (query, name, callback) => {
    check
        .type('name', name, 'string')
        .type('callback', callback, 'function')
        .check({query});
    
    switch (query) {
    default:
        flop.read(name, callback);
        break;
    
    case 'raw':
        flop.read(name, 'raw', callback);
        break;
    
    case 'size':
        flop.read(name, 'size', callback);
        break;
        
    case 'time':
        flop.read(name, 'time raw', callback);
        break;
    
    case 'beautify':
        beautify(name, callback);
        break;
    
    case 'minify':
        minify(name, callback);
        break;
    
    case 'hash':
        ashify(readStream(name), {algorithm: 'sha1', encoding: 'hex'}, callback);
        break;
    }
};

