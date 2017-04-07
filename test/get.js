'use strict';

const fs = require('fs');
const calledWithDiff = require('sinon-called-with-diff');
const sinon = calledWithDiff(require('sinon'));
const test = require('tape');
const fixture = {
    get: require(`${__dirname}/fixture/get`),
    getRaw: require(`${__dirname}/fixture/get-raw`)
};

const {get} = require('./before');

const stub = (name, fn) => {
    require.cache[require.resolve(name)].exports = fn;
};

const clean = (name) => {
    delete require.cache[require.resolve(name)];
};

test('restafary: path traversal beyond root', (t) => {
    get('fs..%2f..%2fetc/passwd', '/tmp', (res, body, cb) => {
        cb();
        t.equal(body, 'Path /etc/passwd beyond root /tmp!', 'should return beyond root message');
        t.end();
    });
});

test('restafary: path traversal', (t) => {
    get('fs/bin', '/', (res, body, cb) => {
        const fn = () => {
            JSON.parse(body);
        };
        t.doesNotThrow(fn, 'should not throw');
        cb();
        t.end();
    });
});

test('restafary: path traversal, not default root', (t) => {
    get('fs/local', '/usr', (res, body, cb) => {
        const fn = () => JSON.parse(body);
        
        t.doesNotThrow(fn, 'should not throw');
        cb();
        t.end();
    });
});

test('restafary: path traversal: "."', (t) => {
    const path = fs.readdirSync('.').filter((name) => {
        return !/^\./.test(name);
    }).pop();
    
    get(`fs/${path}`, '.', (res, body, cb) => {
        t.ok(res.statusCode, 200, 'status code should be OK');
        cb();
        t.end();
    });
});

test('restafary: get: "raw": status', (t) => {
    get('fs/fixture/get-raw?raw', __dirname, (res, body, cb) => {
        t.ok(res.statusCode, 200, 'status code should be OK');
        cb();
        t.end();
    });
});

test('restafary: get: "raw": body: name', (t) => {
    get('fs/fixture/get-raw?raw', __dirname, (res, body, cb) => {
        t.deepEqual(fixture.getRaw.name, JSON.parse(body).name, 'should return raw data');
        cb();
        t.end();
    });
});

test('restafary: get: "raw": body: size', (t) => {
    get('fs/fixture/get-raw?raw', __dirname, (res, body, cb) => {
        t.deepEqual(fixture.getRaw.size, JSON.parse(body).size, 'should return raw data');
        cb();
        t.end();
    });
});

test('restafary: get: "raw": body: mode', (t) => {
    get('fs/fixture/get-raw?raw', __dirname, (res, body, cb) => {
        t.deepEqual(fixture.getRaw.mode, JSON.parse(body).mode, 'should return raw data');
        cb();
        t.end();
    });
});

test('restafary: get: status', (t) => {
    get('fs/fixture/get', __dirname, (res, body, cb) => {
        t.ok(res.statusCode, 200, 'status code should be OK');
        cb();
        t.end();
    });
});

test('restafary: get: body: name', (t) => {
    get('fs/fixture/get', __dirname, (res, body, cb) => {
        t.deepEqual(fixture.get.name, JSON.parse(body).name, 'should return data');
        cb();
        t.end();
    });
});

test('restafary: get: body: size', (t) => {
    get('fs/fixture/get', __dirname, (res, body, cb) => {
        t.deepEqual(fixture.get.size, JSON.parse(body).size, 'should return data');
        cb();
        t.end();
    });
});

test('restafary: get: body: mode', (t) => {
    get('fs/fixture/get', __dirname, (res, body, cb) => {
        t.deepEqual(fixture.get.mode, JSON.parse(body).mode, 'should return data');
        cb();
        t.end();
    });
});

test('restafary: get: sort by name', (t) => {
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
    
    const CALLBACK = 2;
    const read = sinon.stub()
        .callsArgWithAsync(CALLBACK, null, expected);
    
    stub('flop/legacy', {read});
    
    const {get} = require('./before');
    
    get('fs/bin?sort=name', '/', (res, body, cb) => {
        const order = 'asc';
        const sort = 'name';
        t.ok(read.calledWith('/bin', {sort, order}), 'should call readify with sort "name"');
        cb();
        t.end();
    });
});

test('restafary: get: sort by size', (t) => {
    const expected = {
        path: '',
        files: []
    };
    
    clean('./before');
    clean('..');
    clean('../server/fs/get');
    
    const read = sinon.stub()
        .callsArgWithAsync(2, null, expected);
    
    stub('flop/legacy', {read});
    
    const {get} = require('./before');
    
    get('fs/bin?sort=size', '/', (res, body, cb) => {
        const order = 'asc';
        const sort = 'size';
        t.ok(read.calledWith('/bin', {sort, order}), 'should call readify with sort "size"');
        cb();
        t.end();
    });
});

test('restafary: get: sort by order', (t) => {
    const expected = {
        path: '',
        files: []
    };
    
    clean('./before');
    clean('..');
    clean('../server/fs/get');
    
    const read = sinon.stub()
        .callsArgWithAsync(2, null, expected);
    
    stub('flop/legacy', {read});
    
    const {get} = require('./before');
    
    get('fs/bin?order=desc&sort=time', '/', (res, body, cb) => {
        const sort = 'time';
        const order = 'desc';
        t.ok(read.calledWith('/bin', {sort, order}), 'should call readify with sort and order');
        cb();
        t.end();
    });
});

