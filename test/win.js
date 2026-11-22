import process from 'node:process';
import {test} from 'supertape';
import {serveOnce} from 'serve-once';

const importWin = async () => {
    const {platform} = process;
    
    Object.defineProperty(process, 'platform', {
        value: 'win32',
    });
    
    const {restafary} = await import('../server/restafary.js?win');
    
    Object.defineProperty(process, 'platform', {
        value: platform,
    });
    
    return serveOnce(restafary);
};

test('restafary: win: path beyond root', async (t) => {
    const {request} = await importWin();
    const {body} = await request.get('/fs/etc/passwd', {
        options: {
            root: '/tmp/root',
        },
    });
    
    t.match(body, 'beyond root');
    t.end();
});

test('restafary: win: put: not root', async (t) => {
    const {request} = await importWin();
    const {body} = await request.put('/fs/tmp/restafary-win-nonexistent/hello', {
        body: 'zzz',
        options: {
            root: '/tmp',
        },
    });
    
    t.notMatch(body, 'Could not write file/create directory in root on windows!');
    t.end();
});

test('restafary: win: put: root with drive', async (t) => {
    const {request} = await importWin();
    const {body} = await request.put('/fs/c/restafary-win-nonexistent/hello', {
        body: 'zzz',
        options: {
            root: '/',
        },
    });
    
    t.notMatch(body, 'Could not write file/create directory in root on windows!');
    t.end();
});

test('restafary: win: put: root without drive', async (t) => {
    const {request} = await importWin();
    const {body} = await request.put('/fs/hello', {
        body: 'zzz',
        options: {
            root: '/',
        },
    });
    
    t.equal(body, 'Could not write file/create directory in root on windows!');
    t.end();
});
