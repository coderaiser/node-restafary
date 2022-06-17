'use strict';

const test = require('supertape');

const restafary = require('..');
const {request} = require('serve-once')(restafary);

test('restafary: http method: options', async (t) => {
    const {headers} = await request('options', '/fs');
    const methods = headers.raw()['access-control-allow-methods'];
    
    const expected = [[
        'POST',
        'GET',
        'PUT',
        'DELETE',
        'OPTIONS',
    ].join(', ')];
    
    t.deepEqual(methods, expected);
    t.end();
});

