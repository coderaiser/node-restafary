import {callbackify} from 'node:util';
import check from 'checkup';
import pullout from 'pullout';
import patchfile from 'patchfile';

export const patch = callbackify(async (name, readStream, options) => {
    check
        .type('name', name, 'string')
        .type('readStream', readStream, 'object');
    
    const data = await pullout(readStream, 'string');
    
    return patchfile(name, data, options);
});
