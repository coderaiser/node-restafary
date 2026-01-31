'use strict';

const {Buffer} = require('node:buffer');
const {Readable} = require('node:stream');

const {parse} = require('node:querystring');
const check = require('checkup');
const ashify = require('ashify');
const {read} = require('win32');
const {readSize} = require('redzip');

const {assign} = Object;

module.exports = async ({query, path, root}) => {
    check
        .type('path', path, 'string')
        .check({
            query,
        });
    
    const {sort = 'name', order = 'asc'} = parse(query);
    
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
    
    case 'raw-size':
        return await readSize(path, {
            type: 'raw',
        });
    
    case 'hash': {
        const hash = await ashify(await read(path), {
            algorithm: 'sha1',
            encoding: 'hex',
        });
        
        const stream = Readable.from(hash);
        
        assign(stream, {
            contentLength: Buffer.byteLength(hash),
        });
        
        return stream;
    }
    }
};
