'use strict';

const fs = require('fs');
const calledWithDiff = require('sinon-called-with-diff');
const sinon = calledWithDiff(require('sinon'));
const test = require('tape');
const fixture = {
    get: require(`${__dirname}/fixture/get`),
    getRaw: require(`${__dirname}/fixture/get-raw`)
};

const restafary = require('..');
const {get} = require('./before');

const {request} = require('serve-once')(restafary);

const stub = (name, fn) => {
    require.cache[require.resolve(name)].exports = fn;
};

const clean = (name) => {
    delete require.cache[require.resolve(name)];
};

test('restafary: path traversal beyond root', async (t) => {
    const root = '/tmp';
    const {body} = await request.get('/fs..%2f..%2fetc/passwd', {
        options: {
            root,
        }
    });
    
    t.equal(body, 'Path /etc/passwd beyond root /tmp!', 'should return beyond root message');
    t.end();
});

test('restafary: path traversal', async (t) => {
    const {body} = await request.get('/fs/bin', {
        options: {
            root: '/'
        }
    });
    
    const fn = () => JSON.parse(body);
    
    t.doesNotThrow(fn, 'should not throw');
    t.end();
});

test('restafary: path traversal, not default root', async (t) => {
    const [, response] = await get('fs/local', '/usr');
    const {body} = response;
    const fn = () => JSON.parse(body);
    
    t.doesNotThrow(fn, 'should not throw');
    t.end();
});

test('restafary: path traversal: "."', async (t) => {
    const notRoot = (_) => !/^\./.test(_);
    const path = fs.readdirSync('.')
        .filter(notRoot)
        .pop();
    
    const [, res] = await get(`fs/${path}`, '.');
    
    t.ok(res.statusCode, 200, 'status code should be OK');
    t.end();
});

test('restafary: get: "raw": status', async (t) => {
    const [, res] = await get('fs/fixture/get-raw?raw', __dirname);
    
    t.ok(res.statusCode, 200, 'status code should be OK');
    t.end();
});

test('restafary: get: "raw": body: name', async (t) => {
    const [, res] = await get('fs/fixture/get-raw?raw', __dirname);
    const {body} = res;
    
    t.deepEqual(fixture.getRaw.name, JSON.parse(body).name, 'should return raw data');
    t.end();
});

test('restafary: get: "raw": body: size', async (t) => {
    const [, res] = await get('fs/fixture/get-raw?raw', __dirname);
    const {body} = res;
    
    t.deepEqual(fixture.getRaw.size, JSON.parse(body).size, 'should return raw data');
    t.end();
});

test('restafary: get: "raw": body: mode', async (t) => {
    const [, res] = await get('fs/fixture/get-raw?raw', __dirname);
    const {body} = res;
    
    t.deepEqual(fixture.getRaw.mode, JSON.parse(body).mode, 'should return raw data');
    t.end();
});

test('restafary: get: status', async (t) => {
    const [, res] = await get('fs/fixture/get', __dirname);
    
    t.ok(res.statusCode, 200, 'status code should be OK');
    t.end();
});

test('restafary: get: body: name', async (t) => {
    const [, res] = await get('fs/fixture/get', __dirname);
    const {body} = res;
    
    t.deepEqual(fixture.get.name, JSON.parse(body).name, 'should return data');
    t.end();
});

test('restafary: get: body: size', async (t) => {
    const [, res] = await get('fs/fixture/get', __dirname);
    const {body} = res;
    
    t.deepEqual(fixture.get.size, JSON.parse(body).size, 'should return data');
    t.end();
});

test('restafary: get: body: mode', async (t) => {
    const [, res] = await get('fs/fixture/get', __dirname);
    const {body} = res;
    
    t.deepEqual(fixture.get.mode, JSON.parse(body).mode, 'should return data');
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
        }]
    };
    
    clean('./before');
    clean('..');
    clean('../server/fs/get');
    
    const callbackIndex = 2;
    const read = sinon.stub()
        .callsArgWithAsync(callbackIndex, null, expected);
    
    stub('flop', {read});
    
    const {get} = require('./before');
    await get('fs/bin?sort=name', '/');
    
    const [args] = read.args;
    const fn = args[callbackIndex];
    
    const order = 'asc';
    const sort = 'name';
    
    t.ok(read.calledWith('/bin', {sort, order}, fn), 'should call readify with sort "name"');
    t.end();
});

test('restafary: get: sort by size', async (t) => {
    const expected = {
        path: '',
        files: []
    };
    
    clean('./before');
    clean('..');
    clean('../server/fs/get');
    
    const callbackIndex = 2;
    const read = sinon.stub()
        .callsArgWithAsync(callbackIndex, null, expected);
    
    stub('flop', {read});
    
    const {get} = require('./before');
    
    await get('fs/bin?sort=size', '/');
    
    const [args] = read.args;
    const fn = args[callbackIndex];
    const order = 'asc';
    const sort = 'size';
    
    t.ok(read.calledWith('/bin', {sort, order}, fn), 'should call readify with sort "size"');
    t.end();
});

test('restafary: get: sort by order', async (t) => {
    const expected = {
        path: '',
        files: []
    };
    
    clean('./before');
    clean('..');
    clean('../server/fs/get');
    
    const callbackIndex = 2;
    const read = sinon.stub()
        .callsArgWithAsync(callbackIndex, null, expected);
    
    stub('flop', {read});
    
    const {get} = require('./before');
    
    await get('fs/bin?order=desc&sort=time', '/');
    
    const [args] = read.args;
    const fn = args[callbackIndex];
    
    const sort = 'time';
    const order = 'desc';
    
    t.ok(read.calledWith('/bin', {sort, order}, fn), 'should call readify with sort and order');
    t.end();
});

