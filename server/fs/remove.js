import check from 'checkup';
import {remove as flopRemove} from 'flop';
import pullout from 'pullout';

export const remove = async (query, name, readStream) => {
    check
        .type('name', name, 'string')
        .type('readStream', readStream, 'object')
        .check({
            query,
        });
    
    if (query !== 'files')
        return await flopRemove(name);
    
    const files = await getBody(readStream);
    
    await flopRemove(name, files);
};

async function getBody(readStream) {
    const data = await pullout(readStream, 'string');
    
    return JSON.parse(data);
}
