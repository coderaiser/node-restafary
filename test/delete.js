'use strict';

const test = require('tape');
const {del} = require('./before');

test('restafary: delete: no fs', (t) => {
    del('123', '/tmp', null, (res, body, cb) => {
        cb();
        t.ok(body.includes('Cannot DELETE /123'), 'should return error message');
        t.end();
    });
});

test('restafary: delete: path: ENOENT', (t) => {
    const root = `/${Math.random()}`;
    del('fs', root, null, (res, body, cb) => {
        const expected = `ENOENT: no such file or directory, unlink '${root}'`;
        cb();
        t.equal(body, expected,  'should return error message');
        t.end();
    });
});

test('restafary: delete: files: parse error', (t) => {
    const root = `/${Math.random()}`;
    const body = '{a: b}';
    
    del('fs?files', root, body, (res, body, cb) => {
        cb();
        const expected = 'Unexpected token a in JSON at position 1';
        t.equal(body, expected,  'should return error message');
        t.end();
    });
});
