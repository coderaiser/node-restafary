'use strict';

const test = require('supertape');
const {del} = require('./before');

test('restafary: delete: no fs', async (t) => {
    const [e] = await del('123', '/tmp', null);
    const {response} = e;
    const {body} = response;
    
    t.ok(body.includes('Cannot DELETE /123'), 'should return error message');
    t.end();
});

test('restafary: delete: path: ENOENT', async (t) => {
    const root = `/${Math.random()}`;
    const [e] = await del('fs', root, null);
    const {response} = e;
    const {body} = response;
    const expected = `ENOENT: no such file or directory, unlink '${root}'`;
    
    t.equal(body, expected, 'should return error message');
    t.end();
});

test('restafary: delete: files: parse error', async (t) => {
    const root = `/${Math.random()}`;
    const body = '{a: b}';
    
    const [e] = await del('fs?files', root, body);
    const expected = 'Unexpected token a in JSON at position 1';
    
    t.equal(e.response.body, expected, 'should return error message');
    t.end();
});

