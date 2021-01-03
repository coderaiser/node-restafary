'use strict';

const tryCatch = require('try-catch');

const fs = require('fs');
const test = require('supertape');
const fixture = {
    get: require(`${__dirname}/fixture/get`),
    getRaw: require(`${__dirname}/fixture/get-raw`),
};

const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');
const {reRequire} = mockRequire;

const restafary = require('..');

const serveOnce = require('serve-once');
const {request} = serveOnce(restafary, {
    root: __dirname,
});

test('restafary: path traversal beyond root', async (t) => {
    const root = '/tmp';
    const {body} = await request.get('/fs..%2f..%2fetc/passwd', {
        options: {
            root,
        },
    });
    
    t.equal(body, 'Path /etc/passwd beyond root /tmp!', 'should return beyond root message');
    t.end();
});

test('restafary: path traversal', async (t) => {
    const {body} = await request.get('/fs/bin', {
        options: {
            root: '/',
        },
    });
    
    const [error] = tryCatch(JSON.parse, body);
    
    t.notOk(error, 'should not throw');
    t.end();
});

test('restafary: path traversal, not default root', async (t) => {
    const {body} = await request.get('/fs/local', {
        options: {
            root: '/usr',
        },
    });
    const [error] = tryCatch(JSON.parse, body);
    
    t.notOk(error, 'should not throw');
    t.end();
});

test('restafary: path traversal: "."', async (t) => {
    const notRoot = (_) => !/^\./.test(_);
    const path = fs.readdirSync(__dirname)
        .filter(notRoot)
        .pop();
    
    const {status} = await request.get(`/fs/${path}`);
    
    t.equal(status, 200, 'status code should be OK');
    t.end();
});

test('restafary: get: "raw": status', async (t) => {
    const {status} = await request.get('/fs/fixture/get-raw?raw');
    
    t.equal(status, 200, 'status code should be OK');
    t.end();
});

test('restafary: get: "raw": body: name', async (t) => {
    const {body} = await request.get('/fs/fixture/get-raw?raw');
    
    t.deepEqual(fixture.getRaw.name, JSON.parse(body).name, 'should return raw data');
    t.end();
});

test('restafary: get: "raw": body: size', async (t) => {
    const {body} = await request.get('/fs/fixture/get-raw?raw');
    
    t.deepEqual(fixture.getRaw.size, JSON.parse(body).size, 'should return raw data');
    t.end();
});

test('restafary: get: "raw": body: mode', async (t) => {
    const {body} = await request.get('/fs/fixture/get-raw?raw');
    
    t.deepEqual(fixture.getRaw.mode, JSON.parse(body).mode, 'should return raw data');
    t.end();
});

test('restafary: get: status', async (t) => {
    const {status} = await request.get('/fs/fixture/get');
    
    t.equal(status, 200, 'status code should be OK');
    t.end();
});

test('restafary: get: body: name', async (t) => {
    const {body} = await request.get('/fs/fixture/get', {
        type: 'json',
    });
    
    t.deepEqual(fixture.get.name, body.name, 'should return data');
    t.end();
});

test('restafary: get: body: size', async (t) => {
    const {body} = await request.get('/fs/fixture/get', {
        type: 'json',
    });
    
    t.deepEqual(fixture.get.size, body.size, 'should return data');
    t.end();
});

test('restafary: get: body: mode', async (t) => {
    const {body} = await request.get('/fs/fixture/get', {
        type: 'json',
    });
    
    t.deepEqual(fixture.get.mode, body.mode, 'should return data');
    t.end();
});

test('restafary: get: sort by name', async (t) => {
    const expected = {
        path: './',
        files: [{
            name: '.readify.js',
            size: '3.46kb',
            date: '12.01.2017',
            owner: 'root',
            mode: 'rw- rw- r--',
        }, {
            name: 'readdir.js',
            size: '1.59kb',
            date: '12.01.2017',
            owner: 'root',
            mode: 'rw- rw- r--',
        }],
    };
    
    const read = stub().returns(expected);
    
    mockRequire('flop', {
        read,
    });
    
    reRequire('../server/fs/get');
    
    const restafary = reRequire('..');
    const {request} = serveOnce(restafary, {
        root: '/',
    });
    
    await request.get('/fs/bin?sort=name');
    
    const order = 'asc';
    const sort = 'name';
    
    t.calledWith(read, ['/bin', {sort, order}], 'should call readify with sort "name"');
    t.end();
});

test('restafary: get: sort by size', async (t) => {
    const expected = {
        path: '',
        files: [],
    };
    
    const read = stub().returns(expected);
    
    mockRequire('flop', {
        read,
    });
    
    reRequire('../server/fs/get');
    
    const restafary = reRequire('..');
    const {request} = serveOnce(restafary, {
        root: '/',
    });
    
    await request.get('/fs/bin?sort=size');
    
    const order = 'asc';
    const sort = 'size';
    
    t.calledWith(read, ['/bin', {sort, order}], 'should call readify with sort "size"');
    t.end();
});

test('restafary: get: sort by order', async (t) => {
    const expected = {
        path: '',
        files: [],
    };
    
    const read = stub().returns(expected);
    
    mockRequire('flop', {
        read,
    });
    
    reRequire('../server/fs/get');
    
    const restafary = reRequire('..');
    const {request} = serveOnce(restafary, {
        root: '/',
    });
    
    await request.get('/fs/bin?order=desc&sort=time');
    
    const sort = 'time';
    const order = 'desc';
    
    t.calledWith(read, ['/bin', {sort, order}], 'should call readify with sort and order');
    t.end();
});

