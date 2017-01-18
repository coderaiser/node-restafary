'use strict';

const fs = require('fs');
const test = require('tape');
const pullout = require('pullout/legacy');
const fixture = {
    get: require(`${__dirname}/fixture/get`),
    getRaw: require(`${__dirname}/fixture/get-raw`)
};

const {get} = require('./before');

test('restafary: path traversal beyond root', (t) => {
    get('fs..%2f..%2fetc/passwd', '/tmp', (res, cb) => {
        pullout(res, 'string', (error, body) => {
            cb();
            t.notOk(error, `should not be error: ${error}`);
            t.equal(body, 'Path /etc/passwd beyond root /tmp!', 'should return beyond root message');
            t.end();
        });
    });
});

test('restafary: path traversal', (t) => {
    get('fs/bin', '/', (res, cb) => {
        pullout(res, 'string', (error, body) => {
            const fn = () => {
                JSON.parse(body);
            };
            t.notOk(error, `should not be error: ${error}`);
            t.doesNotThrow(fn, 'should not throw');
            cb();
            t.end();
        });
    });
});

test('restafary: path traversal, not default root', (t) => {
    get('fs/local', '/usr', (res, cb) => {
        pullout(res, 'string', (error, body) => {
            const fn = () => {
                JSON.parse(body);
            };
            t.notOk(error, `should not be error: ${error}`);
            t.doesNotThrow(fn, 'should not throw');
            cb();
            t.end();
        });
    });
});

test('restafary: path traversal: "."', (t) => {
    const path = fs.readdirSync('.').filter((name) => {
        return !/^\./.test(name);
    })[0];
    
    get(`fs/${path}`, '.', (res, cb) => {
        t.ok(res.statusCode, 200, 'status code should be OK');
        cb();
        t.end();
    });
});

test('restafary: get: "raw": status', (t) => {
    get('fs/fixture/get-raw?raw', __dirname, (res, cb) => {
        t.ok(res.statusCode, 200, 'status code should be OK');
        cb();
        t.end();
    });
});

test('restafary: get: "raw": body: name', (t) => {
    get('fs/fixture/get-raw?raw', __dirname, (res, cb) => {
        pullout(res, 'string', (error, body) => {
            t.deepEqual(fixture.getRaw.name, JSON.parse(body).name, 'should return raw data');
            cb();
            t.end();
        });
    });
});

test('restafary: get: "raw": body: size', (t) => {
    get('fs/fixture/get-raw?raw', __dirname, (res, cb) => {
        pullout(res, 'string', (error, body) => {
            t.deepEqual(fixture.getRaw.size, JSON.parse(body).size, 'should return raw data');
            cb();
            t.end();
        });
    });
});

test('restafary: get: "raw": body: mode', (t) => {
    get('fs/fixture/get-raw?raw', __dirname, (res, cb) => {
        pullout(res, 'string', (error, body) => {
            t.deepEqual(fixture.getRaw.mode, JSON.parse(body).mode, 'should return raw data');
            cb();
            t.end();
        });
    });
});

test('restafary: get: status', (t) => {
    get('fs/fixture/get', __dirname, (res, cb) => {
        t.ok(res.statusCode, 200, 'status code should be OK');
        cb();
        t.end();
    });
});

test('restafary: get: body: name', (t) => {
    get('fs/fixture/get', __dirname, (res, cb) => {
        pullout(res, 'string', (error, body) => {
            t.deepEqual(fixture.get.name, JSON.parse(body).name, 'should return data');
            cb();
            t.end();
        });
    });
});

test('restafary: get: body: size', (t) => {
    get('fs/fixture/get', __dirname, (res, cb) => {
        pullout(res, 'string', (error, body) => {
            t.deepEqual(fixture.get.size, JSON.parse(body).size, 'should return data');
            cb();
            t.end();
        });
    });
});

test('restafary: get: body: mode', (t) => {
    get('fs/fixture/get', __dirname, (res, cb) => {
        pullout(res, 'string', (error, body) => {
            t.deepEqual(fixture.get.mode, JSON.parse(body).mode, 'should return data');
            cb();
            t.end();
        });
    });
});

