'use strict';

const tryToCatch = require('try-to-catch');
const test = require('supertape');
const got = require('got');

const {
    serve,
    getURL,
} = require('./before');

test('restafary: http method: options', async (t) => {
    const {port, done}  = await serve(__dirname);
    const url = getURL('fs', port);
    
    const [, response] = await tryToCatch(got, url, {
        method: 'OPTIONS'
    });
    
    const {headers} = response;
    const methods = headers['access-control-allow-methods'];
    
    done();
    
    const expected = [
        'POST',
        'GET',
        'PUT',
        'DELETE',
        'OPTIONS',
    ].join(', ');
    
    t.equal(methods, expected, 'should equal');
    t.end();
});

