import {join} from 'node:path';
import {
    mkdtempSync,
    writeFileSync,
    existsSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {test} from 'supertape';
import {serveOnce} from 'serve-once';
import {restafary} from '../server/restafary.js';

const {request} = serveOnce(restafary);

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

test('restafary: delete: files', async (t) => {
    const root = mkdtempSync(join(tmpdir(), 'restafary-'));
    
    writeFileSync(join(root, 'a'), 'a');
    writeFileSync(join(root, 'b'), 'b');
    
    await request.delete('/fs?files', {
        options: {
            root,
        },
        body: JSON.stringify(['a']),
    });
    
    t.notOk(existsSync(join(root, 'a')), 'should remove listed file');
    t.end();
});

test('restafary: delete: files: keep others', async (t) => {
    const root = mkdtempSync(join(tmpdir(), 'restafary-'));
    
    writeFileSync(join(root, 'a'), 'a');
    writeFileSync(join(root, 'b'), 'b');
    
    await request.delete('/fs?files', {
        options: {
            root,
        },
        body: JSON.stringify(['a']),
    });
    
    t.ok(existsSync(join(root, 'b')), 'should keep not listed file');
    t.end();
});
