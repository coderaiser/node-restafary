'use strict';

const {Readable} = require('stream');
const {createGzip} = require('zlib');

const test = require('supertape');
const serveOnce = require('serve-once');

const restafary = require('..');

const {request} = serveOnce(restafary, {
    root: __dirname,
});

test('restafary: put', async (t) => {
    const {body} = await request.put('/fs/fixture/put.zip/hello', {
        body: 'zzz',
        options: {
            root: __dirname,
        },
    });
    
    const expected = 'save: ok("hello")';
    
    t.equal(body, expected);
    t.end();
});

test('restafary: put: unzip', async (t) => {
    const data = Readable.from('hello').pipe(createGzip());
    
    await request.put('/fs/fixture/put.zip/hello?unzip', {
        body: data,
        options: {
            root: __dirname,
        },
    });
    
    const {body} = await request.get('/fs/fixture/put.zip/hello', {
        options: {
            root: __dirname,
        },
    });
    
    const expected = 'hello';
    
    t.equal(body, expected);
    t.end();
});

test('restafary: put: directory', async (t) => {
    const {body} = await request.put('/fs/fixture/put.zip/hello?dir', {
        options: {
            root: __dirname,
        },
    });
    
    const expected = 'make dir: ok("hello")';
    
    t.equal(body, expected);
    t.end();
});

