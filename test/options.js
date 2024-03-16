'use strict';

const test = require('supertape');

const restafary = require('..');
const {request} = require('serve-once')(restafary);

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
