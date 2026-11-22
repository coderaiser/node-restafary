import {join, dirname} from 'node:path';
import {
    mkdtempSync,
    writeFileSync,
    readFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import daffy from 'daffy';
import {test} from 'supertape';
import {serveOnce} from 'serve-once';
import {restafary} from '../server/restafary.js';

const {request} = serveOnce(restafary);

const diff = daffy.createPatch('hello\n', 'world\n');

test('restafary: patch: body', async (t) => {
    const root = mkdtempSync(join(tmpdir(), 'restafary-'));
    
    writeFileSync(join(root, 'hello.txt'), 'hello\n');
    
    const {body} = await request.patch('/fs/hello.txt', {
        body: diff,
        options: {
            root,
        },
    });
    
    t.equal(body, 'patch: ok("hello.txt")');
    t.end();
});

test('restafary: patch: file changed', async (t) => {
    const root = mkdtempSync(join(tmpdir(), 'restafary-'));
    const name = join(root, 'hello.txt');
    
    writeFileSync(name, 'hello\n');
    
    await request.patch('/fs/hello.txt', {
        body: diff,
        options: {
            root,
        },
    });
    const result = readFileSync(name, 'utf8');
    const expected = 'world\n';
    
    t.equal(result, expected);
    t.end();
});

test('restafary: patch: error', async (t) => {
    const root = mkdtempSync(join(tmpdir(), 'restafary-'));
    
    const {body} = await request.patch('/fs/not-exist.txt', {
        body: diff,
        options: {
            root: dirname(join(root, 'x')),
        },
    });
    
    t.match(body, 'ENOENT');
    t.end();
});
