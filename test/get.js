'use strict';

const fs = require('fs');
const {Readable} = require('stream');

const {test, stub} = require('supertape');

const tryCatch = require('try-catch');
const mockRequire = require('mock-require');
const serveOnce = require('serve-once');

const restafary = require('..');

const {reRequire, stopAll} = mockRequire;

const fixture = {
    get: require(`${__dirname}/fixture/get`),
    getRaw: require(`${__dirname}/fixture/get-raw`),
};

const {request} = serveOnce(restafary, {
    root: __dirname,
});

const {stringify, parse} = JSON;

const {assign} = Object;

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
    
    const path = fs
        .readdirSync(__dirname)
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
    const [{name}] = JSON.parse(body).files;
    
    t.equal(name, 'hello.txt', 'should return raw data');
    t.end();
});

test('restafary: get: "raw": directory: size', async (t) => {
    const {body} = await request.get('/fs/fixture/get-raw?raw');
    const [{size}] = JSON.parse(body).files;
    
    t.equal(size, 6, 'should return raw data');
    t.end();
});

test('restafary: get: "raw": directory: raw-size', async (t) => {
    const {body} = await request.get('/fs/fixture/get-raw/hello.txt?raw-size');
    
    t.equal(body, '6', 'should return raw data');
    t.end();
});

test('restafary: get: "raw": body: mode', async (t) => {
    const {body} = await request.get('/fs/fixture/get-raw?raw');
    const expected = JSON.parse(body).mode;
    
    t.deepEqual(fixture.getRaw.mode, expected, 'should return raw data');
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
    
    const str = stringify({
        path,
        files,
    });
    
    const stream = Readable.from(str);
    
    assign(stream, {
        contentLength: Buffer.byteLength(str),
        type: 'directory',
    });
    
    const read = stub().returns(stream);
    
    mockRequire('win32', {
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
    
    stopAll();
    
    t.calledWith(read, ['/bin', {
        sort,
        order,
        root,
    }], 'should call readify with sort "name"');
    t.end();
});

test('restafary: get: sort by size', async (t) => {
    const path = '';
    const files = [];
    
    const str = stringify({
        path,
        files,
    });
    
    const stream = Readable.from(str);
    
    assign(stream, {
        type: 'directory',
        contentLength: Buffer.byteLength(str),
    });
    
    const read = stub().returns(stream);
    
    mockRequire('win32', {
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
    
    stopAll();
    
    t.calledWith(read, ['/bin', {
        sort,
        order,
        root,
    }], 'should call readify with sort "size"');
    t.end();
});

test('restafary: get: sort by order', async (t) => {
    const path = '';
    const files = [];
    
    const str = stringify({
        path,
        files,
    });
    
    const stream = Readable.from(str);
    
    assign(stream, {
        contentLength: Buffer.byteLength(str),
        type: 'directory',
    });
    
    const read = stub().returns(stream);
    
    mockRequire('win32', {
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
    
    stopAll();
    
    t.calledWith(read, ['/bin', {
        sort,
        order,
        root,
    }], 'should call readify with sort and order');
    t.end();
});

test('restafary: path traversal: emoji', async (t) => {
    const url = encodeURI('/fs/fixture/🎉/');
    
    const {body} = await request.get(url, {
        type: 'json',
        options: {
            root: __dirname,
        },
    });
    
    delete body.files[0].owner;
    delete body.files[0].mode;
    delete body.files[0].date;
    
    const expected = {
        path: '/fixture/🎉/',
        files: [{
            name: 'hello.txt',
            size: '6b',
            type: 'file',
        }],
    };
    
    t.deepEqual(body, expected);
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
        files: [{
            name: 'dir',
            size: '0b',
            date: '28.08.2017',
            mode: 'rw- rw- rw-',
            type: 'directory',
            owner: 'root',
        }],
    }, null, 4);
    
    t.equal(body, expected);
    t.end();
});

test('restafary: path traversal: zip: download', async (t) => {
    const {headers} = await request.get('/fs/fixture/get.zip/hello.txt?download', {
        options: {
            root: __dirname,
        },
    });
    
    const result = headers.get('Content-Disposition');
    
    t.equal(result, 'attachment');
    t.end();
});

test('restafary: get: content type', async (t) => {
    const {headers} = await request.get('/fs/fixture/index.html');
    const contentType = headers.get('Content-Type');
    const expected = 'text/html; charset=utf-8';
    
    t.equal(contentType, expected, 'should set content type');
    t.end();
});

test('restafary: get: content type: no extension', async (t) => {
    const {headers} = await request.get('/fs/fixture/image');
    const contentType = headers.get('Content-Type');
    const expected = 'image/x-icon';
    
    t.equal(contentType, expected, 'should set content type');
    t.end();
});

test('restafary: get: file: content length', async (t) => {
    const {headers} = await request.get('/fs/fixture/index.html');
    const contentType = headers.get('Content-Length');
    const expected = '14';
    
    t.equal(contentType, expected, 'should set content length');
    t.end();
});

test('restafary: get: dir: content length', async (t) => {
    const {headers} = await request.get('/fs/fixture/dir.zip');
    const contentType = headers.get('Content-Length');
    const expected = '232';
    
    t.equal(contentType, expected, 'should set content length');
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

test('restafary: zip: hash', async (t) => {
    const {body} = await request.get('/fs/fixture/dir.zip/dir?hash', {
        options: {
            root: __dirname,
        },
    });
    
    const {length} = 'ce5a6d585669be2da407f6b2616128b3bc755c62';
    
    t.equal(body.length, length);
    t.end();
});

test('restafary: zip: hash: content length', async (t) => {
    const {headers} = await request.get('/fs/fixture/dir.zip/dir?hash', {
        options: {
            root: __dirname,
        },
    });
    
    const result = headers.get('content-length');
    const expected = '40';
    
    t.equal(result, expected);
    t.end();
});

test('restafary: get: nbsp', async (t) => {
    const {body} = await request.get('/fs/hello&nbsp;world', {
        options: {
            root: __dirname,
        },
    });
    
    t.match(body, '\xa0');
    t.end();
});

test('restafary: get: error: EACCESS', async (t) => {
    const error = Error('EACCESS');
    const tryToCatch = stub().resolves([error]);
    
    mockRequire('try-to-catch', tryToCatch);
    
    const restafary = reRequire('..');
    
    const {request} = serveOnce(restafary, {
        root: __dirname,
    });
    
    const {body} = await request.get('/fs/hello', {
        options: {
            root: __dirname,
        },
    });
    
    stopAll();
    
    t.equal(body, 'EACCESS');
    t.end();
});

test('restafary: get: ./fixture', async (t) => {
    const {body} = await request.get('/fs/get.json', {
        options: {
            root: './test/fixture/',
        },
    });
    
    const [error] = tryCatch(parse, body);
    
    t.notOk(error);
    t.end();
});
