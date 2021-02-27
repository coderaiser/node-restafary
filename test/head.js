'use strict';

const test = require('supertape');
const serveOnce = require('serve-once');

const restafary = require('..');

const {request} = serveOnce(restafary, {
    root: __dirname,
});

test('restafary: head: content type', async (t) => {
    const {headers} = await request('head', '/fs/fixture/index.html');
    const contentType = headers.get('Content-Type');
    const expected = 'text/html; charset=utf-8';
    
    t.equal(contentType, expected, 'should set content type');
    t.end();
});

test('restafary: get: file: content length', async (t) => {
    const {headers} = await request('head', '/fs/fixture/index.html');
    const contentType = headers.get('Content-Length');
    const expected = '14';
    
    t.equal(contentType, expected, 'should set content length');
    t.end();
});

