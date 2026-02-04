import {test} from 'supertape';
import serveOnce from 'serve-once';
import {restafary} from '../server/restafary.js';

const {request} = serveOnce(restafary);

test('restafary: http method: options', async (t) => {
    const {headers} = await request('options', '/fs');
    const methods = headers.get('Access-Control-Allow-Methods');
    
    const expected = [
        'POST',
        'GET',
        'PUT',
        'DELETE',
        'OPTIONS',
    ].join(', ');
    
    t.equal(methods, expected);
    t.end();
});
