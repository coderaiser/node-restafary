import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {test} from 'supertape';
import serveOnce from 'serve-once';
import {restafary} from '../server/restafary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const {request} = serveOnce(restafary, {
    root: __dirname,
});

test('restafary: head: content type', async (t) => {
    const {headers} = await request('head', '/fs/fixture/index.html');
    const contentType = headers.get('Content-Type');
    const expected = 'text/html; charset=utf-8';
    
    t.equal(contentType, expected, 'should set content type');
    t.end();
});

test('restafary: head: file: content length', async (t) => {
    const {headers} = await request('head', '/fs/fixture/index.html');
    const contentType = headers.get('Content-Length');
    const expected = '14';
    
    t.equal(contentType, expected, 'should set content length');
    t.end();
});

test('restafary: head: file: not found', async (t) => {
    const {status} = await request('head', '/fs/not found');
    const expected = 404;
    
    t.equal(status, expected, 'should set status 404');
    t.end();
});
