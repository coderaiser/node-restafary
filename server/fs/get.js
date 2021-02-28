'use strict';

const {Readable} = require('stream');
const {parse} = require('querystring');

const check = require ('checkup');
const flop = require('flop');
const ashify = require('ashify');
const {read} = require('win32');
const {readSize} = require('redzip');

module.exports = async ({query, path, root}) => {
    check
        .type('path', path, 'string')
        .check({query});
    
    const {
        sort = 'name',
        order = 'asc',
    } = parse(query);
    
    switch(query) {
    default:
        return await read(path, {
            sort,
            order,
            root,
        });
    
    case 'raw':
        return await read(path, {
            sort,
            order,
            type: 'raw',
        });
    
    case 'size':
        return await readSize(path);
    
    case 'hash':
        return Readable.from(await ashify(await read(path), {algorithm: 'sha1', encoding: 'hex'}));
    }
};

