'use strict';

const {test} = require('supertape');
const restafary = require('..');
const {request} = require('serve-once')(restafary);

test('restafary: delete: no fs', async (t) => {
    const options = {
        root: '/tmp',
    };
    
    const {body} = await request('delete', '/123', {
        options,
    });
    
    t.match(body, 'Cannot DELETE /123', 'should return error message');
    t.end();
});

test('restafary: delete: path: ENOENT', async (t) => {
    const root = `/${Math.random()}`;
    
    const options = {
        root,
    };
    
    const {body} = await request.delete('/fs', {
        options,
    });
    
    const expected = `ENOENT: no such file or directory`;
    
    t.match(body, RegExp(expected), 'should return error message');
    t.end();
});

test('restafary: delete: files: parse error', async (t) => {
    const root = `/${Math.random()}`;
    const body = '{a: b}';
    
    const options = {
        root,
    };
    
    const res = await request.delete('/fs?files', {
        options,
        body,
    });
    
    const expected = 'xpected';
    
    t.match(res.body, expected, 'should return error message');
    t.end();
});
