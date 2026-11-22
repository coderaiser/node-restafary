import {callbackify} from 'node:util';
import check from 'checkup';
import {write} from 'redzip';

export const put = callbackify(async (query, name, readStream) => {
    check
        .type('name', name, 'string')
        .type('readStream', readStream, 'object')
        .check({
            query,
        });
    
    if (query === 'dir')
        return await write(name);
    
    if (query === 'unzip')
        return await write(name, readStream, {
            unzip: true,
        });
    
    return await write(name, readStream);
});
