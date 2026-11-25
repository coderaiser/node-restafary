import {test, stub} from 'supertape';
import {tryCatch} from 'try-catch';
import * as restafary from './index.js';

const {
    read,
    write,
    patch,
    remove,
    prefix,
    _escape,
} = restafary;

const createXHR = (overrides = {}) => {
    const {
        status = 200,
        responseText = 'hello',
    } = overrides;
    
    const listeners = {};
    
    const xhr = {
        status,
        responseText,
        open: stub(),
        send: stub(),
        addEventListener: stub((name, fn) => {
            listeners[name] = fn;
        }),
        listeners,
    };
    
    globalThis.XMLHttpRequest = class {
        constructor() {
            return xhr;
        }
    };
    
    return xhr;
};

test('cloudcmd: client: rest: replaceHash', (t) => {
    const url = '/hello/####world';
    const result = _escape(url);
    const expected = '/hello/%23%23%23%23world';
    
    t.equal(result, expected);
    t.end();
});

test('restafary: client: read: request', (t) => {
    const xhr = createXHR();
    
    read('/hello world', stub());
    
    t.calledWith(xhr.open, [
        'GET',
        '/api/v1/fs/hello%20world',
        true,
    ]);
    t.end();
});

test('restafary: client: read: load: no data sent', (t) => {
    const xhr = createXHR();
    
    read('/hello', stub());
    
    t.calledWith(xhr.send, [undefined]);
    t.end();
});

test('restafary: client: read: load: success', (t) => {
    const xhr = createXHR();
    const callback = stub();
    
    read('/hello', callback);
    xhr.listeners.load();
    
    t.calledWith(callback, [null, 'hello']);
    t.end();
});

test('restafary: client: read: load: status 399', (t) => {
    const xhr = createXHR({
        status: 399,
    });
    
    const callback = stub();
    
    read('/hello', callback);
    xhr.listeners.load();
    
    t.calledWith(callback, [null, 'hello']);
    t.end();
});

test('restafary: client: read: load: status 400', (t) => {
    const xhr = createXHR({
        status: 400,
        responseText: 'bad',
    });
    
    const callback = stub();
    
    read('/hello', callback);
    xhr.listeners.load();
    
    const [[error]] = callback.args;
    
    t.equal(error.message, 'bad');
    t.end();
});

test('restafary: client: read: load: status 199', (t) => {
    const xhr = createXHR({
        status: 199,
        responseText: 'info',
    });
    
    const callback = stub();
    
    read('/hello', callback);
    xhr.listeners.load();
    
    const [[error]] = callback.args;
    
    t.equal(error.message, 'info');
    t.end();
});

test('restafary: client: read: error', (t) => {
    const xhr = createXHR();
    const callback = stub();
    
    read('/hello', callback);
    
    t.equal(xhr.listeners.error, callback);
    t.end();
});

test('restafary: client: read: no callback', (t) => {
    createXHR();
    
    const [error] = tryCatch(read, '/hello');
    
    t.equal(error.message, 'Callback should be function!');
    t.end();
});

test('restafary: client: write: data', (t) => {
    const xhr = createXHR();
    
    write('/hello', 'world', stub());
    
    t.calledWith(xhr.send, ['world']);
    t.end();
});

test('restafary: client: write: method', (t) => {
    const xhr = createXHR();
    
    write('/hello', 'world', stub());
    
    t.calledWith(xhr.open, [
        'PUT',
        '/api/v1/fs/hello',
        true,
    ]);
    t.end();
});

test('restafary: client: write: no data', (t) => {
    const xhr = createXHR();
    const callback = stub();
    
    write('/hello', callback);
    xhr.listeners.load();
    
    t.calledWith(callback, [null, 'hello']);
    t.end();
});

test('restafary: client: write: no data: send', (t) => {
    const xhr = createXHR();
    
    write('/hello', stub());
    
    t.calledWith(xhr.send, [null]);
    t.end();
});

test('restafary: client: patch: data', (t) => {
    const xhr = createXHR();
    
    patch('/hello', 'diff', stub());
    
    t.calledWith(xhr.send, ['diff']);
    t.end();
});

test('restafary: client: patch: method', (t) => {
    const xhr = createXHR();
    
    patch('/hello', 'diff', stub());
    
    t.calledWith(xhr.open, [
        'PATCH',
        '/api/v1/fs/hello',
        true,
    ]);
    t.end();
});

test('restafary: client: patch: no data', (t) => {
    const xhr = createXHR();
    const callback = stub();
    
    patch('/hello', callback);
    xhr.listeners.load();
    
    t.calledWith(callback, [null, 'hello']);
    t.end();
});

test('restafary: client: remove: data', (t) => {
    const xhr = createXHR();
    
    remove('/hello', 'files', stub());
    
    t.calledWith(xhr.send, ['files']);
    t.end();
});

test('restafary: client: remove: method', (t) => {
    const xhr = createXHR();
    
    remove('/hello', 'files', stub());
    
    t.calledWith(xhr.open, [
        'DELETE',
        '/api/v1/fs/hello',
        true,
    ]);
    t.end();
});

test('restafary: client: remove: no data', (t) => {
    const xhr = createXHR();
    const callback = stub();
    
    remove('/hello', callback);
    xhr.listeners.load();
    
    t.calledWith(callback, [null, 'hello']);
    t.end();
});

test('restafary: client: prefix', (t) => {
    const xhr = createXHR();
    
    prefix('/custom');
    read('/hello', stub());
    prefix('/api/v1/fs');
    
    t.calledWith(xhr.open, ['GET', '/custom/hello', true]);
    t.end();
});
