'use strict';

const fs = require('fs');
const {Readable} = require('stream');

const test = require('supertape');
const tryCatch = require('try-catch');
const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');
const serveOnce = require('serve-once');

const fixture = {
    get: require(`${__dirname}/fixture/get`),
    getRaw: require(`${__dirname}/fixture/get-raw`),
};

const {reRequire} = mockRequire;

const restafary = require('..');

const {request} = serveOnce(restafary, {
    root: __dirname,
});

const {stringify} = JSON;

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

