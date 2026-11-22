import process from 'node:process';
import {test} from 'supertape';
import {serveOnce} from 'serve-once';

const isUndefined = (a) => typeof a === 'undefined';

test('restafary: dev: client file', async (t) => {
    const {NODE_ENV} = process.env;
    
    process.env.NODE_ENV = 'development';
    const {restafary} = await import('../server/restafary.js?dev');
    
    process.env.NODE_ENV = NODE_ENV;
    
    if (isUndefined(NODE_ENV))
        delete process.env.NODE_ENV;
    
    const {request} = serveOnce(restafary);
    const {body} = await request.get('/restafary.js');
    
    t.notMatch(body, 'Cannot GET', 'should not pass client file to next');
    t.end();
});
