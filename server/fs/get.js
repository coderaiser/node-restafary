import {Buffer} from 'node:buffer';
import {Readable} from 'node:stream';
import {parse} from 'node:querystring';
import check from 'checkup';
import ashify from 'ashify';
import {read as _read} from 'win32';
import {readSize} from 'redzip';

const {assign} = Object;

export const get = async (overrides = {}) => {
    const {
        query,
        path,
        root,
        read = _read,
    } = overrides;
    
    check
        .type('path', path, 'string')
        .check({
            query,
        });
    
    const {
        sort = 'name',
        order = 'asc',
    } = parse(query);
    
    if (query === 'raw')
        return await read(path, {
            sort,
            order,
            type: 'raw',
        });
    
    if (query === 'size')
        return await readSize(path);
    
    if (query === 'raw-size')
        return await readSize(path, {
            type: 'raw',
        });
    
    if (query === 'hash') {
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
    
    return await read(path, {
        sort,
        order,
        root,
    });
};
