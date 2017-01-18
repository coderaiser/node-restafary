'use strict';

const fs = require('fs');
const test = require('tape');
const fixture = {
    get: require(`${__dirname}/fixture/get`),
    getRaw: require(`${__dirname}/fixture/get-raw`)
};

const {get} = require('./before');

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

