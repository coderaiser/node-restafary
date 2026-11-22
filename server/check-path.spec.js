import {test} from 'supertape';
import {checkPath} from './check-path.js';

test('restafary: checkPath: not win', (t) => {
    const result = checkPath({
        name: '/hello',
        root: '/',
        win: false,
    });
    
    t.ok(result);
    t.end();
});

test('restafary: checkPath: win: not root', (t) => {
    const result = checkPath({
        name: '/hello',
        root: '/tmp',
        win: true,
    });
    
    t.ok(result);
    t.end();
});

test('restafary: checkPath: win: root: no drive', (t) => {
    const result = checkPath({
        name: '/hello',
        root: '/',
        win: true,
    });
    
    t.notOk(result);
    t.end();
});

test('restafary: checkPath: win: root: drive', (t) => {
    const result = checkPath({
        name: '/c/hello',
        root: '/',
        win: true,
    });
    
    t.ok(result);
    t.end();
});
