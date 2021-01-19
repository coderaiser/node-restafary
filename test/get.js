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
    const path = './';
    const files = [{
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
    }];
    
    const stream = Readable.from(stringify({
        path,
        files,
    }));
    
    stream.type = 'directory';
    const read = stub().returns(stream);
    
    mockRequire('redzip', {
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
    const root = '/';
    
    t.calledWith(read, ['/bin', {sort, order, root}], 'should call readify with sort "name"');
    t.end();
});

test('restafary: get: sort by size', async (t) => {
    const path = '';
    const files = [];
    
    const stream = Readable.from(stringify({
        path,
        files,
    }));
    
    stream.type = 'directory';
    const read = stub().returns(stream);
    
    mockRequire('redzip', {
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
    const root = '/';
    
    t.calledWith(read, ['/bin', {sort, order, root}], 'should call readify with sort "size"');
    t.end();
});

test('restafary: get: sort by order', async (t) => {
    const path = '';
    const files = [];
    
    const stream = Readable.from(stringify({
        path,
        files,
    }));
    
    stream.type = 'directory';
    
    const read = stub().returns(stream);
    
    mockRequire('redzip', {
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
    const root = '/';
    
    t.calledWith(read, ['/bin', {sort, order, root}], 'should call readify with sort and order');
    t.end();
});

test('restafary: path traversal: zip', async (t) => {
    const {body} = await request.get('/fs/fixture/dir.zip/', {
        options: {
            root: __dirname,
        },
    });
    
    const expected = stringify({
        path: '/fixture/dir.zip/',
        files: [
            {
                name: 'dir',
                size: '0b',
                date: '28.08.2017',
                mode: '--- --- ---',
                type: 'directory',
                owner: 'root',
            },
        ],
    }, null, 4);
    
    t.equal(body, expected);
    t.end();
});

test('restafary: get: content type', async (t) => {
    const {headers} = await request.get('/fs/fixture/index.html');
    const contentType = headers.get('Content-Type');
    const expected = 'text/html; charset=utf-8';
    
    t.equal(contentType, expected, 'should set content type');
    t.end();
});

test('restafary: zip size', async (t) => {
    const {body} = await request.get('/fs/fixture/dir.zip/dir?size', {
        options: {
            root: __dirname,
        },
    });
    
    const expected = '6b';
    
    t.equal(body, expected);
    t.end();
});

test('restafary: outer size', async (t) => {
    const {body} = await request.get('/fs/fixture/dir.zip?size', {
        options: {
            root: __dirname,
        },
    });
    
    const expected = '232b';
    
    t.equal(body, expected);
    t.end();
});
