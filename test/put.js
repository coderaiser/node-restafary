'use strict';

const {Readable} = require('node:stream');
const {createGzip} = require('node:zlib');
const {join} = require('node:path');

const {readFileSync, writeFileSync} = require('node:fs');

const {test} = require('supertape');
const serveOnce = require('serve-once');

const restafary = require('..');

const {request} = serveOnce(restafary, {
    root: __dirname,
});

const fixturePath = join(__dirname, 'fixture', 'put.zip');
const fixtureData = readFileSync(fixturePath);
const restore = () => writeFileSync(fixturePath, fixtureData);

test('restafary: put', async (t) => {
    const {body} = await request.put('/fs/fixture/put.zip/hello', {
        body: 'zzz',
        options: {
            root: __dirname,
        },
    });
    
    restore();
    const expected = 'save: ok("hello")';
    
    t.equal(body, expected);
    t.end();
});

test('restafary: put: unzip', async (t) => {
    const data = Readable
        .from('hello')
        .pipe(createGzip());
    
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
    
    restore();
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
    
    restore();
    const expected = 'make dir: ok("hello")';
    
    t.equal(body, expected);
    t.end();
});
